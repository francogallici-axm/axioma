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
    var FACTOR_AUTOMATIZACION = 0.6;  // parte del tiempo manual que se recupera
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

    function actualizarCalculo() {
      var personas = valorValido(inputPersonas);
      var horas = valorValido(inputHoras);
      var costo = valorValido(inputCosto);

      if (!personas || !horas || !costo) {
        outHoras.textContent = "—";
        outAhorro.textContent = "—";
        return;
      }

      var horasAnuales = personas * horas * SEMANAS_POR_ANIO * FACTOR_AUTOMATIZACION;
      outHoras.textContent = formatoNumero.format(horasAnuales);
      outAhorro.textContent = formatoMoneda.format(horasAnuales * costo);
    }

    calcForm.addEventListener("input", actualizarCalculo);
    calcForm.addEventListener("submit", function (e) { e.preventDefault(); });
    actualizarCalculo();
  }
})();
