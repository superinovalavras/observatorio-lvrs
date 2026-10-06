-- Logos de startups, instituições e programas.
-- Os arquivos ficam no bucket público "logos" do Supabase Storage; aqui só a URL.
alter table startups     add column if not exists logo_url text;
alter table instituicoes add column if not exists logo_url text;
alter table programas    add column if not exists logo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
