// GET /api/painel : os números completos, só para o dono.
// O navegador pede usuário e senha: usuário qualquer, senha = segredo PAINEL_SENHA do projeto.
import { ler, MINIMO_PUBLICO } from "../_lib/contador.js";

function igual(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

function senhaEnviada(request) {
  const cabecalho = request.headers.get("Authorization") || "";
  if (!cabecalho.startsWith("Basic ")) return "";
  try {
    const texto = atob(cabecalho.slice(6));
    return texto.slice(texto.indexOf(":") + 1);
  } catch (_) {
    return "";
  }
}

export async function onRequestGet({ request, env }) {
  const senha = env.PAINEL_SENHA || "";
  if (!senha || !igual(senhaEnviada(request), senha)) {
    return new Response("Senha necessária.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Sheenshot", charset="UTF-8"', "Cache-Control": "no-store" },
    });
  }
  const mapa = await ler(env.DB);
  const site = mapa.site || 0, atualizacoes = mapa.atualizacoes || 0;
  const fmt = (n) => n.toLocaleString("pt-BR");
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="robots" content="noindex">
<title>Sheenshot · downloads</title>
<style>body{font:15px -apple-system,sans-serif;background:#0d0b14;color:#f5f5f7;margin:48px}h1{font-size:18px}
.n{font-size:44px;font-weight:700}.c{display:inline-block;margin-right:48px}p{color:#a9a3b8}</style>
<h1>Sheenshot · downloads</h1>
<div class="c"><div class="n">${fmt(site)}</div>instalações (botão do site)</div>
<div class="c"><div class="n">${fmt(atualizacoes)}</div>atualizações automáticas</div>
<p>${site >= MINIMO_PUBLICO ? "O número já aparece no site." : `O site mostra o número a partir de ${fmt(MINIMO_PUBLICO)}. Faltam ${fmt(MINIMO_PUBLICO - site)}.`}</p>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
