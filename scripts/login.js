document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");
  const btnLogin = document.querySelector(".btn-login");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // 🔒 Toggle visibilité mot de passe
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePassword.classList.toggle("fa-eye", !isPassword);
      togglePassword.classList.toggle("fa-eye-slash", isPassword);
    });
  }

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

  // 🔄 Gérer état du bouton
  function setLoading(isLoading) {
    if (!btnLogin) return;
    btnLogin.disabled = isLoading;
    btnLogin.innerHTML = isLoading
      ? `<span class="spinner"></span> Connexion...`
      : "Se connecter";
  }

  // ✅ Vérification du token au chargement
  async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Aucun token trouvé");
      return;
    }

    try {
      const res = await fetch("https://cspam-backend.onrender.com/api/users/verify-token", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Token valide → redirection auto
        window.location.href = "./dashbord.html";
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

  // 📝 Soumission du formulaire
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username")?.value.trim();
      const password = passwordInput?.value;

      if (!username || !password) {
        showToast("Veuillez remplir tous les champs.", "error");
        return;
      }

      try {
        setLoading(true);

        const res = await fetch("https://cspam-backend.onrender.com/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || "Échec de la connexion.", "error");
          return;
        }

        // ✅ Stockage du token et des infos user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showToast("Connexion réussie 🎉", "success");

        setTimeout(() => {
          window.location.href = "./dashbord.html";
        }, 1200);
      } catch (err) {
        console.error("Erreur réseau :", err);
        showToast("Impossible de se connecter au serveur.", "error");
      } finally {
        setLoading(false);
      }
    });
  }
});
