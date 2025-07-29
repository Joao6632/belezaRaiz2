document.addEventListener("DOMContentLoaded", () => {
    carregarAgendamentos();

    const navLinks = document.querySelectorAll(".bottom-nav-item");
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();
        if (currentPage === linkPage) link.classList.add("active");
    });
});

// ============================
// CARREGAR AGENDAMENTOS PENDENTES
// ============================
function carregarAgendamentos() {
    const container = document.getElementById("agendamentosPendentes");
    container.innerHTML = "";

    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    if (agendamentos.length === 0) {
        container.innerHTML = "<p style='text-align:center;color:gray;'>Nenhum agendamento pendente</p>";
        return;
    }

    agendamentos.forEach((agendamento, index) => {
        const card = document.createElement("div");
        card.classList.add("card-agendamento");

        card.innerHTML = `
            <img src="${agendamento.imagem}" alt="Serviço">
            <div class="card-info">
                <h3>${agendamento.titulo}</h3>
                <p>Duração: ${agendamento.duracao}</p>
                <p>Data: ${agendamento.data}</p>
                <p>Horário: ${agendamento.horario}</p>
            </div>
            <div class="card-buttons">
                <button class="cancelar" onclick="cancelarAgendamento(${index})">❌ Cancelar</button>
                <button class="reagendar" onclick="reagendarAgendamento(${index})">🔄 Reagendar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================
// CANCELAR AGENDAMENTO
// ============================
function cancelarAgendamento(index) {
    if (confirm("❌ Tem certeza que deseja cancelar este agendamento?")) {
        let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
        agendamentos.splice(index, 1);
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        alert("✅ Agendamento cancelado com sucesso!");
        carregarAgendamentos();
    }
}

// ============================
// REAGENDAR (mantém agendamento antigo até confirmar novo)
// ============================
function reagendarAgendamento(index) {
    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    const agendamento = agendamentos[index];
    if (!agendamento) return;

    localStorage.setItem("agendamentoEdicao", JSON.stringify({ index, ...agendamento }));
    alert("🔄 Você será redirecionado para reagendar este serviço.");
    window.location.href = "../bInicio/Inicio.html";
}
