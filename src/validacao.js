const PERIODOS = Array.from({ length: 10 }, (_, i) => `${i + 1}º período`);

function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

// confere os dois dígitos verificadores do CPF
function cpfValido(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(cpf[tamanho])) return false;
  }
  return true;
}

// devolve { erro } se algo estiver errado ou { aluno } com os dados já tratados
function validarAluno(dados) {
  const entrada = dados || {};
  const texto = campo => (typeof entrada[campo] === 'string' ? entrada[campo].trim() : '');

  const aluno = {
    nome: texto('nome'),
    cpf: somenteDigitos(entrada.cpf),
    email: texto('email').toLowerCase(),
    telefone: somenteDigitos(entrada.telefone),
    curso: texto('curso'),
    periodo: texto('periodo')
  };

  for (const [campo, valor] of Object.entries(aluno)) {
    if (!valor) return { erro: `O campo ${campo} é obrigatório.` };
  }

  if (aluno.nome.length > 120 || aluno.nome.split(/\s+/).length < 2) {
    return { erro: 'Informe o nome completo (nome e sobrenome).' };
  }
  if (!cpfValido(aluno.cpf)) {
    return { erro: 'Informe um CPF válido.' };
  }
  if (aluno.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(aluno.email)) {
    return { erro: 'Informe um e-mail válido.' };
  }
  if (aluno.telefone.length < 10 || aluno.telefone.length > 11) {
    return { erro: 'Informe um telefone válido com DDD.' };
  }
  if (aluno.curso.length > 100) {
    return { erro: 'O nome do curso deve ter no máximo 100 caracteres.' };
  }
  if (!PERIODOS.includes(aluno.periodo)) {
    return { erro: 'Selecione um período válido.' };
  }

  return { aluno };
}

module.exports = { validarAluno, cpfValido, somenteDigitos };
