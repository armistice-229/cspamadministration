// =============================
// Auto-complétion Nom & Prénoms
// =============================
const nomInput = document.getElementById("nom");
const classeInput = document.getElementById("classe");
const anneeInput = document.getElementById("annee");
const suggestionBox = document.getElementById("suggestions");

nomInput.addEventListener("input", async () => {
  const search = nomInput.value.trim();
  const classe = classeInput.value;
  const annee = anneeInput.value;

  if (search.length < 2 || !classe || !annee) {
    suggestionBox.innerHTML = "";
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `https://cspam-backend.onrender.com/api/certificat/eleves?classe=${classe}&annee=${annee}&search=${encodeURIComponent(search)}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    const data = await res.json();
    suggestionBox.innerHTML = "";

    // ✅ Cas unique → remplir directement les champs
    if (data.unique && data.eleve) {
      const eleve = data.eleve;

      nomInput.value = `${eleve.nom} ${eleve.prenom}`;
      document.getElementById("matricule").value = eleve.matricule || "";
      document.getElementById("date-naissance").value = eleve.dateNaissance
        ? eleve.dateNaissance.split("T")[0]
        : "";
      document.getElementById("lieu-naissance").value = eleve.lieuNaissance || "";
       
      document.getElementById("classe").value = eleve.classe || "";
      document.getElementById("annee").value = eleve.anneeScolaire || "";

      return; // Pas besoin d'afficher les suggestions
    }

    // ✅ Cas liste multiple
    if (!data.eleves || data.eleves.length === 0) {
      suggestionBox.innerHTML = `<li class="no-result">Aucun élève trouvé</li>`;
      return;
    }

    data.eleves.forEach((eleve) => {
      const li = document.createElement("li");
      li.textContent = `${eleve.nom} ${eleve.prenom}`;
      li.addEventListener("click", () => {
        nomInput.value = `${eleve.nom} ${eleve.prenom}`;
        document.getElementById("matricule").value = eleve.matricule || "";
        document.getElementById("date-naissance").value = eleve.dateNaissance
          ? eleve.dateNaissance.split("T")[0]
          : "";
        document.getElementById("lieu-naissance").value = eleve.lieuNaissance || "";
         
        document.getElementById("classe").value = eleve.classe || "";
        document.getElementById("annee").value = eleve.anneeScolaire || "";

        suggestionBox.innerHTML = ""; // ferme les suggestions
      });
      suggestionBox.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur recherche élève :", err);
    suggestionBox.innerHTML = `<li class="no-result">Erreur serveur</li>`;
  }
});

// Fermer les suggestions si clic en dehors
document.addEventListener("click", (e) => {
  if (!nomInput.parentElement.contains(e.target)) {
    suggestionBox.innerHTML = "";
  }
});

// =============================
// Form Submission avec paiement FedaPay
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("certif-form");
 
  // 👉 On initialise le widget FedaPay une seule fois
  FedaPay.init("#generate-btn", {
    public_key: "pk_sandbox_MzRYR_dNY8mLjA8BKJHxaV0I", // Mets la clé live en prod
    transaction: {
      description: "Certificat de scolarité",
      amount: 295,
      currency: "XOF",
    },
    customer: {
      firstname: "Firstname", 
      lastname: "Lastname", 
      email: "lddynamics2@gmail.com",
    },
    onComplete: async (response) => {
      if (response.transaction.status === "approved") {
        // ✅ Récupère les données du formulaire
        const formData = {
          nom: document.getElementById("nom").value,
          matricule: document.getElementById("matricule").value,
          classe: document.getElementById("classe").value,
          dateNaissance: document.getElementById("date-naissance").value,
          lieuNaissance: document.getElementById("lieu-naissance").value,
          dateInscription: document.getElementById("date-inscription").value,
          assiduite: document.getElementById("assiduite").value,
          conduite: document.getElementById("conduite").value,
          travail: document.getElementById("travail").value,
          observations: document.getElementById("observation").value,
        };

        try {
          showLoader();
          const token = localStorage.getItem("token");

          const res = await fetch("https://cspam-backend.onrender.com/api/certificat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(formData),
          });

          hideLoader();

          if (!res.ok) throw new Error("Erreur serveur");

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `certificat_${formData.nom}_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          showToast("✅ Certificat généré avec succès !", "success");
          loadHistorique();
        } catch (err) {
          console.error(err);
          showToast("❌ Échec de génération du certificat", "error");
        }
      } else {
        showToast("❌ Paiement non validé, certificat non généré", "error");
      }
    },
  });

  // Empêcher le rechargement classique du formulaire
  form.addEventListener("submit", (e) => e.preventDefault());

  // Fixer la date max pour la date d'inscription
  const dateInput = document.getElementById("date-inscription");
  if (dateInput) {
    // définir la date max = aujourd'hui
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("max", today);

    // si l’utilisateur tente de mettre une date > aujourd’hui
    dateInput.addEventListener("input", () => {
      if (dateInput.value > today) {
        dateInput.value = today;
        showToast("⚠️ Vous ne pouvez pas choisir une date future !", "warning");
      }
    });
  }
});

// Fonction pour charger l'historique des certificats
async function loadHistorique() {
  try {
    const res = await fetch("https://cspam-backend.onrender.com/api/certificat/history");
    const data = await res.json();

    const tbody = document.querySelector("#history-table tbody");
    tbody.innerHTML = "";

    data.certificats.forEach(certif => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${certif.dateDelivrance || "N/A"}</td>
        <td>${certif.nomEleve || "N/A"}</td>
        <td>${certif.classe ? certif.classe.toUpperCase() : "N/A"}</td>
        <td>${certif.numeroCertificat || "N/A"}</td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erreur chargement historique:", err);
    showToast("Erreur lors du chargement de l'historique.", "error");
  }
}

// Charger l’historique au chargement de la page
document.addEventListener("DOMContentLoaded", loadHistorique);

//Utils
    function showLoader() {
        document.getElementById("loader").classList.remove("hidden");
    }
    function hideLoader() {
        document.getElementById("loader").classList.add("hidden");
    }
