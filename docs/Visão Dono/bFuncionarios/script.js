// ==== API Configuration ====
const API_BASE_URL = 'http://localhost:8080/api/auth';

// ==== Inicialização ====
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    inicializarPreviewFoto();
    inicializarValidacaoHorario();
    verificarAutenticacao();
});

// Verificar se está autenticado como gerente
function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    if (!token) {
        alert('Você precisa estar logado como gerente.');
        window.location.href = '../../../index.html';
        return;
    }
    
    if (usuarioLogado) {
        try {
            const usuario = JSON.parse(usuarioLogado);
            if (usuario.tipo !== 'gerente') {
                alert('Apenas gerentes podem acessar esta página.');
                window.location.href = '../../../index.html';
            }
        } catch (e) {
            console.error('Erro ao parsear usuário:', e);
        }
    }
}

// Preview da foto de perfil
function inicializarPreviewFoto() {
    document.getElementById('foto-perfil').addEventListener('change', function (event) {
        const file = event.target.files[0];
        const preview = document.getElementById('fotoPreview');

        if (file) {
            // Validar tamanho do arquivo (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A foto deve ter no máximo 5MB');
                event.target.value = '';
                return;
            }
            
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas imagens');
                event.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.innerHTML = "";
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
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, digite um email válido.');
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
    
    // Validar formato de horário (HH:mm)
    const horarioRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(horarioInicio) || !horarioRegex.test(horarioFim)) {
        alert('Formato de horário inválido. Use HH:mm (ex: 08:00)');
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
        horarioFim: horarioFim
    };
    
    // Adicionar foto apenas se existir
    if (fotoBase64) {
        dados.fotoPerfil = fotoBase64;
    }
    
    // LOG para debug - ver o que está sendo enviado
    console.log('=== DADOS ENVIADOS ===');
    console.log('Nome:', dados.nome);
    console.log('Login:', dados.login);
    console.log('HorarioInicio:', dados.horarioInicio);
    console.log('HorarioFim:', dados.horarioFim);
    console.log('Tem foto?', dados.fotoPerfil ? 'Sim' : 'Não');
    console.log('Token presente?', token ? 'Sim' : 'Não');
    
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
        
        // LOG da resposta
        console.log('=== RESPOSTA DO SERVIDOR ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        // Tentar pegar o corpo da resposta
        const contentType = response.headers.get("content-type");
        let result;
        
        if (contentType && contentType.includes("application/json")) {
            result = await response.json();
            console.log('Resposta JSON:', result);
        } else {
            const text = await response.text();
            console.log('Resposta Text:', text);
            result = { message: text };
        }
        
        if (!response.ok) {
            throw new Error(result.message || result.error || `Erro ${response.status}`);
        }
        
        // Sucesso!
        alert(`✅ Barbeiro ${nome} criado com sucesso!\n\n📧 Login: ${email}\n🔒 Senha: ${senha}\n\n⚠️ Guarde essas credenciais!`);
        
        // Limpar formulário
        limparFormulario();
        
    } catch (error) {
        console.error('=== ERRO CAPTURADO ===', error);
        
        let mensagemErro = 'Erro ao criar barbeiro. Tente novamente.';
        
        if (error.message.includes('já está em uso')) {
            mensagemErro = '❌ Este email já está cadastrado.';
        } else if (error.message.includes('Apenas gerentes')) {
            mensagemErro = '❌ Apenas gerentes podem criar barbeiros.';
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogado');
            setTimeout(() => {
                window.location.href = '../../../index.html';
            }, 2000);
        } else if (error.message.includes('Failed to fetch')) {
            mensagemErro = '❌ Erro de conexão. Verifique se o servidor está rodando na porta 8080.';
        } else if (error.message.includes('Login deve ser')) {
            mensagemErro = '❌ Formato de login inválido. Use um email válido.';
        } else if (error.message.includes('Horário')) {
            mensagemErro = `❌ ${error.message}`;
        } else if (error.message) {
            mensagemErro = `❌ ${error.message}`;
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