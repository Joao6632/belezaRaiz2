const btnBarbeiro = document.getElementById('barbeiro');
const modal = document.getElementById('modalBarbeiros');
const barbeiroItems = document.querySelectorAll('.barbeiro-list li');

btnBarbeiro.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

barbeiroItems.forEach(item => {
  item.addEventListener('click', () => {
    const nome = item.dataset.nome;
    const foto = item.dataset.foto;

    // Atualiza visualmente o botão com a foto e nome
    btnBarbeiro.innerHTML = `
      <div class="barbeiro-info">
        <img src="${foto}" alt="${nome}" class="barbeiro-foto">
        <span class="barbeiro-nome">${nome}</span>
      </div>
      <div class="arrow">›</div>
    `;

    // Marca como selecionado
    btnBarbeiro.dataset.selected = "true";

    // Fecha o modal
    modal.classList.add('hidden');
  });
});
