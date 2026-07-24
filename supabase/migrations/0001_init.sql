-- 밸런스게임 MVP 초기 스키마
-- 회원가입이 없으므로 모든 사용자 식별은 client_id(익명 쿠키, text)로 한다.
-- 쓰기 작업은 전부 service role(Route Handler)에서만 수행하고,
-- anon key에는 published/visible 데이터에 대한 select 정책만 부여한다.

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table balance_games (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  creator_client_id text not null,

  option_a_prompt      text not null,
  option_a_image_url   text not null,
  option_a_title       text,
  option_b_prompt      text not null,
  option_b_image_url   text not null,
  option_b_title       text,

  votes_a_count int not null default 0,
  votes_b_count int not null default 0,

  status text not null default 'published'
    check (status in ('published', 'hidden', 'pending_review')),

  created_at timestamptz not null default now()
);

create index balance_games_status_created_at_idx
  on balance_games (status, created_at desc);

create table votes (
  id              uuid primary key default gen_random_uuid(),
  game_id         uuid not null references balance_games(id) on delete cascade,
  voter_client_id text not null,
  choice          text not null check (choice in ('a', 'b')),
  created_at      timestamptz not null default now(),
  unique (game_id, voter_client_id)
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references balance_games(id) on delete cascade,
  client_id  text not null,
  content    text not null,
  status     text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index comments_game_id_created_at_idx
  on comments (game_id, created_at desc);

create table reports (
  id                 uuid primary key default gen_random_uuid(),
  target_type        text not null check (target_type in ('game', 'comment')),
  target_id          uuid not null,
  reporter_client_id text not null,
  reason             text,
  created_at         timestamptz not null default now(),
  unique (target_type, target_id, reporter_client_id)
);

create table generation_usage (
  client_id     text not null,
  usage_date    date not null default current_date,
  consumed      int not null default 0,
  granted_bonus int not null default 0,
  ads_watched   int not null default 0,
  primary key (client_id, usage_date)
);

create table image_generation_jobs (
  id         uuid primary key default gen_random_uuid(),
  client_id  text not null,
  prompt     text not null,
  status     text not null
    check (status in ('pending', 'blocked_text', 'completed', 'blocked_nsfw', 'failed')),
  provider   text not null,
  image_url  text,
  cost_cents numeric(10, 4),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RPC functions (원자적 증감이 필요한 연산은 여기서 처리)
-- ============================================================

-- 오늘 남은 생성권이 있으면 1장 소비하고 true, 없으면 false.
create or replace function consume_generation_credit(
  p_client_id text,
  p_free_limit int
) returns boolean
language plpgsql
as $$
declare
  v_updated boolean;
begin
  insert into generation_usage (client_id, usage_date)
  values (p_client_id, current_date)
  on conflict (client_id, usage_date) do nothing;

  update generation_usage
  set consumed = consumed + 1
  where client_id = p_client_id
    and usage_date = current_date
    and consumed < p_free_limit + granted_bonus
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- 리워드 광고 시청 상한 내에서만 보너스 생성권을 지급.
create or replace function grant_reward_credit(
  p_client_id text,
  p_max_ads_per_day int,
  p_bonus_per_ad int
) returns boolean
language plpgsql
as $$
declare
  v_updated boolean;
begin
  insert into generation_usage (client_id, usage_date)
  values (p_client_id, current_date)
  on conflict (client_id, usage_date) do nothing;

  update generation_usage
  set ads_watched = ads_watched + 1,
      granted_bonus = granted_bonus + p_bonus_per_ad
  where client_id = p_client_id
    and usage_date = current_date
    and ads_watched < p_max_ads_per_day
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- 투표: 중복 투표는 votes의 unique 제약으로 막고, 성공 시 집계 카운트를 함께 증가.
create or replace function cast_vote(
  p_slug text,
  p_voter_client_id text,
  p_choice text
) returns boolean
language plpgsql
as $$
declare
  v_game_id uuid;
begin
  select id into v_game_id
  from balance_games
  where slug = p_slug and status = 'published';

  if v_game_id is null then
    return false;
  end if;

  begin
    insert into votes (game_id, voter_client_id, choice)
    values (v_game_id, p_voter_client_id, p_choice);
  exception when unique_violation then
    return false;
  end;

  if p_choice = 'a' then
    update balance_games set votes_a_count = votes_a_count + 1 where id = v_game_id;
  else
    update balance_games set votes_b_count = votes_b_count + 1 where id = v_game_id;
  end if;

  return true;
end;
$$;

-- 신고 접수 + 누적 신고수가 임계치를 넘으면 자동 비공개.
create or replace function submit_report_and_maybe_hide(
  p_slug text,
  p_reporter_client_id text,
  p_reason text,
  p_auto_hide_threshold int
) returns void
language plpgsql
as $$
declare
  v_game_id uuid;
  v_report_count int;
begin
  select id into v_game_id
  from balance_games
  where slug = p_slug;

  if v_game_id is null then
    raise exception 'game not found';
  end if;

  insert into reports (target_type, target_id, reporter_client_id, reason)
  values ('game', v_game_id, p_reporter_client_id, p_reason)
  on conflict (target_type, target_id, reporter_client_id) do nothing;

  select count(*) into v_report_count
  from reports
  where target_type = 'game' and target_id = v_game_id;

  if v_report_count >= p_auto_hide_threshold then
    update balance_games set status = 'pending_review' where id = v_game_id;
  end if;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table balance_games enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table reports enable row level security;
alter table generation_usage enable row level security;
alter table image_generation_jobs enable row level security;

-- anon key는 공개된 데이터만 읽을 수 있다. 쓰기는 정책을 만들지 않아 기본 차단되고,
-- service role은 RLS를 우회하므로 Route Handler에서는 그대로 동작한다.
create policy "published games are readable" on balance_games
  for select using (status = 'published');

create policy "votes on published games are readable" on votes
  for select using (
    exists (
      select 1 from balance_games
      where balance_games.id = votes.game_id
        and balance_games.status = 'published'
    )
  );

create policy "visible comments are readable" on comments
  for select using (status = 'visible');
