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

// Função para tratar caminhos de imagem de forma consistente
function obterCaminhoImagem(imagemOriginal) {
  // Se não tem imagem, retorna placeholder
  if (!imagemOriginal) {
    return '../../../imagens/placeholder.png';
  }

  let imgPath = imagemOriginal.toString().trim();

  // Se já tem o caminho completo correto, retorna
  if (imgPath.startsWith('')) {
    return imgPath;
  }

  // Se tem 'imagens/' mas com caminho relativo diferente, normaliza
  if (imgPath.includes('imagens/')) {
    // Remove prefixos relativos incorretos
    imgPath = imgPath.replace(/^(\.\.\/)+/, '');
    if (!imgPath.startsWith('imagens/')) {
      // Se após limpeza não começa com imagens/, adiciona o caminho
      return `../../../imagens/${imgPath}`;
    }
    return `../../../${imgPath}`;
  }

  // Se é só o nome do arquivo, adiciona caminho completo
  return `../../../imagens/${imgPath}`;
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

    // Usa a função corrigida para obter o caminho da imagem
    const imgPath = obterCaminhoImagem(ag.imagem);

    card.innerHTML = `
      <img src="${imgPath}" alt="${ag.titulo || 'Serviço'}" onerror="this.src='../../../imagens/placeholder.png'; console.error('Erro ao carregar imagem:', '${imgPath}');">
      <div class="card-info">
        <div class="avaliar-topo">
          <h3>${ag.titulo || 'Serviço'}</h3>
          <button class="btn-avaliar">Avaliar</button>
        </div>
        <p><b>Data:</b> ${ag.data || 'N/A'} - <b>Hora:</b> ${ag.horario || 'N/A'}</p>
        <p><b>Status:</b> ✅ Realizado</p>
      </div>
    `;

    lista.appendChild(card);

    const btnAvaliar = card.querySelector('.btn-avaliar');
    const idAgendamento = ag.id || ag.idAgendamento || `${ag.data}-${ag.horario}-${ag.idBarbeiro}`; // Um ID único para o agendamento

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
        const nomeBarbeiro = ag.barbeiro || 'Barbeiro';
        abrirModalAvaliacao(idBarbeiro, nomeBarbeiro, idAgendamento);
      });
    }
  });
}

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

  let debounceTimer;
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
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilter, 120);
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
let nomeBarbeiroAtual = ''; // Nome do barbeiro
let agendamentoAtual = ''; // ID do agendamento para controle

function abrirModalAvaliacao(idBarbeiro, nomeBarbeiro, idAgendamento) {
  barbeiroAtual = idBarbeiro;
  nomeBarbeiroAtual = nomeBarbeiro;
  agendamentoAtual = idAgendamento;
  avaliacaoAtual = 0;
  
  const modal = document.getElementById('modalAvaliacao');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Atualiza nome do barbeiro no modal
    const nomeSpan = document.getElementById('nomeBarbeiroModal');
    if (nomeSpan) nomeSpan.textContent = nomeBarbeiro;

    // LIMPA o campo de comentário para nova avaliação
    const comentarioInput = document.getElementById('comentarioAvaliacao');
    if (comentarioInput) {
      comentarioInput.value = '';
    }

    gerarEstrelas();
  } else {
    console.error('Modal de avaliação não encontrado!');
  }
}

function fecharModal() {
  const modal = document.getElementById('modalAvaliacao');
  if (modal) {
    modal.classList.add('hidden');
  }
  // Reset valores
  avaliacaoAtual = 0;
  barbeiroAtual = '';
  nomeBarbeiroAtual = '';
  agendamentoAtual = '';
}

function gerarEstrelas() {
  const container = document.getElementById('estrelasContainer');
  if (!container) {
    console.error('Container de estrelas não encontrado!');
    return;
  }
  
  container.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const estrela = document.createElement('span');
    estrela.innerText = '★';
    estrela.dataset.valor = i;
    estrela.classList.add('estrela');
    estrela.style.cursor = 'pointer';
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
  
  // MÚLTIPLAS TENTATIVAS para capturar o comentário
  let comentario = '';
  
  // Tenta várias formas de encontrar o campo de comentário
  const possiveisElementos = [
    document.getElementById('comentarioAvaliacao'),
    document.querySelector('#comentarioAvaliacao'),
    document.querySelector('textarea'),
    document.querySelector('input[name="comentario"]'),
    document.querySelector('[placeholder*="comentário"]'),
    document.querySelector('[placeholder*="Comentário"]'),
    document.querySelector('.modal textarea'),
    document.querySelector('#modalAvaliacao textarea'),
    document.querySelector('#modalAvaliacao input[type="text"]')
  ];
  
  // Encontra o primeiro elemento válido
  let comentarioElement = null;
  for (let elemento of possiveisElementos) {
    if (elemento && elemento.value !== undefined) {
      comentarioElement = elemento;
      break;
    }
  }
  
  if (comentarioElement) {
    comentario = comentarioElement.value || '';
    comentario = comentario.trim();
    console.log('✅ Comentário capturado:', `"${comentario}"`);
    console.log('✅ Elemento usado:', comentarioElement);
  } else {
    console.error('❌ NENHUM campo de comentário encontrado!');
    console.log('❌ Elementos HTML disponíveis:');
    document.querySelectorAll('input, textarea').forEach((el, i) => {
      console.log(`  ${i}: `, el, `value: "${el.value}"`);
    });
  }
  
  if (!idBarbeiro) {
    alert('Erro: ID do barbeiro não encontrado!');
    return;
  }

  if (!nota || nota < 1 || nota > 5) {
    alert('Escolha uma nota entre 1 e 5 clicando nas estrelas!');
    return;
  }

  // Pega dados do usuário logado para salvar junto
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const nomeCliente = usuarioLogado?.nome || 'Cliente Anônimo';

  // Salva avaliação completa
  const avaliacoesCompletas = JSON.parse(localStorage.getItem('avaliacoesCompletas')) || [];
  
  const novaAvaliacao = {
    id: Date.now(),
    idBarbeiro: idBarbeiro,
    nomeBarbeiro: nomeBarbeiroAtual || 'Barbeiro',
    nomeCliente: nomeCliente,
    nota: nota,
    comentario: comentario,
    data: new Date().toLocaleDateString('pt-BR'),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    idAgendamento: agendamentoAtual
  };

  avaliacoesCompletas.push(novaAvaliacao);
  localStorage.setItem('avaliacoesCompletas', JSON.stringify(avaliacoesCompletas));

  // Mantém compatibilidade com sistema de estrelas
  const avaliacoesBarbeiros = JSON.parse(localStorage.getItem('avaliacoesBarbeiros')) || {};
  if (!avaliacoesBarbeiros[idBarbeiro]) {
    avaliacoesBarbeiros[idBarbeiro] = [];
  }
  avaliacoesBarbeiros[idBarbeiro].push(nota);
  localStorage.setItem('avaliacoesBarbeiros', JSON.stringify(avaliacoesBarbeiros));

  // Marca agendamento como avaliado
  const avaliacoesFeitas = JSON.parse(localStorage.getItem('avaliacoesFeitas')) || {};
  avaliacoesFeitas[agendamentoAtual] = true;
  localStorage.setItem('avaliacoesFeitas', JSON.stringify(avaliacoesFeitas));

  const mensagem = comentario.length > 0 
    ? `Avaliação de ${nota} estrelas com comentário enviada com sucesso!`
    : `Avaliação de ${nota} estrelas enviada com sucesso!`;
  
  alert(mensagem);
  
  fecharModal();
  
  // Recarrega a lista
  const usuarioLogadoAtual = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (usuarioLogadoAtual) {
    carregarRealizados(usuarioLogadoAtual);
  }
}

function atualizarNotasBarbeiros() {
  const chave = 'avaliacoesBarbeiros';
  const avaliacoes = JSON.parse(localStorage.getItem(chave)) || {};
  const barbeiros = document.querySelectorAll('.barbeiro-card');

  barbeiros.forEach(barbeiro => {
    const id = barbeiro.dataset.id;
    if (!id) return;
    
    const avaliacoesDoBarbeiro = avaliacoes[id] || [];
    const media = calcularMedia(avaliacoesDoBarbeiro);

    let spanEstrela = barbeiro.querySelector('.estrela-rating');

    if (!spanEstrela) {
      spanEstrela = document.createElement('span');
      spanEstrela.classList.add('estrela-rating');
      const infoDiv = barbeiro.querySelector('.info');
      if (infoDiv) {
        infoDiv.appendChild(spanEstrela);
      }
    }

    spanEstrela.textContent = avaliacoesDoBarbeiro.length > 0
      ? `⭐ ${media.toFixed(1)} (${avaliacoesDoBarbeiro.length})`
      : '⭐ Sem avaliações';
  });
}

function calcularMedia(avaliacoes) {
  if (!avaliacoes || avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((acc, val) => acc + val, 0);
  return soma / avaliacoes.length;
}

// Event listeners para fechar modal
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalAvaliacao');
  const btnFechar = document.getElementById('fecharModal');
  const btnCancelar = document.getElementById('cancelarAvaliacao');
  
  if (btnFechar) {
    btnFechar.addEventListener('click', fecharModal);
  }
  
  if (btnCancelar) {
    btnCancelar.addEventListener('click', fecharModal);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        fecharModal();
      }
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      fecharModal();
    }
  });
});