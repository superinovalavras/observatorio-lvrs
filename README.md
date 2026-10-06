# Observatório VDI — v2

Dashboard público do ecossistema de inovação de Lavras + painel administrativo.
Next.js 16 + Supabase, publicado na Vercel em `observatorio.lvrs.com.br`.

## O que tem

**Site público (6 abas):** Panorama e AgroFoodTech · Startups (vitrine) · Instituições ·
Programas e políticas · Tração e mercado · Investimento e gargalos. O botão
“Responder o censo” fica fixo no cabeçalho, no fim de cada aba e nos estados vazios.

**Painel (`/admin`, com login):** importa a planilha do Google Form, revisa e codifica
cada resposta (aprovar em 1 clique ou revisar campo a campo), CRUD de startups,
instituições, programas/projetos/editais/incentivos e indicadores “Lavras em números”,
e os parâmetros (ciclo, publicar números, grupo mínimo, link do formulário).

## Regras de privacidade embutidas

- O navegador nunca lê o banco. As páginas são montadas no servidor e só levam
  **números agregados** e a **vitrine mínima** (nome, vertical, fase, links liberados).
- Startup só aparece na vitrine com `consentiu_vitrine` — que o admin marca quando a
  resposta do formulário autoriza (ver “Pergunta de consentimento” abaixo).
- **Grupo mínimo** (padrão 3): nenhum recorte com menos startups mostra número.
  Em perguntas de escolha única, uma fatia oculta sozinha leva junto a menor visível
  (senão sairia por subtração). Rankings não ordenam as ocultas entre si.
- Enquanto “Publicar os números do ciclo” estiver desligado, as abas mostram
  “aguardando o ciclo” com a contagem de respostas e o botão do formulário.

## Pôr no ar

1. **Supabase:** criar um projeto (ou usar o existente) e rodar
   `supabase/migrations/0001_observatorio.sql` no SQL Editor.
2. **Admin:** em Authentication › Users, criar o usuário da equipe; depois, no SQL Editor:
   `insert into admins (user_id, email) values ('UUID-DO-USUARIO', 'email@...');`
3. **Variáveis** (Vercel › Settings › Environment Variables, e `.env.local` para rodar local):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SECRET_KEY=...
   ```
4. **Vercel:** o projeto passa de site estático para Next.js — conferir que o
   Framework Preset ficou “Next.js”.

Sem as variáveis o site funciona com o conteúdo-semente (`src/lib/semente.ts`) e o
painel mostra o aviso de configuração.

## Rodar local

```bash
npm install
npm run dev          # site real (sem Supabase: estado vazio)
npm run dev:demo     # 24 startups FICTÍCIAS para ver os gráficos — nunca em produção
```

## Pergunta de consentimento (falta no Google Form)

Adicionar ao fim do formulário, escolha única, obrigatória:

> **A startup autoriza aparecer na vitrine pública do Observatório?**
> Aparecem só o nome, a vertical, a fase e os links públicos (site/redes). Nenhum
> número da empresa é publicado individualmente.
> ○ Sim, autorizo  ○ Não

O importador reconhece a coluna pelo trecho “vitrine” e já sugere a marcação.

## Arquivos

| Onde | O quê |
|---|---|
| `src/lib/censo.ts` | vocabulário do formulário (verticais, faixas, 12 projetos…) |
| `src/lib/agregados.ts` | toda conta que vai para o site, com o grupo mínimo |
| `src/lib/importacao.ts` | leitura da planilha e sugestão de codificação do texto livre |
| `src/lib/server/acoes.ts` | Server Actions do painel (todas começam por `exigirAdmin`) |
| `src/lib/semente.ts` | conteúdo inicial (= o que a migração grava) |
| `src/lib/demo.ts` | startups fictícias do `dev:demo` |
