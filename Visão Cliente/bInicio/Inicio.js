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
//      SEÇÃO: HORÁRIOS DINÂMICOS COM PAGINAÇÃO
// ============================

const btnHorario = document.getElementById("horario");
const modalCalendario = document.getElementById("modalCalendario");
const modalHorarios = document.getElementById("modalHorarios");
const listaHorarios = document.getElementById("listaHorarios");
const btnAgendar = document.querySelector(".btn-agendar");

let dataSelecionada = null;
let horaSelecionada = null;
let horariosIndisponiveis = JSON.parse(localStorage.getItem("horariosIndisponiveis")) || [];

// Controle de paginação
let paginaAtual = 0;
const horariosPorPagina = 8; // 4 linhas x 2 colunas
let todosHorarios = [];

// Função para calcular pausa automaticamente baseada na carga horária
function calcularPausaAutomatica(horarioInicio, horarioFim) {
  const [horaInicio, minInicio] = horarioInicio.split(':').map(Number);
  const [horaFim, minFim] = horarioFim.split(':').map(Number);
  
  const inicioMinutos = horaInicio * 60 + minInicio;
  const fimMinutos = horaFim * 60 + minFim;
  const cargaHoraria = (fimMinutos - inicioMinutos) / 60; // em horas
  
  // Regras para pausas baseadas na carga horária
  if (cargaHoraria <= 4) {
    // Até 4h: sem pausa obrigatória
    return { pausaInicio: null, pausaFim: null };
  } else if (cargaHoraria <= 6) {
    // 4h-6h: pausa de 15min no meio do turno
    const meioTurno = inicioMinutos + (fimMinutos - inicioMinutos) / 2;
    const pausaInicio = Math.floor(meioTurno / 60);
    const pausaInicioMin = meioTurno % 60;
    
    return {
      pausaInicio: `${pausaInicio.toString().padStart(2, '0')}:${Math.floor(pausaInicioMin).toString().padStart(2, '0')}`,
      pausaFim: `${pausaInicio.toString().padStart(2, '0')}:${(Math.floor(pausaInicioMin) + 15).toString().padStart(2, '0')}`
    };
  } else if (cargaHoraria <= 8) {
    // 6h-8h: pausa de 1h no meio do turno
    const meioTurno = inicioMinutos + (fimMinutos - inicioMinutos) / 2;
    const pausaInicio = Math.floor(meioTurno / 60);
    const pausaInicioMin = meioTurno % 60;
    
    return {
      pausaInicio: `${pausaInicio.toString().padStart(2, '0')}:${Math.floor(pausaInicioMin).toString().padStart(2, '0')}`,
      pausaFim: `${(pausaInicio + 1).toString().padStart(2, '0')}:${Math.floor(pausaInicioMin).toString().padStart(2, '0')}`
    };
  } else {
    // Mais de 8h: pausa de 1h30min no meio do turno
    const meioTurno = inicioMinutos + (fimMinutos - inicioMinutos) / 2;
    const pausaInicio = Math.floor(meioTurno / 60);
    const pausaInicioMin = meioTurno % 60;
    
    return {
      pausaInicio: `${pausaInicio.toString().padStart(2, '0')}:${Math.floor(pausaInicioMin).toString().padStart(2, '0')}`,
      pausaFim: `${Math.floor((meioTurno + 90) / 60).toString().padStart(2, '0')}:${Math.floor((meioTurno + 90) % 60).toString().padStart(2, '0')}`
    };
  }
}

// Função para buscar configuração do funcionário selecionado
function obterConfiguracaoFuncionario() {
  const funcionarioId = btnBarbeiro.dataset.id;
  
  if (!funcionarioId) {
    // Configuração padrão se não tiver funcionário selecionado
    return {
      inicio: "08:00",
      fim: "18:00",
      pausaInicio: "12:00",
      pausaFim: "13:00"
    };
  }

  // Buscar funcionários do localStorage
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  const funcionario = funcionarios.find(f => f.id === funcionarioId);
  
  if (funcionario && funcionario.horarioInicio && funcionario.horarioFim) {
    // Calcular pausa automaticamente baseada na carga horária
    const pausaCalculada = calcularPausaAutomatica(funcionario.horarioInicio, funcionario.horarioFim);
    
    return {
      inicio: funcionario.horarioInicio,
      fim: funcionario.horarioFim,
      pausaInicio: pausaCalculada.pausaInicio || funcionario.horarioInicio, // Se não tem pausa, usa horário início
      pausaFim: pausaCalculada.pausaFim || funcionario.horarioInicio
    };
  }
  
  // Fallback para configuração padrão
  return {
    inicio: "08:00",
    fim: "18:00",
    pausaInicio: "12:00",
    pausaFim: "13:00"
  };
}

const inputData = document.getElementById("dataEscolhida");
const hoje = new Date().toISOString().split("T")[0];
inputData.min = hoje;

// Event listener para abrir modal de data
btnHorario.addEventListener("click", () => {
  // Verificar se serviço foi selecionado
  if (!btnServico.dataset.selected || btnServico.dataset.selected !== "true") {
    alert("⚠️ Selecione um serviço primeiro!");
    return;
  }
  
  // Verificar se funcionário foi selecionado
  if (!btnBarbeiro.dataset.selected || btnBarbeiro.dataset.selected !== "true") {
    alert("⚠️ Selecione um funcionário primeiro!");
    return;
  }
  
  modalCalendario.classList.remove("hidden");
});

// Função para gerar horários baseados na duração do serviço
function gerarHorariosDisponiveis(duracaoServicoMinutos) {
  const horarios = [];
  
  // Obter configuração específica do funcionário selecionado
  const configuracaoFuncionario = obterConfiguracaoFuncionario();
  
  const [horaInicio, minInicio] = configuracaoFuncionario.inicio.split(":").map(Number);
  const [horaFim, minFim] = configuracaoFuncionario.fim.split(":").map(Number);
  
  let horaAtual = horaInicio * 60 + minInicio; // Converter para minutos totais
  const fimMinutos = horaFim * 60 + minFim;
  
  // Verificar se tem pausa
  let pausaInicioMinutos = null;
  let pausaFimMinutos = null;
  
  if (configuracaoFuncionario.pausaInicio && configuracaoFuncionario.pausaFim) {
    const [horaPausaInicio, minPausaInicio] = configuracaoFuncionario.pausaInicio.split(":").map(Number);
    const [horaPausaFim, minPausaFim] = configuracaoFuncionario.pausaFim.split(":").map(Number);
    pausaInicioMinutos = horaPausaInicio * 60 + minPausaInicio;
    pausaFimMinutos = horaPausaFim * 60 + minPausaFim;
  }
  
  while (horaAtual + duracaoServicoMinutos <= fimMinutos) {
    let podeAdicionar = true;
    
    // Se tem pausa, verificar conflitos
    if (pausaInicioMinutos !== null && pausaFimMinutos !== null) {
      const fimServico = horaAtual + duracaoServicoMinutos;
      
      // Só adiciona o horário se não conflita com a pausa
      if (!(fimServico <= pausaInicioMinutos || horaAtual >= pausaFimMinutos)) {
        podeAdicionar = false;
      }
    }
    
    if (podeAdicionar) {
      const horas = Math.floor(horaAtual / 60);
      const minutos = horaAtual % 60;
      const horarioFormatado = `${horas.toString().padStart(2, '0')}h${minutos.toString().padStart(2, '0')}`;
      horarios.push(horarioFormatado);
    }
    
    // Se chegou na pausa e ainda não passou dela, pula para depois da pausa
    if (pausaInicioMinutos !== null && horaAtual < pausaInicioMinutos && horaAtual + duracaoServicoMinutos > pausaInicioMinutos) {
      horaAtual = pausaFimMinutos;
    } else {
      horaAtual += duracaoServicoMinutos;
    }
  }
  
  return horarios;
}

// Função para abrir modal de horários após selecionar data
function abrirHorarios() {
  const dataInput = inputData.value;
  if (!dataInput) {
    alert("⚠️ Selecione uma data válida!");
    return;
  }

  const dataSelecionadaObj = new Date(dataInput + "T00:00:00");
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  if (dataSelecionadaObj < hoje) {
    alert("⚠️ Não é possível agendar para datas passadas!");
    return;
  }

  const [ano, mes, dia] = dataInput.split("-");
  dataSelecionada = `${dia}/${mes}`;
  modalCalendario.classList.add("hidden");
  carregarHorarios(dataInput);
  modalHorarios.classList.remove("hidden");
}

// Função principal para carregar horários disponíveis
function carregarHorarios(dataInput) {
  // Verificar se serviço foi selecionado
  const servicoSelecionado = btnServico.dataset.duracao;
  if (!servicoSelecionado) {
    alert("⚠️ Erro: Duração do serviço não encontrada!");
    modalHorarios.classList.add("hidden");
    return;
  }
  
  // Extrair duração em minutos
  const duracaoMinutos = parseInt(servicoSelecionado.replace('min', ''));
  
  // Gerar todos os horários baseados na duração do serviço
  todosHorarios = gerarHorariosDisponiveis(duracaoMinutos);
  
  // Filtrar horários indisponíveis
  const agora = new Date();
  const hojeStr = agora.toISOString().split("T")[0];
  const barbeiroAtual = btnBarbeiro.dataset.nome || "SemBarbeiro";

  todosHorarios = todosHorarios.filter(horario => {
    // Converter formato "08h30" para verificação de tempo
    const [horaStr, minutoStr] = horario.replace("h", ":").split(":");
    const horarioDate = new Date(`${dataInput}T${horaStr.padStart(2,"0")}:${minutoStr.padStart(2,"0")}:00`);

    // Filtrar horários que já passaram (se for hoje)
    if (dataInput === hojeStr && horarioDate <= agora) {
      return false;
    }

    // Filtrar horários já ocupados
    const chaveHorario = `${barbeiroAtual}-${dataSelecionada}-${horario}`;
    if (horariosIndisponiveis.includes(chaveHorario)) {
      return false;
    }

    return true;
  });
  
  if (todosHorarios.length === 0) {
    listaHorarios.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum horário disponível para este dia.</p>';
    return;
  }
  
  // Reset da paginação
  paginaAtual = 0;
  renderizarPaginaHorarios();
}

// Função para renderizar uma página específica de horários
function renderizarPaginaHorarios() {
  listaHorarios.innerHTML = "";
  
  // Verificar se ainda há horários disponíveis após filtros
  if (todosHorarios.length === 0) {
    const mensagemDiv = document.createElement("div");
    mensagemDiv.style.cssText = `
      text-align: center;
      padding: 40px 20px;
      color: #666;
    `;
    
    const agora = new Date();
    const hojeStr = agora.toISOString().split("T")[0];
    const dataInput = inputData.value;
    
    if (dataInput === hojeStr) {
      mensagemDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">⏰</div>
        <h4 style="margin: 0 0 10px 0; color: #333;">Horários esgotados para hoje</h4>
        <p style="margin: 0;">Todos os horários disponíveis já passaram ou estão ocupados.</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Tente agendar para outro dia.</p>
      `;
    } else {
      mensagemDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
        <h4 style="margin: 0 0 10px 0; color: #333;">Nenhum horário disponível</h4>
        <p style="margin: 0;">Todos os horários deste dia já estão ocupados.</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Escolha outra data disponível.</p>
      `;
    }
    
    listaHorarios.appendChild(mensagemDiv);
    return;
  }
  
  const inicio = paginaAtual * horariosPorPagina;
  const fim = inicio + horariosPorPagina;
  const horariosPagina = todosHorarios.slice(inicio, fim);
  
  // Container dos horários
  const containerHorarios = document.createElement("div");
  containerHorarios.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
    min-height: 200px;
  `;
  
  // Adicionar botões de horário
  horariosPagina.forEach(horario => {
    const btn = document.createElement("button");
    btn.innerText = horario;
    btn.classList.add("horario-btn");
    btn.addEventListener("click", () => selecionarHorario(horario));
    containerHorarios.appendChild(btn);
  });
  
  listaHorarios.appendChild(containerHorarios);
  
  // Adicionar controles de navegação EMBAIXO
  adicionarControlesPaginacao();
}

// Função para adicionar controles de paginação
function adicionarControlesPaginacao() {
  const totalPaginas = Math.ceil(todosHorarios.length / horariosPorPagina);
  
  if (totalPaginas <= 1) return; // Não mostrar controles se só tem 1 página
  
  const controlesDiv = document.createElement("div");
  controlesDiv.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 15px 0 5px 0;
    border-top: 1px solid #e0e0e0;
    margin-top: 15px;
  `;
  
  // Botão Anterior
  const btnAnterior = document.createElement("button");
  btnAnterior.innerHTML = "←";
  btnAnterior.style.cssText = `
    background: ${paginaAtual === 0 ? '#f5f5f5' : '#007bff'};
    color: ${paginaAtual === 0 ? '#ccc' : 'white'};
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: ${paginaAtual === 0 ? 'not-allowed' : 'pointer'};
    font-size: 18px;
    font-weight: bold;
    transition: all 0.2s ease;
  `;
  btnAnterior.disabled = paginaAtual === 0;
  btnAnterior.addEventListener("click", () => {
    if (paginaAtual > 0) {
      paginaAtual--;
      renderizarPaginaHorarios();
    }
  });
  
  // Indicadores de página (pontinhos)
  const indicadoresContainer = document.createElement("div");
  indicadoresContainer.style.cssText = `
    display: flex;
    gap: 8px;
    align-items: center;
  `;
  
  for (let i = 0; i < totalPaginas; i++) {
    const ponto = document.createElement("div");
    ponto.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${i === paginaAtual ? '#007bff' : '#ddd'};
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    ponto.addEventListener("click", () => {
      paginaAtual = i;
      renderizarPaginaHorarios();
    });
    indicadoresContainer.appendChild(ponto);
  }
  
  // Botão Próximo
  const btnProximo = document.createElement("button");
  btnProximo.innerHTML = "→";
  btnProximo.style.cssText = `
    background: ${paginaAtual === totalPaginas - 1 ? '#f5f5f5' : '#007bff'};
    color: ${paginaAtual === totalPaginas - 1 ? '#ccc' : 'white'};
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: ${paginaAtual === totalPaginas - 1 ? 'not-allowed' : 'pointer'};
    font-size: 18px;
    font-weight: bold;
    transition: all 0.2s ease;
  `;
  btnProximo.disabled = paginaAtual === totalPaginas - 1;
  btnProximo.addEventListener("click", () => {
    if (paginaAtual < totalPaginas - 1) {
      paginaAtual++;
      renderizarPaginaHorarios();
    }
  });
  
  controlesDiv.appendChild(btnAnterior);
  controlesDiv.appendChild(indicadoresContainer);
  controlesDiv.appendChild(btnProximo);
  
  listaHorarios.appendChild(controlesDiv);
}

// Função para selecionar horário
function selecionarHorario(hora) {
  horaSelecionada = hora;
  modalHorarios.classList.add("hidden");
  
  // Atualizar botão de horário
  btnHorario.querySelector("span").innerHTML = `<b>Dia ${dataSelecionada} às ${horaSelecionada}</b>`;
  btnHorario.dataset.selected = "true";
  
  // Verificar se pode agendar e salvar estado
  verificarSePodeAgendar();
  salvarEstadoAtual();
}

// Função para reservar horário com bloqueio inteligente
function reservarHorario(barbeiro, data, horario, duracaoMinutos) {
  const [hora, min] = horario.replace('h', ':').split(':').map(Number);
  const inicioMinutos = hora * 60 + min;
  const fimMinutos = inicioMinutos + duracaoMinutos;
  
  // Bloquear o horário principal
  const chaveHorario = `${barbeiro}-${data}-${horario}`;
  if (!horariosIndisponiveis.includes(chaveHorario)) {
    horariosIndisponiveis.push(chaveHorario);
  }
  
  // Bloquear horários que seriam conflitantes
  // Por exemplo: se agendou 12h00 com serviço de 40min (até 12h40)
  // Deve bloquear também 12h20 (que terminaria 13h00)
  for (let i = duracaoMinutos; i < 120; i += 20) { // Verifica até 2h de sobreposição
    const horarioConflitante = inicioMinutos - i;
    if (horarioConflitante >= 0) {
      const horaConf = Math.floor(horarioConflitante / 60);
      const minConf = horarioConflitante % 60;
      const horarioConfFormatado = `${horaConf.toString().padStart(2, '0')}h${minConf.toString().padStart(2, '0')}`;
      
      const chaveConflito = `${barbeiro}-${data}-${horarioConfFormatado}`;
      if (!horariosIndisponiveis.includes(chaveConflito)) {
        horariosIndisponiveis.push(chaveConflito);
      }
    }
  }
  
  localStorage.setItem("horariosIndisponiveis", JSON.stringify(horariosIndisponiveis));
}

// Função para liberar horário (caso necessário para cancelamentos)
function liberarHorario(barbeiro, data, horario) {
  const chaveHorario = `${barbeiro}-${data}-${horario}`;
  const index = horariosIndisponiveis.indexOf(chaveHorario);
  if (index > -1) {
    horariosIndisponiveis.splice(index, 1);
    localStorage.setItem("horariosIndisponiveis", JSON.stringify(horariosIndisponiveis));
  }
}

// Função para debug - mostrar horários gerados
function debugHorarios(duracaoMinutos) {
  const horarios = gerarHorariosDisponiveis(duracaoMinutos);
  const funcionarioNome = btnBarbeiro.dataset.nome || "Funcionário não selecionado";
  const config = obterConfiguracaoFuncionario();
  
  console.log(`=== DEBUG HORÁRIOS ===`);
  console.log(`Funcionário: ${funcionarioNome}`);
  console.log(`Trabalha: ${config.inicio} às ${config.fim}`);
  console.log(`Pausa: ${config.pausaInicio} às ${config.pausaFim}`);
  console.log(`Serviço: ${duracaoMinutos} minutos`);
  console.log(`Horários disponíveis:`, horarios);
  console.log(`Total: ${horarios.length} slots`);
  
  return horarios;
}
console.log("Sistema de horários carregado!");
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