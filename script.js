// ==== API Configuration ====
const API_BASE_URL = 'http://localhost:8080/api/auth';

// ==== API Functions ====
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro no login');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// ==== Utils ====

// 🔹 Normaliza login (email lowercase ou telefone com só dígitos)
function normalizeLogin(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (v.includes('@')) return v.toLowerCase();
  return v.replace(/\D/g, '');
}

// 🔹 Máscara de telefone brasileira
function maskPhoneBR(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

// 🔹 Salva dados de autenticação
function saveAuthData(authResponse) {
  localStorage.setItem('token', authResponse.token);
  localStorage.setItem('usuarioLogado', JSON.stringify({
    id: authResponse.id,
    nome: authResponse.nome,
    login: authResponse.login,
    tipo: authResponse.tipo,
    loginType: authResponse.loginType
  }));
}

// 🔹 Redireciona baseado no tipo de usuário
function redirectByUserType(tipo) {
  const routes = {
    'gerente': '/docs/Visão%20Dono/aInicio/index.html',
    'barbeiro': '/docs/Visão%20Barbeiro/Agendamentos/Agen.html',
    'cliente': '/docs/Visão%20Cliente/bInicio/Inicio.html'
  };

  const url = routes[tipo.toLowerCase()] || '/index.html';
  window.location.href = url;
}

// ==== Lógica do Login ====
document.addEventListener('DOMContentLoaded', () => {
  const loginInput = document.getElementById('loginInput');
  const passwordInput = document.getElementById('senhaInput');
  const loginBtn = document.querySelector('.login-btn');

  if (!loginInput || !passwordInput || !loginBtn) {
    console.error('Elementos do formulário não encontrados!');
    return;
  }

  // 🔹 Máscara dinâmica no input
  loginInput.addEventListener('input', () => {
    let val = loginInput.value.trim();

    if (!val) {
      loginInput.value = '';
      return;
    }

    if (val.includes('@')) {
      loginInput.dataset.type = 'email';
      loginInput.setAttribute('inputmode', 'email');
      loginInput.maxLength = 254;
      loginInput.value = val;
      return;
    }

    if (/^[\d()\s\-]*$/.test(val)) {
      const digits = val.replace(/\D/g, '');
      loginInput.dataset.type = 'phone';
      loginInput.setAttribute('inputmode', 'tel');
      loginInput.maxLength = 16;
      loginInput.value = maskPhoneBR(digits);
    } else {
      loginInput.dataset.type = 'email';
      loginInput.setAttribute('inputmode', 'email');
      loginInput.maxLength = 254;
      loginInput.value = val;
    }
  });

  // 🔹 Ao clicar em login
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const rawLogin = loginInput.value.trim();
    const senha = passwordInput.value;

    if (!rawLogin || !senha) {
      alert('Preencha todos os campos.');
      return;
    }

    const loginKey = normalizeLogin(rawLogin);
    if (!loginKey) {
      alert('Email ou telefone inválido.');
      return;
    }

    // Dados para enviar à API
    const credentials = {
      login: loginKey,
      senha: senha
    };

    // Desabilitar botão e mostrar loading
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';

    try {
      // 🔥 Chamar API de login
      const response = await loginUser(credentials);
      
      // Salvar dados de autenticação
      saveAuthData(response);
      
      // ✅ Login OK
      console.log('Login realizado com sucesso:', response);

      // 🔹 Redirecionamento baseado no tipo
      redirectByUserType(response.tipo);
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Mostrar erro específico baseado na mensagem
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.message.includes('Credenciais inválidas')) {
        errorMessage = 'Email/telefone ou senha incorretos.';
      } else if (error.message.includes('não encontrado')) {
        errorMessage = 'Conta não encontrada.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
      }
      
      alert(errorMessage);
      
      // Restaurar botão
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
    }
  });

  // 🔹 Enter para fazer login
  [loginInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginBtn.click();
      }
    });
  });
});