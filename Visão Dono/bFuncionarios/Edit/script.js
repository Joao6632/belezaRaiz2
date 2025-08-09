document.addEventListener("DOMContentLoaded", () => {
    // Corrigir navbar ativa
    corrigirNavbarAtiva();
    
    // Carregar dados do funcionário
    carregarDadosFuncionario();
    
    // Configurar eventos
    configurarEventos();
});

// Função para corrigir navbar ativa
function corrigirNavbarAtiva() {
    const navLinks = document.querySelectorAll(".bottom-nav-item");
    navLinks.forEach(link => link.classList.remove("active"));
    
    // Adicionar active no link de funcionários (terceiro link)
    const linkFuncionarios = navLinks[2];
    if (linkFuncionarios) {
        linkFuncionarios.classList.add("active");
    }
}

// Função para obter ID do funcionário da URL
function obterIdFuncionario() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Função para carregar funcionários do localStorage
function carregarFuncionarios() {
    return JSON.parse(localStorage.getItem('funcionarios')) || [];
}

// Função para carregar dados do funcionário
function carregarDadosFuncionario() {
    const id = obterIdFuncionario();
    
    if (!id) {
        alert('ID do funcionário não encontrado!');
        window.location.href = '../index.html';
        return;
    }
    
    const funcionarios = carregarFuncionarios();
    const funcionario = funcionarios.find(func => func.id == id);
    
    if (!funcionario) {
        alert('Funcionário não encontrado!');
        window.location.href = '../index.html';
        return;
    }
    
    // Preencher dados na tela
    preencherDadosFuncionario(funcionario);
}

// Função para preencher dados do funcionário na tela
function preencherDadosFuncionario(funcionario) {
    // Foto
    const fotoImg = document.getElementById('fotoFuncionario');
    const imagemSrc = funcionario.foto || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9IiNGOEY5RkEiLz4KPHBhdGggZD0iTTQwIDI1QzQ0IDI1IDQ3IDI4IDQ3IDMwQzQ3IDMzIDQ0IDM2IDQwIDM2QzM2IDM2IDMzIDMzIDMzIDMwQzMzIDI4IDM2IDI1IDQwIDI1WiIgZmlsbD0iIzkzQTNCNiIvPgo8cGF0aCBkPSJNMjggNTBDMjggNDQgMzMgMzkgNDAgMzlDNDcgMzkgNTIgNDQgNTIgNTBWNTVIMjhWNTBaIiBmaWxsPSIjOTNBM0I2Ii8+Cjwvc3ZnPg==';
    fotoImg.src = imagemSrc;
    
    // Nome
    document.getElementById('nomeFuncionario').textContent = funcionario.nome;
    
    // Status
    document.getElementById('status').value = funcionario.situacao || 'Ativo';
    
    // Período/Horário
    const horarioCompleto = `${funcionario.horarioInicio} - ${funcionario.horarioFim}`;
    const selectPeriodo = document.getElementById('periodo');
    
    // Verificar se o horário corresponde a algum período pré-definido
    let periodoEncontrado = false;
    for (let option of selectPeriodo.options) {
        if (option.value === horarioCompleto) {
            selectPeriodo.value = option.value;
            periodoEncontrado = true;
            break;
        }
    }
    
    // Se não encontrou, usar personalizado
    if (!periodoEncontrado) {
        selectPeriodo.value = 'custom';
        mostrarHorariosPersonalizados();
    }
    
    // Preencher horários personalizados
    document.getElementById('horarioInicio').value = funcionario.horarioInicio || '';
    document.getElementById('horarioFim').value = funcionario.horarioFim || '';
    
    // Email (readonly)
    document.getElementById('email').value = funcionario.email || '';
    
    // Senha fica vazia (para segurança)
    document.getElementById('senha').value = '';
}

// Função para configurar eventos
function configurarEventos() {
    // Evento para mudança no select de período
    document.getElementById('periodo').addEventListener('change', function() {
        const valor = this.value;
        
        if (valor === 'custom') {
            mostrarHorariosPersonalizados();
        } else {
            esconderHorariosPersonalizados();
            // Se não é personalizado, preencher os horários baseado na seleção
            const horarios = valor.split(' - ');
            if (horarios.length === 2) {
                document.getElementById('horarioInicio').value = horarios[0];
                document.getElementById('horarioFim').value = horarios[1];
            }
        }
    });
    
    // Validação de horário
    document.getElementById('horarioFim').addEventListener('change', validarHorarios);
    
    // Botão Salvar
    document.getElementById('btnSalvar').addEventListener('click', salvarFuncionario);
    
    // Botão Deletar
    document.getElementById('btnDeletar').addEventListener('click', deletarFuncionario);
    
    // Verificar estado inicial do período
    if (document.getElementById('periodo').value === 'custom') {
        mostrarHorariosPersonalizados();
    }
}

// Função para mostrar horários personalizados
function mostrarHorariosPersonalizados() {
    document.getElementById('horariosPersonalizados').style.display = 'block';
}

// Função para esconder horários personalizados
function esconderHorariosPersonalizados() {
    document.getElementById('horariosPersonalizados').style.display = 'none';
}

// Função para validar horários
function validarHorarios() {
    const inicio = document.getElementById('horarioInicio').value;
    const fim = document.getElementById('horarioFim').value;
    
    if (inicio && fim && fim <= inicio) {
        alert('O horário final deve ser maior que o horário inicial!');
        document.getElementById('horarioFim').value = '';
    }
}

// Função para salvar funcionário
function salvarFuncionario() {
    const id = obterIdFuncionario();
    
    if (!id) {
        alert('Erro: ID do funcionário não encontrado!');
        return;
    }
    
    // Coletar dados do formulário
    const dadosAtualizados = {
        situacao: document.getElementById('status').value,
        horarioInicio: document.getElementById('horarioInicio').value,
        horarioFim: document.getElementById('horarioFim').value
    };
    
    // Se senha foi preenchida, incluir
    const novaSenha = document.getElementById('senha').value.trim();
    if (novaSenha) {
        dadosAtualizados.senha = novaSenha;
    }
    
    // Validações
    if (!dadosAtualizados.horarioInicio || !dadosAtualizados.horarioFim) {
        alert('Por favor, defina os horários de trabalho.');
        return;
    }
    
    if (dadosAtualizados.horarioFim <= dadosAtualizados.horarioInicio) {
        alert('O horário final deve ser maior que o inicial.');
        return;
    }
    
    // Atualizar no localStorage
    if (atualizarFuncionario(id, dadosAtualizados)) {
        alert('Funcionário atualizado com sucesso!');
        // Opcional: redirecionar de volta
        // window.location.href = '../../aInicio/index.html';
    } else {
        alert('Erro ao atualizar funcionário!');
    }
}

// Função para atualizar funcionário no localStorage
function atualizarFuncionario(id, dadosAtualizados) {
    let funcionarios = carregarFuncionarios();
    const index = funcionarios.findIndex(func => func.id == id);
    
    if (index !== -1) {
        funcionarios[index] = { ...funcionarios[index], ...dadosAtualizados };
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        return true;
    }
    return false;
}

// Função para deletar funcionário
function deletarFuncionario() {
    const id = obterIdFuncionario();
    const funcionarios = carregarFuncionarios();
    const funcionario = funcionarios.find(func => func.id == id);
    
    if (!funcionario) {
        alert('Funcionário não encontrado!');
        return;
    }
    
    const confirmacao = confirm(`Tem certeza que deseja DELETAR o funcionário "${funcionario.nome}"?\n\nEsta ação não pode ser desfeita!`);
    
    if (confirmacao) {
        // Remover do localStorage
        const novosFuncionarios = funcionarios.filter(func => func.id != id);
        localStorage.setItem('funcionarios', JSON.stringify(novosFuncionarios));
        
        alert('Funcionário deletado com sucesso!');
        
        // Redirecionar para página inicial
        window.location.href = '../../aInicio/index.html';
    }
}