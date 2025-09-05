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
// VERIFICA SE USUÁRIO É BARBEIRO (CORRIGIDO)
// ============================
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogado || usuarioLogado.tipo !== "barbeiro") {
    alert("Acesso restrito para barbeiros!");
    window.location.href = "../../login/login.html";
}

// Atualiza o título com o nome do barbeiro
const tituloElement = document.querySelector("h2");
if (tituloElement) {
    tituloElement.textContent = `Agendamentos de ${usuarioLogado.nome}`;
}

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
// VERIFICA SE AGENDAMENTO PERTENCE AO BARBEIRO (MELHORADO)
// ============================
function pertenceAoBarbeiro(agendamento) {
    const barbeiroLogado = usuarioLogado;
    
    // Verifica todas as possibilidades de identificação do barbeiro
    return (
        agendamento.barbeiro === barbeiroLogado.nome ||
        agendamento.idBarbeiro === barbeiroLogado.id ||
        agendamento.idBarbeiro === barbeiroLogado.nome ||
        agendamento.barbeiroEmail === barbeiroLogado.login ||
        agendamento.barbeiroId === barbeiroLogado.id
    );
}

// ============================
// RENDERIZA AGENDAMENTOS PENDENTES DO BARBEIRO
// ============================
function renderizarAgendamentos(dataISO = "") {
    const lista = document.getElementById("lista");
    if (!lista) return;
    
    lista.innerHTML = "";

    const agendamentos = loadAgendamentos();
    const filtroData = normalizarData(dataISO);

    console.log("Barbeiro logado:", usuarioLogado); // Debug
    console.log("Total agendamentos:", agendamentos.length); // Debug

    // ✅ Filtra pendentes do barbeiro logado
    const pendentes = agendamentos.filter(ag => {
        const barbeiroMatch = pertenceAoBarbeiro(ag);
        const statusMatch = ag.status !== "realizado";
        const dataMatch = filtroData ? normalizarData(ag.data) === filtroData : true;
        
        // Debug específico
        if (barbeiroMatch) {
            console.log("Agendamento encontrado:", ag);
        }
        
        return barbeiroMatch && statusMatch && dataMatch;
    });

    console.log("Agendamentos pendentes encontrados:", pendentes.length); // Debug

    if (pendentes.length === 0) {
        lista.innerHTML = `
            <div class="text-center" style="padding: 20px; color: #666;">
                <p>Nenhum agendamento encontrado para esta data.</p>
                <p><small>Barbeiro: ${usuarioLogado.nome}</small></p>
            </div>
        `;
        return;
    }

    // ✅ Renderiza os cards
    pendentes.forEach((ag, i) => {
        const card = document.createElement("div");
        card.className = "card-agendamento fade-in";
        card.style.animationDelay = `${i * 0.05}s`;

        card.innerHTML = `
            <img src="${ag.imagem || '/assets/default-service.png'}" alt="${ag.titulo}" onerror="this.src='/assets/default-service.png'">
            <div class="card-info">
                <h3>${ag.titulo}</h3>
                <p><b>Cliente:</b> ${ag.usuarioNome || ag.clienteNome || 'Não informado'}</p>
                <p><b>Data:</b> ${ag.data} - <b>Hora:</b> ${ag.horario}</p>
                <p><b>Status:</b> <span class="status-badge ${ag.status}">${ag.status}</span></p>
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
// MARCAR AGENDAMENTO COMO REALIZADO (MELHORADO)
// ============================
function marcarComoRealizado(agendamento) {
    if (!confirm(`✅ Confirmar que o serviço "${agendamento.titulo}" foi realizado?`)) return;

    let agendamentos = loadAgendamentos();

    // 🔥 Localiza o agendamento original com múltiplos critérios
    const indexOriginal = agendamentos.findIndex(a => {
        // Critérios para encontrar o agendamento exato
        const mesmaData = normalizarData(a.data) === normalizarData(agendamento.data);
        const mesmoHorario = a.horario === agendamento.horario;
        const mesmoTitulo = a.titulo === agendamento.titulo;
        const mesmoBarbeiro = pertenceAoBarbeiro(a);
        
        return mesmaData && mesmoHorario && mesmoTitulo && mesmoBarbeiro;
    });

    if (indexOriginal !== -1) {
        // ✅ Garante campos necessários para compatibilidade
        const agendamentoAtual = agendamentos[indexOriginal];
        
        if (!agendamentoAtual.usuarioId && agendamentoAtual.usuarioNome) {
            agendamentoAtual.usuarioId = agendamentoAtual.usuarioNome;
        }
        if (!agendamentoAtual.usuarioNome && agendamentoAtual.usuarioId) {
            agendamentoAtual.usuarioNome = agendamentoAtual.usuarioId;
        }

        // ✅ Atualiza status e data de realização
        agendamentoAtual.status = "realizado";
        agendamentoAtual.dataRealizacao = new Date().toISOString();
        agendamentoAtual.realizadoPor = usuarioLogado.nome;

        // 🔥 Salva de volta
        saveAgendamentos(agendamentos);

        alert("✅ Serviço marcado como realizado!");
        console.log("Agendamento realizado:", agendamentoAtual); // Debug
        
        // Recarrega a lista
        renderizarAgendamentos(document.getElementById("filtroData").value);
    } else {
        alert("❌ Erro: agendamento não encontrado.");
        console.error("Agendamento não localizado:", agendamento); // Debug
    }
}

// ============================
// INICIALIZAÇÃO
// ============================
function carregarAgendamentos(dataISO = "") {
    renderizarAgendamentos(dataISO);
}
