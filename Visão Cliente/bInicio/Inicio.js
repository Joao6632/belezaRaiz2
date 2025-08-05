// ============================
// VALIDAÇÃO DE LOGIN + EXIBIR NOME
// ============================

document.addEventListener('DOMContentLoaded', () => {
  // 🔥 pega usuário logado do localStorage
  const userLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  // ✅ se não existe, manda pra tela de login
  if (!userLogado || !userLogado.nome) {
    window.location.href = '../aLogin/index.html';
    return;
  }

  // ✅ exibe o nome na home
  const welcomeEl = document.getElementById('welcome-name');
  if (welcomeEl) {
    welcomeEl.innerHTML = `Olá, <br>${userLogado.nome}!`;
  }
});




const barbeiros = {
  "Silvio Santos": "../../imagens/silvio.jpg",
  "Alex Silveira": "../../imagens/alex.jpg",
  "Daniel Zolin": "../../imagens/daniel.jpg"
};



// ============================
//      SALVAR & CARREGAR ESTADO TEMPORÁRIO
// ============================

function salvarEstadoAtual() {
  const estado = {
    barbeiro: {
      nome: btnBarbeiro.dataset.nome || null,
      foto: btnBarbeiro.dataset.foto || null,
      selected: btnBarbeiro.dataset.selected === "true"
    },
    servico: {
      nome: btnServico.dataset.nome || null,
      img: btnServico.dataset.img || null,
      duracao: btnServico.dataset.duracao || null,
      selected: btnServico.dataset.selected === "true"
    },
    horario: {
      data: dataSelecionada || null,
      hora: horaSelecionada || null,
      selected: btnHorario.dataset.selected === "true"
    }
  };
  localStorage.setItem("estadoAgendamento", JSON.stringify(estado));
}

function carregarEstadoSalvo() {
  const estadoSalvo = JSON.parse(localStorage.getItem("estadoAgendamento"));
  if (!estadoSalvo) return;

  // ✅ Restaurar barbeiro
  if (estadoSalvo.barbeiro.selected) {
    btnBarbeiro.dataset.selected = "true";
    btnBarbeiro.dataset.nome = estadoSalvo.barbeiro.nome;
    btnBarbeiro.dataset.foto = estadoSalvo.barbeiro.foto;
    btnBarbeiro.innerHTML = `
      <div class="barbeiro-info">
        <img src="${estadoSalvo.barbeiro.foto}" alt="${estadoSalvo.barbeiro.nome}" class="barbeiro-foto">
        <span class="barbeiro-nome">${estadoSalvo.barbeiro.nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
  }

  // ✅ Restaurar serviço
  if (estadoSalvo.servico.selected) {
    btnServico.dataset.selected = "true";
    btnServico.dataset.nome = estadoSalvo.servico.nome;
    btnServico.dataset.img = estadoSalvo.servico.img;
    btnServico.dataset.duracao = estadoSalvo.servico.duracao;
    btnServico.innerHTML = `
      <div class="servico-info">
        <img src="${estadoSalvo.servico.img}" alt="${estadoSalvo.servico.nome}" class="servico-foto">
        <span class="servico-nome">${estadoSalvo.servico.nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
  }

  // ✅ Restaurar horário
  if (estadoSalvo.horario.selected) {
    dataSelecionada = estadoSalvo.horario.data;
    horaSelecionada = estadoSalvo.horario.hora;
    btnHorario.dataset.selected = "true";
    btnHorario.querySelector("span").innerHTML = `<b>Dia ${dataSelecionada} às ${horaSelecionada}</b>`;
  }

  verificarSePodeAgendar();
}

// ============================
//      FUNÇÃO GENÉRICA PARA FECHAR MODAL
// ============================
function fecharModal(idModal) {
  document.getElementById(idModal)?.classList.add("hidden");
}

// ============================
//      SEÇÃO: BARBEIRO
// ============================
const btnBarbeiro = document.getElementById('barbeiro');
const modal = document.getElementById('modalBarbeiros');
const barbeiroItems = document.querySelectorAll('.barbeiro-list li');

btnBarbeiro.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

barbeiroItems.forEach(item => {
  item.addEventListener('click', () => {
    const nome = item.dataset.nome;
    const foto = item.dataset.foto;

    btnBarbeiro.innerHTML = `
      <div class="barbeiro-info">
        <img src="${foto}" alt="${nome}" class="barbeiro-foto">
        <span class="barbeiro-nome">${nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
    btnBarbeiro.dataset.selected = "true";
    btnBarbeiro.dataset.nome = nome;
    btnBarbeiro.dataset.foto = foto;
    modal.classList.add('hidden');
    verificarSePodeAgendar();
    salvarEstadoAtual();
  });
});

// ✅ Botão fechar modal (somente fecha, não reseta nada)
document.querySelectorAll('.fechar').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.add('hidden');
  });
});

// ============================
//      SEÇÃO: SERVIÇOS
// ============================
const btnServico = document.getElementById('servico');
const modalServicos = document.getElementById('modalServicos');
const servicoItems = document.querySelectorAll('.servico-card');
const modalServicoDetalhe = document.getElementById('modalServicoDetalhe');

const detalheTitulo = document.getElementById('detalheTitulo');
const detalheImg = document.getElementById('detalheImg');
const detalheDescricao = document.getElementById('detalheDescricao');
const detalhePreco = document.getElementById('detalhePreco');
const detalheDuracao = document.getElementById('detalheDuracao');

const cancelarServico = document.getElementById('cancelarServico');
const confirmarServico = document.getElementById('confirmarServico');

let servicoSelecionado = null;

btnServico.addEventListener('click', () => {
  modalServicos.classList.remove('hidden');
});

servicoItems.forEach(item => {
  item.addEventListener('click', () => {
    servicoSelecionado = item;
    detalheTitulo.textContent = item.dataset.nome;
    detalheImg.src = `../../imagens/${item.dataset.img}`;
    detalheDescricao.textContent = item.dataset.descricao;
    detalhePreco.textContent = item.dataset.preco;
    detalheDuracao.textContent = item.dataset.duracao;
    modalServicos.classList.add('hidden');
    modalServicoDetalhe.classList.remove('hidden');
  });
});

cancelarServico.addEventListener('click', () => {
  modalServicoDetalhe.classList.add('hidden');
  modalServicos.classList.remove('hidden');
});

confirmarServico.addEventListener('click', () => {
  if (servicoSelecionado) {
    const nome = servicoSelecionado.dataset.nome;
    const img = servicoSelecionado.dataset.img;

    btnServico.innerHTML = `
      <div class="servico-info">
        <img src="../../imagens/${img}" alt="${nome}" class="servico-foto">
        <span class="servico-nome">${nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
    btnServico.dataset.selected = "true";
    btnServico.dataset.nome = nome;
    btnServico.dataset.img = `../../imagens/${img}`;
    btnServico.dataset.duracao = servicoSelecionado.dataset.duracao;
  }
  modalServicoDetalhe.classList.add('hidden');
  verificarSePodeAgendar();
  salvarEstadoAtual();
});

// ============================
//      SEÇÃO: HORÁRIOS
// ============================
const btnHorario = document.getElementById("horario");
const modalCalendario = document.getElementById("modalCalendario");
const modalHorarios = document.getElementById("modalHorarios");
const listaHorarios = document.getElementById("listaHorarios");
const btnAgendar = document.querySelector(".btn-agendar");

let dataSelecionada = null;
let horaSelecionada = null;
let horariosIndisponiveis = JSON.parse(localStorage.getItem("horariosIndisponiveis")) || [];

const horariosDisponiveis = ["11h30","12h00","12h30","13h00","13h30","14h00","14h30","15h00","15h30","16h00","16h30"];

const inputData = document.getElementById("dataEscolhida");
const hoje = new Date().toISOString().split("T")[0];
inputData.min = hoje;

btnHorario.addEventListener("click", () => {
  modalCalendario.classList.remove("hidden");
});

function abrirHorarios() {
  const dataInput = inputData.value;
  if (!dataInput) return alert("Selecione uma data válida!");

  const dataSelecionadaObj = new Date(dataInput);
  if (dataSelecionadaObj < new Date(hoje)) return alert("⚠️ Não é possível agendar para datas passadas!");

  const [ano, mes, dia] = dataInput.split("-");
  dataSelecionada = `${dia}/${mes}`;
  modalCalendario.classList.add("hidden");
  carregarHorarios(dataInput);
  modalHorarios.classList.remove("hidden");
}

function carregarHorarios(dataInput) {
  listaHorarios.innerHTML = "";
  const agora = new Date();
  const hojeStr = agora.toISOString().split("T")[0];

  horariosDisponiveis.forEach(h => {
    const btn = document.createElement("button");
    btn.innerText = h;
    btn.classList.add("horario-btn");

    const [horaStr, minutoStr] = h.replace("h", ":").split(":");
    const horarioDate = new Date(`${dataInput}T${horaStr.padStart(2,"0")}:${minutoStr.padStart(2,"0")}:00`);

    if (dataInput === hojeStr && horarioDate < agora) {
      btn.disabled = true;
      btn.classList.add("indisponivel");
    }

    const barbeiroAtual = btnBarbeiro.dataset.nome;
    if (horariosIndisponiveis.includes(`${barbeiroAtual}-${dataSelecionada}-${h}`)) {
      btn.disabled = true;
      btn.classList.add("indisponivel");
    }

    if (!btn.disabled) btn.addEventListener("click", () => selecionarHorario(h));
    listaHorarios.appendChild(btn);
  });
}

function selecionarHorario(hora) {
  horaSelecionada = hora;
  modalHorarios.classList.add("hidden");
  btnHorario.querySelector("span").innerHTML = `<b>Dia ${dataSelecionada} às ${horaSelecionada}</b>`;
  btnHorario.dataset.selected = "true";
  verificarSePodeAgendar();
  salvarEstadoAtual();
}


// ============================
// SALVAR AGENDAMENTO (COM USUÁRIO)
// ============================
function salvarAgendamento() {
  const barbeiroNome = btnBarbeiro.dataset.nome;
  const servicoNome = btnServico.dataset.nome;
  const servicoImg = btnServico.dataset.img;
  const duracao = btnServico.dataset.duracao;

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  let horariosIndisponiveis = JSON.parse(localStorage.getItem("horariosIndisponiveis")) || [];

  // Verifica se está reagendando (editando)
  const agendamentoEdicao = JSON.parse(localStorage.getItem("agendamentoEdicao"));
  if (agendamentoEdicao) {
    // Remove o horário antigo da lista de indisponíveis para liberar a vaga
    const horarioAntigo = `${agendamentoEdicao.barbeiro}-${agendamentoEdicao.data}-${agendamentoEdicao.horario}`;
    const indexHorario = horariosIndisponiveis.indexOf(horarioAntigo);
    if (indexHorario > -1) {
      horariosIndisponiveis.splice(indexHorario, 1);
    }

    // Atualiza o agendamento na posição certa
    agendamentos[agendamentoEdicao.index] = {
      titulo: `${servicoNome} - ${barbeiroNome}`,
      imagem: servicoImg,
      duracao,
      data: dataSelecionada,
      horario: horaSelecionada,
      barbeiro: barbeiroNome,
      idBarbeiro: barbeiroNome,
      usuarioId: usuarioLogado?.id || usuarioLogado?.nome,
      usuarioNome: usuarioLogado?.nome || "Cliente",
      status: agendamentoEdicao.status || "pendente"
    };

    localStorage.removeItem("agendamentoEdicao");
  } else {
    // Novo agendamento
    agendamentos.push({
      titulo: `${servicoNome} - ${barbeiroNome}`,
      imagem: servicoImg,
      duracao,
      data: dataSelecionada,
      horario: horaSelecionada,
      barbeiro: barbeiroNome,
      idBarbeiro: barbeiroNome,
      usuarioId: usuarioLogado?.id || usuarioLogado?.nome,
      usuarioNome: usuarioLogado?.nome || "Cliente",
      status: "pendente"
    });
  }

  // Marca o novo horário como indisponível
  horariosIndisponiveis.push(`${barbeiroNome}-${dataSelecionada}-${horaSelecionada}`);

  // Salva tudo no localStorage
  localStorage.setItem("horariosIndisponiveis", JSON.stringify(horariosIndisponiveis));
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
  localStorage.removeItem("estadoAgendamento");
}



// ✅ Carregar estado ao abrir
document.addEventListener("DOMContentLoaded", carregarEstadoSalvo);

// ===== Utils =====
const $$ = (s) => Array.from(document.querySelectorAll(s));

function fecharModal(target) {
  let modal = null;

  if (typeof target === 'string') {
    modal = document.getElementById(target);
  } else if (target instanceof HTMLElement) {
    modal = target.closest('.modal-overlay');
  }

  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.removeAttribute('aria-hidden');
}

// ===== Liga tudo quando a página carregar =====
document.addEventListener('DOMContentLoaded', () => {
  // Botões "X"
  $$('.close-btn').forEach((btn) => {
    btn.addEventListener('click', () => fecharModal(btn));
  });

  // Botões "Cancelar" dentro dos modais
  $$('.btn-cancelar').forEach((btn) => {
    btn.addEventListener('click', () => fecharModal(btn));
  });

  // Fechar clicando fora (overlay)
  $$('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharModal(overlay);
    });
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal-overlay:not(.hidden)').forEach((m) => fecharModal(m));
    }
  });
});


// ============================
// BOTÃO CANCELAR AGENDAMENTO (RESET TOTAL)
// ============================
document.getElementById("btnCancelarAgendamento")?.addEventListener("click", () => {
  btnBarbeiro.dataset.selected = "false";
  btnServico.dataset.selected = "false";
  btnHorario.dataset.selected = "false";
  btnBarbeiro.innerHTML = `<span>Selecione um barbeiro</span><div class="arrow">›</div>`;
  btnServico.innerHTML = `<span>Selecione um serviço</span><div class="arrow">›</div>`;
  btnHorario.querySelector("span").innerHTML = `Escolher data e horário`;
  dataSelecionada = null;
  horaSelecionada = null;
  localStorage.removeItem("estadoAgendamento");
  alert("🚫 Agendamento cancelado.");
});

// ============================
// VERIFICAR SE PODE AGENDAR
// ============================
function verificarSePodeAgendar() {
  const podeAgendar =
    btnBarbeiro.dataset.selected === "true" &&
    btnServico.dataset.selected === "true" &&
    btnHorario.dataset.selected === "true";

  if (podeAgendar) {
    btnAgendar.classList.remove("disabled");
    btnAgendar.disabled = false;
  } else {
    btnAgendar.classList.add("disabled");
    btnAgendar.disabled = true;
  }
}

// ============================
// BOTÃO AGENDAR
// ============================
btnAgendar?.addEventListener("click", () => {
  if (
    btnBarbeiro.dataset.selected !== "true" ||
    btnServico.dataset.selected !== "true" ||
    btnHorario.dataset.selected !== "true"
  ) {
    return alert("⚠️ Selecione barbeiro, serviço e horário antes de agendar!");
  }

  salvarAgendamento();
  alert("✅ Agendamento salvo com sucesso!");
  window.location.href = "../cAgendamentos/index.html";
});
function verificarSePodeAgendar() {
  const podeAgendar =
    btnBarbeiro.dataset.selected === "true" &&
    btnServico.dataset.selected === "true" &&
    btnHorario.dataset.selected === "true";

  if (podeAgendar) {
    btnAgendar.classList.remove("disabled");
    btnAgendar.disabled = false;
  } else {
    btnAgendar.classList.add("disabled");
    btnAgendar.disabled = true;
  }
}

const agendamentoEdicao = JSON.parse(localStorage.getItem("agendamentoEdicao"));
if (agendamentoEdicao) {
    console.log("🔄 Modo Reagendamento detectado:", agendamentoEdicao);

    dataSelecionada = agendamentoEdicao.data;
    horaSelecionada = agendamentoEdicao.horario;

    // Barbeiro
    btnBarbeiro.dataset.selected = "true";
    btnBarbeiro.dataset.nome = agendamentoEdicao.barbeiro;
    btnBarbeiro.dataset.foto = barbeiros[agendamentoEdicao.barbeiro] || "";
    btnBarbeiro.innerHTML = `
      <div class="barbeiro-info">
        <img src="${btnBarbeiro.dataset.foto}" alt="${agendamentoEdicao.barbeiro}" class="barbeiro-foto">
        <span class="barbeiro-nome">${agendamentoEdicao.barbeiro}</span>
      </div>
      <div class="arrow">›</div>
    `;

    // Serviço
    const nomeServico = agendamentoEdicao.titulo.split(" - ")[0];
    btnServico.dataset.selected = "true";
    btnServico.dataset.nome = nomeServico;
    btnServico.dataset.img = agendamentoEdicao.imagem;
    btnServico.dataset.duracao = agendamentoEdicao.duracao;
    btnServico.innerHTML = `
      <div class="servico-info">
        <img src="${agendamentoEdicao.imagem}" alt="${nomeServico}" class="servico-foto">
        <span class="servico-nome">${nomeServico}</span>
      </div>
      <div class="arrow">›</div>
    `;

    // Horário
    btnHorario.dataset.selected = "true";
    btnHorario.querySelector("span").innerHTML = `<b>Dia ${agendamentoEdicao.data} às ${agendamentoEdicao.horario}</b>`;

    verificarSePodeAgendar();
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
