create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.workspace_snapshots enable row level security;
create policy "owner reads workspace with mfa" on public.workspace_snapshots for select to authenticated using (user_id = auth.uid() and (auth.jwt()->>'aal') = 'aal2');
create policy "owner creates workspace with mfa" on public.workspace_snapshots for insert to authenticated with check (user_id = auth.uid() and (auth.jwt()->>'aal') = 'aal2');
create policy "owner updates workspace with mfa" on public.workspace_snapshots for update to authenticated using (user_id = auth.uid() and (auth.jwt()->>'aal') = 'aal2') with check (user_id = auth.uid() and (auth.jwt()->>'aal') = 'aal2');

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);
alter table public.audit_events enable row level security;
create policy "owner reads audit with mfa" on public.audit_events for select to authenticated using (user_id = auth.uid() and (auth.jwt()->>'aal') = 'aal2');
create policy "owner appends audit with mfa" on public.audit_events for insert to authenticated with check (user_id = auth.uid() and (auth.jwt()->>'aal') = 'aal2');
create or replace function public.log_workspace_change() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.audit_events(user_id, action) values (new.user_id, case when tg_op = 'INSERT' then 'workspace_created' else 'workspace_updated' end); return new; end; $$;
drop trigger if exists workspace_audit_trigger on public.workspace_snapshots;
create trigger workspace_audit_trigger after insert or update on public.workspace_snapshots for each row execute function public.log_workspace_change();
create index if not exists idx_audit_events_user_created on public.audit_events(user_id, created_at desc);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('receipts','receipts',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict (id) do nothing;
create policy "owner reads receipts with mfa" on storage.objects for select to authenticated using (bucket_id='receipts' and (storage.foldername(name))[1]=auth.uid()::text and (auth.jwt()->>'aal')='aal2');
create policy "owner uploads receipts with mfa" on storage.objects for insert to authenticated with check (bucket_id='receipts' and (storage.foldername(name))[1]=auth.uid()::text and (auth.jwt()->>'aal')='aal2');
