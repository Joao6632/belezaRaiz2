document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado) {
    window.location.href = '../../aLogin/index.html';
    return;
  }

  document.querySelector('h2').textContent = 'Serviços Realizados';

  carregarRealizados(usuarioLogado);
  marcarPaginaAtual();
  ativarFiltroBusca();
});

// Carrega agendamentos do localStorage
function loadAgendamentos() {
  return JSON.parse(localStorage.getItem('agendamentos')) || [];
}

// Função principal que carrega os agendamentos realizados e monta os cards
function carregarRealizados(usuario) {
  const lista = document.getElementById('lista-realizados');
  lista.innerHTML = '';

  const agendamentos = loadAgendamentos();
  const tipo = usuario.tipo ? usuario.tipo.toLowerCase() : 'cliente';

  // Filtra apenas realizados e que pertencem ao usuário (cliente ou barbeiro)
  const realizados = agendamentos.filter((ag) => {
    const isRealizado = (ag.status || '').toLowerCase() === 'realizado';

    const isDoBarbeiro =
      tipo === 'barbeiro' &&
      ((ag.barbeiro || '').toLowerCase() ===
        (usuario.nome || '').toLowerCase() ||
        (ag.idBarbeiro || '').toLowerCase() ===
          (usuario.nome || '').toLowerCase() ||
        ag.idBarbeiro === usuario.id);

    const isDoCliente =
      tipo === 'cliente' &&
      (ag.usuarioId === usuario.id ||
        (ag.usuarioNome || '').toLowerCase() ===
          (usuario.nome || '').toLowerCase());

    return isRealizado && (isDoBarbeiro || isDoCliente);
  });

  if (realizados.length === 0) {
    lista.innerHTML = `<p class="text-center">Nenhum serviço realizado ainda.</p>`;
    return;
  }

  // Recupera avaliações feitas para impedir avaliação múltipla
  const avaliacoesFeitas = JSON.parse(localStorage.getItem('avaliacoesFeitas')) || {};

  realizados.forEach((ag, i) => {
    const card = document.createElement('div');
    card.className = 'card-agendamento fade-in';
    card.style.animationDelay = `${i * 0.05}s`;

    let imgPath = ag.imagem || '';
    if (!imgPath.includes('imagens/')) {
      imgPath = `../../../imagens/${imgPath}`;
    }
    imgPath = imgPath.replace('../../', '../../../');

    card.innerHTML = `
      <img src="${imgPath}" alt="${ag.titulo}" onerror="this.src='../../../imagens/placeholder.png'">
      <div class="card-info">
        <div class="avaliar-topo">
          <h3>${ag.titulo}</h3>
          <button class="btn-avaliar">Avaliar</button>
        </div>
        <p><b>Data:</b> ${ag.data} - <b>Hora:</b> ${ag.horario}</p>
        <p><b>Status:</b> ✅ Realizado</p>
      </div>
    `;

    lista.appendChild(card);

    const btnAvaliar = card.querySelector('.btn-avaliar');
    const idAgendamento = ag.id || ag.idAgendamento || ag.data + ag.horario + ag.idBarbeiro; // Um ID único para o agendamento

    // Se já avaliou, bloqueia o botão
    if (avaliacoesFeitas[idAgendamento]) {
      btnAvaliar.disabled = true;
      btnAvaliar.textContent = "Avaliado";
      btnAvaliar.classList.add('avaliado');
    } else {
      btnAvaliar.disabled = false;
      btnAvaliar.textContent = "Avaliar";
      btnAvaliar.classList.remove('avaliado');
      btnAvaliar.addEventListener('click', () => {
        // Passa o ID e nome do barbeiro para o modal
        const idBarbeiro = ag.idBarbeiro || '';
        const nomeBarbeiro = ag.barbeiro || '';
        abrirModalAvaliacao(idBarbeiro, nomeBarbeiro, idAgendamento);
      });
    }
  });
}

// Outras funções normais...

function marcarPaginaAtual() {
  const navLinks = document.querySelectorAll('.bottom-nav-item');
  const currentPage = window.location.pathname.split('/').pop();
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (currentPage === linkPage) link.classList.add('active');
  });
}

function ativarFiltroBusca() {
  const input = document.getElementById('filtroAgendamento');
  const clear = document.getElementById('clearBusca');
  if (!input) return;

  const cards = () =>
    Array.from(document.querySelectorAll('.card-agendamento'));

  const normalize = (s) =>
    (s || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  let t;
  function applyFilter() {
    const termo = normalize(input.value);
    cards().forEach((card) => {
      const serv =
        card.dataset.servico ||
        card.querySelector('.card-info h3')?.textContent.split('-')[0] ||
        '';
      const func =
        card.dataset.funcionario ||
        card.querySelector('.card-info h3')?.textContent.split('-')[1] ||
        '';
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
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      applyFilter();
    }
  });
  clear?.addEventListener('click', () => {
    input.value = '';
    input.focus();
    applyFilter();
  });

  applyFilter();
}

// ============================
// 🔹 Avaliação / Estrelas
// ============================
let avaliacaoAtual = 0;
let barbeiroAtual = ''; // ID do barbeiro
let agendamentoAtual = ''; // ID do agendamento para controle

function abrirModalAvaliacao(idBarbeiro, nomeBarbeiro, idAgendamento) {
  barbeiroAtual = idBarbeiro;
  agendamentoAtual = idAgendamento;
  avaliacaoAtual = 0;
  document.getElementById('modalAvaliacao').classList.remove('hidden');

  // Se tiver um span para mostrar nome do barbeiro no modal, atualize
  const nomeSpan = document.getElementById('nomeBarbeiroModal');
  if (nomeSpan) nomeSpan.textContent = nomeBarbeiro;

  gerarEstrelas();
}

function fecharModal() {
  document.getElementById('modalAvaliacao').classList.add('hidden');
}

function gerarEstrelas() {
  const container = document.getElementById('estrelasContainer');
  container.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const estrela = document.createElement('span');
    estrela.innerText = '★';
    estrela.dataset.valor = i;
    estrela.classList.add('estrela');
    estrela.onclick = () => selecionarEstrelas(i);
    container.appendChild(estrela);
  }
}

function selecionarEstrelas(qtd) {
  avaliacaoAtual = qtd;
  const estrelas = document.querySelectorAll('#estrelasContainer span');
  estrelas.forEach((el) => {
    const val = Number(el.dataset.valor);
    el.classList.toggle('selecionada', val <= qtd);
  });
}

function confirmarAvaliacao() {
  const idBarbeiro = barbeiroAtual;
  const nota = avaliacaoAtual;
  const chave = 'avaliacoesBarbeiros';

  if (!idBarbeiro || !nota || nota < 1 || nota > 5) {
    alert('Escolha uma nota entre 1 e 5 clicando nas estrelas!');
    return;
  }

  const avaliacoes = JSON.parse(localStorage.getItem(chave)) || {};
  if (!avaliacoes[idBarbeiro]) {
    avaliacoes[idBarbeiro] = [];
  }
  avaliacoes[idBarbeiro].push(nota);
  localStorage.setItem(chave, JSON.stringify(avaliacoes));

  // Marca o agendamento como avaliado para desabilitar botão
  const avaliacoesFeitas = JSON.parse(localStorage.getItem('avaliacoesFeitas')) || {};
  avaliacoesFeitas[agendamentoAtual] = true;
  localStorage.setItem('avaliacoesFeitas', JSON.stringify(avaliacoesFeitas));

  fecharModal();
  atualizarNotasBarbeiros();
  carregarRealizados(JSON.parse(localStorage.getItem('usuarioLogado'))); // Atualiza botões dos cards
}

function atualizarNotasBarbeiros() {
  const chave = 'avaliacoesBarbeiros';
  const avaliacoes = JSON.parse(localStorage.getItem(chave)) || {};
  const barbeiros = document.querySelectorAll('.barbeiro-card');

  barbeiros.forEach(barbeiro => {
    const id = barbeiro.dataset.id;
    const avaliacoesDoBarbeiro = avaliacoes[id] || [];
    const media = calcularMedia(avaliacoesDoBarbeiro);

    let spanEstrela = barbeiro.querySelector('.estrela');

    if (!spanEstrela) {
      spanEstrela = document.createElement('span');
      spanEstrela.classList.add('estrela');
      barbeiro.querySelector('.info').appendChild(spanEstrela);
    }

    spanEstrela.textContent = avaliacoesDoBarbeiro.length > 0
      ? `⭐ ${media.toFixed(1)}`
      : '⭐ Sem avaliações';
  });
}

function calcularMedia(avaliacoes) {
  if (!avaliacoes || avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((acc, val) => acc + val, 0);
  return soma / avaliacoes.length;
}
