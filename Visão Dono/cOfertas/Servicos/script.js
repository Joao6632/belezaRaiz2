// ============================
// VERIFICAÇÃO DE LOGIN DO GERENTE
// ============================
document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    // Verifica se é gerente
    if (!usuarioLogado || usuarioLogado.tipo !== 'gerente') {
        alert('Acesso restrito para gerentes!');
        window.location.href = '../../Visão Cliente/aLogin/index.html';
        return;
    }
    
    // Inicializa o sistema
    initServicos();
});

// ============================
// VARIÁVEIS GLOBAIS
// ============================
let servicoEditando = null;
const modalServicoForm = new bootstrap.Modal(document.getElementById('modalServicoForm'));

// ============================
// FUNÇÕES DE LOCALSTORAGE
// ============================
function loadServicos() {
    return JSON.parse(localStorage.getItem('servicos')) || [];
}

function saveServicos(servicos) {
    localStorage.setItem('servicos', JSON.stringify(servicos));
}

function gerarIdServico() {
    return 'servico_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================
// INICIALIZAÇÃO
// ============================
function initServicos() {
    renderizarServicos();
    setupEventListeners();
}

// ============================
// RENDERIZAR SERVIÇOS
// ============================
function renderizarServicos() {
    const container = document.getElementById('servicosContainer');
    const emptyState = document.getElementById('emptyState');
    const btnAdicionarMais = document.getElementById('btnAdicionarMais');
    
    const servicos = loadServicos().filter(s => s.tipo === 'servico'); // Só serviços por enquanto
    
    container.innerHTML = '';
    
    if (servicos.length === 0) {
        // Mostra tela vazia
        emptyState.classList.remove('d-none');
        btnAdicionarMais.classList.add('d-none');
    } else {
        // Esconde tela vazia e mostra botão adicionar
        emptyState.classList.add('d-none');
        btnAdicionarMais.classList.remove('d-none');
        
        // Renderiza cada serviço
        servicos.forEach(servico => {
            const card = criarCardServico(servico);
            container.appendChild(card);
        });
    }
}

// ============================
// CRIAR CARD DE SERVIÇO
// ============================
function criarCardServico(servico) {
    const card = document.createElement('div');
    card.className = 'servico-card';
    card.dataset.id = servico.id;
    
    const emoji = servico.emoji ? servico.emoji + ' ' : '';
    const preco = parseFloat(servico.preco || 0).toFixed(2).replace('.', ',');
    
    card.innerHTML = `
        <img src="${servico.foto || '/imagens/servico-default.jpg'}" alt="${servico.nome}" 
             onerror="this.src='/imagens/servico-default.jpg'">
        <div class="servico-info">
            <h5>${emoji}${servico.nome}</h5>
            <p>${servico.descricao || 'Sem descrição'}</p>
            <p><strong>Duração:</strong> ${servico.duracao}</p>
            <span class="servico-tipo servico">Serviço</span>
        </div>
        <div class="servico-preco">R$ ${preco}</div>
        <div class="servico-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="editarServico('${servico.id}')">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirServico('${servico.id}')">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

// ============================
// SETUP EVENT LISTENERS
// ============================
function setupEventListeners() {
    // Botão adicionar primeiro serviço
    document.getElementById('btnAdicionarPrimeiro').addEventListener('click', () => {
        abrirModalServico();
    });
    
    // Botão adicionar mais serviços
    document.getElementById('btnAdicionarMais').addEventListener('click', () => {
        abrirModalServico();
    });
    
    // Botão salvar serviço
    document.getElementById('btnSalvarServico').addEventListener('click', () => {
        salvarServico();
    });
    
    // Upload de foto
    document.getElementById('foto-servico').addEventListener('change', (e) => {
        handleFotoUpload(e);
    });
    
    // Reset do modal quando fechar
    document.getElementById('modalServicoForm').addEventListener('hidden.bs.modal', () => {
        resetarModal();
    });
    
    // Validação do tipo (só serviços por enquanto)
    document.getElementById('tipoServico').addEventListener('change', (e) => {
        if (e.target.value === 'oferta') {
            alert('Ofertas serão implementadas em breve!');
            e.target.value = 'servico';
        }
    });
}

// ============================
// ABRIR MODAL PARA ADICIONAR/EDITAR
// ============================
function abrirModalServico(servico = null) {
    servicoEditando = servico;
    
    const modalTitle = document.getElementById('modalTitle');
    const btnSalvar = document.getElementById('btnSalvarServico');
    
    if (servico) {
        modalTitle.textContent = 'Editar Serviço';
        btnSalvar.textContent = 'Atualizar Serviço';
        preencherFormulario(servico);
    } else {
        modalTitle.textContent = 'Adicionar Serviço';
        btnSalvar.textContent = 'Salvar Serviço';
    }
    
    modalServicoForm.show();
}

// ============================
// PREENCHER FORMULÁRIO (EDIÇÃO)
// ============================
function preencherFormulario(servico) {
    document.getElementById('nomeServico').value = servico.nome || '';
    document.getElementById('descricaoServico').value = servico.descricao || '';
    document.getElementById('precoServico').value = servico.preco || '';
    document.getElementById('duracaoServico').value = servico.duracao || '';
    document.getElementById('tipoServico').value = servico.tipo || 'servico';
    document.getElementById('emojiServico').value = servico.emoji || '';
    
    // Preview da foto se existir
    if (servico.foto) {
        const preview = document.getElementById('fotoPreview');
        preview.innerHTML = `<img src="${servico.foto}" alt="Preview">`;
        preview.classList.add('has-image');
    }
}

// ============================
// RESETAR MODAL
// ============================
function resetarModal() {
    document.getElementById('formServico').reset();
    
    const preview = document.getElementById('fotoPreview');
    preview.innerHTML = `
        <i class="bi bi-cloud-arrow-up"></i>
        <span>Clique para adicionar foto</span>
    `;
    preview.classList.remove('has-image');
    
    servicoEditando = null;
}

// ============================
// HANDLE UPLOAD DE FOTO
// ============================
function handleFotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validação de arquivo
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('fotoPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

// ============================
// SALVAR SERVIÇO
// ============================
function salvarServico() {
    const form = document.getElementById('formServico');
    
    // Validação básica
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const nome = document.getElementById('nomeServico').value.trim();
    const descricao = document.getElementById('descricaoServico').value.trim();
    const preco = document.getElementById('precoServico').value;
    const duracao = document.getElementById('duracaoServico').value.trim();
    const tipo = document.getElementById('tipoServico').value;
    const emoji = document.getElementById('emojiServico').value.trim();
    
    // Pega a foto (base64 ou URL existente)
    const fotoPreview = document.getElementById('fotoPreview');
    const imgElement = fotoPreview.querySelector('img');
    const foto = imgElement ? imgElement.src : null;
    
    // Dados do serviço
    const dadosServico = {
        nome,
        descricao,
        preco: parseFloat(preco),
        duracao,
        tipo,
        emoji,
        foto,
        dataCriacao: servicoEditando ? servicoEditando.dataCriacao : new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };
    
    let servicos = loadServicos();
    
    if (servicoEditando) {
        // Editando serviço existente
        const index = servicos.findIndex(s => s.id === servicoEditando.id);
        if (index !== -1) {
            servicos[index] = { ...servicoEditando, ...dadosServico };
        }
    } else {
        // Novo serviço
        dadosServico.id = gerarIdServico();
        servicos.push(dadosServico);
    }
    
    saveServicos(servicos);
    modalServicoForm.hide();
    renderizarServicos();
    
    const acao = servicoEditando ? 'atualizado' : 'criado';
    alert(`✅ Serviço ${acao} com sucesso!`);
}

// ============================
// EDITAR SERVIÇO
// ============================
function editarServico(id) {
    const servicos = loadServicos();
    const servico = servicos.find(s => s.id === id);
    
    if (servico) {
        abrirModalServico(servico);
    } else {
        alert('Serviço não encontrado!');
    }
}

// ============================
// EXCLUIR SERVIÇO
// ============================
function excluirServico(id) {
    const servicos = loadServicos();
    const servico = servicos.find(s => s.id === id);
    
    if (!servico) {
        alert('Serviço não encontrado!');
        return;
    }
    
    const confirmacao = confirm(
        `Tem certeza que deseja excluir o serviço "${servico.nome}"?\n\n` +
        `Esta ação não pode ser desfeita.`
    );
    
    if (confirmacao) {
        const novosServicos = servicos.filter(s => s.id !== id);
        saveServicos(novosServicos);
        renderizarServicos();
        alert('✅ Serviço excluído com sucesso!');
    }
}

// ============================
// FUNÇÕES UTILITÁRIAS PARA INTEGRAÇÃO
// ============================

// Função para ser usada no cliente - carrega apenas serviços ativos
function carregarServicosParaCliente() {
    return loadServicos().filter(s => s.tipo === 'servico');
}

// Função para obter um serviço específico
function obterServicoPorId(id) {
    const servicos = loadServicos();
    return servicos.find(s => s.id === id);
}

// Função para obter serviço por nome (compatibilidade)
function obterServicoPorNome(nome) {
    const servicos = loadServicos();
    return servicos.find(s => s.nome.toLowerCase() === nome.toLowerCase());
}

// Exporta funções para uso global
window.carregarServicosParaCliente = carregarServicosParaCliente;
window.obterServicoPorId = obterServicoPorId;
window.obterServicoPorNome = obterServicoPorNome;