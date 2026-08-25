-- ============================================================
-- Two-shop platform: oddboxbd.shop + mithebangla.shop
-- Run this whole file once in Supabase SQL Editor (or via CLI).
-- Re-runnable: uses IF NOT EXISTS / ON CONFLICT guards.
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists moddatetime;

-- ---------- TABLES ----------

create table if not exists public.tenants (
  id text primary key check (id in ('oddbox','mithai')),
  name_bn text not null,
  announcement_bn text,
  delivery_fee_inside int not null default 70 check (delivery_fee_inside >= 0),
  delivery_fee_outside int not null default 140 check (delivery_fee_outside >= 0),
  free_delivery_over int,
  whatsapp_number text,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant text not null references public.tenants(id) on delete cascade,
  slug text not null,
  name_bn text not null,
  emoji text,
  sort int not null default 0,
  unique (tenant, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant text not null references public.tenants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null,
  title_bn text not null,
  tagline_bn text,
  description_bn text,
  price_bdt int not null check (price_bdt >= 0),
  compare_price_bdt int,
  images text[] not null default '{}',
  variants jsonb not null default '[]',
  stock int check (stock is null or stock >= 0),
  badge_bn text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  seasonal_from date,
  seasonal_to date,
  sort int not null default 100,
  created_at timestamptz not null default now(),
  unique (tenant, slug)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant text not null references public.tenants(id),
  order_no text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  district text not null,
  thana_area text,
  zone text not null check (zone in ('inside_dhaka','outside_dhaka')),
  notes_bn text,
  gift_message_bn text,
  subtotal_bdt int not null check (subtotal_bdt >= 0),
  delivery_fee_bdt int not null check (delivery_fee_bdt >= 0),
  total_bdt int not null check (total_bdt >= 0),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_tenant_status_idx on public.orders (tenant, status, created_at desc);
create index if not exists orders_phone_idx on public.orders (phone);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title_snapshot_bn text not null,
  variant_label_bn text,
  unit_price_bdt int not null,
  qty int not null check (qty > 0)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'moderator' check (role in ('owner','moderator')),
  assigned_tenants text[] not null default '{oddbox,mithai}',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- updated_at maintenance
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function moddatetime(updated_at);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
for each row execute function moddatetime(updated_at);

-- ---------- STAFF HELPER FUNCTIONS ----------
-- security definer so policies never recurse into profiles RLS

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid())
$$;

create or replace function public.can_manage(t text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'owner' or t = any (p.assigned_tenants))
  )
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'
  )
$$;

-- ---------- NEW USER -> PROFILE ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------

alter table public.tenants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_log enable row level security;

-- tenants: world-readable, owner-writable
drop policy if exists tenants_public_read on public.tenants;
create policy tenants_public_read on public.tenants
for select using (true);

drop policy if exists tenants_owner_write on public.tenants;
create policy tenants_owner_write on public.tenants
for update using (public.is_owner());

-- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
for select using (true);

drop policy if exists categories_staff_write on public.categories;
create policy categories_staff_write on public.categories
for all using (public.can_manage(tenant)) with check (public.can_manage(tenant));

-- products: anon sees only active ones
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
for select using (is_active = true or public.can_manage(tenant));

drop policy if exists products_staff_insert on public.products;
create policy products_staff_insert on public.products
for insert with check (public.can_manage(tenant));

drop policy if exists products_staff_update on public.products;
create policy products_staff_update on public.products
for update using (public.can_manage(tenant)) with check (public.can_manage(tenant));

drop policy if exists products_staff_delete on public.products;
create policy products_staff_delete on public.products
for delete using (public.can_manage(tenant));

-- orders: anyone may place; staff of the shop manage them
drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert on public.orders
for insert with check (true);

drop policy if exists orders_staff_read on public.orders;
create policy orders_staff_read on public.orders
for select using (public.can_manage(tenant));

drop policy if exists orders_staff_update on public.orders;
create policy orders_staff_update on public.orders
for update using (public.can_manage(tenant)) with check (public.can_manage(tenant));

-- order items follow their parent order
drop policy if exists order_items_staff_read on public.order_items;
create policy order_items_staff_read on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and public.can_manage(o.tenant)
  )
);

drop policy if exists order_items_system_insert on public.order_items;
create policy order_items_system_insert on public.order_items
for insert with check (true);

-- profiles: see yourself; owner sees everyone
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
for select using (id = auth.uid() or public.is_owner());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update using (id = auth.uid() or public.is_owner());

-- audit log: staff read-only
drop policy if exists audit_staff_read on public.audit_log;
create policy audit_staff_read on public.audit_log
for select using (public.is_staff());

-- ---------- STORAGE BUCKET ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
for select using (bucket_id = 'product-images');

drop policy if exists product_images_staff_upload on storage.objects;
create policy product_images_staff_upload on storage.objects
for insert to authenticated
with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists product_images_staff_update on storage.objects;
create policy product_images_staff_update on storage.objects
for update to authenticated
using (bucket_id = 'product-images' and public.is_staff());

drop policy if exists product_images_staff_delete on storage.objects;
create policy product_images_staff_delete on storage.objects
for delete to authenticated
using (bucket_id = 'product-images' and public.is_staff());

-- ---------- PLACE ORDER RPC (authoritative pricing, atomic) ----------

create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_tenant text := payload->>'tenant';
  v_zone text := payload->>'zone';
  v_item jsonb;
  v_product public.products;
  v_variant jsonb;
  v_unit int;
  v_subtotal int := 0;
  v_fee int;
  v_free_over int;
  v_qty int;
  v_variant_label text;
  v_order_no text;
  v_order_id uuid;
  v_attempts int := 0;
begin
  -- basic validation
  if v_tenant not in ('oddbox','mithai') then
    return jsonb_build_object('ok', false, 'error', 'invalid_tenant');
  end if;
  if v_zone not in ('inside_dhaka','outside_dhaka') then
    return jsonb_build_object('ok', false, 'error', 'invalid_zone');
  end if;
  if coalesce(jsonb_array_length(payload->'items'), 0) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_cart');
  end if;
  if length(coalesce(payload->>'customer_name','')) < 2 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if (payload->>'phone') !~ '^01[3-9][0-9]{8}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;
  if length(coalesce(payload->>'address','')) < 8 then
    return jsonb_build_object('ok', false, 'error', 'invalid_address');
  end if;

  -- price every line against the live catalogue
  for v_item in select * from jsonb_array_elements(payload->'items') loop
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid and tenant = v_tenant and is_active;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'product_unavailable');
    end if;

    if (v_product.seasonal_from is not null and v_product.seasonal_from > current_date)
      or (v_product.seasonal_to is not null and v_product.seasonal_to < current_date) then
      return jsonb_build_object('ok', false, 'error', 'season_closed');
    end if;

    v_qty := least(greatest(coalesce((v_item->>'qty')::int, 1), 1), 20);

    if v_product.stock is not null and v_product.stock <= 0 then
      return jsonb_build_object('ok', false, 'error', 'out_of_stock');
    end if;

    v_variant_label := nullif(trim(v_item->>'variant_label'), '');
    v_unit := v_product.price_bdt;

    if v_variant_label is not null then
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

  -- delivery fee from tenant settings
  select case when v_zone = 'inside_dhaka' then delivery_fee_inside else delivery_fee_outside end,
         free_delivery_over
    into v_fee, v_free_over
    from public.tenants where id = v_tenant;

  if v_free_over is not null and v_subtotal >= v_free_over then
    v_fee := 0;
  end if;

  -- unique order number with retries
  v_order_no := null;
  while v_order_no is null loop
    declare
      p text := case when v_tenant = 'mithai' then 'MB' else 'OB' end;
      ymd text := to_char(now(), 'YYMMDD');
      candidate text := p || '-' || ymd || '-' || lpad((floor(random()*9000)+1000)::text, 4, '0');
    begin
      begin
        insert into public.orders (tenant, order_no, customer_name, phone, address, district,
                                   thana_area, zone, notes_bn, gift_message_bn,
                                   subtotal_bdt, delivery_fee_bdt, total_bdt, status)
        values (v_tenant, candidate, payload->>'customer_name', payload->>'phone',
                payload->>'address', coalesce(nullif(payload->>'district',''), '—'),
                nullif(payload->>'thana_area',''), v_zone,
                nullif(payload->>'notes_bn',''), nullif(payload->>'gift_message_bn',''),
                v_subtotal, v_fee, v_subtotal + v_fee, 'pending')
        returning id into v_order_id;
        v_order_no := candidate;
      exception when unique_violation then
        v_attempts := v_attempts + 1;
        if v_attempts > 5 then
          raise;
        end if;
      end;
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

  return jsonb_build_object('ok', true, 'order_no', v_order_no, 'total', v_subtotal + v_fee);
end $$;

grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ---------- TRACK ORDER RPC (no login needed) ----------

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

  return jsonb_build_object('found', true, 'order', to_jsonb(v_order) - 'id' - 'phone' - 'address', 'items', v_items);
end $$;

grant execute on function public.track_order(text, text) to anon, authenticated;

-- ---------- SEED DATA ----------

insert into public.tenants (id, name_bn, announcement_bn, delivery_fee_inside, delivery_fee_outside, free_delivery_over, whatsapp_number)
values
  ('oddbox', 'অডবক্স বিডি', '🚚 ১৫০০৳+ অর্ডারে ডেলিভারি ফ্রি!', 70, 140, 1500, '+8801711000000'),
  ('mithai', 'মিষ্টি বাংলা', '🍃 সুন্দরবনের খাঁটি মধু এখন স্টকে!', 70, 140, 1500, '+8801811000000')
on conflict (id) do nothing;

-- OddBox categories
insert into public.categories (tenant, slug, name_bn, emoji, sort) values
  ('oddbox','farm','ফার্ম সিরিজ','🐄',1),
  ('oddbox','air','বাতাস সিরিজ','💨',2),
  ('oddbox','donkey','গাধা স্পেশাল','🌿',3),
  ('oddbox','combo','কম্বো বক্স','🎁',4)
on conflict do nothing;

-- Mithe Bangla categories
insert into public.categories (tenant, slug, name_bn, emoji, sort) values
  ('mithai','sweets','মিষ্টি','🍮',1),
  ('mithai','dairy','ঘি ও দুধজাত','🧈',2),
  ('mithai','honey','মধু','🍯',3),
  ('mithai','fruits','মৌসুমি ফল','🥭',4)
on conflict do nothing;

-- OddBox products
insert into public.products (tenant, category_id, slug, title_bn, tagline_bn, description_bn, price_bdt, compare_price_bdt, images, variants, stock, badge_bn, is_active, is_featured, sort)
values
  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='farm'),'fresh-cowdung',
   'ফ্রেশ গরুর গোবর (প্রিমিয়াম প্যাক)','গরু বন্ধুকে তার প্রাপ্য উপহার!',
   'আপনার সেই বন্ধুকে কি “গরু” বলে ডাকা হয় গ্রুপে? এবার তাকে অফিসিয়ালি সার্টিফিকেট দিন! সুস্বাদু, সুগঠিত, ফ্রেশ গোবর — এয়ারটাইট বক্সে সাজানো। সাথে থাকছে “বৃষভূষণ সম্মাননা সনদ”। গন্ধের দায়িত্ব গোবরের, হাসির দায়িত্ব আপনার।',
   299, 449, ARRAY['/products/ob-fresh-cowdung.svg'], '[{"label":"সিঙ্গেল পিস","priceDelta":0},{"label":"ফ্যামিলি প্যাক (৩ পিস)","priceDelta":200}]'::jsonb,
   50, '🔥 ভাইরাল', true, true, 1),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='air'),'pure-air-bag',
   'ব্যাগে বিশুদ্ধ ঢাকার বাতাস','যে উপহার শোঁকার পরও শেষ হয় না (নাকি?)',
   'ঢাকার বাতাস এখন দুর্লভ সম্পদ — তাই তো আমরা সংগ্রহ করেছি সকাল ৫টার সবচেয়ে টাটকা বাতাস, ভ্যাকুয়াম-সিল ব্যাগে! উপহার পাওয়া বন্ধু খুলে দেখবে: ঠিক আগের মতোই কিছু নেই। কিন্তু মজা তো গল্পে, তাই না?',
   149, 249, ARRAY['/products/ob-pure-air.svg'], '[{"label":"রেগুলার ব্যাগ","priceDelta":0},{"label":"জাম্বো ব্যাগ","priceDelta":100}]'::jsonb,
   999, NULL, true, true, 2),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='donkey'),'grass-box',
   'গাধা বন্ধুর জন্য ঘাসের বক্স','“খাও, সুস্থ থাও” — সদ্য কাটা ঘাস',
   'যে বন্ধু প্রতি প্ল্যানে দেরি করে, যে ক্লাসমেট প্রতি বছর ফেল করে, যে কলিগ অফিসে শুধু চা খেতে আসে — তাদের সবার জন্য এক বান্ডেল টাটকা ঘাস। হাতে-কলমে বাছাইকৃত, ছাগল-অনুমোদিত কোয়ালিটি।',
   349, 499, ARRAY['/products/ob-grass-box.svg'], NULL,
   40, '🌿 গাধা অ্যাপ্রুভড', true, true, 3),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='farm'),'brick-diamond',
   '“হিরা” উপহার সেট','কারণ মূল্যবোধ মূল্য ছাড়াই দেওয়া যায়',
   'ভেলভেট বক্সে সাজানো একটি আস্ত ইট। বক্স খুলে বন্ধু যা ভাববে, তা-ই আসল উপহার। ইটটি পরে ব্যবহারও করা যাবে — যেমন: জানালায় বাঁধা, বা পরের ঝগড়ায়… না না, ওইটুকু মজা করলেই হলো!',
   199, 299, ARRAY['/products/ob-brick.svg'], NULL,
   60, NULL, true, false, 4),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='combo'),'chili-bomb',
   'ঝাল চকলেট বোম্বা','মিষ্টি মুখে, আগুন পেটে 😈',
   'দেখতে সাধারণ চকলেট, ভিতরে ভুট্টান-লেভেল ঝাল! শেয়ার করলে বন্ধুত্ব, একা খেলে সাহস। প্রতিটি পিসে আলাদা ঝাল-লেভেল লেবেল করা — যেন খেয়ে অভিযোগ করতে না পারে।',
   249, 349, ARRAY['/products/ob-chili.svg'], '[{"label":"হালকা ঝাল","priceDelta":0},{"label":"আগুন মোড 🔥","priceDelta":50}]'::jsonb,
   80, '😈 প্র্যাংক ক্লাসিক', true, true, 5),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='combo'),'future-gift',
   'সম্পূর্ণ খালি বক্স — “ভবিষ্যতের উপহার”','দার্শনিকদের জন্য বিশেষ প্যাকেজ',
   'বক্সটি সম্পূর্ণ খালি। কারণ সবচেয়ে বড় উপহার হলো আশা। কার্ডে লেখা থাকবে: “যা চেয়েছিলে, জীবন তা-ই দেবে — একদিন।” নাস্তিক বন্ধুদের জন্য সুপারিশ করা হয় না।',
   99, 149, ARRAY['/products/ob-empty-box.svg'], NULL,
   120, '🧠 দার্শনিক পছন্দ', true, false, 6),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='farm'),'onion-tears',
   'পেঁয়াজ টিয়ার্স বুকে (১০টি পেঁয়াজ)','কাঁদানো আর দাম বাড়ানো — দুটোই গ্যারান্টেড',
   'দেশের যেখানে পেঁয়াজের দাম আবেগের চেয়েও ঊর্ধ্বে, সেখানে ১০টি ফ্রেশ পেঁয়াজের বুকে আসলেই রাজকীয় উপহার। সাথে “কষ্ট পাইনি, পেঁয়াজের গন্ধে চোখে পানি আসছে” লেখা কার্ড।',
   179, 259, ARRAY['/products/ob-onion.svg'], NULL,
   70, NULL, true, false, 7),

  ('oddbox',(select id from public.categories where tenant='oddbox' and slug='combo'),'donkey-full-pack',
   'সম্পূর্ণ গাধা প্যাক','গোবর + ঘাস + বাতাস — ফুল সেট, ফুল মজা',
   'এক বন্ধুকে তিন ধরনের সম্মান একসাথে! গোবর (গরু-সার্টিফিকেট), ঘাস (গাধা-নমস্কার) আর বাতাসের ব্যাগ (শূন্যতার প্রতীক)। জন্মদিনে এটা পেলে বুঝতে হবে — বন্ধুরা আর রেহাই দেবে না।',
   599, 899, ARRAY['/products/ob-combo.svg'], NULL,
   30, '💎 বেস্ট ভ্যালু', true, true, 8)
on conflict (tenant, slug) do nothing;

-- Mithe Bangla products
insert into public.products (tenant, category_id, slug, title_bn, tagline_bn, description_bn, price_bdt, compare_price_bdt, images, variants, stock, badge_bn, is_active, is_featured, sort)
values
  ('mithai',(select id from public.categories where tenant='mithai' and slug='sweets'),'misti-doi',
   'টাটকা মিষ্টি দই','প্রতিদিন ভোরে টবে জমে, দুপুরে ঘরে পৌঁছায়',
   'ঘি-মাখা উপরের লেয়ার, নরম ছানার ভিতরে টক-মিষ্টি সমতা। প্রতিদিন সকালে মাটির ভাঁড়ে জমানো হয় সীমিত সংখ্যক দই — শেষ হলে আগামীকাল অপেক্ষা।',
   250, 300, ARRAY['/products/mb-doi.svg'], '[{"label":"৫০০ গ্রাম (মাটির ভাঁড়)","priceDelta":0},{"label":"১ কেজি (মাটির ভাঁড়)","priceDelta":230}]'::jsonb,
   40, '🆕 আজকের ব্যাচ', true, true, 1),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='dairy'),'gawa-ghee',
   'ঘানি ভাঙা খাঁটি গরুর ঘি','এক চামচে গ্রামবাংলার সকাল',
   'দেশি গরুর দুধের সর থেকে, ঐতিহ্যবাহী ঘানিতে ভাঙা খাঁটি ঘি। কোনো মেশানো তেল নেই, কোনো গন্ধ-বাড়ানো কেমিক্যাল নেই। রান্নায় দিলে ঘর ভরে ওঠে সেই চেনা খুশবু।',
   1250, 1450, ARRAY['/products/mb-ghee.svg'], '[{"label":"৫০০ গ্রাম","priceDelta":0},{"label":"১ কেজি","priceDelta":1150}]'::jsonb,
   25, NULL, true, true, 2),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='sweets'),'roshogolla',
   'নরম রসগোল্লা (১২ পিস)','চিনির সিরায় ভেসে থাকা ছানার তুলো',
   'হালকা চিবালেই গলে যায় — এমন নরম রসগোল্লা, যা বাড়ির মিষ্টির দোকান নয়, বরং অভিজ্ঞ মিষ্টির হাতে তৈরি। বিকেলের দুধচা-র সেরা সঙ্গী।',
   380, 450, ARRAY['/products/mb-roshogolla.svg'], '[{"label":"১২ পিস","priceDelta":0},{"label":"২৫ পিস","priceDelta":400}]'::jsonb,
   35, NULL, true, true, 3),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='sweets'),'nolen-gurer-sandesh',
   'নলেন গুড়ের সন্দেশ','শীতের সকালের সেরা মিষ্টি, এখন সারাবছর',
   'খেজুর গাছের নলেন গুড়ের গন্ধে যেন পুরো শীতকাল মুড়িয়ে রাখা। হাতে ছানা ঘাঁটা, কলাপাতায় পরিবেশিত — অতিথি এলে এর চেয়ে ভদ্র উপহার আর নেই।',
   480, 550, ARRAY['/products/mb-sandesh.svg'], '[{"label":"১২ পিস","priceDelta":0},{"label":"২৪ পিস","priceDelta":440}]'::jsonb,
   30, NULL, true, false, 4),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='sweets'),'chanar-payesh',
   'ছানার পায়েস','দাদির রান্নার সেই চেনা স্বাদ',
   'ঘন দুধে ছানা ফুটিয়ে, এলাচ আর কিশমিশ ছড়িয়ে তৈরি ঘরোয়া ছানার পায়েস। জন্মদিন, মিলাদ, বা এমনি-ই “আজ কিছু মিষ্টি খিতে ইচ্ছে করছে”-র দিনে পারফেক্ট।',
   580, 650, ARRAY['/products/mb-payesh.svg'], '[{"label":"৫০০ গ্রাম","priceDelta":0},{"label":"১ কেজি","priceDelta":520}]'::jsonb,
   20, NULL, true, false, 5),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='honey'),'sundarban-honey',
   'সুন্দরবনের খাঁটি মধু','মৌয়ালের হাত থেকে সোজা বোতলে',
   'প্রতি বর্ষার শুরুতে সুন্দরবনের মৌয়ালরা খালি হাতে মৌচাক সংগ্রহ করেন। ছাঁকনে ছাঁকা, কোনো চিনি বা মোলাস মেশানো নয়। বোতলের গায়ে থাকে সংগ্রহের তারিখ আর মৌয়ালের এলাকা।',
   1850, 2200, ARRAY['/products/mb-honey.svg'], '[{"label":"৫০০ গ্রাম","priceDelta":0},{"label":"১ কেজি","priceDelta":1600}]'::jsonb,
   18, '🍯 সীমিত স্টক', true, true, 6),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='fruits'),'himsagar-mango',
   'হিমসাগর আম (৫ কেজি বক্স)','মৌসুমের রাজা, সরাসরি সাতক্ষীরা থেকে',
   'কার্বাইডমুক্ত, গাছপাকা হিমসাগর — একবার খেলে বাজারের আম ভুলে যাবেন। কাঁচা পাঠানো হয় না; পাকা আম কাগজে মুড়িয়ে নরম বাক্সে বাছাই করে পাঠানো হয়। মৌসুম: জুন–আগস্ট।',
   1250, 1500, ARRAY['/products/mb-mango.svg'], NULL,
   45, '🥭 মৌসুমি', true, true, 7),

  ('mithai',(select id from public.categories where tenant='mithai' and slug='dairy'),'malai-cream-roll',
   'মালাই ক্রিম রোল','বাইরে মোচা-ক্রাঞ্চি, ভিতরে ঠান্ডা মালাই',
   'লেয়ারে লেয়ারে কুরকুরে পেস্ট্রি, ভিতরে ঘন দুধের মালাই ক্রিম। ফ্রিজে রেখে ঠান্ডা খেলে একদম বেকারি-স্টাইল অনুভূতি — তবে সাথে থাকে ঘরে তৈরির আস্থা।',
   520, 600, ARRAY['/products/mb-creamroll.svg'], '[{"label":"৬ পিস","priceDelta":0},{"label":"১২ পিস","priceDelta":480}]'::jsonb,
   22, NULL, true, false, 8)
on conflict (tenant, slug) do nothing;
