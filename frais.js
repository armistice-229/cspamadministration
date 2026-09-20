document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("frais-form");
  const fraisList = document.getElementById("frais-list");

  // Charger la liste au démarrage
  fetchFrais();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const classe = document.getElementById("classe").value;
    const montant = document.getElementById("montant").value;
    const anneeScolaire = document.getElementById("annee").value;

    if (!classe || !montant || !anneeScolaire) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/frais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classe, montant, anneeScolaire })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de l’enregistrement.");
        return;
      }

      alert("✅ Frais enregistré avec succès !");
      form.reset();
      fetchFrais();
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Erreur réseau, impossible de contacter le serveur.");
    }
  });

  async function fetchFrais() {
    try {
      const res = await fetch("http://localhost:5000/api/frais");
      const frais = await res.json();

      fraisList.innerHTML = "";
      frais.forEach(f => {
        const li = document.createElement("li");
        li.textContent = `${f.classe.toUpperCase()} | ${f.anneeScolaire} → ${f.montant} FCFA`;
        fraisList.appendChild(li);
      });
    } catch (err) {
      console.error("Erreur chargement frais :", err);
    }
  }
});
