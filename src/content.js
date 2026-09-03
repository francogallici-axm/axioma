// Valores por defecto de todos los textos editables de la landing.
// Sirven de "fallback" cuando todavía no hay overrides guardados en KV,
// y definen el esquema (claves + secciones + tipo de campo) que usa el panel /admin.
//
// type: "text" -> <input type="text">   |   "textarea" -> <textarea>

export const CONTENT_SCHEMA = [
  {
    section: "Hero",
    fields: [
      { key: "hero.eyebrow", label: "Texto pequeño superior", type: "text" },
      { key: "hero.pillar1", label: "Pilar 1", type: "text" },
      { key: "hero.pillar2", label: "Pilar 2", type: "text" },
      { key: "hero.pillar3", label: "Pilar 3", type: "text" },
      { key: "hero.subtitle", label: "Subtítulo", type: "textarea" },
      { key: "hero.lead1", label: "Bajada", type: "textarea" },
      { key: "hero.cta", label: "Texto del botón principal", type: "text" },
      { key: "hero.ctaNota", label: "Nota junto al botón", type: "text" },
    ],
  },
  {
    section: "Quiénes somos",
    fields: [
      { key: "quienes.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "quienes.title", label: "Título", type: "text" },
      { key: "quienes.p1", label: "Párrafo 1", type: "textarea" },
      { key: "quienes.highlight", label: "Frase destacada", type: "textarea" },
      { key: "quienes.p2", label: "Párrafo 2", type: "textarea" },
      { key: "quienes.p3", label: "Párrafo 3", type: "textarea" },
      { key: "card1.title", label: "Tarjeta 1 · título", type: "text" },
      { key: "card1.desc", label: "Tarjeta 1 · descripción", type: "textarea" },
      { key: "card2.title", label: "Tarjeta 2 · título", type: "text" },
      { key: "card2.desc", label: "Tarjeta 2 · descripción", type: "textarea" },
      { key: "card3.title", label: "Tarjeta 3 · título", type: "text" },
      { key: "card3.desc", label: "Tarjeta 3 · descripción", type: "textarea" },
    ],
  },
  {
    section: "¿Cuánto estás perdiendo?",
    fields: [
      { key: "calc.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "calc.title", label: "Título", type: "text" },
      { key: "calc.intro", label: "Texto de introducción", type: "textarea" },
      { key: "calc.labelPersonas", label: "Etiqueta · personas", type: "text" },
      { key: "calc.labelHoras", label: "Etiqueta · horas", type: "text" },
      { key: "calc.labelCosto", label: "Etiqueta · costo", type: "text" },
      { key: "calc.supuestos", label: "Nota de supuestos", type: "textarea" },
      { key: "calc.labelHorasAnuales", label: "Etiqueta · horas al año", type: "text" },
      { key: "calc.labelAhorro", label: "Etiqueta · ahorro", type: "text" },
      { key: "calc.vacio", label: "Mensaje sin datos", type: "textarea" },
      { key: "calc.nodosNota", label: "Nota de la red", type: "textarea" },
      { key: "calc.gateTitle", label: "Pedido del email", type: "textarea" },
      { key: "calc.gateLegal", label: "Aviso legal del email", type: "textarea" },
      { key: "calc.reveladoNota", label: "Nota tras revelar", type: "textarea" },
      { key: "calc.cta", label: "Botón final", type: "text" },
    ],
  },
  {
    section: "Preguntas frecuentes",
    fields: [
      { key: "faq.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "faq.title", label: "Título", type: "text" },
      // Las preguntas en sí no son campos fijos: viven en la lista dinámica
      // FAQ_LIST_KEY, que se puede ampliar o recortar desde el panel.
    ],
  },
  {
    section: "Contacto",
    fields: [
      { key: "contacto.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "contacto.title", label: "Título", type: "text" },
      { key: "contacto.intro", label: "Texto de introducción", type: "textarea" },
      { key: "contacto.formSubmit", label: "Texto del botón de envío", type: "text" },
      { key: "contacto.labelNombre", label: "Etiqueta · nombre", type: "text" },
      { key: "contacto.labelEmail", label: "Etiqueta · email", type: "text" },
      { key: "contacto.labelEmpresa", label: "Etiqueta · empresa", type: "text" },
      { key: "contacto.labelMensaje", label: "Etiqueta · mensaje", type: "text" },
      { key: "contacto.directo", label: "Texto del email directo", type: "textarea" },
      { key: "contacto.okTitulo", label: "Título de confirmación", type: "text" },
      { key: "contacto.okTexto", label: "Texto de confirmación", type: "textarea" },
    ],
  },
  {
    section: "Footer",
    fields: [{ key: "footer.copyright", label: "Texto de copyright", type: "text" }],
  },
];

export const DEFAULT_CONTENT = {
  "hero.eyebrow": "Consultoría en Optimización de Procesos",
  "hero.pillar1": "Tiempos",
  "hero.pillar2": "Costos",
  "hero.pillar3": "Calidad",
  "hero.subtitle": "Ayudamos a PyMEs a mejorar sus procesos a través de la tecnología.",
  "hero.lead1":
    "Analizamos y optimizamos operaciones para reducir costos, mejorar tiempos y ganar control sobre la gestión, apoyándonos en la tecnología que mejor se adapte a cada caso.",
  "hero.cta": "Conocé cómo trabajamos",

  "quienes.kicker": "Quiénes somos",
  "quienes.title": "Tres miradas distintas, soluciones integrales",
  "quienes.p1":
    "Somos un equipo de profesionales con experiencia real en análisis de datos, soporte IT, ventas, logística y aseguramiento de calidad. Cada proyecto se mira desde múltiples ángulos para encontrar mejoras que de verdad muevan la aguja.",
  "quienes.highlight": "No vendemos teoría, aplicamos lo que ya probamos en empresas reales.",
  "quienes.p2":
    "Incorporamos inteligencia artificial como herramienta dentro de nuestra metodología: nos da velocidad de análisis y nos mantiene actualizados, sin perder el criterio profesional que solo da la experiencia.",
  "quienes.p3":
    "Trabajamos por objetivos y resultados concretos, con soluciones adaptadas a la realidad de cada empresa.",
  "card1.title": "Datos & Tecnología",
  "card1.desc": "Análisis de datos y soporte IT para tomar decisiones con información, no con intuición.",
  "card2.title": "Operaciones & Logística",
  "card2.desc": "Ventas, logística y procesos operativos optimizados para escalar sin fricción.",
  "card3.title": "Aseguramiento de Calidad",
  "card3.desc": "Procesos confiables y repetibles: que crecer no signifique perder el control.",

  "calc.kicker": "¿Cuánto estás perdiendo?",
  "calc.title": "El costo real de las tareas manuales",
  "calc.intro":
    "Estimá en 30 segundos cuánto tiempo y dinero podrías recuperar al año automatizando un proceso manual de tu empresa.",

  "faq.kicker": "Preguntas frecuentes",
  "faq.title": "Lo que más nos consultan",

  "contacto.kicker": "Contacto",
  "contacto.title": "¿Hablamos?",
  "contacto.intro":
    "Escribinos para una consulta inicial sin compromiso. Conversamos sobre tu proceso y te decimos con franqueza si podemos ayudarte.",
  "contacto.formSubmit": "Enviar",

  "hero.ctaNota":
    "30 segundos, tres números",
  "calc.labelPersonas":
    "Personas involucradas en el proceso",
  "calc.labelHoras":
    "Horas semanales por persona en tareas manuales",
  "calc.labelCosto":
    "Costo aproximado por hora",
  "calc.supuestos":
    "Estimación orientativa: asume que la automatización elimina alrededor del 45 % del tiempo dedicado a esas tareas repetitivas, sobre 48 semanas laborales al año.",
  "calc.labelHorasAnuales":
    "Horas recuperadas al año",
  "calc.labelAhorro":
    "De ahorro anual estimado",
  "calc.vacio":
    "Completá los tres campos y el estimado aparece solo. No hay botón de calcular.",
  "calc.nodosNota":
    "La red se dibuja con tus datos: un nodo por persona, y el tamaño de cada uno son las horas que hoy se van en tareas manuales.",
  "calc.gateTitle":
    "Dejanos tu email y te mostramos el monto. Te escribimos una sola vez, y solo si nos lo pedís.",
  "calc.gateLegal":
    "Usamos tu email solo para contactarte por esta consulta. No lo compartimos con terceros y podés pedirnos que lo borremos cuando quieras.",
  "calc.reveladoNota":
    "Ese número es el techo de lo que se puede recuperar en un año. Cuánto de eso es alcanzable depende del proceso.",
  "calc.cta":
    "Quiero que lo analicemos",
  "contacto.labelNombre":
    "Nombre",
  "contacto.labelEmail":
    "Email",
  "contacto.labelEmpresa":
    "Empresa",
  "contacto.labelMensaje":
    "Contanos qué proceso te está costando tiempo",
  "contacto.directo":
    "O directamente a contacto@axiomaconsulting.com.ar",
  "contacto.okTitulo":
    "Recibimos tu mensaje",
  "contacto.okTexto":
    "Te respondemos dentro de las próximas 48 horas hábiles, desde contacto@axiomaconsulting.com.ar. Si es urgente, escribinos directamente a ese mismo correo.",

  "footer.copyright": "© 2026 Axioma Consulting. Todos los derechos reservados.",
};

/**
 * Lista de preguntas frecuentes. A diferencia del resto del contenido, es una
 * lista de largo variable: desde el panel se pueden agregar, editar, reordenar
 * o eliminar preguntas. Se guarda en KV bajo esta misma clave.
 */
export const FAQ_LIST_KEY = "faq.items";

export const MAX_FAQ_ITEMS = 20;

export const DEFAULT_FAQ = [
  {
    q: "¿Qué hace exactamente una consultora de optimización de procesos?",
    a: "Analizamos cómo trabaja hoy tu empresa, detectamos dónde se pierde tiempo, dinero o calidad, y rediseñamos esos procesos apoyándonos en tecnología: digitalización, automatización y mejor uso de los datos. El objetivo es que produzcas lo mismo o más, con menos esfuerzo y más control.",
  },
  {
    q: "¿Trabajan con PyMEs o solo con empresas grandes?",
    a: "Trabajamos específicamente con PyMEs, tanto tecnológicas como operacionales. Adaptamos el alcance a la realidad de cada empresa: no aplicamos recetas de corporación a estructuras chicas.",
  },
  {
    q: "¿Cómo cobran: por hora o por proyecto?",
    a: "Trabajamos por objetivos y resultados concretos, no por horas. Definimos juntos qué se busca lograr, en qué plazo y con qué alcance, y sobre eso armamos la propuesta.",
  },
  {
    q: "¿Cuánto tarda en verse un resultado?",
    a: "Depende del proceso, pero trabajamos por fases justamente para que haya mejoras visibles temprano. Las primeras optimizaciones suelen notarse en las primeras semanas, sin esperar a que termine todo el proyecto.",
  },
  {
    q: "¿Necesito tener sistemas o software para que puedan ayudarme?",
    a: "No. Muchos de los procesos que optimizamos arrancan en planillas, papel o WhatsApp. Parte del trabajo es justamente definir qué conviene digitalizar, con qué herramientas y en qué orden.",
  },
  {
    q: "¿Usan inteligencia artificial en sus proyectos?",
    a: "Sí, como herramienta dentro de nuestra metodología: nos da velocidad de análisis y nos mantiene actualizados. Pero el criterio profesional y la decisión final siempre son humanos, apoyados en experiencia real en empresas.",
  },
];
