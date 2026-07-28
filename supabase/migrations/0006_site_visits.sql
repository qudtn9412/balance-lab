-- "오늘 방문자수" 통계를 위한 최소 방문 로그. 이미지 생성 여부와 무관하게, client_id 쿠키를
-- 가진 누구든 하루 1번만 기록된다(proxy.ts에서 게이팅). GA 없이도 우리 DB 안에서 답할 수 있는
-- 질문만 담당하고, 브라우저/기기별 상세 트래픽 분석은 별도 분석 도구의 몫으로 남겨둔다.

create table site_visits (
  client_id  text not null,
  visit_date date not null default current_date,
  primary key (client_id, visit_date)
);

alter table site_visits enable row level security;
