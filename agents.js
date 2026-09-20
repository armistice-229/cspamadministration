const API_URL = "http://localhost:5000/api/admin/agent"; // ⚠️ adapter selon ton backend
const token = localStorage.getItem("token"); // ⚠️ tu dois avoir ton JWT stocké ici

// Charger la liste des agents
async function loadAgents() {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const agents = await res.json();

  const tbody = document.getElementById("agentsTableBody");
  tbody.innerHTML = "";

  agents.forEach(agent => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${agent.nom}</td>
      <td>${agent.prenom}</td>
      <td>${agent.fonction || "-"}</td>
      <td>${agent.actif ? "✅" : "❌"}</td>
      <td>
        <button onclick="toggleActif('${agent._id}', ${agent.actif})">
          ${agent.actif ? "Désactiver" : "Activer"}
        </button>
        <button onclick="deleteAgent('${agent._id}')">Supprimer</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Ajouter un agent
document.getElementById("agentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const fonction = document.getElementById("fonction").value;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nom, prenom, fonction })
  });

  if (res.ok) {
    alert("Agent ajouté !");
    e.target.reset();
    loadAgents();
  } else {
    const err = await res.json();
    alert("Erreur: " + err.error);
  }
});

// Changer état actif/inactif
async function toggleActif(id, actuel) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ actif: !actuel })
  });

  if (res.ok) loadAgents();
}

// Supprimer un agent
async function deleteAgent(id) {
  if (!confirm("Voulez-vous supprimer cet agent ?")) return;

  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) loadAgents();
}

// Charger au démarrage
loadAgents();
