(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("site-menu");
  const header = document.querySelector(".dashboard-header");
  const iconMenu = navToggle?.querySelector("img");

  const ICONS = {
    open: "../assets/icon/menu.png",
    close: "../assets/icon/close.png",
  };

  // Ouvrir / fermer menu mobile
  const toggleMobileMenu = () => {
    const isOpen = menu.classList.contains("is-open");
    menu.classList.toggle("is-open", !isOpen);
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    if (iconMenu) iconMenu.src = isOpen ? ICONS.open : ICONS.close;

    // Fermer tous les dropdowns si fermeture
    if (isOpen) closeAllDropdowns();
  };

  navToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Gestion des dropdowns
  const dropdownTriggers = document.querySelectorAll(".dropdown-trigger");

  const closeAllDropdowns = () => {
    dropdownTriggers.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      btn.closest(".has-dropdown")?.classList.remove("open");
    });
  };

  dropdownTriggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".has-dropdown");
      const isOpen = parent.classList.contains("open");

      closeAllDropdowns();
      parent.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // Clic extérieur
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) {
      menu?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      if (iconMenu) iconMenu.src = ICONS.open;
      closeAllDropdowns();
    }
  });

  // Escape -> ferme tout
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      if (iconMenu) iconMenu.src = ICONS.open;
      closeAllDropdowns();
    }
  });

  // Reset si retour en desktop
  const MQ = window.matchMedia("(max-width: 900px)");
  MQ.addEventListener("change", () => {
    if (!MQ.matches) {
      menu?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      if (iconMenu) iconMenu.src = ICONS.open;
      closeAllDropdowns();
    }
  });
})();
