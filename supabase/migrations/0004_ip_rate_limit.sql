-- client_id 쿠키는 지우면 그만이라 그것만으로는 하루 무료 생성 한도를 강제할 수 없다.
-- IP 단위 하루 상한을 별도로 두어, 쿠키를 초기화해도 같은 IP에서는 여전히 막히게 하는
-- 2차 방어선을 추가한다. 리워드 보너스는 client_id 한도에만 적용되고 IP 상한에는 영향을
-- 주지 않는다 (IP 상한은 어뷰징 방지용 상한선이지, 정상적으로 늘어나야 할 개인 한도가 아님).

create table ip_generation_usage (
  ip_address text not null,
  usage_date date not null default current_date,
  consumed   int not null default 0,
  primary key (ip_address, usage_date)
);

alter table ip_generation_usage enable row level security;

drop function if exists consume_generation_credit(text, int);

create or replace function consume_generation_credit(
  p_client_id text,
  p_free_limit int,
  p_ip_address text,
  p_ip_daily_cap int
) returns boolean
language plpgsql
as $$
declare
  v_client_updated boolean;
  v_ip_updated boolean;
begin
  insert into generation_usage (client_id, usage_date)
  values (p_client_id, current_date)
  on conflict (client_id, usage_date) do nothing;

  update generation_usage
  set consumed = consumed + 1
  where client_id = p_client_id
    and usage_date = current_date
    and consumed < p_free_limit + granted_bonus
  returning true into v_client_updated;

  if not coalesce(v_client_updated, false) then
    return false;
  end if;

  insert into ip_generation_usage (ip_address, usage_date)
  values (p_ip_address, current_date)
  on conflict (ip_address, usage_date) do nothing;

  update ip_generation_usage
  set consumed = consumed + 1
  where ip_address = p_ip_address
    and usage_date = current_date
    and consumed < p_ip_daily_cap
  returning true into v_ip_updated;

  if not coalesce(v_ip_updated, false) then
    -- IP 상한 초과 — 앞서 증가시킨 client_id 카운트를 되돌린다.
    update generation_usage
    set consumed = consumed - 1
    where client_id = p_client_id and usage_date = current_date;
    return false;
  end if;

  return true;
end;
$$;
