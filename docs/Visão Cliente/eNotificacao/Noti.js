document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const notificacoesContainer = document.getElementById('notificacoes');
  
    if (!usuarioLogado) {
      notificacoesContainer.innerHTML = '<p>Usuário não logado.</p>';
      return;
    }
  
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
  
    const agendamentosDoUsuario = agendamentos.filter(agendamento => {
      return agendamento.usuarioId === usuarioLogado.id;
    });
  
    if (agendamentosDoUsuario.length === 0) {
      notificacoesContainer.innerHTML = '<p>Sem notificações por enquanto.</p>';
      return;
    }
  
    agendamentosDoUsuario.forEach(agendamento => {
      const div = document.createElement('div');
      div.classList.add('card-agendamento');
  
      // Cria span com classe de status
      const statusSpan = document.createElement('span');
      statusSpan.classList.add('status'); // base
      statusSpan.classList.add(`status-${agendamento.status}`); // ex: status-pendente
      statusSpan.textContent = agendamento.status;
  
      div.innerHTML = `
        <img src="${agendamento.imagem || 'https://via.placeholder.com/80'}" alt="Serviço" class="agendamento-img">
        <div class="agendamento-info">
          <strong>${agendamento.titulo} - ${agendamento.barbeiro}</strong><br>
          Duração: ${agendamento.duracao}<br>
          Data: ${agendamento.data}<br>
          Horário: ${agendamento.horario}<br>
          Status: 
        </div>
      `;
  
      // Adiciona o span de status depois do "Status: "
      const infoDiv = div.querySelector('.agendamento-info');
      infoDiv.appendChild(statusSpan);
  
      notificacoesContainer.appendChild(div);
    });
  });
  