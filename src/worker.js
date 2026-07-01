import { DEFAULT_CONTENT } from "./content.js";

const CONTENT_KEY = "content"; // única key de KV donde vive el JSON de overrides

// Token del beacon de Cloudflare Web Analytics (index.html). No es secreto:
// ya está público en el HTML, es el identificador del sitio ("siteTag") en
// la API de Analytics.
const ANALYTICS_SITE_TAG = "7b7af660163146bebe42965e51f5e306";
const ANALYTICS_WINDOW_DAYS = 30;

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

    return {
      windowDays: ANALYTICS_WINDOW_DAYS,
      totalVisits: account.totals?.[0]?.sum?.visits ?? 0,
      topPages: (account.topPages || []).map((row) => ({
        path: row.dimensions?.requestPath || "/",
        visits: row.sum?.visits ?? 0,
      })),
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

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(init.headers || {}) },
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

export default {
  async fetch(request, env) {
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

    const content = await getContent(env);
    return new HTMLRewriter().on("[data-key]", new ContentInjector(content)).transform(response);
  },
};
