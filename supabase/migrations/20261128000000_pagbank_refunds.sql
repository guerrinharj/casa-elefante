begin;

create table if not exists public.pagbank_refunds (
    id uuid primary key,
    order_id uuid not null references public.orders(id),
    requested_by uuid not null,
    type text not null check (type in ('total', 'partial')),
    requested_amount integer not null check (requested_amount > 0),
    amount integer not null check (amount > 0),
    reason text not null,
    notes text not null default '',
    status text not null default 'processing'
        check (status in ('processing', 'completed', 'failed')),
    charge_id text,
    refunded_before integer check (refunded_before >= 0),
    created_at timestamptz not null default now()
);

create unique index if not exists pagbank_refunds_one_processing_per_order
    on public.pagbank_refunds (order_id)
    where status = 'processing';

alter table public.pagbank_refunds enable row level security;
revoke all on public.pagbank_refunds from anon, authenticated;
grant select, insert, update on public.pagbank_refunds to service_role;

create or replace function public.complete_pagbank_refund(p_id uuid, p_refunded integer, p_paid integer)
returns void
language plpgsql
set search_path = ''
as '
declare
    refund public.pagbank_refunds%rowtype;
begin
    refund := (
        select entry
        from public.pagbank_refunds as entry
        where entry.id = p_id
        for update
    );
    if refund.id is null then
        raise exception ''PagBank refund not found'';
    end if;
    if refund.status = ''completed'' then
        return;
    end if;

    if refund.status <> ''processing'' or refund.refunded_before is null
        or p_refunded <> refund.refunded_before + refund.amount or p_refunded > p_paid then
        raise exception ''Inconsistent PagBank refund'';
    end if;

    if p_refunded = p_paid then
        update public.orders set status = ''refunded''
        where id = refund.order_id and status = ''paid'';
    end if;

    update public.pagbank_refunds set status = ''completed'' where id = p_id;
end;
';

revoke all on function public.complete_pagbank_refund(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.complete_pagbank_refund(uuid, integer, integer) to service_role;

commit;
