// ============================
// Gestion du menu burger
// ============================

// Sélection des éléments
const burger = document.querySelector(".menu-burger"); // Bouton burger
const nav = document.querySelector(".nav-mobile");     // Menu mobile

// Icônes (adapter les chemins si besoin)
const burgerOriginalIcon = `<img src="./assets/icon/menu.png" alt="Ouvrir le menu">`;
const burgerCrossIcon   = `<img src="./assets/icon/close.png" alt="Fermer le menu">`;

// ============================
// Toggle menu au clic sur burger
// ============================
burger.addEventListener("click", (e) => {
  e.stopPropagation(); // Empêche de déclencher l’événement document

  // Basculer l’état du menu
  nav.classList.toggle("active");

  // Changer l’icône du burger
  burger.innerHTML = nav.classList.contains("active") 
    ? burgerCrossIcon 
    : burgerOriginalIcon;
});

// ============================
// Fermer le menu si clic en dehors
// ============================
document.addEventListener("click", (e) => {
  if (!nav.contains(e.target) && !burger.contains(e.target)) {
    nav.classList.remove("active");
    burger.innerHTML = burgerOriginalIcon; // Remet l’icône d’origine
  }
});

// ============================
// Fermer après clic sur un lien du menu
// ============================
document.querySelectorAll(".nav-mobile a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
    burger.innerHTML = burgerOriginalIcon; // Remet l’icône d’origine
  });
});
