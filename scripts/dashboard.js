function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

async function loadProgress() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://cspam-backend.onrender.com/api/dashboard/progress", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    const progressBar = document.querySelector(".progress");
    const progressLabel = document.querySelector(".progress-label");

    if (progressBar && progressLabel) {
      const taux = data.taux || 0;
      progressBar.style.width = taux + "%";
      progressBar.setAttribute("aria-valuenow", taux);
      progressLabel.textContent = `Taux d'encaissement à : ${taux}%`;
    }
  } catch (err) {
    console.error("Erreur chargement progress:", err);
  }
}

async function loadStats() {
  try {
    const res = await fetch("https://cspam-backend.onrender.com/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();

   document.querySelector('[data-key="solde"]').textContent = data.solde?.toLocaleString() ?? "******";

    document.querySelector('[data-key="revenus-jour"]').textContent = (data.revenusJour ?? 0).toLocaleString();

    document.querySelector('[data-key="depenses-jour"]').textContent = (data.depensesJour ?? 0).toLocaleString();

  } catch (err) {
    console.error("Erreur chargement stats:", err);
  }
}


async function chargerEffectifs() {
    const listContainer = document.querySelector(".class-list");
    listContainer.innerHTML = "<li>Chargement...</li>";

    try {
        const res = await fetch("https://cspam-backend.onrender.com/api/dashboard/effectifs?annee=2024-2025", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();

        listContainer.innerHTML = ""; // vide la liste

        data.effectifs.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="class">${item.classe}</span> 
                <span class="dot" aria-hidden="true">•</span> 
                <span class="count">${item.count}</span>
            `;
            listContainer.appendChild(li);
        });
    } catch (error) {
        console.error("Erreur chargement effectifs:", error);
        listContainer.innerHTML = "<li style='color:red;'>Erreur de chargement</li>";
    }
}

// Charger après le DOM
document.addEventListener("DOMContentLoaded", async () => {
  showLoading();
  try {
    await Promise.all([
      loadStats(),
      loadProgress(),
      chargerEffectifs()
    ]);
  } catch (err) {
    console.error("Erreur lors du chargement global:", err);
  } finally {
    hideLoading();
  }
});


