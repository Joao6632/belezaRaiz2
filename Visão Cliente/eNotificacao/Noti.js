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
  
      // Define cor do status
      let corStatus;
      switch (agendamento.status) {
        case 'pendente':
          corStatus = 'red';
          break;
        case 'confirmado':
          corStatus = '#007bff';
          break;
        case 'realizado':
          corStatus = 'green';
          break;
        case 'cancelado':
          corStatus = 'gray';
          break;
        default:
          corStatus = 'black';
      }
  
      div.innerHTML = `
        <img src="${agendamento.imagem || 'https://via.placeholder.com/80'}" alt="Serviço" class="agendamento-img">
        <div class="agendamento-info">
          <strong>${agendamento.titulo} - ${agendamento.barbeiro}</strong><br>
          Duração: ${agendamento.duracao}<br>
          Data: ${agendamento.data}<br>
          Horário: ${agendamento.horario}<br>
          Status: <span style="color: ${corStatus}; font-weight: bold">${agendamento.status}</span>
        </div>
      `;
  
      notificacoesContainer.appendChild(div);
    });
  });
  