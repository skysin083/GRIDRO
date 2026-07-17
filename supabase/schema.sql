-- resumes 테이블 + storage 버킷. Supabase 대시보드 SQL Editor에서 실행할 것.

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "resumes are publicly readable when published"
  on public.resumes for select
  using (is_published or auth.uid() = user_id);

create policy "users manage their own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('resume-images', 'resume-images', true)
on conflict (id) do nothing;

create policy "resume images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'resume-images');

create policy "users upload to their own folder"
  on storage.objects for insert
  with check (bucket_id = 'resume-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users manage their own resume image files"
  on storage.objects for update using (bucket_id = 'resume-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resume-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own resume image files"
  on storage.objects for delete
  using (bucket_id = 'resume-images' and (storage.foldername(name))[1] = auth.uid()::text);
