begin;

alter table public.products
    add column if not exists is_record_of_the_week boolean default false,
    add column if not exists editorial_comment text;

-- Keep the same first record the homepage would pick for legacy duplicates.
with ranked as (
    select id, row_number() over (order by created_at desc, id desc) as position
    from public.products
    where is_record_of_the_week is true
)
update public.products as product
set is_record_of_the_week = false, editorial_comment = null
from ranked
where product.id = ranked.id and ranked.position > 1;

create unique index products_single_record_of_the_week
    on public.products (is_record_of_the_week)
    where is_record_of_the_week is true;

create function public.set_record_of_the_week(
    p_product_id uuid,
    p_editorial_comment text,
    p_expected_product_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_product_id uuid;
begin
    if not exists (
        select 1
        from public.profiles
        where id = auth.uid() and role in ('admin', 'collaborator')
    ) then
        raise exception 'Product manager access required' using errcode = '42501';
    end if;

    -- Serialize changes even when there is no current selection to lock.
    lock table public.products in share row exclusive mode;

    select id into current_product_id
    from public.products
    where is_record_of_the_week is true;

    if current_product_id is distinct from p_expected_product_id then
        raise exception 'The current selection has changed' using errcode = '40001';
    end if;

    update public.products
    set is_record_of_the_week = false, editorial_comment = null
    where id = current_product_id and id is distinct from p_product_id;

    if p_product_id is not null then
        update public.products
        set is_record_of_the_week = true,
            editorial_comment = nullif(btrim(p_editorial_comment), '')
        where id = p_product_id;

        if not found then
            raise exception 'Product not found' using errcode = 'P0002';
        end if;
    end if;
end;
$$;

revoke all on function public.set_record_of_the_week(uuid, text, uuid) from public, anon;
grant execute on function public.set_record_of_the_week(uuid, text, uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
