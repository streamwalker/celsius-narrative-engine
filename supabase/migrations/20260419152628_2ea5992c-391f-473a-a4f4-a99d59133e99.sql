create table public.script_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Script',
  version_label text not null default 'v1',
  content text not null default '',
  format text not null default 'graphic-novel',
  formatted_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.script_drafts enable row level security;

create policy "Users can view their own drafts"
  on public.script_drafts for select
  using (auth.uid() = user_id);

create policy "Users can create their own drafts"
  on public.script_drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own drafts"
  on public.script_drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own drafts"
  on public.script_drafts for delete
  using (auth.uid() = user_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_script_drafts_updated_at
  before update on public.script_drafts
  for each row execute function public.update_updated_at_column();

create index idx_script_drafts_user_id on public.script_drafts(user_id);
create index idx_script_drafts_updated_at on public.script_drafts(updated_at desc);