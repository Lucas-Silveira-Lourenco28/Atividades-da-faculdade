const form = document.getElementById('form-aluno');
const tbody = document.getElementById('lista-alunos');
const message = document.getElementById('mensagem');
const idField = document.getElementById('aluno-id');
const title = document.getElementById('titulo-formulario');
const saveButton = document.getElementById('botao-salvar');
const cancelButton = document.getElementById('botao-cancelar');
const searchInput = document.getElementById('busca');
const totalLabel = document.getElementById('total-alunos');
const fields = ['nome', 'cpf', 'email', 'telefone', 'curso', 'periodo'];

// ---------- formatação ----------

function formatarCpf(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  const base = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join('.');
  return d.length > 9 ? `${base}-${d.slice(9)}` : base;
}

function formatarTelefone(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const corte = d.length > 10 ? 5 : 4; // celular tem 9 dígitos, fixo tem 8
  if (resto.length <= corte) return `(${ddd}) ${resto}`;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

document.getElementById('cpf').addEventListener('input', e => {
  e.target.value = formatarCpf(e.target.value);
});
document.getElementById('telefone').addEventListener('input', e => {
  e.target.value = formatarTelefone(e.target.value);
});

// ---------- mensagens e formulário ----------

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function resetForm() {
  form.reset();
  idField.value = '';
  title.textContent = 'Cadastrar aluno';
  saveButton.textContent = 'Cadastrar aluno';
  cancelButton.classList.add('hidden');
}

// ---------- listagem ----------

function createCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function createButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function showEmptyRow(text) {
  tbody.innerHTML = '';
  const row = document.createElement('tr');
  const cell = createCell(text);
  cell.colSpan = 7;
  cell.className = 'empty';
  row.appendChild(cell);
  tbody.appendChild(row);
}

async function loadStudents() {
  const busca = searchInput.value.trim();
  try {
    const response = await fetch(`/api/alunos?busca=${encodeURIComponent(busca)}`);
    const students = await response.json();

    totalLabel.textContent = `${students.length} ${students.length === 1 ? 'aluno' : 'alunos'}`;
    if (!students.length) {
      showEmptyRow(busca ? 'Nenhum aluno encontrado para a busca.' : 'Nenhum aluno cadastrado.');
      return;
    }

    tbody.innerHTML = '';
    students.forEach(student => {
      const row = document.createElement('tr');
      row.append(
        createCell(student.nome),
        createCell(formatarCpf(student.cpf)),
        createCell(student.email),
        createCell(formatarTelefone(student.telefone)),
        createCell(student.curso),
        createCell(student.periodo)
      );

      const actions = document.createElement('div');
      actions.className = 'table-actions';
      actions.append(
        createButton('Editar', 'edit', () => editStudent(student)),
        createButton('Excluir', 'delete', () => deleteStudent(student.id))
      );
      const actionsCell = document.createElement('td');
      actionsCell.appendChild(actions);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });
  } catch (error) {
    showMessage('Não foi possível carregar os alunos. Verifique se o servidor está ativo.', 'error');
  }
}

let buscaTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(loadStudents, 250);
});

// ---------- criar / atualizar ----------

form.addEventListener('submit', async event => {
  event.preventDefault();

  const data = {};
  fields.forEach(field => { data[field] = document.getElementById(field).value.trim(); });

  const id = idField.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/alunos/${id}` : '/api/alunos';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (!response.ok) {
      showMessage(result.erro || 'Não foi possível salvar o cadastro.', 'error');
      return;
    }

    showMessage(id ? 'Cadastro atualizado com sucesso!' : 'Aluno cadastrado com sucesso!', 'success');
    resetForm();
    await loadStudents();
  } catch (error) {
    showMessage('Erro de comunicação com o servidor.', 'error');
  }
});

function editStudent(student) {
  idField.value = student.id;
  fields.forEach(field => { document.getElementById(field).value = student[field]; });
  // CPF e telefone vêm do banco só com números
  document.getElementById('cpf').value = formatarCpf(student.cpf);
  document.getElementById('telefone').value = formatarTelefone(student.telefone);

  title.textContent = 'Editar aluno';
  saveButton.textContent = 'Salvar alterações';
  cancelButton.classList.remove('hidden');
  showMessage('Altere os dados desejados e salve as alterações.', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- excluir ----------

async function deleteStudent(id) {
  if (!window.confirm('Tem certeza de que deseja excluir este aluno?')) return;

  try {
    const response = await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
    const result = await response.json();

    if (!response.ok) {
      showMessage(result.erro || 'Não foi possível excluir o aluno.', 'error');
      return;
    }

    if (idField.value === String(id)) resetForm();
    showMessage('Aluno excluído com sucesso.', 'success');
    await loadStudents();
  } catch (error) {
    showMessage('Erro de comunicação com o servidor.', 'error');
  }
}

cancelButton.addEventListener('click', () => {
  resetForm();
  showMessage('Edição cancelada.', 'success');
});

loadStudents();
