document.addEventListener("DOMContentLoaded", async () => {
    // === Graphique 1 : Revenus vs Recettes ===
    const revenusRecettesChart = echarts.init(document.getElementById("revenusRecettesChart"));
    const depensesCategorieChart = echarts.init(document.getElementById("depensesCategorieChart"));

    // Active le mode loading
    revenusRecettesChart.showLoading({
        text: "Chargement...",
        color: "#d4af37",
        textColor: "#fff",
        maskColor: "rgba(14,25,49,0.6)",
        fontSize: 16
    });

    depensesCategorieChart.showLoading({
        text: "Chargement...",
        color: "#d4af37",
        textColor: "#fff",
        maskColor: "rgba(14,25,49,0.6)",
        fontSize: 16
    });


    // Options de base
    const revenusRecettesOptions = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(14, 25, 49, 0.9)",
            borderRadius: 8,
            textStyle: { color: "#fff", fontFamily: "Poppins" }
        },
        legend: {
            data: ["Entrées", "Sorties"],
            top: 10,
            textStyle: { color: "#d4af37", fontWeight: "600" }
        },
        grid: { left: "5%", right: "5%", bottom: "8%", containLabel: true },
        xAxis: {
            type: "category",
            boundaryGap: false,
            axisLine: { lineStyle: { color: "#888" } },
            axisLabel: { color: "#ccc", fontFamily: "Poppins" },
            data: [] // ⚡ rempli dynamiquement
        },
        yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
            axisLabel: { color: "#ccc", fontFamily: "Poppins" }
        },
        series: [
            {
                name: "Entrées",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                lineStyle: { width: 4, color: "#4facfe" },
                itemStyle: { color: "#4facfe", shadowBlur: 10, shadowColor: "#4facfe" },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(79,172,254,0.4)" },
                        { offset: 1, color: "rgba(79,172,254,0)" }
                    ])
                },
                data: [] // ⚡ rempli dynamiquement
            },
            {
                name: "Sorties",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                lineStyle: { width: 4, color: "#f7797d" },
                itemStyle: { color: "#f7797d", shadowBlur: 10, shadowColor: "#f7797d" },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(247,121,125,0.4)" },
                        { offset: 1, color: "rgba(247,121,125,0)" }
                    ])
                },
                data: [] // ⚡ rempli dynamiquement
            }
        ]
    };

    const depensesCategorieOptions = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "item",
            backgroundColor: "rgba(14, 25, 49, 0.9)",
            borderRadius: 8,
            textStyle: { color: "#fff", fontFamily: "Poppins" }
        },
        series: [
            {
                name: "Dépenses",
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: "#0e1931", borderWidth: 2 },
                label: { show: true, color: "#fff", fontWeight: "600" },
                labelLine: { show: true, smooth: true, length: 20, length2: 15 },
                data: [] // ⚡ rempli dynamiquement
            }
        ]
    };

    // === Récupération des données backend ===
    try {
        const res = await fetch("https://cspam-backend.onrender.com/api/dashboard/stats-caisse", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();

        // Injecter dans Graphique 1
        revenusRecettesOptions.xAxis.data = data.revenusVsRecettes.map(d => d.date);
        revenusRecettesOptions.series[0].data = data.revenusVsRecettes.map(d => d.revenus);
        revenusRecettesOptions.series[1].data = data.revenusVsRecettes.map(d => d.recettes);

        revenusRecettesChart.setOption(revenusRecettesOptions);
        revenusRecettesChart.hideLoading(); // retire le loading

        // Injecter dans Graphique 2
        depensesCategorieOptions.series[0].data = data.depensesCategories.map(c => ({
            name: c.categorie || "Autres",
            value: c.montant
        }));

        depensesCategorieChart.setOption(depensesCategorieOptions);
        depensesCategorieChart.hideLoading(); // retire le loading
 

    } catch (error) {
        console.error("Erreur chargement stats:", error);

        // Afficher un message d'erreur si le backend ne répond pas
        revenusRecettesChart.showLoading({
            text: "Erreur de chargement",
            color: "#ff7b7b",
            textColor: "#fff",
            maskColor: "rgba(14,25,49,0.6)",
            fontSize: 16
        });
        depensesCategorieChart.showLoading({
            text: "Erreur de chargement",
            color: "#ff7b7b",
            textColor: "#fff",
            maskColor: "rgba(14,25,49,0.6)",
            fontSize: 16
        });
    }

    // Resize dynamique
    window.addEventListener("resize", () => {
        revenusRecettesChart.resize();
        depensesCategorieChart.resize();
    });
});
