// ==== API Configuration ====
const API_BASE_URL = 'http://localhost:8080/api/auth';

// ==== Inicialização ====
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    inicializarPreviewFoto();
    inicializarValidacaoHorario();
});

// Preview da foto de perfil
function inicializarPreviewFoto() {
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
}

// Validação de horário
function inicializarValidacaoHorario() {
    const inicioInput = document.getElementById("horarioInicio");
    const fimInput = document.getElementById("horarioFim");

    fimInput.addEventListener("change", () => {
        if (fimInput.value && inicioInput.value && fimInput.value <= inicioInput.value) {
            alert("O horário final precisa ser maior que o horário inicial!");
            fimInput.value = "";
        }
    });
}

// Função para inicializar o formulário
function inicializarFormulario() {
    const form = document.querySelector('.form-profissional');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        adicionarFuncionario();
    });
}

// Função para adicionar funcionário
async function adicionarFuncionario() {
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
    
    if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    if (!horarioInicio || !horarioFim) {
        alert('Por favor, defina o horário de trabalho.');
        return;
    }
    
    // Processar foto (se houver)
    if (fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const fotoBase64 = e.target.result;
            await enviarParaAPI(nome, email, senha, horarioInicio, horarioFim, fotoBase64);
        };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        await enviarParaAPI(nome, email, senha, horarioInicio, horarioFim, null);
    }
}

// Função para enviar dados para a API
async function enviarParaAPI(nome, email, senha, horarioInicio, horarioFim, fotoBase64) {
    // Pegar token do gerente logado
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Você precisa estar logado como gerente para criar funcionários.');
        window.location.href = '../../../index.html';
        return;
    }
    
    // Montar objeto para enviar
    const dados = {
        nome: nome,
        login: email,
        senha: senha,
        horarioInicio: horarioInicio,
        horarioFim: horarioFim,
        fotoPerfil: fotoBase64
    };
    
    // Desabilitar botão enquanto envia
    const btnSalvar = document.querySelector('button[type="submit"]');
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/create-barber`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erro ao criar barbeiro');
        }
        
        // Sucesso!
        alert(`Barbeiro ${nome} criado com sucesso!\n\nLogin: ${email}\nSenha: ${senha}\n\nGuarde essas credenciais!`);
        
        // Limpar formulário
        limparFormulario();
        
    } catch (error) {
        console.error('Erro:', error);
        
        let mensagemErro = 'Erro ao criar barbeiro. Tente novamente.';
        
        if (error.message.includes('já está em uso')) {
            mensagemErro = 'Este email já está cadastrado.';
        } else if (error.message.includes('Apenas gerentes')) {
            mensagemErro = 'Apenas gerentes podem criar barbeiros.';
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogado');
            window.location.href = '../../../index.html';
            return;
        } else if (error.message.includes('Failed to fetch')) {
            mensagemErro = 'Erro de conexão. Verifique se o servidor está rodando.';
        }
        
        alert(mensagemErro);
        
    } finally {
        // Restaurar botão
        btnSalvar.disabled = false;
        btnSalvar.textContent = textoOriginal;
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