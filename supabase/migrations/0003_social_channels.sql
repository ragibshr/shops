-- ============================================================
-- 0003 — Social channels: Instagram / Facebook / WhatsApp / Messenger
--   * social handles in shop settings
--   * order "source" (website, WhatsApp, Messenger, …) for chat orders
--   * reels/posts shown on the homepage
-- Run AFTER 0002. Safe to re-run.
-- ============================================================

alter table public.tenants add column if not exists instagram_handle text;
alter table public.tenants add column if not exists facebook_page text;
alter table public.tenants add column if not exists messenger_username text;

update public.tenants
set instagram_handle   = coalesce(instagram_handle, 'oddboxbd'),
    facebook_page      = coalesce(facebook_page, 'oddboxbd'),
    messenger_username = coalesce(messenger_username, 'oddboxbd')
where id = 'oddbox';

-- where did the order come from?
alter table public.orders add column if not exists source text not null default 'website';

do $$ begin
  alter table public.orders add constraint orders_source_chk
    check (source in ('website','whatsapp','messenger','instagram','facebook','phone','other'));
exception when duplicate_object then null; end $$;

create index if not exists orders_source_idx on public.orders (source, created_at desc);

-- reels / posts to show on the site
create table if not exists public.social_posts (
  id bigint generated always as identity primary key,
  platform text not null check (platform in ('instagram','facebook')),
  url text not null check (url ~ '^https://(www\.)?(instagram\.com|facebook\.com|fb\.watch)/'),
  caption_bn text,
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;

drop policy if exists social_posts_public_read on public.social_posts;
create policy social_posts_public_read on public.social_posts
for select using (is_active or public.is_owner());

drop policy if exists social_posts_owner_write on public.social_posts;
create policy social_posts_owner_write on public.social_posts
for all using (public.is_owner()) with check (public.is_owner());
