# Sheenshot — site

Site estático (HTML + CSS), em português e inglês.

- `/` detecta o idioma do navegador e manda para `/pt/` ou `/en/` (a escolha no seletor PT | EN fica salva).
- `/pt/`, `/en/` — página principal
- `/pt/privacidade.html`, `/en/privacy.html` — privacidade
- `/pt/suporte.html`, `/en/support.html` — suporte (formulário do Tally)
- `/downloads/Sheenshot-gratis.dmg` — DMG grátis de 30 dias
- Formulários do Tally: lista de espera `D4gGRN` (PT) e `ODONxY` (EN); suporte `rjzZ82` (PT) e `ZjqBbe` (EN)

## Publicar no Cloudflare Pages

1. Cloudflare › Workers & Pages › Create › Pages › Connect to Git › escolha `manifestai/sheenshot`.
2. Project name: `sheenshot` (o endereço fica `sheenshot.pages.dev`).
3. Framework preset: None · Build command: vazio · Build output directory: `/`.
4. Save and Deploy. Cada `git push` publica de novo.

## Atualizar o DMG

1. Gere o DMG: `bash scripts/gerar-dmg.sh gratis` no projeto do app.
2. Copie `build/Sheenshot-<versão>-gratis.dmg` para `downloads/Sheenshot-gratis.dmg` (mesmo nome, para os links continuarem valendo).
3. Atualize o tamanho do DMG em `pt/index.html` e `en/index.html`.
4. Crie um Release novo no GitHub e anexe o DMG.
