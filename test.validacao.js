const test = require('node:test');
const assert = require('node:assert');
const { validarAluno, cpfValido } = require('./src/validacao');

const alunoOk = {
  nome: 'Maria da Silva',
  cpf: '529.982.247-25',
  email: 'Maria@Email.com',
  telefone: '(34) 99999-9999',
  curso: 'Análise e Desenvolvimento de Sistemas',
  periodo: '6º período'
};

test('aceita CPF válido e rejeita inválidos', () => {
  assert.strictEqual(cpfValido('52998224725'), true);
  assert.strictEqual(cpfValido('52998224724'), false);
  assert.strictEqual(cpfValido('11111111111'), false);
  assert.strictEqual(cpfValido('123'), false);
});

test('normaliza os dados de um aluno válido', () => {
  const { aluno, erro } = validarAluno(alunoOk);
  assert.strictEqual(erro, undefined);
  assert.strictEqual(aluno.cpf, '52998224725');
  assert.strictEqual(aluno.telefone, '34999999999');
  assert.strictEqual(aluno.email, 'maria@email.com');
});

test('rejeita campos inválidos', () => {
  assert.ok(validarAluno({ ...alunoOk, nome: 'Maria' }).erro);
  assert.ok(validarAluno({ ...alunoOk, email: 'maria@' }).erro);
  assert.ok(validarAluno({ ...alunoOk, telefone: '123' }).erro);
  assert.ok(validarAluno({ ...alunoOk, periodo: '11º período' }).erro);
  assert.ok(validarAluno(undefined).erro);
});
