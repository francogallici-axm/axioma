/* ============================================================
   AXIOMA CONSULTING — Interacciones
   1. Menú móvil
   2. Calculadora de ahorro (con red animada y selector de moneda)
   3. Candado: el monto se revela al dejar el email
   4. Formulario de contacto
   ============================================================ */
(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function $(id) { return document.getElementById(id); }

  /* ---------- 1. Menú móvil ---------- */
  var navToggle = $("navToggle");
  var navMain = $("navMain");

  if (navToggle && navMain) {
    function cerrarMenu() {
      navMain.setAttribute("data-abierto", "false");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
    }
    navToggle.addEventListener("click", function () {
      var abierto = navMain.getAttribute("data-abierto") === "true";
      navMain.setAttribute("data-abierto", String(!abierto));
      navToggle.setAttribute("aria-expanded", String(!abierto));
      navToggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
    });
    navMain.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", cerrarMenu);
    });
    // Escape cierra el menú: obligatorio para navegación por teclado.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMain.getAttribute("data-abierto") === "true") {
        cerrarMenu();
        navToggle.focus();
      }
    });
  }

  /* ---------- 2. Espina de progreso (mobile) ---------- */
  // Lleva el checklist del hero a toda la página: cada sección que se alcanza
  // marca su nodo. Es decorativa, así que si el navegador no soporta
  // IntersectionObserver simplemente no aparece: nada se rompe.
  var spine = $("scrollSpine");
  if (spine && "IntersectionObserver" in window) {
    var nodos = [].slice.call(spine.querySelectorAll(".spine-node"));
    var secciones = nodos
      .map(function (n) { return document.getElementById(n.dataset.seccion); })
      .filter(Boolean);

    var observer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var i = secciones.indexOf(e.target);
        if (i < 0) return;
        if (e.isIntersecting) {
          nodos[i].classList.add("activa");
          // Todo lo anterior queda marcado como recorrido.
          nodos.forEach(function (n, j) { if (j <= i) n.classList.add("visto"); });
        } else {
          nodos[i].classList.remove("activa");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });   // se activa al cruzar el centro

    secciones.forEach(function (sec) { observer.observe(sec); });
  }

  /* ---------- 3. Calculadora ---------- */
  var calcForm = $("calcForm");
  if (!calcForm) return;

  // Supuestos del cálculo. Ambos se muestran en pantalla: si se cambian acá,
  // el texto que lee el visitante se actualiza solo y no puede contradecirlo.
  var FACTOR_AUTOMATIZACION = 0.45;  // parte del tiempo manual que se recupera
  var SEMANAS_POR_ANIO = 48;         // descontando vacaciones y feriados

  var notaFactor = $("calcFactorPct");
  var notaSemanas = $("calcSemanas");
  if (notaFactor) notaFactor.textContent = Math.round(FACTOR_AUTOMATIZACION * 100);
  if (notaSemanas) notaSemanas.textContent = SEMANAS_POR_ANIO;

  var inPersonas = $("calcPersonas");
  var inHoras = $("calcHoras");
  var inCosto = $("calcCosto");
  var inMoneda = $("calcMoneda");

  var outHoras = $("calcHorasAnuales");
  var outMonto = $("calcAhorroAnual");
  var boxVacio = $("calcVacio");
  var boxResultado = $("calcResultado");
  var net = $("calcNet");
  var netNota = $("calcNetNota");

  var fmtNumero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  function fmtMoneda(valor) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: inMoneda ? inMoneda.value : "ARS",
      maximumFractionDigits: 0,
    }).format(valor);
  }

  function num(input) {
    var n = parseFloat(input.value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  var desbloqueada = false;
  var ultimoCalculo = { horasAnuales: 0, ahorroAnual: 0 };
  var ultimasHoras = null;

  /* --- Red de nodos: uno por persona, tamaño según las horas --- */
  // Los nodos viven en su propia banda, en abanico sobre un concentrador fijo:
  // ninguna coordenada compite con una caja de texto.
  var SLOTS = [
    [32, 64], [288, 64], [160, 16], [96, 26], [224, 26],
    [56, 42], [264, 42], [120, 44], [200, 44], [84, 62],
    [236, 62], [160, 50]
  ];
  var NS = "http://www.w3.org/2000/svg";
  var lineas = [];
  var circulos = [];

  function construirRed() {
    if (!net) return;
    var gLineas = document.createElementNS(NS, "g");
    gLineas.setAttribute("stroke", "#7eb0b1");
    gLineas.setAttribute("stroke-width", "1");
    gLineas.setAttribute("fill", "none");
    gLineas.setAttribute("opacity", "0.35");

    var gNodos = document.createElementNS(NS, "g");
    gNodos.setAttribute("fill", "#072528");
    gNodos.setAttribute("stroke", "#7eb0b1");
    gNodos.setAttribute("stroke-width", "1.3");

    SLOTS.forEach(function (p, i) {
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", 160); l.setAttribute("y1", 102);
      l.setAttribute("x2", p[0]); l.setAttribute("y2", p[1]);
      l.style.opacity = 0;
      l.style.transition = "opacity .24s ease " + (i * 20) + "ms";
      gLineas.appendChild(l);
      lineas.push(l);

      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", 5);
      c.style.transformOrigin = p[0] + "px " + p[1] + "px";
      c.style.transform = "scale(0.4)";
      c.style.opacity = 0;
      c.style.transition =
        "transform .24s cubic-bezier(.22,.61,.36,1) " + (i * 20) + "ms, " +
        "opacity .24s ease " + (i * 20) + "ms, r .24s ease";
      gNodos.appendChild(c);
      circulos.push(c);
    });

    var centro = document.createElementNS(NS, "circle");
    centro.setAttribute("cx", 160); centro.setAttribute("cy", 102);
    centro.setAttribute("r", 6); centro.setAttribute("fill", "#7eb0b1");

    net.appendChild(gLineas);
    net.appendChild(gNodos);
    net.appendChild(centro);
  }

  function pintarRed(personas, horas) {
    var activos = Math.max(0, Math.min(SLOTS.length, Math.round(personas)));
    var radio = Math.max(5, Math.min(13, 5 + horas * 0.7));
    circulos.forEach(function (c, i) {
      var visible = i < activos;
      c.setAttribute("r", radio);
      c.style.transform = visible ? "scale(1)" : "scale(0.4)";
      c.style.opacity = visible ? 1 : 0;
      lineas[i].style.opacity = visible ? 1 : 0;
    });
  }

  function actualizarCalculo() {
    var personas = num(inPersonas);
    var horas = num(inHoras);
    var costo = num(inCosto);
    var vacio = !(personas && horas && costo);

    pintarRed(personas, horas);

    if (vacio) {
      outHoras.textContent = "—";
      ultimoCalculo = { horasAnuales: 0, ahorroAnual: 0 };
      if (boxVacio) boxVacio.hidden = false;
      if (boxResultado) boxResultado.hidden = true;
      if (netNota) {
        netNota.textContent = "La red se dibuja con tus datos: un nodo por persona, " +
          "y el tamaño de cada uno son las horas que hoy se van en tareas manuales.";
      }
      return;
    }

    var horasAnuales = personas * horas * SEMANAS_POR_ANIO * FACTOR_AUTOMATIZACION;
    var ahorroAnual = horasAnuales * costo;
    ultimoCalculo = { horasAnuales: horasAnuales, ahorroAnual: ahorroAnual };

    var redondeadas = Math.round(horasAnuales);
    outHoras.textContent = fmtNumero.format(redondeadas);
    // Solo reanimamos cuando el número cambia de verdad.
    if (ultimasHoras !== redondeadas) {
      ultimasHoras = redondeadas;
      outHoras.classList.remove("pulso");
      void outHoras.offsetWidth;
      outHoras.classList.add("pulso");
    }

    // El monto real no se escribe en la página hasta que dejan el email:
    // difuminarlo por CSS se saltea inspeccionando el código.
    outMonto.textContent = desbloqueada ? fmtMoneda(ahorroAnual) : "$ ●.●●●.●●●";
    outMonto.classList.toggle("calc-monto--bloqueado", !desbloqueada);

    if (boxVacio) boxVacio.hidden = true;
    if (boxResultado) boxResultado.hidden = false;
    if (netNota) {
      netNota.textContent = "Cada nodo es una de las " + fmtNumero.format(Math.round(personas)) +
        " personas del proceso y su tamaño son las " + fmtNumero.format(Math.round(horas)) +
        " horas semanales que hoy se van en tareas manuales. Todas confluyen en el mismo punto: la cifra de arriba.";
    }
  }

  construirRed();
  calcForm.addEventListener("input", actualizarCalculo);
  calcForm.addEventListener("change", actualizarCalculo);
  calcForm.addEventListener("submit", function (e) { e.preventDefault(); });

  /* ---------- 4. Candado del monto ---------- */
  var gate = $("calcGate");
  var gateBtn = $("calcGateBtn");
  var gateError = $("calcGateError");
  var gateEmail = $("calcEmail");
  var gateHp = $("calcWebsite");
  var revelado = $("calcRevelado");

  // El desbloqueo dura solo lo que dure la visita: sessionStorage se borra al
  // cerrar la pestaña, así una consulta nueva más adelante vuelve a registrarse.
  var CLAVE = "axioma.calc.desbloqueada";
  function yaDesbloqueada() {
    try { return sessionStorage.getItem(CLAVE) === "1"; } catch (e) { return false; }
  }
  try { localStorage.removeItem(CLAVE); } catch (e) { /* modo privado */ }

  function desbloquear() {
    desbloqueada = true;
    if (gate) gate.hidden = true;
    if (revelado) revelado.hidden = false;
    actualizarCalculo();
  }

  function cargando(btn, activo, textoActivo, textoNormal) {
    btn.disabled = activo;
    btn.querySelector(".spinner").hidden = !activo;
    btn.querySelector(".btn-texto").textContent = activo ? textoActivo : textoNormal;
  }

  if (gate) {
    if (yaDesbloqueada()) desbloquear();

    gate.addEventListener("submit", function (e) {
      e.preventDefault();
      gateError.hidden = true;
      gateEmail.classList.remove("con-error");

      var email = (gateEmail.value || "").trim();
      if (!EMAIL_RE.test(email)) {
        gateError.textContent = "Revisá el email, parece incompleto.";
        gateError.hidden = false;
        gateEmail.classList.add("con-error");
        gateEmail.focus();
        return;
      }

      cargando(gateBtn, true, "Enviando…", "Ver el ahorro");

      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          website: gateHp ? gateHp.value : "",
          personas: num(inPersonas),
          horas: num(inHoras),
          costo: num(inCosto),
          moneda: inMoneda ? inMoneda.value : "ARS",
          horasAnuales: ultimoCalculo.horasAnuales,
          ahorroAnual: ultimoCalculo.ahorroAnual,
        }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("No se pudo enviar");
          try { sessionStorage.setItem(CLAVE, "1"); } catch (e) { /* modo privado */ }
          desbloquear();
        })
        .catch(function () {
          gateError.textContent = "No pudimos guardar tu email. Revisá tu conexión e intentá de nuevo.";
          gateError.hidden = false;
        })
        .then(function () {
          cargando(gateBtn, false, "Enviando…", "Ver el ahorro");
        });
    });
  }

  /* ---------- 5. Formulario de contacto ---------- */
  var contactForm = $("contactForm");
  var contactBtn = $("contactBtn");
  var contactError = $("contactError");
  var contactOk = $("contactOk");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactError.hidden = true;

      var nombre = ($("nombre").value || "").trim();
      var email = ($("email").value || "").trim();

      if (!nombre) {
        contactError.textContent = "Necesitamos tu nombre para responderte.";
        contactError.hidden = false;
        $("nombre").focus();
        return;
      }
      if (!EMAIL_RE.test(email)) {
        contactError.textContent = "Revisá el email, parece incompleto.";
        contactError.hidden = false;
        $("email").focus();
        return;
      }

      cargando(contactBtn, true, "Enviando…", "Enviar");

      fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          email: email,
          empresa: ($("empresa").value || "").trim(),
          mensaje: ($("mensaje").value || "").trim(),
          website: $("contactoWebsite") ? $("contactoWebsite").value : "",
        }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("No se pudo enviar");
          contactForm.hidden = true;
          contactOk.hidden = false;
          contactOk.setAttribute("tabindex", "-1");
          contactOk.focus();
        })
        .catch(function () {
          contactError.textContent =
            "No pudimos enviar tu mensaje. Revisá tu conexión, o escribinos directamente a contacto@axiomaconsulting.com.ar";
          contactError.hidden = false;
        })
        .then(function () {
          cargando(contactBtn, false, "Enviando…", "Enviar");
        });
    });
  }

  actualizarCalculo();
})();
