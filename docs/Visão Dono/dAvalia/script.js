document.addEventListener('DOMContentLoaded', () => {
    // Verifica se é um gerente/admin logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado || (usuarioLogado.tipo && usuarioLogado.tipo.toLowerCase() !== 'gerente' && usuarioLogado.tipo.toLowerCase() !== 'admin')) {
      alert('Acesso restrito para gerentes!');
      window.location.href = '../../aLogin/index.html';
      return;
    }
  
    carregarAvaliacoes();
    configurarFiltros();
  });
  
  // Função para carregar e exibir as avaliações
  function carregarAvaliacoes(filtroData = null) {
    const avaliacoesCompletas = JSON.parse(localStorage.getItem('avaliacoesCompletas')) || [];
    const container = document.querySelector('.area-branca');
    
    // Remove lista anterior se existir
    const listaExistente = document.getElementById('lista-avaliacoes');
    if (listaExistente) {
      listaExistente.remove();
    }
  
    // Cria container para as avaliações
    const listaAvaliacoes = document.createElement('div');
    listaAvaliacoes.id = 'lista-avaliacoes';
    listaAvaliacoes.className = 'lista-avaliacoes mt-4';
  
    // Filtra por data se especificado
    let avaliacoesFiltradas = avaliacoesCompletas;
    if (filtroData) {
      avaliacoesFiltradas = avaliacoesCompletas.filter(av => av.data === filtroData);
    } else {
      // Por padrão, mostra apenas as avaliações de hoje
      const hoje = new Date().toLocaleDateString('pt-BR');
      avaliacoesFiltradas = avaliacoesCompletas.filter(av => av.data === hoje);
    }
  
    // Ordena por mais recentes primeiro
    avaliacoesFiltradas.sort((a, b) => {
      const dataA = new Date(a.data.split('/').reverse().join('-') + ' ' + a.hora);
      const dataB = new Date(b.data.split('/').reverse().join('-') + ' ' + b.hora);
      return dataB - dataA;
    });
  
    if (avaliacoesFiltradas.length === 0) {
      const mensagem = filtroData ? 
        `Nenhuma avaliação encontrada para ${filtroData}` : 
        'Nenhuma avaliação encontrada para hoje';
      
      listaAvaliacoes.innerHTML = `
        <div class="alert alert-info text-center">
          <i class="bi bi-info-circle"></i>
          <p class="mb-0">${mensagem}</p>
        </div>
      `;
    } else {
      // Adiciona filtros e contador
      const headerInfo = document.createElement('div');
      headerInfo.className = 'header-info mb-3';
      headerInfo.innerHTML = `
        <div class="filtros-container">
          <div class="input-group" style="max-width: 300px;">
            <span class="input-group-text"><i class="bi bi-calendar-date"></i></span>
            <input type="date" id="filtroData" class="form-control" 
                   title="Filtrar por data específica">
            <button class="btn btn-outline-secondary" type="button" id="limparFiltro">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
          <div class="contador-avaliacoes ms-3">
            <span class="badge bg-primary fs-6">
              ${avaliacoesFiltradas.length} avaliação(ões) ${filtroData ? `em ${filtroData}` : 'hoje'}
            </span>
          </div>
        </div>
      `;
      listaAvaliacoes.appendChild(headerInfo);
  
      // Cria cards para cada avaliação
      avaliacoesFiltradas.forEach((avaliacao, index) => {
        const cardAvaliacao = criarCardAvaliacao(avaliacao, index);
        listaAvaliacoes.appendChild(cardAvaliacao);
      });
    }
  
    // Insere a lista após a linha
    const linha = document.querySelector('.linha');
    linha.parentNode.insertBefore(listaAvaliacoes, linha.nextSibling);
  
    // Configura eventos dos filtros
    configurarEventosFiltros();
  }
  
  // Função para criar card individual de avaliação
  function criarCardAvaliacao(avaliacao, index) {
    const card = document.createElement('div');
    card.className = 'card mb-3 avaliacao-card fade-in';
    card.style.animationDelay = `${index * 0.1}s`;
    card.dataset.avaliacaoId = avaliacao.id;
  
    // Gera estrelas visuais
    const estrelas = '★'.repeat(avaliacao.nota) + '☆'.repeat(5 - avaliacao.nota);
    
    // Trata comentário vazio ou undefined
    const comentario = avaliacao.comentario && avaliacao.comentario.trim() !== '' 
      ? avaliacao.comentario 
      : '<em class="text-muted">Sem comentário</em>';
  
    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-person-circle"></i> ${avaliacao.nomeCliente}
        </h5>
        <div class="acoes-avaliacao">
          <button class="btn btn-danger btn-sm" onclick="excluirAvaliacao(${avaliacao.id})" 
                  title="Excluir avaliação">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <p><strong>Barbeiro:</strong> ${avaliacao.nomeBarbeiro || 'Não informado'}</p>
            <p><strong>Data:</strong> ${avaliacao.data} às ${avaliacao.hora}</p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="nota-container">
              <span class="estrelas-display">${estrelas}</span>
              <span class="nota-numero">(${avaliacao.nota}/5)</span>
            </div>
          </div>
        </div>
        <div class="comentario-section mt-3">
          <h6><i class="bi bi-chat-quote"></i> Comentário:</h6>
          <div class="comentario-texto p-3 bg-light rounded">
            ${comentario}
          </div>
        </div>
      </div>
    `;
  
    return card;
  }
  
  // Função para configurar filtros
  function configurarFiltros() {
    // Adiciona estilos CSS se não existirem
    if (!document.getElementById('estilos-avaliacoes')) {
      const estilos = document.createElement('style');
      estilos.id = 'estilos-avaliacoes';
      estilos.innerHTML = `
        .avaliacao-card {
          border-left: 4px solid #007bff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .avaliacao-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-in-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
          from {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        
        .estrelas-display {
          color: #ffc107;
          font-size: 1.2rem;
        }
        
        .nota-numero {
          color: #6c757d;
          font-weight: bold;
          margin-left: 8px;
        }
        
        .comentario-texto {
          min-height: 50px;
          border-left: 3px solid #007bff;
          font-style: italic;
        }
        
        .filtros-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .contador-avaliacoes {
          margin-top: 10px;
        }
        
        @media (max-width: 768px) {
          .filtros-container {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .contador-avaliacoes {
            margin-top: 0;
            margin-left: 0 !important;
          }
        }
      `;
      document.head.appendChild(estilos);
    }
  }
  
  // Função para configurar eventos dos filtros
  function configurarEventosFiltros() {
    const filtroData = document.getElementById('filtroData');
    const limparFiltro = document.getElementById('limparFiltro');
    
    if (filtroData) {
      filtroData.addEventListener('change', (e) => {
        if (e.target.value) {
          const dataFiltro = new Date(e.target.value + 'T00:00:00').toLocaleDateString('pt-BR');
          carregarAvaliacoes(dataFiltro);
        }
      });
    }
    
    if (limparFiltro) {
      limparFiltro.addEventListener('click', () => {
        if (filtroData) {
          filtroData.value = '';
        }
        carregarAvaliacoes(); // Carrega avaliações de hoje
      });
    }
  }
  
  // Função para excluir avaliação
  function excluirAvaliacao(idAvaliacao) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
      return;
    }
  
    try {
      // Remove da lista de avaliações completas
      const avaliacoesCompletas = JSON.parse(localStorage.getItem('avaliacoesCompletas')) || [];
      const avaliacaoParaRemover = avaliacoesCompletas.find(av => av.id === idAvaliacao);
      
      if (!avaliacaoParaRemover) {
        alert('Avaliação não encontrada!');
        return;
      }
  
      const avaliacoesAtualizadas = avaliacoesCompletas.filter(av => av.id !== idAvaliacao);
      localStorage.setItem('avaliacoesCompletas', JSON.stringify(avaliacoesAtualizadas));
  
      // Remove também da lista de notas dos barbeiros
      const avaliacoesBarbeiros = JSON.parse(localStorage.getItem('avaliacoesBarbeiros')) || {};
      const idBarbeiro = avaliacaoParaRemover.idBarbeiro;
      
      if (avaliacoesBarbeiros[idBarbeiro]) {
        // Remove uma nota correspondente (a primeira ocorrência da mesma nota)
        const indiceNota = avaliacoesBarbeiros[idBarbeiro].indexOf(avaliacaoParaRemover.nota);
        if (indiceNota !== -1) {
          avaliacoesBarbeiros[idBarbeiro].splice(indiceNota, 1);
        }
        
        // Se não restaram notas, remove o barbeiro da lista
        if (avaliacoesBarbeiros[idBarbeiro].length === 0) {
          delete avaliacoesBarbeiros[idBarbeiro];
        }
        
        localStorage.setItem('avaliacoesBarbeiros', JSON.stringify(avaliacoesBarbeiros));
      }
  
      // Remove da lista de avaliações feitas para permitir nova avaliação
      const avaliacoesFeitas = JSON.parse(localStorage.getItem('avaliacoesFeitas')) || {};
      if (avaliacaoParaRemover.idAgendamento && avaliacoesFeitas[avaliacaoParaRemover.idAgendamento]) {
        delete avaliacoesFeitas[avaliacaoParaRemover.idAgendamento];
        localStorage.setItem('avaliacoesFeitas', JSON.stringify(avaliacoesFeitas));
      }
  
      // Animação de remoção
      const cardElement = document.querySelector(`[data-avaliacao-id="${idAvaliacao}"]`);
      if (cardElement) {
        cardElement.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        setTimeout(() => {
          carregarAvaliacoes(); // Recarrega a lista
        }, 300);
      } else {
        carregarAvaliacoes(); // Recarrega imediatamente se não encontrou o card
      }
  
      // Mostra mensagem de sucesso
      setTimeout(() => {
        const toast = document.createElement('div');
        toast.className = 'alert alert-success position-fixed';
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        toast.innerHTML = `
          <i class="bi bi-check-circle"></i>
          Avaliação excluída com sucesso!
        `;
        document.body.appendChild(toast);
  
        setTimeout(() => {
          toast.remove();
        }, 3000);
      }, 100);
  
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      alert('Erro ao excluir a avaliação. Tente novamente.');
    }
  }
  
  // Adiciona animação de saída ao CSS
  document.addEventListener('DOMContentLoaded', () => {
    const estiloFadeOut = document.createElement('style');
    estiloFadeOut.innerHTML = `
      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateX(-100%);
        }
      }
    `;
    document.head.appendChild(estiloFadeOut);
  });
  
  // Função para atualizar estatísticas (opcional - para dashboard)
  function obterEstatisticasAvaliacoes() {
    const avaliacoesCompletas = JSON.parse(localStorage.getItem('avaliacoesCompletas')) || [];
    
    if (avaliacoesCompletas.length === 0) {
      return {
        total: 0,
        mediaGeral: 0,
        hoje: 0,
        porBarbeiro: {}
      };
    }
  
    const hoje = new Date().toLocaleDateString('pt-BR');
    const avaliacoesHoje = avaliacoesCompletas.filter(av => av.data === hoje);
    
    const somaNotas = avaliacoesCompletas.reduce((acc, av) => acc + av.nota, 0);
    const mediaGeral = somaNotas / avaliacoesCompletas.length;
    
    // Estatísticas por barbeiro
    const porBarbeiro = {};
    avaliacoesCompletas.forEach(av => {
      const id = av.idBarbeiro;
      if (!porBarbeiro[id]) {
        porBarbeiro[id] = {
          nome: av.nomeBarbeiro,
          avaliacoes: [],
          media: 0
        };
      }
      porBarbeiro[id].avaliacoes.push(av.nota);
    });
    
    // Calcula médias por barbeiro
    Object.keys(porBarbeiro).forEach(id => {
      const avaliacoes = porBarbeiro[id].avaliacoes;
      porBarbeiro[id].media = avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length;
    });
  
    return {
      total: avaliacoesCompletas.length,
      mediaGeral: parseFloat(mediaGeral.toFixed(2)),
      hoje: avaliacoesHoje.length,
      porBarbeiro: porBarbeiro
    };
  }