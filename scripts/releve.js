document.addEventListener("DOMContentLoaded", () => {
    const classeSelect = document.getElementById("classe");
    const nomEleveSelect = document.getElementById("nomEleve");

    // Initialisation des charts
    const paiementChart = echarts.init(document.getElementById("paiementChart"));
    const situationChart = echarts.init(document.getElementById("situationChart"));


    //Utils
    function showLoader() {
        document.getElementById("loader").classList.remove("hidden");
    }
    function hideLoader() {
        document.getElementById("loader").classList.add("hidden");
    }


    // ===============================
    // 1. Quand la classe change → charger élèves
    // ===============================
    classeSelect.addEventListener("change", async () => {
        const classe = classeSelect.value;
        nomEleveSelect.innerHTML = `<option value="" disabled selected>Chargement...</option>`;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`https://cspam-backend.onrender.com/api/eleves/classe/${classe}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const eleves = await res.json();
            nomEleveSelect.innerHTML = `<option value="" disabled selected>Choisissez un élève</option>`;

            if (!eleves.length) {
                const opt = document.createElement("option");
                opt.textContent = "Aucun élève trouvé";
                opt.disabled = true;
                nomEleveSelect.appendChild(opt);
                return;
            }

            // Remplir la liste
            eleves.forEach(eleve => {
                const opt = document.createElement("option");
                opt.value = eleve._id;
                opt.textContent = `${eleve.nom} ${eleve.prenom}`;
                opt.dataset.nom = eleve.nom;
                opt.dataset.prenom = eleve.prenom;
                opt.dataset.classe = eleve.classe; // 🔑 On garde la classe aussi
                nomEleveSelect.appendChild(opt);
            });

        } catch (err) {
            console.error("Erreur chargement élèves:", err);
            nomEleveSelect.innerHTML = `<option value="" disabled selected>Erreur de chargement</option>`;
        }
    });

    // ===============================
    // 2. Quand un élève est choisi → charger relevé
    // ===============================
    nomEleveSelect.addEventListener("change", async () => {

        // Section titre élève
        const studentTitle = document.querySelector(".student-title h1");

        // Récupérer option sélectionnée
        const selectedOption = nomEleveSelect.options[nomEleveSelect.selectedIndex];
        if (selectedOption) {
            const nom = selectedOption.dataset.nom;
            const prenom = selectedOption.dataset.prenom;
            const classe = selectedOption.dataset.classe;

            studentTitle.textContent = `${nom} ${prenom}, ${classe}`;
        }


        const eleveId = nomEleveSelect.value;
        if (!eleveId) return;

        try {
            showLoader();
            const response = await fetch(`https://cspam-backend.onrender.com/api/eleves/${eleveId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            hideLoader();
            if (!response.ok) throw new Error("Erreur lors de la récupération des paiements");

            const data = await response.json();

            const paiements = data.paiements || [];
            const totalAPayer = data.montantTotal || 0;
            const totalPaye = data.totalPaye || 0;

            // ===== Graphique Histogramme =====
            paiementChart.setOption({
                backgroundColor: "transparent",
                tooltip: {
                    trigger: "axis",
                    backgroundColor: "rgba(14,25,49,0.9)",
                    borderColor: "#d4af37",
                    borderWidth: 1,
                    textStyle: { color: "#fff", fontSize: 12 }
                },
                xAxis: {
                    type: "category",
                    data: paiements.map(p => new Date(p.date).toLocaleDateString("fr-FR")),
                    axisLine: { lineStyle: { color: "#555" } },
                    axisLabel: { color: "#bbb" }
                },
                yAxis: {
                    type: "value",
                    splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
                    axisLabel: { color: "#bbb" }
                },
                series: [
                    {
                        type: "bar",
                        data: paiements.map(p => p.montant),
                        barWidth: "45%",
                        itemStyle: {
                            borderRadius: [6, 6, 0, 0],
                            shadowColor: "rgba(212,175,55,0.4)",
                            shadowBlur: 8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: "#d4af37" },
                                { offset: 1, color: "#b8860b" }
                            ])
                        },
                        animationEasing: "elasticOut",
                        animationDuration: 1200
                    }
                ]
            });

            // ===== Graphique Camembert =====
            situationChart.setOption({
                backgroundColor: "transparent",
                tooltip: {
                    trigger: "item",
                    backgroundColor: "rgba(14,25,49,0.9)",
                    borderColor: "#00a86b",
                    borderWidth: 1,
                    textStyle: { color: "#fff", fontSize: 12 }
                },
                series: [
                    {
                        type: "pie",
                        radius: ["45%", "75%"],
                        avoidLabelOverlap: true,
                        data: [
                            { value: totalPaye, name: "Payé" },
                            { value: totalAPayer - totalPaye, name: "Reste à payer" }
                        ],
                        itemStyle: {
                            borderRadius: 6,
                            borderColor: "#0e1931",
                            borderWidth: 2,
                            color: (params) =>
                                params.name === "Payé"
                                    ? new echarts.graphic.LinearGradient(1, 0, 0, 1, [
                                        { offset: 0, color: "#00ffb3" },
                                        { offset: 1, color: "#00875a" }
                                    ])
                                    : new echarts.graphic.LinearGradient(1, 0, 0, 1, [
                                        { offset: 0, color: "#ff6f61" },
                                        { offset: 1, color: "#b22222" }
                                    ])
                        },
                        label: {
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: "600",
                            formatter: "{b}\n{c} ({d}%)"
                        },
                        emphasis: {
                            scale: true,
                            scaleSize: 8,
                            itemStyle: {
                                shadowBlur: 20,
                                shadowColor: "rgba(255,255,255,0.3)"
                            }
                        },
                        animationEasing: "cubicOut",
                        animationDuration: 1000
                    }
                ]
            });
        } catch (err) {
            console.error("Erreur frontend paiements:", err);
        }
    });

    // ===============================
    // 3. Resize (ajouté une seule fois)
    // ===============================
    window.addEventListener("resize", () => {
        paiementChart.resize();
        situationChart.resize();
    });
});
