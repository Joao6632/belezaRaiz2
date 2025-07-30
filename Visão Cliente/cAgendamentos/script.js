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

// nav-active.js
(function () {
  function normalizePath(u) {
    const url = new URL(u, location.origin);
    let p = url.pathname.replace(/\\/g, "/");

    // trata /pasta/ e /pasta/index.html como a MESMA rota
    p = p.replace(/\/index\.html?$/i, "");
    // remove barra final (menos a raiz "/")
    if (p.length > 1) p = p.replace(/\/+$/, "");
    // case-insensitive (Windows servers)
    return p.toLowerCase();
  }

  function setActiveBottomNav() {
    const here = normalizePath(location.href);
    const items = Array.from(document.querySelectorAll(".bottom-nav .bottom-nav-item"));

    if (!items.length) return;

    items.forEach((a) => a.classList.remove("active"));

    // 1) tenta match exato com href
    let current = items.find((a) => normalizePath(a.href) === here);

    // 2) se não achou, tenta pelo data-route (opcional)
    if (!current) {
      current = items.find((a) => {
        const r = a.getAttribute("data-route");
        return r && normalizePath(r) === here;
      });
    }

    // 3) fallback: se a URL atual estiver dentro da pasta do link
    // ex.: link -> /cAgendamentos  |  aqui -> /cAgendamentos/detalhe
    if (!current) {
      current = items
        .map((a) => ({ a, path: normalizePath(a.href) }))
        .filter(({ path }) => here.startsWith(path) && path !== "/")
        .sort((x, y) => y.path.length - x.path.length) // pega o mais específico
        .map(({ a }) => a)[0];
    }

    if (current) current.classList.add("active");
  }

  // roda quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setActiveBottomNav, { once: true });
  } else {
    setActiveBottomNav();
  }
})();


(function () {
  const input = document.getElementById('filtroAgendamento');
  const clear = document.getElementById('clearBusca');

  if (!input) return;

  const cards = () => Array.from(document.querySelectorAll('.card-agendamento'));

  const normalize = (s) =>
    (s || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // tira acento
      .replace(/\s+/g, ' ')              // normaliza espaços
      .trim();

  let t;
  function applyFilter() {
    const termo = normalize(input.value);
    cards().forEach((card) => {
      const serv = card.dataset.servico || card.querySelector('.card-info h3')?.textContent.split('-')[0] || '';
      const func = card.dataset.funcionario || card.querySelector('.card-info h3')?.textContent.split('-')[1] || '';
      const haystack = normalize(`${serv} ${func} ${card.textContent}`);
      const show = termo === '' || haystack.includes(termo);
      card.style.display = show ? '' : 'none';
    });
  }

  function debouncedFilter() {
    clearTimeout(t);
    t = setTimeout(applyFilter, 120);
  }

  input.addEventListener('input', debouncedFilter);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; applyFilter(); }});
  clear?.addEventListener('click', () => { input.value = ''; input.focus(); applyFilter(); });

  // roda na carga (caso venha com valor via autocomplete)
  applyFilter();
})();
