document.addEventListener("DOMContentLoaded", () => {
    const inputData = document.getElementById("filtroData");
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split("T")[0];
    if (inputData) inputData.value = hojeISO;

    carregarAgendamentos(hojeISO);

    // 🔹 Ativa ícone de navegação
    const navLinks = document.querySelectorAll(".bottom-nav-item");
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();
        if (currentPage === linkPage) link.classList.add("active");
    });

    // 🔹 Filtro por data
    document.getElementById("btnFiltrar")?.addEventListener("click", () => {
        renderizarAgendamentos(inputData.value);
    });

    document.getElementById("btnLimpar")?.addEventListener("click", () => {
        inputData.value = hojeISO;
        renderizarAgendamentos(hojeISO);
    });
});

// 🔹 Usuário logado
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado || usuarioLogado.tipo !== "barbeiro") {
    window.location.href = "../login/login.html";
}

document.querySelector("h2").textContent = `Agendamentos de ${usuarioLogado.nome}`;

// 🔹 Funções de storage
function loadAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
}
function saveAgendamentos(data) {
    localStorage.setItem("agendamentos", JSON.stringify(data));
}

// ✅ Normaliza datas para o padrão DD/MM (já que seu objeto salva "01/08")
function normalizarData(data) {
    if (!data) return "";
    if (data.includes("-")) {
        const [y, m, d] = data.split("-");
        return `${d}/${m}`;
    }
    return data; // já está no formato correto
}

// 🔹 Renderiza agendamentos
function renderizarAgendamentos(dataISO = "") {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    const agendamentos = loadAgendamentos();

    // ✅ Converte data de filtro para DD/MM
    const filtroData = normalizarData(dataISO);

    // ✅ Filtra agendamentos
    let pendentes = agendamentos.filter(ag => {
        const barbeiroMatch = (ag.barbeiro === usuarioLogado.nome) || (ag.idBarbeiro === usuarioLogado.id) || (ag.idBarbeiro === usuarioLogado.nome);
        const statusMatch = ag.status !== "realizado";
        const dataMatch = filtroData ? normalizarData(ag.data) === filtroData : true;
        return barbeiroMatch && statusMatch && dataMatch;
    });

    if (pendentes.length === 0) {
        lista.innerHTML = `<p class="text-center">Nenhum agendamento encontrado.</p>`;
        return;
    }

    // ✅ Renderiza cards
    pendentes.forEach((ag, i) => {
        const card = document.createElement("div");
        card.className = "card-agendamento fade-in";
        card.style.animationDelay = `${i * 0.05}s`;

        card.innerHTML = `
            <img src="${ag.imagem}" alt="${ag.titulo}">
            <div class="card-info">
                <h3>${ag.titulo}</h3>
                <p><b>Data:</b> ${ag.data} - <b>Hora:</b> ${ag.horario}</p>
                <p><b>Status:</b> ${ag.status}</p>
                <button class="realizado">Marcar como Realizado</button>
            </div>
        `;

        card.querySelector("button.realizado").addEventListener("click", () => {
            marcarComoRealizado(ag);
        });

        lista.appendChild(card);
    });
}

// 🔹 Marcar como realizado
function marcarComoRealizado(agendamento) {
    let agendamentos = loadAgendamentos();

    const indexOriginal = agendamentos.findIndex(a =>
        normalizarData(a.data) === normalizarData(agendamento.data) &&
        a.horario === agendamento.horario &&
        ((a.idBarbeiro && (a.idBarbeiro === usuarioLogado.id || a.idBarbeiro === usuarioLogado.nome)) ||
         a.barbeiro === usuarioLogado.nome)
    );

    if (indexOriginal !== -1) {
        agendamentos[indexOriginal].status = "realizado";
        saveAgendamentos(agendamentos);
        renderizarAgendamentos(document.getElementById("filtroData").value);
    }
}

// 🔹 Inicializa
function carregarAgendamentos(dataISO = "") {
    renderizarAgendamentos(dataISO);
}
