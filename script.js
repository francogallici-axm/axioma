/* ============================================================
   AXIOMA CONSULTING — Interacciones mínimas
   1. Navbar sólido al hacer scroll
   2. Menú móvil (hamburguesa)
   3. Fade-in de elementos .reveal al entrar en viewport
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Navbar sólido al hacer scroll ---------- */
  var navbar = document.getElementById("navbar");
  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Menú móvil ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.querySelector(".nav-links");

  function closeMenu() {
    toggle.classList.remove("open");
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var isOpen = links.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // cerrar el menú al clickear un link
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- 3. Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: mostrar todo
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 4. Calculadora de ahorro / ROI ---------- */
  var calcForm = document.getElementById("calcForm");

  if (calcForm) {
    // Supuestos del cálculo. Ambos se muestran en pantalla (ver más abajo):
    // si se cambian acá, el texto que lee el visitante se actualiza solo.
    var FACTOR_AUTOMATIZACION = 0.45;  // parte del tiempo manual que se recupera
    var SEMANAS_POR_ANIO = 48;        // descontando vacaciones y feriados

    // Escribimos los supuestos en el texto para que no puedan desincronizarse
    // del cálculo.
    var notaFactor = document.getElementById("calcFactorPct");
    var notaSemanas = document.getElementById("calcSemanas");
    if (notaFactor) notaFactor.textContent = Math.round(FACTOR_AUTOMATIZACION * 100);
    if (notaSemanas) notaSemanas.textContent = SEMANAS_POR_ANIO;

    var inputPersonas = document.getElementById("calcPersonas");
    var inputHoras = document.getElementById("calcHoras");
    var inputCosto = document.getElementById("calcCosto");
    var outHoras = document.getElementById("calcHorasAnuales");
    var outAhorro = document.getElementById("calcAhorroAnual");

    var formatoMoneda = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
    var formatoNumero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

    function valorValido(input) {
      var n = parseFloat(input.value);
      return isFinite(n) && n > 0 ? n : 0;
    }

    // Estado del "candado": hasta que no dejen el email, el monto en pesos ni
    // siquiera se escribe en la página (difuminarlo por CSS se saltea mirando
    // el código de la página).
    var desbloqueada = true;
    var ultimoCalculo = { horasAnuales: 0, ahorroAnual: 0 };

    function actualizarCalculo() {
      var personas = valorValido(inputPersonas);
      var horas = valorValido(inputHoras);
      var costo = valorValido(inputCosto);

      if (!personas || !horas || !costo) {
        outHoras.textContent = "—";
        outAhorro.textContent = "—";
        ultimoCalculo = { horasAnuales: 0, ahorroAnual: 0 };
        return;
      }

      var horasAnuales = personas * horas * SEMANAS_POR_ANIO * FACTOR_AUTOMATIZACION;
      var ahorroAnual = horasAnuales * costo;
      ultimoCalculo = { horasAnuales: horasAnuales, ahorroAnual: ahorroAnual };

      outHoras.textContent = formatoNumero.format(horasAnuales);
      outAhorro.textContent = desbloqueada
        ? formatoMoneda.format(ahorroAnual)
        : "$ ●.●●●.●●●";
    }

    calcForm.addEventListener("input", actualizarCalculo);
    calcForm.addEventListener("submit", function (e) { e.preventDefault(); });

    /* ---- Revelado del ahorro en pesos a cambio del email ---- */
    var gate = document.getElementById("calcGate");
    var gateBtn = document.getElementById("calcGateBtn");
    var gateError = document.getElementById("calcGateError");
    var inputEmail = document.getElementById("calcEmail");
    var inputWebsite = document.getElementById("calcWebsite");
    var ahorroBox = document.getElementById("calcAhorroBox");
    var cta = document.getElementById("calcCta");

    // El desbloqueo dura solo lo que dure la visita: usamos sessionStorage, que
    // se borra al cerrar la pestaña. Asi, si la persona vuelve otro dia con una
    // consulta nueva, la registramos de nuevo en vez de perderla.
    var YA_DESBLOQUEADO = "axioma.calc.desbloqueada";
    function estaDesbloqueada() {
      try { return sessionStorage.getItem(YA_DESBLOQUEADO) === "1"; } catch (e) { return false; }
    }
    // Limpieza: la version anterior guardaba la marca en localStorage (para
    // siempre). La borramos para no dejar datos huerfanos en el navegador.
    try { localStorage.removeItem(YA_DESBLOQUEADO); } catch (e) { /* modo privado */ }

    function recordarDesbloqueo() {
      try { sessionStorage.setItem(YA_DESBLOQUEADO, "1"); } catch (e) { /* modo privado */ }
    }

    function desbloquear() {
      desbloqueada = true;
      if (gate) gate.hidden = true;
      if (cta) cta.hidden = false;
      if (ahorroBox) ahorroBox.classList.remove("calc-result--bloqueado");
      actualizarCalculo();
    }

    if (gate) {
      if (estaDesbloqueada()) {
        desbloquear();
      } else {
        desbloqueada = false;
        ahorroBox.classList.add("calc-result--bloqueado");
      }

      gate.addEventListener("submit", function (e) {
        e.preventDefault();
        gateError.hidden = true;

        var email = (inputEmail.value || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          gateError.textContent = "Revisá el email, parece incompleto.";
          gateError.hidden = false;
          inputEmail.focus();
          return;
        }

        gateBtn.disabled = true;
        gateBtn.textContent = "Enviando…";

        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            website: inputWebsite ? inputWebsite.value : "",
            personas: valorValido(inputPersonas),
            horas: valorValido(inputHoras),
            costo: valorValido(inputCosto),
            horasAnuales: ultimoCalculo.horasAnuales,
            ahorroAnual: ultimoCalculo.ahorroAnual,
          }),
        })
          .then(function (res) {
            if (!res.ok) throw new Error("No se pudo enviar");
            recordarDesbloqueo();
            desbloquear();
          })
          .catch(function () {
            gateError.textContent =
              "No pudimos guardar tu email. Revisá tu conexión e intentá de nuevo.";
            gateError.hidden = false;
          })
          .then(function () {
            gateBtn.disabled = false;
            gateBtn.textContent = "Ver el ahorro";
          });
      });
    }

    actualizarCalculo();
  }
})();
