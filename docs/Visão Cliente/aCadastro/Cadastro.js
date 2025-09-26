// ==== API Configuration ====
const API_BASE_URL = 'http://localhost:8080/api/auth';

// ==== API Functions ====
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro no cadastro');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Normaliza para enviar para API: email em lowercase OU telefone só dígitos
function normalizeLogin(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (v.includes('@')) return v.toLowerCase();
  return v.replace(/\D/g, '');
}

// Máscara brasileira dinâmica para telefone
function maskPhoneBR(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 11); // até 11 dígitos
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; // 11 dígitos
}

// Salvar token no localStorage
function saveAuthData(authResponse) {
  localStorage.setItem('token', authResponse.token);
  localStorage.setItem('user', JSON.stringify({
    id: authResponse.id,
    nome: authResponse.nome,
    login: authResponse.login,
    tipo: authResponse.tipo,
    loginType: authResponse.loginType
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCadastro');
  const nomeEl = document.getElementById('nome');
  const contatoEl = document.getElementById('contato');
  const senhaEl = document.getElementById('senha');
  const confirmarEl = document.getElementById('confirmarSenha');

  function applyContatoMask() {
    let val = contatoEl.value || '';
    val = val.trim();

    if (!val) {
      contatoEl.value = '';
      return;
    }

    if (val.includes('@')) {
      contatoEl.dataset.type = 'email';
      contatoEl.setAttribute('inputmode', 'email');
      contatoEl.maxLength = 254;
      contatoEl.value = val;
      return;
    }

    if (/^[\d()\s\-]*$/.test(val)) {
      const digits = val.replace(/\D/g, '');
      contatoEl.dataset.type = 'phone';
      contatoEl.setAttribute('inputmode', 'tel');
      contatoEl.maxLength = 16;
      contatoEl.value = maskPhoneBR(digits);
    } else {
      contatoEl.dataset.type = 'email';
      contatoEl.setAttribute('inputmode', 'email');
      contatoEl.maxLength = 254;
      contatoEl.value = val;
    }
  }

  if (contatoEl) {
    applyContatoMask();
    contatoEl.addEventListener('input', applyContatoMask);
    contatoEl.addEventListener('blur', applyContatoMask);
    contatoEl.addEventListener('paste', () => setTimeout(applyContatoMask, 0));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = nomeEl.value.trim();
      const contatoRaw = contatoEl.value.trim();
      const senha = senhaEl.value;
      const confirmar = confirmarEl.value;

      // Validações frontend
      if (!nome || !contatoRaw || !senha || !confirmar) {
        alert('Preencha todos os campos.');
        return;
      }
      if (senha.length < 6) {
        alert('Senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (senha !== confirmar) {
        alert('As senhas não coincidem.');
        return;
      }

      const loginKey = normalizeLogin(contatoRaw);
      if (!loginKey) {
        alert('Informe um email ou telefone válido.');
        return;
      }

      if (contatoRaw.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contatoRaw)) {
          alert('Email inválido.');
          return;
        }
      } else {
        if (loginKey.length < 10) {
          alert('Telefone inválido. Use DDD + número.');
          return;
        }
      }

      // Dados para enviar à API
      const userData = {
        nome: nome,
        login: loginKey,
        senha: senha
      };

      // Desabilitar botão e mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Cadastrando...';

      try {
        // Chamar API
        const response = await registerUser(userData);
        
        // Salvar dados de autenticação
        saveAuthData(response);
        
        // Sucesso
        alert('Cadastro realizado com sucesso!');
        
        // Redirecionar baseado no tipo de usuário
        if (response.tipo === 'cliente') {
          window.location.href = '../../../index.html'; // ou página do cliente
        } else if (response.tipo === 'gerente') {
          window.location.href = '../../../gerente/dashboard.html'; // página do gerente
        } else if (response.tipo === 'barbeiro') {
          window.location.href = '../../../barbeiro/dashboard.html'; // página do barbeiro
        }
        
      } catch (error) {
        console.error('Erro no cadastro:', error);
        alert(error.message || 'Erro ao realizar cadastro. Tente novamente.');
        
        // Restaurar botão
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});