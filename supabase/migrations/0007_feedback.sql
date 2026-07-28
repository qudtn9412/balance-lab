-- 관리자에게 보내는 비공개 건의/불편 게시판. 사용자는 글만 남기고, 목록은 관리자만
-- (/admin, service role) 본다 — 신고(reports)는 개별 게임에 대한 것이고 이건 사이트 자체에
-- 대한 일반 피드백이라 별도 테이블로 둔다. anon select 정책을 만들지 않아 기본적으로
-- 익명 키로는 아무것도 조회할 수 없다.

create table feedback (
  id         uuid primary key default gen_random_uuid(),
  client_id  text not null,
  nickname   text not null default '익명',
  content    text not null,
  status     text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index feedback_created_at_idx on feedback (created_at desc);

alter table feedback enable row level security;
