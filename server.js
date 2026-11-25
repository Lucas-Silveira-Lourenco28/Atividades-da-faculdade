const express = require('express');
const path = require('path');
const db = require('./src/database');
const { validarAluno, somenteDigitos } = require('./src/validacao');

const app = express();
const PORT = process.env.PORT || 3000;
const COLUNAS = 'id, nome, cpf, email, telefone, curso, periodo';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// valida o :id uma vez só para todas as rotas que usam
app.param('id', (req, res, next, valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  req.alunoId = id;
  next();
});

function responderErro(res, error, acao) {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ erro: 'Já existe um aluno cadastrado com esse CPF.' });
  }
  console.error(error);
  res.status(500).json({ erro: `Não foi possível ${acao} o aluno.` });
}

// READ: lista os alunos, com busca opcional por nome, CPF, e-mail ou curso.
app.get('/api/alunos', (req, res) => {
  const busca = String(req.query.busca || '').trim();
  const digitos = somenteDigitos(busca);

  const alunos = db.prepare(`
    SELECT ${COLUNAS} FROM alunos
    WHERE nome LIKE @termo OR email LIKE @termo OR curso LIKE @termo
       OR (@digitos != '' AND cpf LIKE @digitos)
    ORDER BY nome COLLATE NOCASE
  `).all({ termo: `%${busca}%`, digitos: digitos ? `%${digitos}%` : '' });

  res.json(alunos);
});

// READ: consulta um aluno pelo ID.
app.get('/api/alunos/:id', (req, res) => {
  const aluno = db.prepare(`SELECT ${COLUNAS} FROM alunos WHERE id = ?`).get(req.alunoId);
  if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  res.json(aluno);
});

// CREATE: cadastra um aluno.
app.post('/api/alunos', (req, res) => {
  const { aluno, erro } = validarAluno(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const result = db.prepare(`
      INSERT INTO alunos (nome, cpf, email, telefone, curso, periodo)
      VALUES (@nome, @cpf, @email, @telefone, @curso, @periodo)
    `).run(aluno);
    const criado = db.prepare(`SELECT ${COLUNAS} FROM alunos WHERE id = ?`).get(result.lastInsertRowid);
    res.status(201).json(criado);
  } catch (error) {
    responderErro(res, error, 'cadastrar');
  }
});

// UPDATE: atualiza os dados de um aluno.
app.put('/api/alunos/:id', (req, res) => {
  const { aluno, erro } = validarAluno(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const result = db.prepare(`
      UPDATE alunos
      SET nome = @nome, cpf = @cpf, email = @email,
          telefone = @telefone, curso = @curso, periodo = @periodo
      WHERE id = @id
    `).run({ ...aluno, id: req.alunoId });

    if (!result.changes) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json(db.prepare(`SELECT ${COLUNAS} FROM alunos WHERE id = ?`).get(req.alunoId));
  } catch (error) {
    responderErro(res, error, 'atualizar');
  }
});

// DELETE: remove um aluno.
app.delete('/api/alunos/:id', (req, res) => {
  const result = db.prepare('DELETE FROM alunos WHERE id = ?').run(req.alunoId);
  if (!result.changes) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  res.json({ mensagem: 'Aluno excluído com sucesso.' });
});

// qualquer erro que escapar das rotas (ex.: JSON malformado) volta em JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => console.log(`Sistema disponível em http://localhost:${PORT}`));
