create table public.impact_creator_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  impact_subid text not null,
  impact_partner_id text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(creator_id)
);

alter table public.impact_creator_accounts enable row level security;

create policy "Creators view own impact account"
on public.impact_creator_accounts for select
to authenticated
using (auth.uid() = creator_id or public.has_role(auth.uid(), 'admin'::app_role));

create policy "Creators insert own impact account"
on public.impact_creator_accounts for insert
to authenticated
with check (auth.uid() = creator_id);

create policy "Creators update own impact account"
on public.impact_creator_accounts for update
to authenticated
using (auth.uid() = creator_id or public.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins delete impact account"
on public.impact_creator_accounts for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role));

create trigger update_impact_creator_accounts_updated_at
before update on public.impact_creator_accounts
for each row execute function public.update_updated_at_column();