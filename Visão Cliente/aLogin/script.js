// Reusa a normalização igual no cadastro
function normalizeLogin(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (v.includes('@')) return v.toLowerCase();
  return v.replace(/\D/g, '');
}

function loadUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.login-btn');
  const inputs = document.querySelectorAll('.input-field input');

  if (!loginBtn || inputs.length < 2) return;

  const loginInput = inputs[0];
  const passwordInput = inputs[1];

  loginBtn.addEventListener('click', (e) => {
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

    const users = loadUsers();
    const user = users.find(u => u.login === loginKey);

    if (!user) {
      alert('Conta não encontrada.');
      return;
    }

    if (user.senha !== senha) {
      alert('Senha incorreta.');
      return;
    }

    // Login OK, redireciona para a página inicial ou dashboard
    alert(`Bem-vindo, ${user.nome}!`);
    localStorage.setItem('loggedUserName', user.nome);
    window.location.href = '../bInicio/inicio.html';
  });
});
