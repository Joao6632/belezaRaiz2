// ============================
// VERIFICAÇÃO DE LOGIN DO BARBEIRO
// ============================
document.addEventListener("DOMContentLoaded", () => {
    const inputData = document.getElementById("filtroData");
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split("T")[0];
    if (inputData) inputData.value = hojeISO;

    carregarAgendamentos(hojeISO);

    // Ativar ícone da bottom-nav
    const navLinks = document.querySelectorAll(".bottom-nav-item");
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();
        if (currentPage === linkPage) link.classList.add("active");
    });

    // Filtro por data
    document.getElementById("btnFiltrar")?.addEventListener("click", () => {
        renderizarAgendamentos(inputData.value);
    });

    document.getElementById("btnLimpar")?.addEventListener("click", () => {
        inputData.value = hojeISO;
        renderizarAgendamentos(hojeISO);
    });
});

// ============================
// VERIFICA SE USUÁRIO É BARBEIRO
// ============================
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado || usuarioLogado.tipo !== "barbeiro") {
    window.location.href = "../login/login.html";
}
document.querySelector("h2").textContent = `Agendamentos de ${usuarioLogado.nome}`;

// ============================
// FUNÇÕES DE LOCALSTORAGE
// ============================
function loadAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
}
function saveAgendamentos(data) {
    localStorage.setItem("agendamentos", JSON.stringify(data));
}

// ============================
// NORMALIZA DATA (YYYY-MM-DD -> DD/MM)
// ============================
function normalizarData(data) {
    if (!data) return "";
    if (data.includes("-")) {
        const [y, m, d] = data.split("-");
        return `${d}/${m}`;
    }
    return data;
}

// ============================
// RENDERIZA AGENDAMENTOS PENDENTES DO BARBEIRO
// ============================
function renderizarAgendamentos(dataISO = "") {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    const agendamentos = loadAgendamentos();
    const filtroData = normalizarData(dataISO);

    // ✅ Filtra pendentes do barbeiro logado
    const pendentes = agendamentos.filter(ag => {
        const barbeiroMatch = (ag.barbeiro === usuarioLogado.nome) || (ag.idBarbeiro === usuarioLogado.id) || (ag.idBarbeiro === usuarioLogado.nome);
        const statusMatch = ag.status !== "realizado";
        const dataMatch = filtroData ? normalizarData(ag.data) === filtroData : true;
        return barbeiroMatch && statusMatch && dataMatch;
    });

    if (pendentes.length === 0) {
        lista.innerHTML = `<p class="text-center">Nenhum agendamento encontrado.</p>`;
        return;
    }

    // ✅ Renderiza os cards
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
                <button class="realizado">✅ Marcar como Realizado</button>
            </div>
        `;

        // 🔹 Evento de marcar como realizado
        card.querySelector("button.realizado").addEventListener("click", () => {
            marcarComoRealizado(ag);
        });

        lista.appendChild(card);
    });
}

// ============================
// MARCAR AGENDAMENTO COMO REALIZADO (CORRIGIDO)
// ============================
function marcarComoRealizado(agendamento) {
    if (!confirm("✅ Confirmar que este serviço foi realizado?")) return;

    let agendamentos = loadAgendamentos();

    // 🔥 Localiza o agendamento original
    const indexOriginal = agendamentos.findIndex(a =>
        normalizarData(a.data) === normalizarData(agendamento.data) &&
        a.horario === agendamento.horario &&
        ((a.idBarbeiro && (a.idBarbeiro === usuarioLogado.id || a.idBarbeiro === usuarioLogado.nome)) ||
         a.barbeiro === usuarioLogado.nome)
    );

    if (indexOriginal !== -1) {
        // ✅ Mantém ID e Nome do cliente (garante compatibilidade com a tela de realizados)
        if (!agendamentos[indexOriginal].usuarioId) {
            agendamentos[indexOriginal].usuarioId = agendamentos[indexOriginal].usuarioNome || "desconhecido";
        }
        if (!agendamentos[indexOriginal].usuarioNome) {
            agendamentos[indexOriginal].usuarioNome = agendamentos[indexOriginal].usuarioId;
        }

        // ✅ Atualiza status
        agendamentos[indexOriginal].status = "realizado";

        // 🔥 Salva de volta
        saveAgendamentos(agendamentos);

        alert("✅ Serviço marcado como realizado!");
        renderizarAgendamentos(document.getElementById("filtroData").value);
    } else {
        alert("❌ Erro: agendamento não encontrado.");
    }
}


// ============================
// INICIALIZAÇÃO
// ============================
function carregarAgendamentos(dataISO = "") {
    renderizarAgendamentos(dataISO);
}
