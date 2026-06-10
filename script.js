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

})();
