# Sheenshot — site

Site estático (HTML + CSS), em português e inglês.

- `/` detecta o idioma do navegador e manda para `/pt/` ou `/en/` (a escolha no seletor PT | EN fica salva).
- `/pt/`, `/en/` — página principal (recursos, Grátis e Pro, lista de espera `#lista`/`#waitlist`, perguntas)
- `/pt/gerador-de-fundo.html`, `/en/background-generator.html` — gerador de fundo (Cores do print)
- `/pt/novidades.html`, `/en/whats-new.html` — novidades de cada versão (o link "Ver tudo" do app abre estas páginas: não mude os endereços)
- `/pt/imprensa.html`, `/en/press.html` — kit de imprensa
- `/pt/privacidade.html`, `/en/privacy.html` — privacidade
- `/pt/suporte.html`, `/en/support.html` — suporte (formulário do Tally)
- `/downloads/Sheenshot-gratis.dmg` — DMG com tudo liberado por 30 dias; depois vira a versão grátis
- Formulários do Tally: lista de espera `D4gGRN` (PT) e `ODONxY` (EN); suporte `rjzZ82` (PT) e `ZjqBbe` (EN)

## Ferramentas (`assets/tools.js`)

JavaScript puro, sem bibliotecas. Nada é enviado: as imagens são lidas e desenhadas no próprio navegador. O mesmo código monta a versão compacta (na página principal) e a completa (na página da ferramenta), pelo atributo `data-tool`. A comparação de tamanho do Copiar para IA, na página principal, é só HTML e CSS (`.ai-size`), sem JavaScript.

- `data-tool="background"` — gerador de fundo. Reduz a imagem para ~120 px, ignora pixels pouco saturados, muito escuros ou muito claros, agrupa as cores por tom e usa até 4. Mostra o print sobre o fundo mesh e o degradê (135°), com botão para baixar cada PNG. Com menos de 2 cores vivas, avisa que o Sheenshot usaria o fundo padrão. Já começa com um exemplo desenhado no próprio JS.
- `data-tool="stage"` — antes e depois do Palco limpo: mesa de Mac desenhada em CSS, com arraste (ou setas do teclado) e a opção Pro de esconder a barra de menus e o Dock.
- `data-full-href="…"` mostra o link para a versão completa.
- `data-copy="id"` em um botão copia o texto do elemento com esse id (usado na página de imprensa).

## Kit de imprensa

`assets/press/sheenshot-press-kit.zip` tem o ícone, o logo, `og.png`, as imagens do app (`screenshots/`) e `textos.txt` com as descrições em português e inglês. Se trocar alguma imagem em `assets/img/`, gere o ZIP de novo (por exemplo, com o `zipfile` do Python) para ele não ficar desatualizado.

## Vídeos em loop (opcional)

Depois, dá para gravar loops curtos com o próprio Sheenshot e colocar junto (ou no lugar) das demonstrações da página principal:

- `assets/video/palco.mp4` — Palco limpo
- `assets/video/biblioteca.mp4` — Biblioteca
- `assets/video/cores.mp4` — Cores do print
- `assets/video/ia.mp4` — Copiar para IA

Cerca de 2 MB cada, MP4 sem som, com uma imagem de capa (`poster`), por exemplo `<video autoplay muted loop playsinline poster="…">`. Nenhuma página usa esses arquivos ainda.

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
