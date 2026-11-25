# Sistema Acadêmico – Cadastro de Alunos

Projeto acadêmico de CRUD desenvolvido com JavaScript (Node.js), Express, SQLite, HTML e CSS.

## Funcionalidades

- **Create:** cadastrar aluno.
- **Read:** listar alunos, buscar por nome, CPF, e-mail ou curso e consultar um registro pela API.
- **Update:** editar dados de um aluno.
- **Delete:** excluir um aluno (com confirmação).

O formulário possui seis campos: nome completo, CPF, e-mail, telefone, curso e período.

### Validações

- CPF com verificação dos dígitos verificadores e máscara automática; é único no banco de dados.
- Telefone com DDD (10 ou 11 dígitos) e máscara automática.
- E-mail em formato válido, nome com sobrenome e período dentro da lista de opções.
- Todas as validações são feitas no servidor, não só no navegador.
- CPF e telefone são salvos apenas com números e formatados na exibição.

## Requisitos

- Node.js 18 ou superior (recomendado 20+).
- npm.

## Como executar

1. Abra o terminal na pasta do projeto.
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm start`
4. Acesse `http://localhost:3000` no navegador.

O arquivo do banco SQLite é criado automaticamente na pasta `data` na primeira execução.

Para rodar os testes de validação: `npm test`

## Rotas da API

| Método | Rota | Ação |
|---|---|---|
| GET | `/api/alunos` | Lista os alunos (aceita `?busca=termo`) |
| GET | `/api/alunos/:id` | Consulta um aluno pelo ID |
| POST | `/api/alunos` | Cadastra um aluno |
| PUT | `/api/alunos/:id` | Atualiza um aluno |
| DELETE | `/api/alunos/:id` | Exclui um aluno |

Códigos de resposta: `200`/`201` sucesso, `400` dados inválidos, `404` aluno não encontrado, `409` CPF já cadastrado.

## Estrutura

```text
sistema-academico-crud/
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── src/
│   ├── database.js
│   └── validacao.js
├── .gitignore
├── package.json
├── README.md
├── server.js
└── test.validacao.js
```

## Observação

Projeto demonstrativo para fins acadêmicos. Para uso real em uma instituição, seriam necessários autenticação, controle de permissões, proteção de dados pessoais, backups e validações adicionais.
