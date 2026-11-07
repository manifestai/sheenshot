// GET /api/downloads : o número público. Só aparece a partir de 500 instalações;
// antes disso, responde só { publico: false } (o número não sai daqui).
import { ler, MINIMO_PUBLICO } from "../_lib/contador.js";

export async function onRequestGet({ env }) {
  let corpo = { publico: false };
  try {
    const total = (await ler(env.DB)).site || 0;
    if (total >= MINIMO_PUBLICO) corpo = { publico: true, total };
  } catch (_) {}
  return new Response(JSON.stringify(corpo), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
