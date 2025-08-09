document.addEventListener("DOMContentLoaded", () => {
    carregarFuncionariosNaTela();
    
    // 🔧 CORREÇÃO DA NAVBAR - executar apenas uma vez
    corrigirNavbarAtiva();
});

// 🔧 Função separada para gerenciar a navbar ativa
function corrigirNavbarAtiva() {
    const navLinks = document.querySelectorAll(".bottom-nav-item");
    const currentPath = window.location.pathname.replace(/\/$/, "");
    
    console.log("🔧 Corrigindo navbar. Caminho atual:", currentPath);
    
    // 🔧 PRIMEIRO: Remover TODAS as classes active
    navLinks.forEach(link => {
        link.classList.remove("active");
    });
    
    // 🔧 SEGUNDO: Adicionar active apenas no link correto
    let linkEncontrado = false;
    
    navLinks.forEach((link, index) => {
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "");
        
        if (currentPath === linkPath && !linkEncontrado) {
            link.classList.add("active");
            linkEncontrado = true;
            console.log(`✅ Active adicionado ao link ${index}: ${linkPath}`);
        }
    });
    
    // 🔧 VERIFICAÇÃO: Contar links ativos
    const activeCount = document.querySelectorAll(".bottom-nav-item.active").length;
    console.log(`🔍 Total de links ativos: ${activeCount}`);
    
    if (activeCount !== 1) {
        console.warn("⚠️ Problema: Deveria haver apenas 1 link ativo!");
    }
}

// Função para carregar funcionários do localStorage
function carregarFuncionarios() {
    return JSON.parse(localStorage.getItem('funcionarios')) || [];
}

// Função para carregar funcionários na tela inicial
function carregarFuncionariosNaTela() {
    const funcionarios = carregarFuncionarios();
    const containerFuncionarios = document.getElementById('funcionarios-container');
    
    if (!containerFuncionarios) {
        console.warn('Container de funcionários não encontrado.');
        return;
    }
    
    containerFuncionarios.innerHTML = '';
    
    if (funcionarios.length === 0) {
        containerFuncionarios.innerHTML = `
            <div class="sem-funcionarios">
                <p>Nenhum funcionário cadastrado ainda.</p>
                <a href="../bFuncionarios/index.html" class="btn btn-primary">
                    <i class="bi bi-plus"></i> Adicionar Primeiro Funcionário
                </a>
            </div>
        `;
        return;
    }
    
    funcionarios.forEach(funcionario => {
        const cardFuncionario = criarCardFuncionario(funcionario);
        containerFuncionarios.appendChild(cardFuncionario);
    });
}

// Função para criar card do funcionário
function criarCardFuncionario(funcionario) {
    const card = document.createElement('div');
    card.className = 'card-funcionario';
    card.setAttribute('data-funcionario-id', funcionario.id);
    
    const imagemSrc = funcionario.foto || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMzUgMjBDMzggMjAgNDAgMjIgNDAgMjVDNDAgMjggMzggMzAgMzUgMzBDMzIgMzAgMzAgMjggMzAgMjVDMzAgMjIgMzIgMjAgMzUgMjBaIiBmaWxsPSIjOTNBM0I2Ii8+CjxwYXRoIGQ9Ik0yNSA0NUMyNSA0MCAyOSAzNiAzNSAzNkM0MSAzNiA0NSA0MCA0NSA0NVY1MEgyNVY0NVoiIGZpbGw9IiM5M0EzQjYiLz4KPHN2Zz4=';
    const horario = `${funcionario.horarioInicio} - ${funcionario.horarioFim}`;
    
    card.innerHTML = `
        <div class="funcionario-foto">
            <img src="${imagemSrc}" alt="Foto de ${funcionario.nome}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMzUgMjBDMzggMjAgNDAgMjIgNDAgMjVDNDAgMjggMzggMzAgMzUgMzBDMzIgMzAgMzAgMjggMzAgMjVDMzAgMjIgMzIgMjAgMzUgMjBaIiBmaWxsPSIjOTNBM0I2Ii8+CjxwYXRoIGQ9Ik0yNSA0NUMyNSA0MCAyOSAzNiAzNSAzNkM0MSAzNiA0NSA0MCA0NSA0NVY1MEgyNVY0NVoiIGZpbGw9IiM5M0EzQjYiLz4KPHN2Zz4='">
        </div>
        <div class="funcionario-detalhes">
            <h3 class="funcionario-nome">${funcionario.nome}</h3>
            <p class="funcionario-horario">Carga horária: ${horario}</p>
            <div class="funcionario-status">
                <span class="status ${funcionario.situacao.toLowerCase()}">${funcionario.situacao}</span>
            </div>
        </div>
        <div class="funcionario-acoes">
            <button class="btn btn-editar" onclick="editarFuncionario(${funcionario.id})" title="Editar">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-remover" onclick="confirmarRemocaoFuncionario(${funcionario.id})" title="Remover">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Função para editar funcionário
function editarFuncionario(id) {
    window.location.href = `../bFuncionarios/Edit/index.html?id=${id}`;
}

// Função para confirmar remoção do funcionário
function confirmarRemocaoFuncionario(id) {
    const funcionario = obterFuncionarioPorId(id);
    
    if (!funcionario) {
        alert('Funcionário não encontrado.');
        return;
    }
    
    const confirmacao = confirm(`Tem certeza que deseja remover o funcionário "${funcionario.nome}"?`);
    
    if (confirmacao) {
        removerFuncionario(id);
        carregarFuncionariosNaTela();
        alert('Funcionário removido com sucesso!');
    }
}

// Função para obter funcionário por ID
function obterFuncionarioPorId(id) {
    const funcionarios = carregarFuncionarios();
    return funcionarios.find(func => func.id == id);
}

// Função para remover funcionário
function removerFuncionario(id) {
    let funcionarios = carregarFuncionarios();
    funcionarios = funcionarios.filter(func => func.id != id);
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
}

// Função para alternar status do funcionário
function alternarStatusFuncionario(id) {
    let funcionarios = carregarFuncionarios();
    const funcionario = funcionarios.find(func => func.id == id);
    
    if (funcionario) {
        funcionario.situacao = funcionario.situacao === 'Ativo' ? 'Inativo' : 'Ativo';
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        carregarFuncionariosNaTela();
    }
}