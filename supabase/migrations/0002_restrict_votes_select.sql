-- votes 테이블은 개별 투표자의 선택(choice)을 담고 있어 anon key로 전체 select를
-- 허용하면 누가 무엇을 선택했는지 제3자가 그대로 조회할 수 있다. 화면에는 balance_games의
-- 집계 카운트(votes_a_count/votes_b_count)만 필요하고, "내가 이미 투표했는가"는
-- Route Handler/Server Component에서 service role로 확인하므로 anon select 정책을 제거한다.
drop policy if exists "votes on published games are readable" on votes;
