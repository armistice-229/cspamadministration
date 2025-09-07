// =============================
// Utils
// =============================
function setLoading(btn, isLoading, text = "Enregistrer") {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? `<span class="spinner"></span> ...` : text;
}

async function postData(url, data) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Erreur requête");
  return result;
}


// =============================
// Fonction générique Suggestions
// =============================
function setupMotifSuggestions(inputId, suggestionsId, storageKey, formElement) {
  const inputEl = document.getElementById(inputId);
  const suggestionsEl = document.getElementById(suggestionsId);
  let motifsRecents = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Affichage des suggestions
  function showSuggestions(query) {
    suggestionsEl.innerHTML = "";
    if (!query) return;

    const matches = motifsRecents.filter(m => m.toLowerCase().includes(query.toLowerCase()));
    matches.forEach(motif => {
      const li = document.createElement("li");
      li.textContent = motif;
      li.addEventListener("click", () => {
        inputEl.value = motif;
        suggestionsEl.innerHTML = "";
      });
      suggestionsEl.appendChild(li);
    });
  }

  // Quand l’utilisateur tape
  if (inputEl && suggestionsEl) {
    inputEl.addEventListener("input", () => {
      const query = inputEl.value.trim();
      showSuggestions(query);
    });

    // Fermer suggestions si clic en dehors
    document.addEventListener("click", (e) => {
      if (!inputEl.contains(e.target) && !suggestionsEl.contains(e.target)) {
        suggestionsEl.innerHTML = "";
      }
    });
  }

  // Sauvegarder le motif après soumission du formulaire
  if (formElement) {
    formElement.addEventListener("submit", () => {
      const newMotif = inputEl.value.trim();
      if (newMotif && !motifsRecents.includes(newMotif)) {
        motifsRecents.unshift(newMotif); // ajoute en tête
        motifsRecents = motifsRecents.slice(0, 10); // garde max 10
        localStorage.setItem(storageKey, JSON.stringify(motifsRecents));
      }
    });
  }
}


// =============================
// Infos Agent + Date
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const agentNameEl = document.getElementById("agent-name");
  if (agentNameEl) agentNameEl.textContent = user?.nom || "Utilisateur inconnu";

  // input date global
  const dateEl = document.getElementById("operation-date");
  if (dateEl) {
    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
    dateEl.value = today; // par défaut aujourd’hui
  }
});


// =============================
// Auto-complétion Élève
// =============================
const eleveInput = document.getElementById("eleve");
const suggestionsBox = document.getElementById("eleve-suggestions");
let debounceTimeout;

if (eleveInput && suggestionsBox) {
  eleveInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    const query = eleveInput.value.trim();
    if (query.length < 2) {
      suggestionsBox.innerHTML = "";
      return;
    }

    debounceTimeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://cspam-backend.onrender.com/api/eleves/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eleves = await res.json();

        suggestionsBox.innerHTML = "";

        if (!eleves.length) {
          const li = document.createElement("li");
          li.textContent = "⚠️ Aucun élève trouvé. Vérifiez le nom saisi.";
          li.style.cssText = "color:red;font-style:italic;cursor:default";
          suggestionsBox.appendChild(li);
          return;
        }

        eleves.forEach(eleve => {
          const li = document.createElement("li");
          li.textContent = `${eleve.nom} ${eleve.prenom} (${eleve.classe})`;
          li.dataset.id = eleve._id;

          li.addEventListener("click", () => {
            eleveInput.value = `${eleve.nom} ${eleve.prenom}`;
            eleveInput.dataset.id = eleve._id;
            eleveInput.dataset.nom = `${eleve.nom} ${eleve.prenom}`;
            suggestionsBox.innerHTML = "";
          });

          suggestionsBox.appendChild(li);
        });
      } catch (err) {
        console.error("Erreur recherche élève:", err);
        showToast("Erreur lors de la recherche d'élève.", "error");
      }
    }, 300);
  });
}

// =============================
// Formulaire Entrée
// =============================
const formEntree = document.querySelector('form[aria-label="Formulaire Entrée de Caisse"]');

if (formEntree) {
  formEntree.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = formEntree.querySelector("button[type='submit']");
    setLoading(btn, true, "Enregistrer");

    const eleveId = eleveInput?.dataset.id;
    const montant = document.getElementById("montant-entree")?.value;
    const recu = document.getElementById("recu")?.value.trim();
    const motifs = document.getElementById("motif-entree")?.value.trim();

    if (!eleveId || !montant || !recu) {
      showToast("Veuillez remplir tous les champs requis.", "error");
      return setLoading(btn, false, "Enregistrer");
    }

    try {
      const operationDate = document.getElementById("operation-date")?.value;

      await postData("https://cspam-backend.onrender.com/api/caisse", {
        type: "entree",
        eleve: eleveId,
        montant: Number(montant),
        recu,
        motifs,
        date: operationDate, // on ajoute la date ici
      });
      showToast("Entrée de caisse enregistrée ✅", "success");
      formEntree.reset();
      eleveInput.dataset.id = "";
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      setLoading(btn, false, "Enregistrer");
    }
  });
}

// =============================
// Formulaire Sortie
// =============================
const formSortie = document.getElementById("fom-sortie");

if (formSortie) {
  formSortie.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-sortie");
    setLoading(btn, true, "Enregistrer");

    const categorie = formSortie.querySelector("select")?.value;
    const montant = document.getElementById("montant-sortie")?.value;
    const description = document.getElementById("motif-sortie")?.value.trim();

    if (!categorie || !montant) {
      showToast("Veuillez remplir tous les champs requis.", "error");
      return setLoading(btn, false, "Enregistrer");
    }

    try {
      const operationDate = document.getElementById("operation-date")?.value;

      await postData("https://cspam-backend.onrender.com/api/caisse", {
        type: "sortie",
        categorie,
        montant: Number(montant),
        description,
        date: operationDate, // on ajoute la date ici
      });
      showToast("Sortie de caisse enregistrée ✅", "success");
      formSortie.reset();
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      setLoading(btn, false, "Enregistrer");
    }
  });
}


// =============================
// Initialisation Suggestions Motifs
// =============================
// Suggestions pour Entrée
setupMotifSuggestions("motif-entree", "motif-suggestions", "motifsRecents", formEntree);

// Suggestions pour Sortie
setupMotifSuggestions("motif-sortie", "motif-sortie-suggestions", "motifsSortieRecents", formSortie);
// =============================
