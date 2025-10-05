document.addEventListener("DOMContentLoaded", () => {
  const btnRapportJournalier = document.getElementById("btnRapportJournalier");
  const modal = document.getElementById("journalierModal");
  const cancelBtn = document.getElementById("cancelJournalier");
  const confirmBtn = document.getElementById("confirmJournalier");
  const inputDate = document.getElementById("journalierDate");

  // Ouvrir le modal
  btnRapportJournalier.addEventListener("click", () => {
    modal.classList.remove("hidden");
    inputDate.focus(); // focus direct dans le champ
  });

  // Fermer le modal (Annuler ou clic en dehors du contenu)
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.classList.add("hidden");
    inputDate.value = "";
  }

  // Valider la date
  confirmBtn.addEventListener("click", () => {
    const date = inputDate.value;
    if (!date) {
      showToast("Veuillez sélectionner une date !", "warning");
      return;
    }

    closeModal();

    // 🔹 Construire le nom du fichier plus lisible
    const formattedDate = date.split("-").reverse().join("-");
    const filename = `rapport-journalier-${formattedDate}.pdf`;

    // 🔹 Déclencher le téléchargement
    downloadFile(`https://cspam-backend.onrender.com/api/rapport/journalier?date=${date}`, filename);
  });

  
  const dateInput = document.getElementById("journalierDate");
  if (dateInput) {
    // calcul de la date du jour au format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // fixer la date max + remplir automatiquement
    dateInput.setAttribute("max", today);
    dateInput.value = today;

    // empêcher saisie future manuelle
    dateInput.addEventListener("input", () => {
      if (dateInput.value > today) {
        dateInput.value = today;
        showToast("⚠️ Vous ne pouvez pas choisir une date future !", "warning");
      }
    });
  }

  const btnListe = document.getElementById("btnlisteAlphabetique");

    if (btnListe) {
        btnListe.addEventListener("click", async () => {
            try {
                // Ici, tu peux récupérer dynamiquement la classe sélectionnée
                // Par exemple depuis un <select id="selectClasse"> si tu en as un
                const classe = prompt("Entrez la classe (ex: CI, CP, CE1...) :");
                if (!classe) return;

                const annee = "2024-2025"; // ou à récupérer depuis ton store global
                const token = localStorage.getItem("token"); // auth JWT

                const url = `http://localhost:5000/api/rapport/liste/${classe}?annee=${encodeURIComponent(annee)}`;
                const resp = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!resp.ok) {
                    if (resp.status === 404) {
                        alert("Aucun élève trouvé pour cette classe.");
                        return;
                    }
                    throw new Error("Erreur lors de la génération du PDF");
                }

                // Télécharger le PDF
                const blob = await resp.blob();
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `liste_${classe}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();

            } catch (err) {
                console.error("Erreur :", err);
                alert("Une erreur est survenue lors du téléchargement du PDF.");
            }
        });
    }
});


// Fonction générique pour télécharger un fichier depuis l’API
function downloadFile(url, filename) {
  fetch(url, { 
    method: "GET" , headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erreur lors du téléchargement");
      return res.blob();
    })
    .then((blob) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      link.remove();
    })
    .catch((err) => {
      showToast("❌ Impossible de télécharger le rapport : " + err.message, "error");
    });
}
