-- 거지맵.com처럼 "누가 만들었는지" 보여주기 위해 회원가입 없이도 입력 가능한 닉네임을 추가한다.
-- 소유권(수정/삭제 권한) 판별은 여전히 client_id(익명 쿠키)로 한다 — 닉네임은 표시용일 뿐,
-- 동일 닉네임을 여러 사람이 써도 보안에는 영향이 없다.

alter table balance_games
  add column creator_nickname text not null default '익명';

alter table comments
  add column nickname text not null default '익명';

-- 댓글 등록 시 닉네임도 함께 저장하도록 교체.
create or replace function add_comment(
  p_slug text,
  p_client_id text,
  p_content text,
  p_nickname text default '익명'
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

  insert into comments (game_id, client_id, content, nickname)
  values (v_game_id, p_client_id, p_content, coalesce(nullif(trim(p_nickname), ''), '익명'))
  returning id into v_comment_id;

  update balance_games set comments_count = comments_count + 1 where id = v_game_id;

  return v_comment_id;
end;
$$;

-- 댓글 수정: 작성자 본인(client_id 일치)만 가능. 다른 사람 댓글이면 false.
create or replace function edit_comment(
  p_comment_id uuid,
  p_client_id text,
  p_content text
) returns boolean
language plpgsql
as $$
declare
  v_updated boolean;
begin
  update comments
  set content = p_content
  where id = p_comment_id
    and client_id = p_client_id
    and status = 'visible'
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- 댓글 삭제: 작성자 본인만 가능. 성공 시 comments_count 감소.
create or replace function delete_comment(
  p_comment_id uuid,
  p_client_id text
) returns boolean
language plpgsql
as $$
declare
  v_game_id uuid;
begin
  delete from comments
  where id = p_comment_id
    and client_id = p_client_id
  returning game_id into v_game_id;

  if v_game_id is null then
    return false;
  end if;

  update balance_games set comments_count = comments_count - 1 where id = v_game_id;
  return true;
end;
$$;
