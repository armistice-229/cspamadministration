  // 🔔 Fonction utilitaire pour afficher une notification
  function showToast(message, type = "info") {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("visible"));

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

 // ✅ Vérification du token au chargement
  async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Accès interdit ❌ Connectez-vous.", "error");
      window.location.href = "./connexion.html";
      return;
    }

    try {
      const res = await fetch("https://cspam-backend.onrender.com/api/users/verify-token", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        console.log("Token valide");
      } else {
        // Token invalide
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showToast("Session expirée ❌ Veuillez vous reconnecter.", "error");
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du token :", err);
      showToast("Impossible de vérifier votre session.", "error");
    }
  }

  // 🚀 On appelle la vérification
  checkAuth();

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogout = document.getElementById("cancelLogout");
  const confirmLogout = document.getElementById("confirmLogout");

  // 👉 Quand on clique sur "Déconnexion"
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutModal.classList.remove("hidden"); // affiche le modal
  });

  // 👉 Quand on clique sur "Annuler"
  cancelLogout.addEventListener("click", () => {
    logoutModal.classList.add("hidden");
  });

  // 👉 Quand on clique sur "Confirmer"
  confirmLogout.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirection
    window.location.href = "../index.html";
  });
});
