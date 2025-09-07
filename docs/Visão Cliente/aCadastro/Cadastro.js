// ==== Storage utils ====
const loadUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const saveUsers = (arr) => localStorage.setItem('users', JSON.stringify(arr));

// Gera UUID simples (substitui crypto.randomUUID)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Normaliza para salvar/validar: email em lowercase OU telefone só dígitos
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
      contatoEl.value = ''; // limpa se vazio, sem '(' na tela
      return;
    }

    if (val.includes('@')) {
      contatoEl.dataset.type = 'email';
      contatoEl.setAttribute('inputmode', 'email');
      contatoEl.maxLength = 254;
      contatoEl.value = val; // mantém email puro
      return;
    }

    if (/^[\d()\s\-]*$/.test(val)) {
      const digits = val.replace(/\D/g, '');
      contatoEl.dataset.type = 'phone';
      contatoEl.setAttribute('inputmode', 'tel');
      contatoEl.maxLength = 16;
      contatoEl.value = maskPhoneBR(digits);
    } else {
      // letras antes do @, deixa passar sem máscara
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = nomeEl.value.trim();
      const contatoRaw = contatoEl.value.trim();
      const senha = senhaEl.value;
      const confirmar = confirmarEl.value;

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

      const users = loadUsers();
      if (users.some(u => u.login === loginKey)) {
        alert('Já existe uma conta com esse email/telefone.');
        return;
      }

      const user = {
        id: generateUUID(),
        nome,
        login: loginKey,
        senha,
        createdAt: Date.now()
      };

      users.push(user);
      saveUsers(users);

      alert('Cadastro realizado com sucesso!');
      window.location.href = '../../../index.html';
    });
  }
});
