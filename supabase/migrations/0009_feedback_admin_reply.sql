-- 건의 제출자와 관리자 사이의 양방향 소통을 위해 관리자 답변 컬럼을 추가한다.
-- 제출자는 /feedback 페이지에서 client_id 기준으로 본인 글의 상태와 이 답변을 확인한다.

alter table feedback add column admin_reply text;
