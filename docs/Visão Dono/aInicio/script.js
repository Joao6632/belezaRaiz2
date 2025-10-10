// ==== API Configuration ====
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener("DOMContentLoaded", () => {
    carregarFuncionariosNaTela();
    corrigirNavbarAtiva();
});

// 🔧 Função separada para gerenciar a navbar ativa
function corrigirNavbarAtiva() {
    const navLinks = document.querySelectorAll(".bottom-nav-item");
    const currentPath = window.location.pathname.replace(/\/$/, "");
    
    console.log("🔧 Corrigindo navbar. Caminho atual:", currentPath);
    
    navLinks.forEach(link => {
        link.classList.remove("active");
    });
    
    let linkEncontrado = false;
    
    navLinks.forEach((link, index) => {
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "");
        
        if (currentPath === linkPath && !linkEncontrado) {
            link.classList.add("active");
            linkEncontrado = true;
            console.log(`✅ Active adicionado ao link ${index}: ${linkPath}`);
        }
    });
    
    const activeCount = document.querySelectorAll(".bottom-nav-item.active").length;
    console.log(`🔍 Total de links ativos: ${activeCount}`);
    
    if (activeCount !== 1) {
        console.warn("⚠️ Problema: Deveria haver apenas 1 link ativo!");
    }
}

// ========== NOVA IMPLEMENTAÇÃO COM API ==========

// Função para buscar barbeiros da API
async function carregarFuncionarios() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.warn('Token não encontrado. Redirecionando para login...');
        window.location.href = '../../../index.html';
        return [];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/barbeiros`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            console.warn('Token inválido ou expirado');
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogado');
            window.location.href = '../../../index.html';
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar barbeiros: ${response.status}`);
        }
        
        const barbeiros = await response.json();
        console.log('✅ Barbeiros carregados:', barbeiros);
        return barbeiros;
        
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        
        if (error.message.includes('Failed to fetch')) {
            alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        }
        
        return [];
    }
}

// Função para carregar funcionários na tela inicial
async function carregarFuncionariosNaTela() {
    const containerFuncionarios = document.getElementById('funcionarios-container');
    
    if (!containerFuncionarios) {
        console.warn('Container de funcionários não encontrado.');
        return;
    }
    
    // Mostrar loading
    containerFuncionarios.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Carregando funcionários...</p>
        </div>
    `;
    
    const funcionarios = await carregarFuncionarios();
    
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
    
    // Usar foto do backend ou placeholder
    const imagemSrc = funcionario.fotoPerfil || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMzUgMjBDMzggMjAgNDAgMjIgNDAgMjVDNDAgMjggMzggMzAgMzUgMzBDMzIgMzAgMzAgMjggMzAgMjVDMzAgMjIgMzIgMjAgMzUgMjBaIiBmaWxsPSIjOTNBM0I2Ii8+CjxwYXRoIGQ9Ik0yNSA0NUMyNSA0MCAyOSAzNiAzNSAzNkM0MSAzNiA0NSA0MCA0NSA0NVY1MEgyNVY0NVoiIGZpbGw9IiM5M0EzQjYiLz4KPHN2Zz4=';
    
    // Formatação de horário
    let horario = 'Horário não definido';
    if (funcionario.horarioInicio && funcionario.horarioFim) {
        horario = `${funcionario.horarioInicio} - ${funcionario.horarioFim}`;
    }
    
    // Status do barbeiro (mapear do enum para string visual)
    let statusTexto = 'Ativo';
    let statusClasse = 'ativo';
    
    if (funcionario.status) {
        switch (funcionario.status.toUpperCase()) {
            case 'ATIVO':
                statusTexto = 'Ativo';
                statusClasse = 'ativo';
                break;
            case 'FERIAS':
                statusTexto = 'Férias';
                statusClasse = 'ferias';
                break;
            case 'INATIVO':
                statusTexto = 'Inativo';
                statusClasse = 'inativo';
                break;
            default:
                statusTexto = funcionario.status;
                statusClasse = funcionario.status.toLowerCase();
        }
    }
    
    card.innerHTML = `
        <div class="funcionario-foto">
            <img src="${imagemSrc}" 
                 alt="Foto de ${funcionario.nome}" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMzUgMjBDMzggMjAgNDAgMjIgNDAgMjVDNDAgMjggMzggMzAgMzUgMzBDMzIgMzAgMzAgMjggMzAgMjVDMzAgMjIgMzIgMjAgMzUgMjBaIiBmaWxsPSIjOTNBM0I2Ii8+CjxwYXRoIGQ9Ik0yNSA0NUMyNSA0MCAyOSAzNiAzNSAzNkM0MSAzNiA0NSA0MCA0NSA0NVY1MEgyNVY0NVoiIGZpbGw9IiM5M0EzQjYiLz4KPHN2Zz4='">
        </div>
        <div class="funcionario-detalhes">
            <h3 class="funcionario-nome">${funcionario.nome}</h3>
            <p class="funcionario-horario">Carga horária: ${horario}</p>
            <div class="funcionario-status">
                <span class="status ${statusClasse}">${statusTexto}</span>
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
async function confirmarRemocaoFuncionario(id) {
    const funcionarios = await carregarFuncionarios();
    const funcionario = funcionarios.find(func => func.id == id);
    
    if (!funcionario) {
        alert('Funcionário não encontrado.');
        return;
    }
    
    const confirmacao = confirm(`Tem certeza que deseja remover o funcionário "${funcionario.nome}"?`);
    
    if (confirmacao) {
        await removerFuncionario(id);
    }
}

// Função para remover funcionário (via API)
async function removerFuncionario(id) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Você precisa estar logado.');
        window.location.href = '../../../index.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/barbeiros/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao remover funcionário');
        }
        
        alert('Funcionário removido com sucesso!');
        carregarFuncionariosNaTela();
        
    } catch (error) {
        console.error('Erro ao remover funcionário:', error);
        alert('Erro ao remover funcionário. Tente novamente.');
    }
}

// Função para alternar status do funcionário (via API)
async function alternarStatusFuncionario(id) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Você precisa estar logado.');
        window.location.href = '../../../index.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/barbeiros/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao alterar status');
        }
        
        carregarFuncionariosNaTela();
        
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        alert('Erro ao alterar status. Tente novamente.');
    }
}