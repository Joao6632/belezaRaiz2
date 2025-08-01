// 🔹 Normaliza login (igual ao seu código original)
function normalizeLogin(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (v.includes('@')) return v.toLowerCase();
  return v.replace(/\D/g, '');
}

// 🔹 Carrega usuários salvos
function loadUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

// 🔹 Garante que os barbeiros fixos existam no LocalStorage
function seedBarbeiros() {
  let users = loadUsers();

  // Evita duplicar barbeiros se já estiverem cadastrados
  if (users.some(u => u.tipo === "barbeiro")) return;

  // Adiciona os 3 barbeiros fixos
  users.push(
    { nome: "Silvio Santos", login: "silvio@barbearia.com", senha: "123456", tipo: "barbeiro", id: "barbeiro1" },
    { nome: "Alex Silveira", login: "alex@barbearia.com", senha: "123456", tipo: "barbeiro", id: "barbeiro2" },
    { nome: "Daniel Zolin", login: "daniel@barbearia.com", senha: "123456", tipo: "barbeiro", id: "barbeiro3" }
  );

  localStorage.setItem("users", JSON.stringify(users));
}

seedBarbeiros(); // 🔥 garante que barbeiros estão cadastrados

// 🔹 Evento do botão de login
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

    // ✅ Login OK
    alert(`Bem-vindo, ${user.nome}!`);

    // 🔹 Salva todos os dados do usuário logado
    localStorage.setItem("usuarioLogado", JSON.stringify(user));

    // 🔹 Redireciona baseado no tipo
    if (user.tipo === "barbeiro") {
      window.location.href = "../../Visão Barbeiro/Agendamentos/Agen.html";
    } else {
      window.location.href = "../bInicio/inicio.html";
    }
  });
});
