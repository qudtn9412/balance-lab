-- 자유게시판(소통 게시판). 밸런스게임과 무관하게 사용자들끼리 노는 공간이라, 기존 comments를
-- 특정 game_id에 억지로 묶는 대신 같은 패턴(익명 client_id + 닉네임 + 텍스트 필터)의 독립
-- 테이블로 둔다. 목록/작성 UX는 게임 상세의 댓글 컴포넌트를 그대로 재사용한다.

create table board_comments (
  id         uuid primary key default gen_random_uuid(),
  client_id  text not null,
  nickname   text not null default '익명',
  content    text not null,
  status     text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index board_comments_created_at_idx on board_comments (created_at desc);

alter table board_comments enable row level security;

create policy "visible board comments are readable" on board_comments
  for select using (status = 'visible');
