import { DEFAULT_CONTENT, DEFAULT_FAQ, FAQ_LIST_KEY, MAX_FAQ_ITEMS } from "./content.js";

const CONTENT_KEY = "content"; // única key de KV donde vive el JSON de overrides

// Token del beacon de Cloudflare Web Analytics (index.html). No es secreto:
// ya está público en el HTML, es el identificador del sitio ("siteTag") en
// la API de Analytics.
const ANALYTICS_SITE_TAG = "7b7af660163146bebe42965e51f5e306";
const ANALYTICS_WINDOW_DAYS = 30;

/**
 * Traduce el dominio de origen a un nombre reconocible. Varias plataformas
 * usan más de un dominio (LinkedIn, por ejemplo, redirige por lnkd.in), así
 * que se agrupan bajo una misma etiqueta.
 */
function nombreDeFuente(host) {
  if (!host) return "Directo / desconocido";

  const h = host.toLowerCase().replace(/^www\./, "");

  const mapa = [
    [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
    [/(^|\.)google\./, "Google"],
    [/(^|\.)bing\.com$/, "Bing"],
    [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
    [/(^|\.)instagram\.com$/, "Instagram"],
    [/(^|\.)facebook\.com$|^l\.facebook\.com$|^fb\.me$/, "Facebook"],
    [/(^|\.)whatsapp\.com$|^wa\.me$/, "WhatsApp"],
    [/(^|\.)x\.com$|(^|\.)twitter\.com$|^t\.co$/, "X / Twitter"],
    [/(^|\.)youtube\.com$|^youtu\.be$/, "YouTube"],
    [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "ChatGPT"],
    [/(^|\.)perplexity\.ai$/, "Perplexity"],
    [/(^|\.)claude\.ai$/, "Claude"],
    [/(^|\.)gemini\.google\.com$/, "Gemini"],
    [/(^|\.)axiomaconsulting\.com\.ar$/, "Navegación interna"],
  ];

  for (const [patron, nombre] of mapa) {
    if (patron.test(h)) return nombre;
  }
  return h;
}

/**
 * Trae un resumen de Cloudflare Web Analytics (visitas totales y páginas más
 * vistas de los últimos ANALYTICS_WINDOW_DAYS días) vía la GraphQL Analytics
 * API. Requiere los secrets CF_ANALYTICS_TOKEN y CF_ACCOUNT_ID configurados
 * en el Worker; si no están, o si la consulta falla, devuelve null (el panel
 * lo muestra como "no disponible" en vez de romperse).
 */
async function getAnalytics(env) {
  if (!env.CF_ANALYTICS_TOKEN || !env.CF_ACCOUNT_ID) return null;

  const until = new Date();
  const since = new Date(until.getTime() - ANALYTICS_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const query = `
    query WebAnalytics($accountTag: String!, $siteTag: String!, $since: Time!, $until: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          totals: rumPageloadEventsAdaptiveGroups(
            filter: { AND: [{ datetime_geq: $since, datetime_leq: $until }, { siteTag: $siteTag }, { bot: 0 }] }
            limit: 1
          ) {
            sum { visits }
          }
          topPages: rumPageloadEventsAdaptiveGroups(
            filter: { AND: [{ datetime_geq: $since, datetime_leq: $until }, { siteTag: $siteTag }, { bot: 0 }] }
            limit: 5
            orderBy: [sum_visits_DESC]
          ) {
            sum { visits }
            dimensions { requestPath }
          }
          sources: rumPageloadEventsAdaptiveGroups(
            filter: { AND: [{ datetime_geq: $since, datetime_leq: $until }, { siteTag: $siteTag }, { bot: 0 }] }
            limit: 10
            orderBy: [sum_visits_DESC]
          ) {
            sum { visits }
            dimensions { refererHost }
          }
          series: rumPageloadEventsAdaptiveGroups(
            filter: { AND: [{ datetime_geq: $since, datetime_leq: $until }, { siteTag: $siteTag }, { bot: 0 }] }
            limit: 5000
            orderBy: [date_ASC]
          ) {
            sum { visits }
            dimensions { date refererHost }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          accountTag: env.CF_ACCOUNT_ID,
          siteTag: ANALYTICS_SITE_TAG,
          since: since.toISOString(),
          until: until.toISOString(),
        },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.errors) return null;

    const account = json.data?.viewer?.accounts?.[0];
    if (!account) return null;

    // Varios dominios se agrupan bajo una misma fuente (ej. linkedin.com y
    // lnkd.in), así que sumamos las visitas por nombre resultante.
    const porFuente = new Map();
    for (const row of account.sources || []) {
      const nombre = nombreDeFuente(row.dimensions?.refererHost);
      porFuente.set(nombre, (porFuente.get(nombre) || 0) + (row.sum?.visits ?? 0));
    }
    const sources = [...porFuente.entries()]
      .map(([name, visits]) => ({ name, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8);

    // Serie temporal: una fila por día y fuente, para poder graficar tanto el
    // total como el desglose por origen sin volver a consultar la API.
    const series = (account.series || []).map((row) => ({
      date: row.dimensions?.date,
      source: nombreDeFuente(row.dimensions?.refererHost),
      visits: row.sum?.visits ?? 0,
    }));

    return {
      windowDays: ANALYTICS_WINDOW_DAYS,
      totalVisits: account.totals?.[0]?.sum?.visits ?? 0,
      topPages: (account.topPages || []).map((row) => ({
        path: row.dimensions?.requestPath || "/",
        visits: row.sum?.visits ?? 0,
      })),
      sources,
      series,
      // Rango consultado, para que el gráfico dibuje el eje completo aunque
      // algunos días no tengan visitas.
      since: since.toISOString().slice(0, 10),
      until: until.toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

/**
 * Lee el contenido actual: valores por defecto + overrides guardados en KV.
 * Si KV falla o está vacío, devuelve los valores por defecto (nunca rompe el sitio).
 */
async function getContent(env) {
  if (!env.CONTENT_KV) return { ...DEFAULT_CONTENT };
  try {
    const stored = await env.CONTENT_KV.get(CONTENT_KEY, "json");
    return { ...DEFAULT_CONTENT, ...(stored || {}) };
  } catch {
    return { ...DEFAULT_CONTENT };
  }
}

async function saveContent(env, partial) {
  const current = await getContent(env);
  // Solo se guardan las claves que existen en el esquema por defecto,
  // para no permitir inyectar claves arbitrarias en el JSON de KV.
  const next = { ...current };
  for (const key of Object.keys(DEFAULT_CONTENT)) {
    if (typeof partial[key] === "string") next[key] = partial[key];
  }
  await env.CONTENT_KV.put(CONTENT_KEY, JSON.stringify(next));
  return next;
}

/** Lista de FAQs guardada (o la de por defecto si todavía no se editó). */
async function getFaq(env) {
  if (!env.CONTENT_KV) return [...DEFAULT_FAQ];
  try {
    const stored = await env.CONTENT_KV.get(FAQ_LIST_KEY, "json");
    return Array.isArray(stored) && stored.length ? stored : [...DEFAULT_FAQ];
  } catch {
    return [...DEFAULT_FAQ];
  }
}

/**
 * Guarda la lista de FAQs. Sanea la entrada: descarta lo que no sea
 * {q, a} con texto real, recorta el largo y limita la cantidad de ítems.
 */
async function saveFaq(env, items) {
  if (!Array.isArray(items)) return null;

  const limpio = items
    .filter((it) => it && typeof it.q === "string" && typeof it.a === "string")
    .map((it) => ({ q: it.q.trim().slice(0, 300), a: it.a.trim().slice(0, 2000) }))
    .filter((it) => it.q && it.a)
    .slice(0, MAX_FAQ_ITEMS);

  await env.CONTENT_KV.put(FAQ_LIST_KEY, JSON.stringify(limpio));
  return limpio;
}

/* ================= Consultas de la calculadora (leads) ================= */

const LEAD_PREFIX = "lead:";
const MAX_LEADS_LISTADOS = 200;

/** Validación de email deliberadamente simple: descarta lo evidentemente
 *  inválido sin rechazar direcciones legítimas poco comunes. */
function emailValido(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function numeroPositivo(valor, maximo) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 && n <= maximo ? n : null;
}

/**
 * Guarda una consulta de la calculadora. Cada una va en su propia clave de KV
 * (nunca en una lista compartida) para que dos envíos simultáneos no puedan
 * pisarse entre sí y perder datos.
 */
async function guardarLead(env, cuerpo, request) {
  const email = typeof cuerpo.email === "string" ? cuerpo.email.trim().toLowerCase() : "";
  if (!emailValido(email)) return { error: "Email inválido" };

  // Trampa para bots: es un campo oculto que una persona nunca completa.
  if (cuerpo.website) return { error: null, descartado: true };

  const personas = numeroPositivo(cuerpo.personas, 100000);
  const horas = numeroPositivo(cuerpo.horas, 168);
  const costo = numeroPositivo(cuerpo.costo, 100000000);
  if (!personas || !horas || !costo) return { error: "Datos de la calculadora inválidos" };

  // Redondeamos al guardar: el calculo arrastra decimales binarios que no
  // aportan nada y ensucian la exportacion y el aviso por mail.
  const horasAnuales = Math.round(Number(cuerpo.horasAnuales) || 0);
  const ahorroAnual = Math.round(Number(cuerpo.ahorroAnual) || 0);

  const referer = request.headers.get("Referer") || "";
  let origen = "";
  try {
    origen = referer ? nombreDeFuente(new URL(referer).hostname) : "";
  } catch {
    origen = "";
  }

  const lead = {
    email,
    personas,
    horas,
    costo,
    horasAnuales,
    ahorroAnual,
    fecha: new Date().toISOString(),
    origen: origen || "Directo / desconocido",
    pais: request.headers.get("CF-IPCountry") || "",
  };

  const clave = LEAD_PREFIX + lead.fecha + ":" + Math.random().toString(36).slice(2, 8);
  await env.CONTENT_KV.put(clave, JSON.stringify(lead));
  return { error: null, lead };
}

async function listarLeads(env) {
  if (!env.CONTENT_KV) return [];
  const listado = await env.CONTENT_KV.list({ prefix: LEAD_PREFIX, limit: MAX_LEADS_LISTADOS });
  const leads = await Promise.all(
    listado.keys.map((k) => env.CONTENT_KV.get(k.name, "json").catch(() => null))
  );
  // Las claves llevan la fecha, así que vienen ordenadas de más vieja a más
  // nueva; damos vuelta para mostrar primero las recientes.
  return leads.filter(Boolean).reverse();
}

/**
 * Avisa por mail que llegó una consulta nueva. Requiere RESEND_API_KEY y
 * LEAD_NOTIFY_TO configurados como secrets; si faltan, se omite en silencio
 * (la consulta ya quedó guardada, que es lo que importa).
 */
async function notificarLead(env, lead) {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_TO) return;

  const pesos = new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }).format(lead.ahorroAnual);

  const texto = [
    "Alguien usó la calculadora y dejó su email.",
    "",
    "Email: " + lead.email,
    "Origen: " + lead.origen,
    "",
    "Cargó:",
    "  Personas: " + lead.personas,
    "  Horas semanales por persona: " + lead.horas,
    "  Costo por hora: " + lead.costo,
    "",
    "Resultado que vio:",
    "  " + Math.round(lead.horasAnuales) + " horas al año",
    "  " + pesos + " de ahorro anual estimado",
    "",
    "Fecha: " + lead.fecha,
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.LEAD_NOTIFY_FROM || "Calculadora Axioma <onboarding@resend.dev>",
        to: env.LEAD_NOTIFY_TO.split(",").map((s) => s.trim()),
        reply_to: lead.email,
        subject: "Nueva consulta desde la calculadora — " + lead.email,
        text: texto,
      }),
    });
  } catch {
    // Un fallo al avisar no debe romper la experiencia del visitante.
  }
}

/** Escapa texto para insertarlo de forma segura dentro del HTML. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Estas respuestas son dinámicas (contenido editable, estadísticas en
      // vivo): nunca deben quedar cacheadas por el navegador ni por el borde
      // de Cloudflare, o un cambio recién guardado podría no reflejarse.
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });
}

/** Inyecta los textos de `content` en cualquier elemento con [data-key]. */
class ContentInjector {
  constructor(content) {
    this.content = content;
  }
  element(el) {
    const key = el.getAttribute("data-key");
    if (key && Object.prototype.hasOwnProperty.call(this.content, key)) {
      el.setInnerContent(this.content[key], { html: false });
    }
  }
}

/**
 * Regenera el bloque JSON-LD de FAQPage a partir del contenido actual, para
 * que los datos estructurados que lee Google nunca queden desincronizados de
 * las preguntas que realmente se ven en la página (Google penaliza esa
 * discrepancia).
 */
class FaqSchemaInjector {
  constructor(faq) {
    this.faq = faq;
  }
  element(el) {
    const mainEntity = this.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://www.axiomaconsulting.com.ar/#faq",
      mainEntity,
    };

    // JSON.stringify ya escapa comillas y barras; además cortamos cualquier
    // "</script>" para que un texto editado no pueda romper la etiqueta.
    const json = JSON.stringify(schema, null, 2).replace(/<\//g, "<\\/");
    el.setInnerContent(json, { html: true });
  }
}

/** Dibuja la lista visible de preguntas frecuentes a partir de la lista guardada. */
class FaqListInjector {
  constructor(faq) {
    this.faq = faq;
  }
  element(el) {
    const html = this.faq
      .map(
        (item) =>
          `<details class="faq-item"><summary>${escapeHtml(item.q)}</summary>` +
          `<p>${escapeHtml(item.a)}</p></details>`
      )
      .join("");
    el.setInnerContent(html, { html: true });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // ---------- API de contenido (protegida por Cloudflare Access en /admin*) ----------
    if (pathname === "/admin/api/content") {
      if (request.method === "GET") {
        const content = await getContent(env);
        return jsonResponse(content);
      }

      if (request.method === "PUT") {
        // Defensa en profundidad: Cloudflare Access ya debería bloquear esto,
        // pero igual verificamos que la request venga autenticada.
        if (!request.headers.get("Cf-Access-Authenticated-User-Email")) {
          return jsonResponse({ error: "No autorizado" }, { status: 403 });
        }
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "JSON inválido" }, { status: 400 });
        }
        const saved = await saveContent(env, body);
        return jsonResponse(saved);
      }

      return jsonResponse({ error: "Método no permitido" }, { status: 405 });
    }

    // ---------- Consulta de la calculadora (PÚBLICA) ----------
    // Va fuera de /admin a propósito: si estuviera adentro, Cloudflare Access
    // se lo bloquearía a los visitantes.
    if (pathname === "/api/lead" && request.method === "POST") {
      let cuerpo;
      try {
        cuerpo = await request.json();
      } catch {
        return jsonResponse({ error: "JSON inválido" }, { status: 400 });
      }

      const { error, lead, descartado } = await guardarLead(env, cuerpo, request);
      if (error) return jsonResponse({ error }, { status: 400 });

      // A los bots les respondemos OK sin guardar nada, para no darles pistas.
      if (descartado) return jsonResponse({ ok: true });

      // El aviso por mail no debe demorar la respuesta al visitante.
      ctx.waitUntil(notificarLead(env, lead));
      return jsonResponse({ ok: true });
    }

    // ---------- Consultas recibidas (protegida por Access) ----------
    if (pathname === "/admin/api/leads" && request.method === "GET") {
      return jsonResponse(await listarLeads(env));
    }

    // ---------- Preguntas frecuentes (lista dinámica) ----------
    if (pathname === "/admin/api/faq") {
      if (request.method === "GET") {
        return jsonResponse(await getFaq(env));
      }

      if (request.method === "PUT") {
        if (!request.headers.get("Cf-Access-Authenticated-User-Email")) {
          return jsonResponse({ error: "No autorizado" }, { status: 403 });
        }
        let body;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "JSON inválido" }, { status: 400 });
        }
        const saved = await saveFaq(env, body);
        if (!saved) {
          return jsonResponse({ error: "Se esperaba una lista de preguntas" }, { status: 400 });
        }
        return jsonResponse(saved);
      }

      return jsonResponse({ error: "Método no permitido" }, { status: 405 });
    }

    // ---------- Estadísticas (protegida por Cloudflare Access en /admin*) ----------
    if (pathname === "/admin/api/analytics" && request.method === "GET") {
      const analytics = await getAnalytics(env);
      return jsonResponse(analytics); // null si no está configurado o falló
    }

    // ---------- Panel de administración (protegido por Cloudflare Access) ----------
    // Ojo: se pide "/admin/" (con barra) y NO "/admin/index.html" — pedir el
    // .html directo hace que Cloudflare redirija a la URL "limpia" y con
    // run_worker_first eso vuelve a pasar por acá, generando un loop infinito.
    if (pathname === "/admin" || pathname === "/admin/") {
      const assetReq = new Request(new URL("/admin/", url), request);
      return env.ASSETS.fetch(assetReq);
    }

    // ---------- Resto del sitio: assets estáticos + inyección de contenido ----------
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) return response;

    const [content, faq] = await Promise.all([getContent(env), getFaq(env)]);
    return new HTMLRewriter()
      .on("[data-key]", new ContentInjector(content))
      .on(".faq-list", new FaqListInjector(faq))
      .on("script#faq-jsonld", new FaqSchemaInjector(faq))
      .transform(response);
  },
};
