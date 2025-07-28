// --- BARBEIRO ---
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

    btnBarbeiro.innerHTML = `
      <div class="barbeiro-info">
        <img src="${foto}" alt="${nome}" class="barbeiro-foto">
        <span class="barbeiro-nome">${nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
    btnBarbeiro.dataset.selected = "true";
    modal.classList.add('hidden');
  });
});

// --- SERVIÇOS ---
const btnServico = document.getElementById('servico');
const modalServicos = document.getElementById('modalServicos');
const servicoItems = document.querySelectorAll('.servico-card');
const modalServicoDetalhe = document.getElementById('modalServicoDetalhe');

const detalheTitulo = document.getElementById('detalheTitulo');
const detalheImg = document.getElementById('detalheImg');
const detalheDescricao = document.getElementById('detalheDescricao');
const detalhePreco = document.getElementById('detalhePreco');
const detalheDuracao = document.getElementById('detalheDuracao');

const cancelarServico = document.getElementById('cancelarServico');
const confirmarServico = document.getElementById('confirmarServico');

let servicoSelecionado = null;

btnServico.addEventListener('click', () => {
  modalServicos.classList.remove('hidden');
});

servicoItems.forEach(item => {
  item.addEventListener('click', () => {
    servicoSelecionado = item;

    detalheTitulo.textContent = item.dataset.nome;
    detalheImg.src = `../../imagens/${item.dataset.img}`;
    detalheDescricao.textContent = item.dataset.descricao;
    detalhePreco.textContent = item.dataset.preco;
    detalheDuracao.textContent = item.dataset.duracao;

    modalServicos.classList.add('hidden');
    modalServicoDetalhe.classList.remove('hidden');
  });
});

cancelarServico.addEventListener('click', () => {
  modalServicoDetalhe.classList.add('hidden');
  modalServicos.classList.remove('hidden');
});

confirmarServico.addEventListener('click', () => {
  if (servicoSelecionado) {
    const nome = servicoSelecionado.dataset.nome;
    const img = servicoSelecionado.dataset.img;

    btnServico.innerHTML = `
      <div class="servico-info">
        <img src="../../imagens/${img}" alt="${nome}" class="servico-foto">
        <span class="servico-nome">${nome}</span>
      </div>
      <div class="arrow">›</div>
    `;
    btnServico.dataset.selected = "true";
  }
  modalServicoDetalhe.classList.add('hidden');
});

// --- HORÁRIO ---
const btnHorario = document.getElementById("horario");
const modalCalendario = document.getElementById("modalCalendario");
const modalHorarios = document.getElementById("modalHorarios");
const listaHorarios = document.getElementById("listaHorarios");
const btnAgendar = document.querySelector(".btn-agendar");

let dataSelecionada = null;
let horaSelecionada = null;

// horários ocupados ficam salvos como "DD/MM-HH:MM"
let horariosIndisponiveis = ["27/07-13h30", "27/07-15h00"];

const horariosDisponiveis = [
  "11h30","12h00","12h30","13h00","13h30",
  "14h00","14h30","15h00","15h30","16h00","16h30"
];

// 🔹 Configura input de data (min = hoje)
const inputData = document.getElementById("dataEscolhida");
const hoje = new Date().toISOString().split("T")[0];
inputData.min = hoje;

// 🔹 Abre modal calendário
btnHorario.addEventListener("click", () => {
  modalCalendario.classList.remove("hidden");
});

// 🔹 Função chamada ao clicar OK no calendário
function abrirHorarios() {
  const dataInput = inputData.value;
  if (!dataInput) {
    alert("Selecione uma data válida!");
    return;
  }

  // Converte para formato DD/MM (sem ano)
  const [ano, mes, dia] = dataInput.split("-");
  dataSelecionada = `${dia}/${mes}`;

  // Fecha calendário e abre horários
  modalCalendario.classList.add("hidden");
  carregarHorarios();
  modalHorarios.classList.remove("hidden");
}

// 🔹 Carrega botões de horários
function carregarHorarios() {
  listaHorarios.innerHTML = "";
  horariosDisponiveis.forEach(h => {
    const btn = document.createElement("button");
    btn.innerText = h;
    btn.classList.add("horario-btn");

    if (horariosIndisponiveis.includes(`${dataSelecionada}-${h}`)) {
      btn.disabled = true;
      btn.classList.add("indisponivel");
    } else {
      btn.addEventListener("click", () => selecionarHorario(h));
    }

    listaHorarios.appendChild(btn);
  });
}

// 🔹 Quando usuário escolhe um horário
function selecionarHorario(hora) {
  horaSelecionada = hora;
  modalHorarios.classList.add("hidden");

  // ✅ Mostra data/hora selecionada em negrito
  btnHorario.querySelector("span").innerHTML = `<b>Dia ${dataSelecionada} às ${horaSelecionada}</b>`;
  btnHorario.dataset.selected = "true";
}

// 🔹 Confirmar agendamento → bloqueia horário escolhido
btnAgendar.addEventListener("click", () => {
  if (!dataSelecionada || !horaSelecionada) {
    alert("Selecione a data e o horário antes de agendar!");
    return;
  }
  horariosIndisponiveis.push(`${dataSelecionada}-${horaSelecionada}`);
  alert("✅ Agendamento confirmado!");
});

// 🔹 Função para fechar modal
function fecharModal(id) {
  document.getElementById(id).classList.add("hidden");
}
