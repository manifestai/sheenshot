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

## Publicar uma versão nova do app

O app (DMG grátis) procura versões novas em `/atualizacoes/appcast.xml` e se atualiza sozinho.

1. No projeto do app, suba a versão no Xcode (alvo Sheenshot › General › Version, por exemplo 0.18).
2. Opcional: escreva as novidades em `scripts/novidades/0.18.html` (aparecem na janela de atualização).
3. Gere o DMG: `bash scripts/gerar-dmg.sh gratis`. O script copia sozinho para esta pasta:
   - `downloads/Sheenshot-gratis.dmg` (o botão do site, mesmo endereço de sempre)
   - `downloads/Sheenshot-<versão>-<build>.dmg` (as 3 versões mais novas, usadas pela atualização)
   - `atualizacoes/appcast.xml` (a lista de versões que o app consulta)
   - o tamanho do DMG em `pt/index.html` e `en/index.html`
4. Publique: `git add -A && git commit -m "Sheenshot 0.18" && git push`.
5. Opcional: crie um Release no GitHub e anexe o DMG.

Quem já tem o Sheenshot recebe o aviso no menu em até 1 dia, ou na hora em Ajustes › Atualizações › Procurar agora.

Nunca publique a pasta `Chaves/` do projeto do app nem o DMG `completo`.
