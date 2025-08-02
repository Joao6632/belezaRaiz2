document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // ✅ Verifica login
    if (!usuarioLogado) {
        window.location.href = "../../aLogin/index.html";
        return;
    }

    // ✅ Define título
    document.querySelector("h2").textContent = "Serviços Realizados";

    // ✅ Carrega agendamentos
    carregarRealizados(usuarioLogado);

    // ✅ Marca ícone ativo
    const navLinks = document.querySelectorAll(".bottom-nav-item");
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();
        if (currentPage === linkPage) link.classList.add("active");
    });
});

// ============================
// 🔹 Carrega agendamentos do localStorage
// ============================
function loadAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
}

// ============================
// 🔹 Renderiza serviços realizados
// ============================
function carregarRealizados(usuario) {
    const lista = document.getElementById("lista-realizados");
    lista.innerHTML = "";

    const agendamentos = loadAgendamentos();
    const tipo = usuario.tipo ? usuario.tipo.toLowerCase() : "cliente"; // ✅ assume cliente se não tiver tipo

    console.log("🔍 Usuário logado:", usuario);
    console.log("🔍 Agendamentos no storage:", agendamentos);

    // ✅ Filtro principal
    const realizados = agendamentos.filter(ag => {
        const isRealizado = (ag.status || "").toLowerCase() === "realizado";

        // 🔹 Se for barbeiro → mostra só os dele
        const isDoBarbeiro = tipo === "barbeiro" && (
            (ag.barbeiro || "").toLowerCase() === (usuario.nome || "").toLowerCase() ||
            (ag.idBarbeiro || "").toLowerCase() === (usuario.nome || "").toLowerCase() ||
            ag.idBarbeiro === usuario.id
        );

        // 🔹 Se for cliente → mostra só os dele
        const isDoCliente = tipo === "cliente" && (
            ag.usuarioId === usuario.id ||
            (ag.usuarioNome || "").toLowerCase() === (usuario.nome || "").toLowerCase()
        );

        return isRealizado && (isDoBarbeiro || isDoCliente);
    });

    console.log("✅ Agendamentos filtrados:", realizados);

    // ✅ Se não houver resultados
    if (realizados.length === 0) {
        lista.innerHTML = `<p class="text-center">Nenhum serviço realizado ainda.</p>`;
        return;
    }

    // ✅ Renderiza os cards dinamicamente
    realizados.forEach((ag, i) => {
        const card = document.createElement("div");
        card.className = "card-agendamento fade-in";
        card.style.animationDelay = `${i * 0.05}s`;

        // ✅ Ajusta o caminho da imagem (corrige ../../ e garante pasta imagens)
        let imgPath = ag.imagem || "";
        if (!imgPath.includes("imagens/")) {
            imgPath = `../../../imagens/${imgPath}`;
        }
        imgPath = imgPath.replace("../../", "../../../");

        card.innerHTML = `
            <img src="${imgPath}" alt="${ag.titulo}" onerror="this.src='../../../imagens/placeholder.png'">
            <div class="card-info">
                <h3>${ag.titulo}</h3>
                <p><b>Data:</b> ${ag.data} - <b>Hora:</b> ${ag.horario}</p>
                <p><b>Status:</b> ✅ Realizado</p>
            </div>
        `;
        lista.appendChild(card);
    });
}
