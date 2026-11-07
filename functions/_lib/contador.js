// Contador de downloads do Sheenshot (banco D1 ligado ao projeto como "DB").
// Se o banco não estiver ligado, nada quebra: os downloads continuam, só não contam.

export const MINIMO_PUBLICO = 500;

const CRIAR = "CREATE TABLE IF NOT EXISTS contagem (chave TEXT PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0)";

export async function somar(db, chave) {
  if (!db) return;
  await db.batch([
    db.prepare(CRIAR),
    db.prepare("INSERT INTO contagem (chave, total) VALUES (?1, 1) ON CONFLICT(chave) DO UPDATE SET total = total + 1").bind(chave),
  ]);
}

export async function ler(db) {
  if (!db) return {};
  await db.prepare(CRIAR).run();
  const { results } = await db.prepare("SELECT chave, total FROM contagem").all();
  const mapa = {};
  for (const linha of results || []) mapa[linha.chave] = linha.total;
  return mapa;
}

// Robôs e verificações de link não contam.
const ROBO = /bot|crawl|spider|slurp|preview|facebookexternalhit|curl|wget|python|httpclient|monitor|uptime/i;

export function deveContar(request) {
  if (request.method !== "GET") return false;
  // Retomada de download (Range a partir do meio do arquivo) não é download novo.
  const range = request.headers.get("Range");
  if (range && !/^bytes=0-/.test(range)) return false;
  const agente = request.headers.get("User-Agent") || "";
  return agente !== "" && !ROBO.test(agente);
}
