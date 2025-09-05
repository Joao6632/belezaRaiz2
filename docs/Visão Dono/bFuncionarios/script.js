

    // Inicializar eventos do formulário
    inicializarFormulario();


// Preview da foto de perfil
document.getElementById('foto-perfil').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById('fotoPreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.innerHTML = ""; // remove o ícone
        }
        reader.readAsDataURL(file);
    }
});

// Validação de horário
const inicioInput = document.getElementById("horarioInicio");
const fimInput = document.getElementById("horarioFim");

fimInput.addEventListener("change", () => {
    if (fimInput.value && inicioInput.value && fimInput.value <= inicioInput.value) {
        alert("O horário final precisa ser maior que o horário inicial!");
        fimInput.value = "";
    }
});

// Função para inicializar o formulário
function inicializarFormulario() {
    const form = document.querySelector('.form-profissional');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        adicionarFuncionario();
    });
}

// Função para adicionar funcionário
function adicionarFuncionario() {
    // Capturar dados do formulário
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const horarioInicio = document.getElementById('horarioInicio').value;
    const horarioFim = document.getElementById('horarioFim').value;
    const fotoInput = document.getElementById('foto-perfil');
    
    // Validações
    if (!nome) {
        alert('Por favor, digite o nome do funcionário.');
        return;
    }
    
    if (!email) {
        alert('Por favor, digite o email do funcionário.');
        return;
    }
    
    if (!senha) {
        alert('Por favor, digite a senha do funcionário.');
        return;
    }
    
    if (!horarioInicio || !horarioFim) {
        alert('Por favor, defina o horário de trabalho.');
        return;
    }
    
    // Processar foto (se houver)
    let fotoBase64 = null;
    if (fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fotoBase64 = e.target.result;
            salvarFuncionario();
        };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        salvarFuncionario();
    }
    
    function salvarFuncionario() {
        // Criar objeto funcionário
        const funcionario = {
            id: Date.now(), // ID único baseado no timestamp
            nome: nome,
            email: email,
            senha: senha, // Em produção, nunca armazene senhas em texto plano
            horarioInicio: horarioInicio,
            horarioFim: horarioFim,
            foto: fotoBase64,
            situacao: 'Ativo',
            dataCadastro: new Date().toISOString()
        };
        
        // Recuperar funcionários existentes do localStorage
        let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
        
        // Verificar se já existe um funcionário com este email
        const emailExiste = funcionarios.some(func => func.email === email);
        if (emailExiste) {
            alert('Já existe um funcionário cadastrado com este email.');
            return;
        }
        
        // Adicionar novo funcionário
        funcionarios.push(funcionario);
        
        // Salvar no localStorage
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        
        // Mostrar mensagem de sucesso
        alert('Funcionário adicionado com sucesso!');
        
        // Limpar formulário
        limparFormulario();
        
        // Opcional: redirecionar para a página inicial
        // window.location.href = '../aInicio/index.html';
    }
}

// Função para limpar o formulário
function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('horarioInicio').value = '';
    document.getElementById('horarioFim').value = '';
    document.getElementById('foto-perfil').value = '';
    
    // Limpar preview da foto
    const preview = document.getElementById('fotoPreview');
    preview.style.backgroundImage = '';
    preview.innerHTML = '<i class="bi bi-cloud-arrow-up"></i>';
}

// Função para carregar funcionários (para outras páginas)
function carregarFuncionarios() {
    return JSON.parse(localStorage.getItem('funcionarios')) || [];
}

// Função para obter um funcionário por ID
function obterFuncionarioPorId(id) {
    const funcionarios = carregarFuncionarios();
    return funcionarios.find(func => func.id == id);
}

// Função para atualizar funcionário
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

// Função para remover funcionário
function removerFuncionario(id) {
    let funcionarios = carregarFuncionarios();
    funcionarios = funcionarios.filter(func => func.id != id);
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
}

// Função para formatar horário para exibição
function formatarHorario(inicio, fim) {
    return `${inicio} - ${fim}`;
}