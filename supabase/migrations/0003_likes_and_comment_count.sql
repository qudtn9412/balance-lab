-- 좋아요 기능 + 댓글 수 집계 컬럼 추가.
-- likes는 votes와 동일하게 "누가 좋아요 눌렀는지"는 비공개로 유지한다(anon select 정책 없음).
-- "내가 이미 좋아요 눌렀는가"는 votes와 마찬가지로 서버(service role)에서 확인한다.

alter table balance_games
  add column likes_count int not null default 0,
  add column comments_count int not null default 0;

create table likes (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references balance_games(id) on delete cascade,
  client_id  text not null,
  created_at timestamptz not null default now(),
  unique (game_id, client_id)
);

alter table likes enable row level security;

-- 좋아요 토글: 이미 눌렀으면 취소(카운트 감소), 아니면 추가(카운트 증가).
create or replace function toggle_like(
  p_slug text,
  p_client_id text
) returns boolean
language plpgsql
as $$
declare
  v_game_id uuid;
  v_existing uuid;
begin
  select id into v_game_id
  from balance_games
  where slug = p_slug and status = 'published';

  if v_game_id is null then
    raise exception 'game not found';
  end if;

  select id into v_existing
  from likes
  where game_id = v_game_id and client_id = p_client_id;

  if v_existing is not null then
    delete from likes where id = v_existing;
    update balance_games set likes_count = likes_count - 1 where id = v_game_id;
    return false;
  else
    insert into likes (game_id, client_id) values (v_game_id, p_client_id);
    update balance_games set likes_count = likes_count + 1 where id = v_game_id;
    return true;
  end if;
end;
$$;

-- 댓글 등록 + comments_count 증가를 원자적으로 처리.
create or replace function add_comment(
  p_slug text,
  p_client_id text,
  p_content text
) returns uuid
language plpgsql
as $$
declare
  v_game_id uuid;
  v_comment_id uuid;
begin
  select id into v_game_id
  from balance_games
  where slug = p_slug and status = 'published';

  if v_game_id is null then
    raise exception 'game not found';
  end if;

  insert into comments (game_id, client_id, content)
  values (v_game_id, p_client_id, p_content)
  returning id into v_comment_id;

  update balance_games set comments_count = comments_count + 1 where id = v_game_id;

  return v_comment_id;
end;
$$;
