document.addEventListener('DOMContentLoaded', () => {
  let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  const editarBtn = document.getElementById('editar-nome');
  const nomeUsuarioEl = document.getElementById('nome-usuario');


  // JS PARA MODIFICAR O NOME

  // Exibe o nome no DOM
  function mostrarNome() {
    if (usuarioLogado && usuarioLogado.nome) {
      nomeUsuarioEl.textContent = usuarioLogado.nome;
    } else {
      nomeUsuarioEl.textContent = 'Usuário';
    }
  }

  mostrarNome();

  editarBtn.addEventListener('click', () => {
    const nomeAtual = nomeUsuarioEl.textContent;

    // Cria input para editar nome
    const input = document.createElement('input');
    input.type = 'text';
    input.value = nomeAtual;
    input.classList.add('form-control');
    input.style.maxWidth = '150px';

    // Esconde o <strong>, adiciona o input no lugar
    nomeUsuarioEl.style.display = 'none';
    nomeUsuarioEl.parentElement.insertBefore(input, nomeUsuarioEl);

    input.focus();

    function salvarNome() {
      const novoNome = input.value.trim() || 'Usuário';

      // Atualiza localStorage usuarioLogado
      usuarioLogado.nome = novoNome;
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

      // Atualiza lista users
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const index = users.findIndex(
        (user) => user.login === usuarioLogado.login
      );
      if (index !== -1) {
        users[index].nome = novoNome;
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Atualiza texto e mostra <strong> de novo
      nomeUsuarioEl.textContent = novoNome;
      nomeUsuarioEl.style.display = '';
      input.remove();
    }

    input.addEventListener('blur', salvarNome);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        salvarNome();
      }
    });
  });
});

// FINALIZA O JS DO "NOME"

// JS PARA MODIFICAR O E-MAIL
