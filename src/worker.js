import { DEFAULT_CONTENT } from "./content.js";

const CONTENT_KEY = "content"; // única key de KV donde vive el JSON de overrides

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
