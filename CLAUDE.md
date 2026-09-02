# Axioma Consulting — sitio web

Landing institucional de una sola página + panel de administración privado.
En producción: **https://www.axiomaconsulting.com.ar**

## Stack

- HTML, CSS y JS **sin framework ni build step**. Lo que ves es lo que se publica.
- **Cloudflare Workers** (NO Pages). Se migró desde Pages porque Pages no puede
  ejecutar la lógica del panel. Si algo de la documentación menciona Pages, está
  desactualizado.
- Contenido editable en **Cloudflare KV**; estadísticas con **Cloudflare Web
  Analytics**; login del panel con **Cloudflare Access** (Google).
- Avisos por mail con **Resend** (dominio propio ya verificado).

## Deploy

**Pushear a `main` publica en producción automáticamente**, en ~1 minuto. No hay
staging. Ramas:

- `main` → producción
- `desarrollo` → trabajo en curso

Flujo: commit en `desarrollo` → push → **pull request hacia `main`** → merge.
El merge es lo que publica. Verificar siempre en producción después (`curl` a
la home).

**No pushear directo a `main`**: el PR es la instancia de revisión.

`gh` está instalado en `C:\Program Files\GitHub CLI\gh.exe`, pero puede no
estar en el PATH de la terminal. Se autentica con un PAT en la variable de
entorno `GH_TOKEN`; para abrir PRs ese token necesita permiso **Pull requests:
Read and write**, además de Contents.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Toda la landing |
| `styles.css` / `script.js` | Estilos e interacciones |
| `admin/index.html` | Panel completo (3 pestañas: Contenido, Reportes, Consultas) |
| `src/worker.js` | Worker: rutas, inyección de contenido, API |
| `src/content.js` | Textos por defecto + esquema de campos editables |
| `wrangler.jsonc` | Config de Cloudflare |
| `.assetsignore` | Qué NO se publica como archivo estático |

## Contenido editable — importante

Los textos de la landing **no se editan en el HTML**. Viven en KV y se inyectan
en cada visita vía `HTMLRewriter`, buscando elementos con `data-key`.

Para agregar un campo editable hay que tocar **tres** lugares:
1. `data-key="seccion.campo"` en `index.html`
2. Valor por defecto en `DEFAULT_CONTENT` (`src/content.js`)
3. Campo en el esquema del panel (`admin/index.html`, constante `SCHEMA`)

Las **FAQ son distintas**: son una lista de largo variable (`faq.items` en KV),
administrable desde el panel. El Worker genera desde esa misma lista tanto el
HTML visible como el JSON-LD de `FAQPage`, para que no puedan desincronizarse
(Google penaliza esa discrepancia). No hardcodear preguntas.

## Rutas del Worker

- `/api/lead` (POST, **público**) — consultas de la calculadora.
  **Debe quedar fuera de `/admin`**: si estuviera adentro, Cloudflare Access se
  lo bloquearía a los visitantes.
- `/admin/*` — todo protegido por Access (incluidas sus APIs).

## Trampas conocidas (ya nos mordieron)

- **`run_worker_first: true`** es obligatorio en `wrangler.jsonc`. Sin eso
  Cloudflare sirve los archivos estáticos directo y el Worker nunca inyecta el
  contenido.
- Para servir el panel se pide **`/admin/`**, nunca `/admin/index.html`: pedir el
  `.html` provoca un redirect a la URL limpia y un **bucle infinito**.
- Las respuestas dinámicas llevan **`Cache-Control: no-store`**, si no un cambio
  recién guardado puede no verse.
- El atributo `[hidden]` **pierde contra cualquier regla CSS con `display`**. Por
  eso `admin/index.html` tiene `[hidden] { display: none !important; }`.
  Al verificar visibilidad, medir la **altura renderizada**, no la propiedad
  `.hidden` del DOM.
- Los **secrets de Cloudflare no se aplican al guardarlos**: hay que apretar
  **Deploy** después. Ya perdimos tiempo dos veces con esto.

## Calculadora de ahorro

Dos supuestos, ambos declarados en pantalla: **45 %** de tiempo recuperado y
**48 semanas** laborales al año. Están como constantes en `script.js` y el texto
visible **lo escribe el JS desde esas constantes** — no volver a escribirlos a
mano en el HTML o pueden contradecirse.

Las horas se muestran gratis; el ahorro en pesos se revela al dejar el email.
El monto **no se envía al navegador** hasta ese momento (difuminarlo por CSS se
saltea inspeccionando la página).

## Convenciones

- Todo el contenido en **español de Argentina, con voseo** ("Conocé", "Escribinos").
- Comentarios de código y mensajes de commit en español, sin tildes en los
  mensajes de commit (evita problemas de encoding en la terminal de Windows).
- Tono del copy: profesional y directo, sin tecnicismos ni promesas grandilocuentes.

## Reglas del negocio

- **No hay precios, paquetes ni tarifas en el sitio**, y así debe seguir hasta
  nueva instrucción. La postura publicada es "por objetivos y resultados, no por
  horas".
- No inventar métricas, casos de éxito ni testimonios: no existen.

## Pendientes

- El formulario de contacto usa **`mailto:`**: depende de que el visitante tenga
  cliente de correo configurado. Probablemente esté perdiendo consultas.
  Migrarlo a un servicio real es la mejora más valiosa pendiente.
- Una respuesta del FAQ menciona "trabajamos por fases" sin describirlas. Definir
  con los socios si se comunica un modelo formal de fases.
