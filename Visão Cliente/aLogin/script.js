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

// 🔹 Carrega usuários do LocalStorage
function loadUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

// 🔹 Salva usuários
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// 🔹 Garante que barbeiros fixos existam
function seedBarbeiros() {
  let users = loadUsers();
  if (users.some(u => u.tipo === "barbeiro")) return;

  users.push(
    { nome: "Silvio Santos", login: "silvio@barbearia.com", senha: "123456", tipo: "barbeiro", id: "barbeiro1" },
    { nome: "Alex Silveira", login: "alex@barbearia.com", senha: "123456", tipo: "barbeiro", id: "barbeiro2" },
    { nome: "Daniel Zolin", login: "daniel@barbearia.com", senha: "123456", tipo: "barbeiro", id: "barbeiro3" },
    { nome: "CEO João", login: "joaov@barbearia.com", senha: "123456", tipo: "gerente", id: "gerente1" },
  );

  saveUsers(users);
}

// ==== Lógica do Login ====
document.addEventListener('DOMContentLoaded', () => {
  seedBarbeiros(); // garante barbeiros no LocalStorage

  const loginInput = document.getElementById('loginInput');
  const passwordInput = document.getElementById('senhaInput');
  const loginBtn = document.querySelector('.login-btn');

  if (!loginInput || !passwordInput || !loginBtn) return;

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
    const user = users.find(u => normalizeLogin(u.login) === loginKey);

    if (!user) {
      alert('Conta não encontrada.');
      return;
    }

    if (user.senha !== senha) {
      alert('Senha incorreta.');
      return;
    }

    // ✅ Login OK
    alert(`Bem-vindo, ${user.nome}!`);
    localStorage.setItem("usuarioLogado", JSON.stringify(user));

    // 🔹 Redirecionamento baseado no tipo
    if (user.tipo === "barbeiro") {
      window.location.href = "../../Visão Barbeiro/Agendamentos/Agen.html";
    } else if (user.tipo === "gerente") {
      window.location.href = "../../Visão Dono/aInicio/index.html"; // ajuste a rota que quiser
    } else {
      window.location.href = "../bInicio/inicio.html"; // cliente ou outro tipo
    }
  });
});
