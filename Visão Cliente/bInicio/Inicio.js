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

// função de redenrizar

function renderizarBotaoServico(nome, img, preco, emoji) {
  const temEmoji = emoji && emoji.trim() !== '';
  
  if (temEmoji) {
    // Estrutura com emoji - igual ao print
    return `
      <div class="icon service-icon" style="background: white; border: 2.5px solid #000; font-size: 18px; display: flex; align-items: center; justify-content: center;">
        ${emoji}
      </div>
      <span style="flex-grow: 1; font-size: 16px; color: #333;">${nome}</span>
      <span style="font-weight: bold; color: #007bff; margin-left: auto;">R$ ${preco}</span>
      <div class="arrow">›</div>
    `;
  } else {
    // Estrutura sem emoji - com imagem
    return `
      <div class="servico-info">
        <img src="${img}" alt="${nome}" class="servico-foto" 
             onerror="this.src='../../imagens/servico-default.jpg'" 
             style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;">
        <div class="servico-detalhes">
          <span class="servico-nome" style="font-size: 16px; font-weight: 500;">${nome}</span>
          <span class="servico-preco" style="font-size: 14px; color: #007bff; font-weight: bold;">R$ ${preco}</span>
        </div>
      </div>
      <div class="arrow">›</div>
    `;
  }
}
// ============================
// CARREGAMENTO DINÂMICO DE BARBEIROS
// ============================

// Função para carregar barbeiros do localStorage
function carregarBarbeirosDinamicamente() {
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  const barbeirosAtivos = funcionarios.filter(func => func.situacao === 'Ativo');
  
  return barbeirosAtivos;
}

// Função para criar o HTML de um barbeiro
function criarHTMLBarbeiro(barbeiro) {
  // Se não tem foto, usa uma imagem padrão
  const fotoSrc = barbeiro.foto || '../../imagens/barbeiro-default.jpg';
  
  return `
    <li class="barbeiro-card" 
        data-id="${barbeiro.id}" 
        data-nome="${barbeiro.nome}" 
        data-foto="${fotoSrc}" 
        data-nota="0">
      <img src="${fotoSrc}" alt="${barbeiro.nome}" style="border-radius: 36px;">
      <div class="info">
        <span>${barbeiro.nome}</span>
        <span class="estrela">⭐ Sem avaliações</span>
      </div>
    </li>
  `;
}

// Função para renderizar a lista de barbeiros no modal
function renderizarBarbeiros() {
  const barbeiros = carregarBarbeirosDinamicamente();
  const listaBarbeiros = document.querySelector('.barbeiro-list');
  
  if (!listaBarbeiros) return;
  
  // Limpa a lista atual
  listaBarbeiros.innerHTML = '';
  
  // Se não há barbeiros cadastrados
  if (barbeiros.length === 0) {
    listaBarbeiros.innerHTML = `
      <li style="text-align: center; padding: 20px; color: #666;">
        <p>Nenhum barbeiro cadastrado no momento.</p>
        <p><small>Entre em contato com o estabelecimento.</small></p>
      </li>
    `;
    return;
  }
  
  // Adiciona cada barbeiro à lista
  barbeiros.forEach(barbeiro => {
    listaBarbeiros.innerHTML += criarHTMLBarbeiro(barbeiro);
  });
  
  // Reaplica os event listeners para os novos elementos
  aplicarEventListenersBarbeiros();
  
  // Atualiza as notas dos barbeiros
  atualizarNotasBarbeiros();
}

// Função para aplicar event listeners aos barbeiros
function aplicarEventListenersBarbeiros() {
  const barbeiroItems = document.querySelectorAll('.barbeiro-list li.barbeiro-card');
  const modal = document.getElementById('modalBarbeiros');
  
  barbeiroItems.forEach(item => {
    // Remove listeners anteriores para evitar duplicação
    const novoItem = item.cloneNode(true);
    item.parentNode.replaceChild(novoItem, item);
    
    // Adiciona novo listener
    novoItem.addEventListener('click', () => {
      const nome = novoItem.dataset.nome;
      const foto = novoItem.dataset.foto;

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
}

// Função para obter o mapeamento atualizado de barbeiros
function obterMapeamentoBarbeiros() {
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  const mapeamento = {};
  
  funcionarios.forEach(func => {
    if (func.situacao === 'Ativo' && func.foto) {
      mapeamento[func.nome] = func.foto;
    }
  });
  
  // Adiciona barbeiros fixos como fallback (se ainda existirem)
  const barbeirosFixos = {
    "Silvio Santos": "../../imagens/silvio.jpg",
    "Alex Silveira": "../../imagens/alex.jpg",
    "Daniel Zolin": "../../imagens/daniel.jpg"
  };
  
  return { ...barbeirosFixos, ...mapeamento };
}

// ============================
// CARREGAMENTO DINÂMICO DE SERVIÇOS
// ============================

// Função para carregar serviços do localStorage
function carregarServicosDinamicamente() {
  const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
  // Só retorna serviços do tipo 'servico' e que estejam ativos
  return servicos.filter(servico => servico.tipo === 'servico');
}

// Função para criar o HTML de um serviço
function criarHTMLServico(servico) {
  const emoji = servico.emoji ? servico.emoji + ' ' : '';
  const preco = parseFloat(servico.preco || 0).toFixed(2).replace('.', ',');
  const fotoSrc = servico.foto || '../../imagens/servico-default.jpg';
  
  return `
    <li class="servico-card" 
        data-id="${servico.id}"
        data-nome="${servico.nome}" 
        data-img="${fotoSrc}"
        data-descricao="${servico.descricao || 'Descrição não disponível'}"
        data-preco="${preco}"
        data-duracao="${servico.duracao}"
        data-emoji="${servico.emoji || ''}">
      
      <img src="${fotoSrc}" alt="${servico.nome}" class="servico-foto-pequena" 
           onerror="this.src='../../imagens/servico-default.jpg'">
      
      <div class="servico-info-simples">
        <span class="servico-nome-simples">${emoji}${servico.nome}</span>
        <span class="servico-preco-simples">R$ ${preco}</span>
      </div>
      <div class="arrow">›</div>
    </li>
  `;
}


// Função para renderizar a lista de serviços no modal
function renderizarServicos() {
  const servicos = carregarServicosDinamicamente();
  const listaServicos = document.getElementById('servicoList');
  
  if (!listaServicos) {
    console.warn('Element #servicoList não encontrado');
    return;
  }
  
  // Limpa a lista atual
  listaServicos.innerHTML = '';
  
  // Se não há serviços cadastrados
  if (servicos.length === 0) {
    listaServicos.innerHTML = `
      <li style="text-align: center; padding: 20px; color: #666;">
        <div class="no-services">
          <i class="bi bi-scissors" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p><strong>Nenhum serviço disponível</strong></p>
          <p><small>Os serviços aparecerão aqui quando forem cadastrados pelo estabelecimento.</small></p>
        </div>
      </li>
    `;
    return;
  }
  
  // Adiciona cada serviço à lista
  servicos.forEach(servico => {
    listaServicos.innerHTML += criarHTMLServico(servico);
  });
  
  // Reaplica os event listeners para os novos elementos
  aplicarEventListenersServicos();
}

// Função para aplicar event listeners aos serviços
function aplicarEventListenersServicos() {
  const servicoItems = document.querySelectorAll('.servico-list .servico-card');
  const modalServicos = document.getElementById('modalServicos');
  const modalServicoDetalhe = document.getElementById('modalServicoDetalhe');
  
  servicoItems.forEach(item => {
    // Remove listeners anteriores para evitar duplicação
    const novoItem = item.cloneNode(true);
    item.parentNode.replaceChild(novoItem, item);
    
    // Adiciona novo listener
    novoItem.addEventListener('click', () => {
      // Preenche o modal de detalhes com os dados do serviço
      const nome = novoItem.dataset.nome;
      const img = novoItem.dataset.img;
      const descricao = novoItem.dataset.descricao;
      const preco = novoItem.dataset.preco;
      const duracao = novoItem.dataset.duracao;
      
      // Atualiza elementos do modal de detalhe
      document.getElementById('detalheTitulo').textContent = nome;
      document.getElementById('detalheImg').src = img;
      document.getElementById('detalheImg').alt = nome;
      document.getElementById('detalheDescricao').textContent = descricao;
      document.getElementById('detalhePreco').textContent = preco;
      document.getElementById('detalheDuracao').textContent = duracao;
      
      // Salva referência do serviço selecionado
      servicoSelecionado = novoItem;
      
      // Fecha modal de lista e abre modal de detalhes
      modalServicos.classList.add('hidden');
      modalServicoDetalhe.classList.remove('hidden');
    });
  });
}

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
      preco: btnServico.dataset.preco || null,
      emoji: btnServico.dataset.emoji || null, // ADICIONAR ESTA LINHA
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
    btnServico.dataset.preco = estadoSalvo.servico.preco;
    btnServico.dataset.emoji = estadoSalvo.servico.emoji;
    
    // USA A NOVA FUNÇÃO DE RENDERIZAÇÃO
    btnServico.innerHTML = renderizarBotaoServico(
      estadoSalvo.servico.nome,
      estadoSalvo.servico.img,
      estadoSalvo.servico.preco,
      estadoSalvo.servico.emoji
    );
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
//      SEÇÃO: BARBEIRO (ATUALIZADA)
// ============================
const btnBarbeiro = document.getElementById('barbeiro');
const modal = document.getElementById('modalBarbeiros');

// NOVO EVENT LISTENER - Agora carrega barbeiros dinamicamente
btnBarbeiro.addEventListener('click', () => {
  // Recarrega os barbeiros sempre que o modal é aberto
  renderizarBarbeiros();
  modal.classList.remove('hidden');
});

// ✅ Botão fechar modal (somente fecha, não reseta nada)
document.querySelectorAll('.fechar').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.add('hidden');
  });
});

// ============================
// ATUALIZAÇÃO DA SEÇÃO DE SERVIÇOS
// ============================
const btnServico = document.getElementById('servico');
const modalServicos = document.getElementById('modalServicos');
const modalServicoDetalhe = document.getElementById('modalServicoDetalhe');

const detalheTitulo = document.getElementById('detalheTitulo');
const detalheImg = document.getElementById('detalheImg');
const detalheDescricao = document.getElementById('detalheDescricao');
const detalhePreco = document.getElementById('detalhePreco');
const detalheDuracao = document.getElementById('detalheDuracao');

const cancelarServico = document.getElementById('cancelarServico');
const confirmarServico = document.getElementById('confirmarServico');

let servicoSelecionado = null;

// Event listener para abrir o modal de serviços
btnServico.addEventListener('click', () => {
  // Recarrega os serviços sempre que o modal é aberto
  renderizarServicos();
  modalServicos.classList.remove('hidden');
});

// Event listener para cancelar seleção
cancelarServico.addEventListener('click', () => {
  modalServicoDetalhe.classList.add('hidden');
  modalServicos.classList.remove('hidden');
});


// Event listener para confirmar seleção
confirmarServico.addEventListener('click', () => {
  if (servicoSelecionado) {
    const nome = servicoSelecionado.dataset.nome;
    const img = servicoSelecionado.dataset.img;
    const preco = servicoSelecionado.dataset.preco;
    const duracao = servicoSelecionado.dataset.duracao;
    const emoji = servicoSelecionado.dataset.emoji;

    // ✅ ATUALIZA IGUAL AO BARBEIRO - SÓ FOTO + NOME
    btnServico.innerHTML = `
      <div class="servico-info">
        <img src="${img}" alt="${nome}" class="servico-foto" onerror="this.src='../../imagens/servico-default.jpg'">
        <span class="servico-nome">${emoji ? emoji + ' ' : ''}${nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
    
    // Marca como selecionado e salva os dados
    btnServico.dataset.selected = "true";
    btnServico.dataset.nome = nome;
    btnServico.dataset.img = img;
    btnServico.dataset.duracao = duracao;
    btnServico.dataset.preco = preco;
    btnServico.dataset.emoji = emoji;
    
    // Fecha o modal
    modalServicoDetalhe.classList.add('hidden');
    
    // Verifica se pode agendar e salva o estado
    verificarSePodeAgendar();
    salvarEstadoAtual();
  }
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

// ===== Utils =====
const $ = (s) => Array.from(document.querySelectorAll(s));

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

// ============================
// TRATAMENTO DE REAGENDAMENTO (ATUALIZADO)
// ============================
const agendamentoEdicao = JSON.parse(localStorage.getItem("agendamentoEdicao"));
if (agendamentoEdicao) {
    console.log("🔄 Modo Reagendamento detectado:", agendamentoEdicao);

    dataSelecionada = agendamentoEdicao.data;
    horaSelecionada = agendamentoEdicao.horario;

    // Barbeiro
    const barbeirosAtualizados = obterMapeamentoBarbeiros();
    btnBarbeiro.dataset.selected = "true";
    btnBarbeiro.dataset.nome = agendamentoEdicao.barbeiro;
    btnBarbeiro.dataset.foto = barbeirosAtualizados[agendamentoEdicao.barbeiro] || "../../imagens/barbeiro-default.jpg";
    btnBarbeiro.innerHTML = `
      <div class="barbeiro-info">
        <img src="${btnBarbeiro.dataset.foto}" alt="${agendamentoEdicao.barbeiro}" class="barbeiro-foto">
        <span class="barbeiro-nome">${agendamentoEdicao.barbeiro}</span>
      </div>
      <div class="arrow">›</div>
    `;

    // Serviço - USAR NOVA FUNÇÃO
    const nomeServico = agendamentoEdicao.titulo.split(" - ")[0];
    const servicosCarregados = carregarServicosDinamicamente();
    const servicoOriginal = servicosCarregados.find(s => s.nome === nomeServico);
    
    btnServico.dataset.selected = "true";
    btnServico.dataset.nome = nomeServico;
    btnServico.dataset.img = agendamentoEdicao.imagem;
    btnServico.dataset.duracao = agendamentoEdicao.duracao;
    btnServico.dataset.preco = servicoOriginal?.preco?.toFixed(2).replace('.', ',') || '0,00';
    btnServico.dataset.emoji = servicoOriginal?.emoji || '';
    
    // USA A NOVA FUNÇÃO DE RENDERIZAÇÃO
    btnServico.innerHTML = renderizarBotaoServico(
      nomeServico,
      agendamentoEdicao.imagem,
      btnServico.dataset.preco,
      servicoOriginal?.emoji || ''
    );

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

// ============================
// FUNÇÕES DE AVALIAÇÃO ATUALIZADAS
// ============================

function calcularMedia(avaliacoes) {
  if (!avaliacoes || avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((acc, val) => acc + val, 0);
  return soma / avaliacoes.length;
}

function atualizarNotasBarbeiros() {
  const chave = 'avaliacoesBarbeiros';
  const avaliacoes = JSON.parse(localStorage.getItem(chave)) || {};

  const barbeiros = document.querySelectorAll('.barbeiro-card');

  barbeiros.forEach(card => {
    const id = card.dataset.id;
    const nome = card.dataset.nome;
    
    // Busca avaliações por ID ou por nome (compatibilidade)
    const avaliacoesDoBarbeiro = avaliacoes[id] || avaliacoes[nome] || [];
    const media = calcularMedia(avaliacoesDoBarbeiro);

    // Tenta encontrar o span da estrela já existente
    let spanEstrela = card.querySelector('.estrela');

    // Se não existir, cria e adiciona
    if (!spanEstrela) {
      spanEstrela = document.createElement('span');
      spanEstrela.classList.add('estrela');
      card.querySelector('.info').appendChild(spanEstrela);
    }

    // Define o conteúdo com base na existência de avaliações
    spanEstrela.textContent = avaliacoesDoBarbeiro.length > 0
      ? `⭐ ${media.toFixed(1)}`
      : '⭐ Sem avaliações';
  });
}

// ============================
// FUNÇÕES AUXILIARES PARA COMPATIBILIDADE
// ============================

// Função para obter serviço por nome (compatibilidade com código existente)
function obterServicoPorNome(nome) {
  const servicos = carregarServicosDinamicamente();
  return servicos.find(s => s.nome.toLowerCase() === nome.toLowerCase());
}

// Função para obter serviço por ID
function obterServicoPorId(id) {
  const servicos = carregarServicosDinamicamente();
  return servicos.find(s => s.id === id);
}

// ===== INICIALIZAÇÃO COMPLETA =====
document.addEventListener('DOMContentLoaded', () => {
  // Carrega barbeiros e serviços dinamicamente na inicialização
  renderizarBarbeiros();
  renderizarServicos();
  
  // Carrega estado salvo
  carregarEstadoSalvo();
  
  // Atualiza notas dos barbeiros
  atualizarNotasBarbeiros();
  
  // Botões "X"
  $('.close-btn').forEach((btn) => {
    btn.addEventListener('click', () => fecharModal(btn));
  });

  // Botões "Cancelar" dentro dos modais
  $('.btn-cancelar').forEach((btn) => {
    btn.addEventListener('click', () => fecharModal(btn));
  });

  // Fechar clicando fora (overlay)
  $('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharModal(overlay);
    });
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('.modal-overlay:not(.hidden)').forEach((m) => fecharModal(m));
    }
  });
});