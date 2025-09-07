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

// 🔹 Carrega funcionários do LocalStorage
function loadFuncionarios() {
  return JSON.parse(localStorage.getItem('funcionarios') || '[]');
}

// 🔹 Salva usuários
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// 🔹 Garante que apenas o gerente fixo e cliente Kelly existam
function seedUsuarios() {
  let users = loadUsers();
  
  // Remove barbeiros fixos antigos se existirem
  users = users.filter(u => u.tipo !== "barbeiro" || !u.id?.startsWith("barbeiro"));

  // Adiciona o gerente fixo se não existir
  const gerenteExiste = users.find(u => u.tipo === "gerente" && u.login === "joaov@barbearia.com");
  if (!gerenteExiste) {
    users.push({
      nome: "CEO João", 
      login: "joaov@barbearia.com", 
      senha: "123456", 
      tipo: "gerente", 
      id: "gerente1"
    });
  }

  // Adiciona a cliente Kelly se não existir
  const kellyExiste = users.find(u => u.tipo === "cliente" && u.login === "kelly@cliente.com");
  if (!kellyExiste) {
    users.push({
      nome: "Kelly", 
      login: "kelly@cliente.com", 
      senha: "123456", 
      tipo: "cliente", 
      id: "cliente_kelly"
    });
  }

  saveUsers(users);
}

// 🔹 Busca usuário no sistema (users + funcionários)
function buscarUsuario(loginNormalizado) {
  // 1. Busca nos usuários (gerente e clientes)
  const users = loadUsers();
  let usuario = users.find(u => normalizeLogin(u.login) === loginNormalizado);
  
  if (usuario) return usuario;

  // 2. Busca nos funcionários (barbeiros dinâmicos)
  const funcionarios = loadFuncionarios();
  const funcionario = funcionarios.find(f => 
    f.situacao === "Ativo" && normalizeLogin(f.email) === loginNormalizado
  );

  if (funcionario) {
    // Converte funcionário para formato de usuário
    return {
      id: funcionario.id,
      nome: funcionario.nome,
      login: funcionario.email,
      senha: funcionario.senha,
      tipo: "barbeiro", // Funcionários ativos são barbeiros
      dataCadastro: funcionario.dataCadastro,
      situacao: funcionario.situacao
    };
  }

  return null;
}

// ==== Lógica do Login ====
document.addEventListener('DOMContentLoaded', () => {
  seedUsuarios(); // garante gerente e cliente Kelly no LocalStorage

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

    // 🔥 Busca usuário no sistema integrado
    const user = buscarUsuario(loginKey);

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
      window.location.href = "/docs/Visão%20Barbeiro/Agendamentos/Agen.html";
    } else if (user.tipo === "gerente") {
      window.location.href = "/docs/Visão%20Dono/aInicio/index.html";
    } else {
      // Debug: vamos ver onde estamos tentando ir
      const clientPath = "/docs/Visão%20Cliente/bInicio/Inicio.html";
      console.log("Tentando redirecionar cliente para:", clientPath);
      alert("Redirecionando para: " + clientPath); // temporário para debug
      window.location.href = clientPath;
    }
  });

  // 🔹 Debug: mostra usuários disponíveis no console (remover em produção)
  console.log("Usuários:", loadUsers());
  console.log("Funcionários:", loadFuncionarios());
});