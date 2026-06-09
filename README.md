# Axioma Consulting — Sitio web

Sitio web institucional de **Axioma Consulting**, consultora especializada en
optimización de procesos (Tiempos · Costos · Calidad) para PyMEs.

Es un sitio **estático de una sola página** (HTML + CSS + JS puro), sin
dependencias ni build step. Pensado para desplegarse en **Cloudflare Pages**.

---

## Estructura del proyecto

```
Axioma web/
├── index.html      → Estructura y contenido del sitio (todo el copy vive acá)
├── styles.css      → Estilos, paleta de marca y responsive
├── script.js       → Navbar al scrollear, menú móvil y fade-in
├── favicon.svg     → Ícono de la pestaña (logo reducido)
└── README.md       → Este archivo
```

No hay framework ni `node_modules`: lo que ves es lo que se publica.

---

## Ver el sitio localmente

Solo abrí `index.html` en el navegador (doble clic).

Para que el formulario y las rutas se comporten como en producción, podés
levantar un servidor estático simple:

```bash
# Con Python (ya instalado en la mayoría de los sistemas)
python -m http.server 8080
# luego abrí http://localhost:8080
```

```powershell
# Alternativa con Node, si lo tenés instalado
npx serve .
```

---

## Cómo modificar el contenido

| Qué querés cambiar | Dónde |
|---|---|
| Textos (titulares, párrafos, copy) | `index.html` — buscá la sección por su comentario (`HERO`, `QUIÉNES SOMOS`, `CONTACTO`, `FOOTER`) |
| Email de contacto | `index.html` — `contacto@axiomaconsulting.com.ar` aparece 2 veces: en el `action="mailto:..."` del `<form>` y en el link `.contact-direct`. Cambiá ambos |
| Link de LinkedIn | `index.html` — en el `<footer>`, atributo `href` del `.footer-link` (apunta a `linkedin.com/company/axiomaconsulting`) |
| Colores de marca | `styles.css` — variables `:root` al inicio del archivo |
| Tipografías | `styles.css` — variables `--font-serif` / `--font-sans` |
| El logo (símbolo) | `index.html` — el `<symbol id="axioma-mark">` al inicio del `<body>`: la "Á" oficial construida con red de nodos y relojes. Es un path único que usa `fill="currentColor"`, así que se recolorea con la propiedad CSS `color` según el contexto (crema en navbar/footer, teal semitransparente de fondo en el hero). Se reutiliza vía `<use>` |

### Paleta de colores (referencia)

| Variable | Hex | Uso |
|---|---|---|
| `--green-deep` | `#0e3739` | Fondo principal |
| `--green-dark` | `#072528` | Fondo secundario / acentos |
| `--teal` | `#7eb0b1` | Acento principal |
| `--cream` | `#e8dcc8` | Textos secundarios / detalles |
| `--white` | `#ffffff` | Texto principal |

---

## Formulario de contacto

Por defecto el formulario usa `mailto:` — al enviar, abre el cliente de correo
del visitante con los datos cargados. **No requiere backend.**

Para recibir los mensajes de forma más robusta (recomendado en producción),
podés conectarlo a un servicio gratuito sin servidor:

### Opción A — Formspree
1. Creá un formulario en <https://formspree.io> y copiá tu endpoint.
2. En `index.html`, reemplazá la etiqueta `<form>`:
   ```html
   <form class="form" action="https://formspree.io/f/TU_ID" method="POST">
   ```
3. Quitá el atributo `enctype="text/plain"`.

### Opción B — Cloudflare Pages Forms / Workers
Si ya estás en Cloudflare, podés capturar el envío con un
[Pages Function](https://developers.cloudflare.com/pages/functions/) y reenviarlo
por email o a una base de datos.

---

## Deploy en Cloudflare Pages

### Opción 1 — Subida directa (la más rápida, sin Git)

1. Entrá a <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → pestaña **Pages** → **Upload assets**.
2. Arrastrá los archivos del proyecto (o el `.zip` con `index.html`, `styles.css`, `script.js`, `favicon.svg`).
3. Poné un nombre al proyecto (ej. `axioma-consulting`) y hacé **Deploy**.
4. Listo: queda publicado en `https://axioma-consulting.pages.dev`.

### Opción 2 — Conectado a Git (deploy automático en cada push)

1. Subí este proyecto a un repositorio de GitHub / GitLab.
2. En Cloudflare Pages → **Create** → **Connect to Git** → elegí el repo.
3. Configuración de build:
   - **Framework preset:** `None`
   - **Build command:** *(dejar vacío)*
   - **Build output directory:** `/`  (la raíz, porque el sitio ya está listo)
4. **Save and Deploy**. Cada `git push` a la rama principal redeploya solo.

### Dominio propio

En el proyecto de Pages → **Custom domains** → **Set up a custom domain** y
seguí los pasos para apuntar tu dominio (ej. `axiomaconsulting.com`). Si el
dominio ya está en Cloudflare, la configuración de DNS es automática.

---

## Notas técnicas

- **Responsive** mobile-first, con menú hamburguesa en pantallas chicas.
- **Accesibilidad:** HTML semántico, `alt`/`aria-label` en elementos clave,
  contraste alto y respeto a `prefers-reduced-motion`.
- **Performance:** sin librerías; solo una fuente externa (Inter vía Google
  Fonts, con `preconnect`). Todo el resto es local.
- **Animaciones** sutiles vía `IntersectionObserver` (con fallback).

---

© 2025 Axioma Consulting.
