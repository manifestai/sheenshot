// /downloads/* : entrega o DMG de sempre e soma +1 no contador, sem atrasar o download.
// Sheenshot-gratis.dmg = botão do site (instalação nova).
// Sheenshot-<versão>-<build>.dmg baixado pelo atualizador (Sparkle) = atualização.
import { somar, deveContar } from "../_lib/contador.js";

export async function onRequest(context) {
  const { request, env, params } = context;
  const resposta = await context.next();

  try {
    if (resposta.ok && deveContar(request)) {
      const arquivo = String(params.arquivo || "");
      const agente = request.headers.get("User-Agent") || "";
      let chave = null;
      if (arquivo === "Sheenshot-gratis.dmg") chave = "site";
      else if (/^Sheenshot-[\d.]+-\d+\.dmg$/.test(arquivo)) chave = /Sparkle/i.test(agente) ? "atualizacoes" : "site";
      if (chave) context.waitUntil(somar(env.DB, chave).catch(() => {}));
    }
  } catch (_) {
    // O contador nunca impede o download.
  }
  // O _headers do site não vale para respostas de funções: os cabeçalhos do DMG vêm daqui.
  if (!resposta.ok) return resposta;
  const final = new Response(resposta.body, resposta);
  final.headers.set("Content-Type", "application/x-apple-diskimage");
  final.headers.set("Content-Disposition", "attachment");
  final.headers.set("Cache-Control", "public, max-age=300");
  return final;
}
