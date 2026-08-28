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
      { key: "hero.lead1", label: "Bajada, párrafo 1", type: "textarea" },
      { key: "hero.lead2", label: "Bajada, párrafo 2", type: "textarea" },
      { key: "hero.cta", label: "Texto del botón principal", type: "text" },
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
      { key: "card1.title", label: "Tarjeta 1 · título", type: "text" },
      { key: "card1.desc", label: "Tarjeta 1 · descripción", type: "textarea" },
      { key: "card2.title", label: "Tarjeta 2 · título", type: "text" },
      { key: "card2.desc", label: "Tarjeta 2 · descripción", type: "textarea" },
      { key: "card3.title", label: "Tarjeta 3 · título", type: "text" },
      { key: "card3.desc", label: "Tarjeta 3 · descripción", type: "textarea" },
    ],
  },
  {
    section: "Calculadora de ahorro",
    fields: [
      { key: "calc.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "calc.title", label: "Título", type: "text" },
      { key: "calc.intro", label: "Texto de introducción", type: "textarea" },
    ],
  },
  {
    section: "Preguntas frecuentes",
    fields: [
      { key: "faq.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "faq.title", label: "Título", type: "text" },
      { key: "faq.q1", label: "Pregunta 1", type: "text" },
      { key: "faq.a1", label: "Respuesta 1", type: "textarea" },
      { key: "faq.q2", label: "Pregunta 2", type: "text" },
      { key: "faq.a2", label: "Respuesta 2", type: "textarea" },
      { key: "faq.q3", label: "Pregunta 3", type: "text" },
      { key: "faq.a3", label: "Respuesta 3", type: "textarea" },
      { key: "faq.q4", label: "Pregunta 4", type: "text" },
      { key: "faq.a4", label: "Respuesta 4", type: "textarea" },
      { key: "faq.q5", label: "Pregunta 5", type: "text" },
      { key: "faq.a5", label: "Respuesta 5", type: "textarea" },
      { key: "faq.q6", label: "Pregunta 6", type: "text" },
      { key: "faq.a6", label: "Respuesta 6", type: "textarea" },
    ],
  },
  {
    section: "Contacto",
    fields: [
      { key: "contacto.kicker", label: "Etiqueta de sección", type: "text" },
      { key: "contacto.title", label: "Título", type: "text" },
      { key: "contacto.intro", label: "Texto de introducción", type: "textarea" },
      { key: "contacto.formSubmit", label: "Texto del botón de envío", type: "text" },
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
    "Digitalizamos, automatizamos y optimizamos operaciones para reducir costos, mejorar tiempos y aumentar el control de la gestión.",
  "hero.lead2":
    "Trabajamos por objetivos y resultados concretos, con soluciones adaptadas a la realidad de cada empresa.",
  "hero.cta": "Conocé cómo trabajamos",

  "quienes.kicker": "Quiénes somos",
  "quienes.title": "Tres miradas distintas, soluciones integrales",
  "quienes.p1":
    "Somos un equipo de profesionales con experiencia real en análisis de datos, soporte IT, ventas, logística y aseguramiento de calidad. Cada proyecto se mira desde múltiples ángulos para encontrar mejoras que de verdad muevan la aguja.",
  "quienes.highlight": "No vendemos teoría, aplicamos lo que ya probamos en empresas reales.",
  "quienes.p2":
    "Incorporamos inteligencia artificial como herramienta dentro de nuestra metodología: nos da velocidad de análisis y nos mantiene actualizados, sin perder el criterio profesional que solo da la experiencia.",
  "card1.title": "Datos & Tecnología",
  "card1.desc": "Análisis de datos y soporte IT para tomar decisiones con información, no con intuición.",
  "card2.title": "Operaciones & Logística",
  "card2.desc": "Ventas, logística y procesos operativos optimizados para escalar sin fricción.",
  "card3.title": "Aseguramiento de Calidad",
  "card3.desc": "Procesos confiables y repetibles: que crecer no signifique perder el control.",

  "calc.kicker": "Calculadora",
  "calc.title": "¿Cuánto te cuestan las tareas manuales?",
  "calc.intro":
    "Estimá en 30 segundos cuánto tiempo y dinero podrías recuperar al año automatizando un proceso manual de tu empresa.",

  "faq.kicker": "Preguntas frecuentes",
  "faq.title": "Lo que más nos consultan",
  "faq.q1": "¿Qué hace exactamente una consultora de optimización de procesos?",
  "faq.a1":
    "Analizamos cómo trabaja hoy tu empresa, detectamos dónde se pierde tiempo, dinero o calidad, y rediseñamos esos procesos apoyándonos en tecnología: digitalización, automatización y mejor uso de los datos. El objetivo es que produzcas lo mismo o más, con menos esfuerzo y más control.",
  "faq.q2": "¿Trabajan con PyMEs o solo con empresas grandes?",
  "faq.a2":
    "Trabajamos específicamente con PyMEs, tanto tecnológicas como operacionales. Adaptamos el alcance a la realidad de cada empresa: no aplicamos recetas de corporación a estructuras chicas.",
  "faq.q3": "¿Cómo cobran: por hora o por proyecto?",
  "faq.a3":
    "Trabajamos por objetivos y resultados concretos, no por horas. Definimos juntos qué se busca lograr, en qué plazo y con qué alcance, y sobre eso armamos la propuesta.",
  "faq.q4": "¿Cuánto tarda en verse un resultado?",
  "faq.a4":
    "Depende del proceso, pero trabajamos por fases justamente para que haya mejoras visibles temprano. Las primeras optimizaciones suelen notarse en las primeras semanas, sin esperar a que termine todo el proyecto.",
  "faq.q5": "¿Necesito tener sistemas o software para que puedan ayudarme?",
  "faq.a5":
    "No. Muchos de los procesos que optimizamos arrancan en planillas, papel o WhatsApp. Parte del trabajo es justamente definir qué conviene digitalizar, con qué herramientas y en qué orden.",
  "faq.q6": "¿Usan inteligencia artificial en sus proyectos?",
  "faq.a6":
    "Sí, como herramienta dentro de nuestra metodología: nos da velocidad de análisis y nos mantiene actualizados. Pero el criterio profesional y la decisión final siempre son humanos, apoyados en experiencia real en empresas.",

  "contacto.kicker": "Contacto",
  "contacto.title": "¿Hablamos?",
  "contacto.intro":
    "Escribinos para una consulta inicial sin compromiso. Conversamos sobre tu proceso y te decimos con franqueza si podemos ayudarte.",
  "contacto.formSubmit": "Enviar",

  "footer.copyright": "© 2026 Axioma Consulting. Todos los derechos reservados.",
};
