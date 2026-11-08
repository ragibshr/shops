-- ============================================================
-- 0002 — Oddbox BD: one brand, three sections (fun → dairy → mango),
--        COD + bKash payments, "delivery team" logins, security fixes.
--
-- Run this AFTER 0001_init.sql, in the Supabase SQL Editor.
-- Safe to re-run.
-- ============================================================

-- ---------- FIXES ----------

-- 0001 attached an updated_at trigger to products without the column,
-- which made every product edit fail.
alter table public.products
  add column if not exists updated_at timestamptz not null default now();

-- 0001 let anyone insert rows straight into orders / order_items,
-- bypassing price checks. Orders now go ONLY through place_order().
drop policy if exists orders_public_insert on public.orders;
drop policy if exists order_items_system_insert on public.order_items;

-- Staff can write their own audit entries (0001 had no insert policy).
drop policy if exists audit_staff_insert on public.audit_log;
create policy audit_staff_insert on public.audit_log
for insert with check (public.is_staff() and actor = auth.uid());

-- ---------- SHOP SETTINGS (stored on the 'oddbox' tenant row) ----------

alter table public.tenants add column if not exists cod_enabled boolean not null default true;
alter table public.tenants add column if not exists bkash_enabled boolean not null default false;
alter table public.tenants add column if not exists bkash_number text;
alter table public.tenants add column if not exists bkash_account_type text not null default 'personal';

do $$ begin
  alter table public.tenants add constraint tenants_bkash_type_chk
    check (bkash_account_type in ('personal','agent','merchant'));
exception when duplicate_object then null; end $$;

update public.tenants
set name_bn = 'অডবক্স বিডি',
    announcement_bn = coalesce(announcement_bn, '🚚 ১৫০০৳+ অর্ডারে ডেলিভারি ফ্রি!')
where id = 'oddbox';

-- ---------- SECTIONS: মজার উপহার → দুগ্ধজাত → আম ----------

create table if not exists public.sections (
  id text primary key,
  name_bn text not null,
  emoji text,
  tagline_bn text,
  status text not null default 'coming_soon'
    check (status in ('live','coming_soon','hidden')),
  sort int not null default 0
);

alter table public.sections enable row level security;

drop policy if exists sections_public_read on public.sections;
create policy sections_public_read on public.sections for select using (true);

drop policy if exists sections_owner_write on public.sections;
create policy sections_owner_write on public.sections
for all using (public.is_owner()) with check (public.is_owner());

insert into public.sections (id, name_bn, emoji, tagline_bn, status, sort) values
  ('fun',   'মজার উপহার',   '🎁', 'বন্ধুকে হাসান, একটু জ্বালান — প্যাকেজিং একদম আসল', 'live', 1),
  ('dairy', 'খাঁটি দুগ্ধজাত', '🥛', 'গাওয়া ঘি, টক-মিষ্টি দই — খামার থেকে সোজা ঘরে',   'coming_soon', 2),
  ('mango', 'মৌসুমি আম',     '🥭', 'গাছপাকা, কার্বাইডমুক্ত — বাছাই করে বাক্সে',          'coming_soon', 3)
on conflict (id) do nothing;

alter table public.categories
  add column if not exists section_id text references public.sections(id) on delete set null;

update public.categories set section_id = 'fun'
where tenant = 'oddbox' and section_id is null and slug in ('farm','air','donkey','combo');

-- The old second shop (Mithe Bangla) is retired; its catalogue is folded
-- into Oddbox's dairy & mango sections below.
delete from public.products where tenant = 'mithai';
delete from public.categories where tenant = 'mithai';

insert into public.categories (tenant, slug, name_bn, emoji, sort, section_id) values
  ('oddbox','ghee',  'ঘি ও মাখন', '🧈', 10, 'dairy'),
  ('oddbox','doi',   'দই',        '🍮', 11, 'dairy'),
  ('oddbox','mango', 'আম',        '🥭', 20, 'mango')
on conflict (tenant, slug) do update set section_id = excluded.section_id;

-- Starter products for the upcoming sections (hidden from customers until
-- you switch the section to "live" in Admin → Settings). Edit prices freely.
insert into public.products (tenant, category_id, slug, title_bn, tagline_bn, description_bn,
                             price_bdt, compare_price_bdt, images, variants, stock, badge_bn,
                             is_active, is_featured, sort)
values
  ('oddbox', (select id from public.categories where tenant='oddbox' and slug='ghee'), 'gawa-ghee',
   'খাঁটি গাওয়া ঘি', 'দেশি গরুর দুধের সর থেকে জ্বাল দেওয়া',
   'গ্রামের খামারের দেশি গরুর দুধের সর জমিয়ে, ধীরে জ্বাল দিয়ে তৈরি। কোনো ডালডা, পাম অয়েল বা রং মেশানো নয়। কাচের বয়ামে প্যাক করা।',
   850, 950, array['/products/mb-ghee.svg'],
   '[{"label":"৫০০ গ্রাম","priceDelta":0},{"label":"১ কেজি","priceDelta":800}]'::jsonb,
   30, '🧈 খামার থেকে', true, true, 20),

  ('oddbox', (select id from public.categories where tenant='oddbox' and slug='doi'), 'mishti-doi',
   'বগুড়ার মিষ্টি দই', 'মাটির সরায় জমানো, ঘন আর মোলায়েম',
   'খাঁটি দুধ ঘন করে জ্বাল দিয়ে মাটির সরায় জমানো মিষ্টি দই। ঢাকার ভিতরে ২৪ ঘণ্টায় ডেলিভারি।',
   380, null, array['/products/mb-doi.svg'],
   '[{"label":"১ কেজি সরা","priceDelta":0},{"label":"২ কেজি সরা","priceDelta":360}]'::jsonb,
   20, null, true, false, 21),

  ('oddbox', (select id from public.categories where tenant='oddbox' and slug='mango'), 'himsagar-5kg',
   'হিমসাগর আম (৫ কেজি)', 'মৌসুমের রাজা, সাতক্ষীরা থেকে',
   'কার্বাইডমুক্ত, গাছপাকা হিমসাগর। বাছাই করে কাগজে মুড়িয়ে নরম বাক্সে পাঠানো হয়।',
   1250, 1500, array['/products/mb-mango.svg'], '[]'::jsonb,
   40, '🥭 মৌসুমি', true, true, 30),

  ('oddbox', (select id from public.categories where tenant='oddbox' and slug='mango'), 'langra-5kg',
   'ল্যাংড়া আম (৫ কেজি)', 'আঁশহীন, রসালো, মিষ্টি',
   'রাজশাহী-চাঁপাইয়ের বাগান থেকে সরাসরি। পাকা অবস্থায় বাছাই করা।',
   1150, 1400, array['/products/mb-mango.svg'], '[]'::jsonb,
   40, null, true, false, 31)
on conflict (tenant, slug) do nothing;

-- ---------- PAYMENTS ON ORDERS ----------

alter table public.orders add column if not exists payment_method text not null default 'cod';
alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists bkash_trx_id text;
alter table public.orders add column if not exists bkash_sender text;
alter table public.orders add column if not exists paid_at timestamptz;

do $$ begin
  alter table public.orders add constraint orders_payment_method_chk
    check (payment_method in ('cod','bkash'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.orders add constraint orders_payment_status_chk
    check (payment_status in ('unpaid','pending_verification','paid','failed','refunded'));
exception when duplicate_object then null; end $$;

-- one bKash transaction can only pay one order
create unique index if not exists orders_bkash_trx_unique
  on public.orders (upper(bkash_trx_id)) where bkash_trx_id is not null;

-- ---------- WAITLIST for "coming soon" sections ----------

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  section_id text not null references public.sections(id) on delete cascade,
  phone text not null check (phone ~ '^01[3-9][0-9]{8}$'),
  created_at timestamptz not null default now(),
  unique (section_id, phone)
);

alter table public.waitlist enable row level security;

drop policy if exists waitlist_staff_read on public.waitlist;
create policy waitlist_staff_read on public.waitlist for select using (public.is_owner());

create or replace function public.join_waitlist(p_section text, p_phone text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if trim(p_phone) !~ '^01[3-9][0-9]{8}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;
  if not exists (select 1 from public.sections where id = p_section and status = 'coming_soon') then
    return jsonb_build_object('ok', false, 'error', 'invalid_section');
  end if;
  insert into public.waitlist (section_id, phone) values (p_section, trim(p_phone))
  on conflict do nothing;
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.join_waitlist(text, text) to anon, authenticated;

-- ---------- ROLES: owner = everything, moderator = delivery team ----------
-- Delivery team: see orders, move them along (confirmed/shipped/delivered),
-- update stock. Products, prices, payments, settings and team are owner-only.

drop policy if exists categories_staff_write on public.categories;
drop policy if exists categories_owner_write on public.categories;
create policy categories_owner_write on public.categories
for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists products_staff_insert on public.products;
drop policy if exists products_staff_update on public.products;
drop policy if exists products_staff_delete on public.products;
drop policy if exists products_owner_insert on public.products;
drop policy if exists products_owner_update on public.products;
drop policy if exists products_owner_delete on public.products;
create policy products_owner_insert on public.products for insert with check (public.is_owner());
create policy products_owner_update on public.products for update using (public.is_owner()) with check (public.is_owner());
create policy products_owner_delete on public.products for delete using (public.is_owner());

-- product photos: owner-only uploads
drop policy if exists product_images_staff_upload on storage.objects;
drop policy if exists product_images_staff_update on storage.objects;
drop policy if exists product_images_staff_delete on storage.objects;
drop policy if exists product_images_owner_upload on storage.objects;
drop policy if exists product_images_owner_update on storage.objects;
drop policy if exists product_images_owner_delete on storage.objects;
create policy product_images_owner_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_owner());
create policy product_images_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_owner());
create policy product_images_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_owner());

-- stock: any staff member, via this function only
create or replace function public.set_stock(p_product uuid, p_stock int)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  if p_stock is not null and p_stock < 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_stock');
  end if;
  update public.products set stock = p_stock where id = p_product;
  insert into public.audit_log (actor, action, entity, entity_id, meta)
  values (auth.uid(), 'stock_update', 'products', p_product::text, jsonb_build_object('stock', p_stock));
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.set_stock(uuid, int) to authenticated;

-- A moderator could previously promote themselves to owner via profiles_self_update.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_owner() then
    if new.role is distinct from old.role
       or new.assigned_tenants is distinct from old.assigned_tenants then
      raise exception 'only the owner can change roles';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
for each row execute function public.guard_profile_update();

-- Orders: money fields are frozen; payment status is owner-only;
-- COD becomes "paid" on delivery; cancelling (before delivery) puts stock back.
create or replace function public.guard_order_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.order_no <> old.order_no
     or new.subtotal_bdt <> old.subtotal_bdt
     or new.delivery_fee_bdt <> old.delivery_fee_bdt
     or new.total_bdt <> old.total_bdt
     or new.payment_method <> old.payment_method
     or new.bkash_trx_id is distinct from old.bkash_trx_id then
    raise exception 'order amounts and payment details cannot be edited';
  end if;

  if auth.uid() is not null and not public.is_owner()
     and new.payment_status is distinct from old.payment_status then
    raise exception 'only the owner can change payment status';
  end if;

  if new.status = 'delivered' and old.status <> 'delivered' and new.payment_method = 'cod' then
    new.payment_status := 'paid';
  end if;

  if new.payment_status = 'paid' and old.payment_status <> 'paid' then
    new.paid_at := coalesce(new.paid_at, now());
  end if;

  if new.status = 'cancelled' and old.status not in ('cancelled','delivered') then
    update public.products p
    set stock = p.stock + oi.qty
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id and p.stock is not null;
  end if;

  return new;
end $$;

drop trigger if exists orders_guard on public.orders;
create trigger orders_guard before update on public.orders
for each row execute function public.guard_order_update();

-- ---------- PLACE ORDER (rewritten: sections, payments, stock by qty) ----------

create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_tenant text := coalesce(payload->>'tenant', 'oddbox');
  v_zone text := payload->>'zone';
  v_method text := coalesce(nullif(payload->>'payment_method', ''), 'cod');
  v_trx text := upper(nullif(trim(payload->>'bkash_trx_id'), ''));
  v_sender text := nullif(trim(payload->>'bkash_sender'), '');
  v_shop public.tenants;
  v_item jsonb;
  v_product public.products;
  v_unit int;
  v_subtotal int := 0;
  v_fee int;
  v_qty int;
  v_variant_label text;
  v_order_no text;
  v_order_id uuid;
  v_attempts int := 0;
  v_prefix text;
begin
  select * into v_shop from public.tenants where id = v_tenant;
  if not found or v_tenant <> 'oddbox' then
    return jsonb_build_object('ok', false, 'error', 'invalid_tenant');
  end if;
  if v_zone not in ('inside_dhaka','outside_dhaka') then
    return jsonb_build_object('ok', false, 'error', 'invalid_zone');
  end if;
  if coalesce(jsonb_array_length(payload->'items'), 0) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_cart');
  end if;
  if length(trim(coalesce(payload->>'customer_name',''))) < 2 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if coalesce(payload->>'phone','') !~ '^01[3-9][0-9]{8}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;
  if length(trim(coalesce(payload->>'address',''))) < 8 then
    return jsonb_build_object('ok', false, 'error', 'invalid_address');
  end if;

  -- payment method
  if v_method = 'cod' then
    if not v_shop.cod_enabled then
      return jsonb_build_object('ok', false, 'error', 'cod_disabled');
    end if;
    v_trx := null; v_sender := null;
  elsif v_method = 'bkash' then
    if not v_shop.bkash_enabled or v_shop.bkash_number is null then
      return jsonb_build_object('ok', false, 'error', 'bkash_disabled');
    end if;
    if v_trx is null or v_trx !~ '^[A-Z0-9]{8,12}$' then
      return jsonb_build_object('ok', false, 'error', 'invalid_trx');
    end if;
    if v_sender is null or v_sender !~ '^01[3-9][0-9]{8}$' then
      return jsonb_build_object('ok', false, 'error', 'invalid_sender');
    end if;
    if exists (select 1 from public.orders where upper(bkash_trx_id) = v_trx) then
      return jsonb_build_object('ok', false, 'error', 'trx_used');
    end if;
  else
    return jsonb_build_object('ok', false, 'error', 'invalid_payment');
  end if;

  -- price every line against the live catalogue
  for v_item in select * from jsonb_array_elements(payload->'items') loop
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid and tenant = v_tenant and is_active;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'product_unavailable');
    end if;

    if exists (
      select 1 from public.categories c
      join public.sections s on s.id = c.section_id
      where c.id = v_product.category_id and s.status <> 'live'
    ) then
      return jsonb_build_object('ok', false, 'error', 'section_closed');
    end if;

    if (v_product.seasonal_from is not null and v_product.seasonal_from > current_date)
      or (v_product.seasonal_to is not null and v_product.seasonal_to < current_date) then
      return jsonb_build_object('ok', false, 'error', 'season_closed');
    end if;

    v_qty := least(greatest(coalesce((v_item->>'qty')::int, 1), 1), 20);
    if v_product.stock is not null and v_product.stock < v_qty then
      return jsonb_build_object('ok', false, 'error', 'out_of_stock');
    end if;

    v_variant_label := nullif(trim(v_item->>'variant_label'), '');
    v_unit := v_product.price_bdt;
    if v_variant_label is not null then
      v_unit := null;
      select v_product.price_bdt + (v->>'priceDelta')::int into v_unit
        from jsonb_array_elements(v_product.variants) v
        where v->>'label' = v_variant_label
        limit 1;
      if v_unit is null then
        return jsonb_build_object('ok', false, 'error', 'invalid_variant');
      end if;
    end if;

    v_subtotal := v_subtotal + v_unit * v_qty;
  end loop;

  v_fee := case when v_zone = 'inside_dhaka' then v_shop.delivery_fee_inside else v_shop.delivery_fee_outside end;
  if v_shop.free_delivery_over is not null and v_subtotal >= v_shop.free_delivery_over then
    v_fee := 0;
  end if;

  v_prefix := 'OB-' || to_char(now() at time zone 'Asia/Dhaka', 'YYMMDD') || '-';
  loop
    begin
      v_order_no := v_prefix || lpad((floor(random() * 9000) + 1000)::text, 4, '0');
      insert into public.orders (tenant, order_no, customer_name, phone, address, district,
                                 thana_area, zone, notes_bn, gift_message_bn,
                                 subtotal_bdt, delivery_fee_bdt, total_bdt, status,
                                 payment_method, payment_status, bkash_trx_id, bkash_sender)
      values (v_tenant, v_order_no, trim(payload->>'customer_name'), payload->>'phone',
              trim(payload->>'address'), coalesce(nullif(payload->>'district',''), '—'),
              nullif(payload->>'thana_area',''), v_zone,
              nullif(payload->>'notes_bn',''), nullif(left(payload->>'gift_message_bn', 120),''),
              v_subtotal, v_fee, v_subtotal + v_fee, 'pending',
              v_method,
              case when v_method = 'bkash' then 'pending_verification' else 'unpaid' end,
              v_trx, v_sender)
      returning id into v_order_id;
      exit;
    exception when unique_violation then
      if exists (select 1 from public.orders where upper(bkash_trx_id) = v_trx) then
        return jsonb_build_object('ok', false, 'error', 'trx_used');
      end if;
      v_attempts := v_attempts + 1;
      if v_attempts > 5 then raise; end if;
    end;
  end loop;

  -- items + stock decrement
  for v_item in select * from jsonb_array_elements(payload->'items') loop
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid and tenant = v_tenant;
    v_variant_label := nullif(trim(v_item->>'variant_label'), '');
    v_unit := v_product.price_bdt;
    if v_variant_label is not null then
      select v_product.price_bdt + (v->>'priceDelta')::int into v_unit
        from jsonb_array_elements(v_product.variants) v
        where v->>'label' = v_variant_label limit 1;
    end if;
    v_qty := least(greatest(coalesce((v_item->>'qty')::int, 1), 1), 20);

    insert into public.order_items (order_id, product_id, title_snapshot_bn, variant_label_bn, unit_price_bdt, qty)
    values (v_order_id, v_product.id, v_product.title_bn, v_variant_label, v_unit, v_qty);

    if v_product.stock is not null then
      update public.products set stock = greatest(stock - v_qty, 0) where id = v_product.id;
    end if;
  end loop;

  return jsonb_build_object('ok', true, 'order_no', v_order_no, 'total', v_subtotal + v_fee,
                            'payment_method', v_method);
end $$;

grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ---------- TRACK ORDER (now shows payment status, hides private fields) ----------

create or replace function public.track_order(p_phone text, p_order_no text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_items jsonb;
begin
  select * into v_order from public.orders
    where upper(order_no) = upper(trim(p_order_no)) and phone = trim(p_phone);
  if not found then
    return jsonb_build_object('found', false);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'title', title_snapshot_bn, 'variant', variant_label_bn,
    'unitPrice', unit_price_bdt, 'qty', qty)), '[]')
    into v_items
    from public.order_items where order_id = v_order.id;

  return jsonb_build_object(
    'found', true,
    'order', to_jsonb(v_order) - 'id' - 'phone' - 'address' - 'bkash_sender' - 'bkash_trx_id' - 'notes_bn',
    'items', v_items);
end $$;

grant execute on function public.track_order(text, text) to anon, authenticated;
