# Sistema de Controle de Estacionamento — EstACME

Sistema de controle de estacionamento desenvolvido em JavaScript como projeto da disciplina de Programação Orientada a Objetos.

O projeto implementa diferentes categorias de clientes, regras de cobrança, controle de entrada e saída de veículos, persistência de dados em arquivos CSV, relatórios gerenciais e interface de terminal.

## Funcionalidades

O sistema permite:

- cadastrar clientes;
- cadastrar e remover placas;
- controlar entrada e saída de veículos;
- consultar a situação do estacionamento;
- identificar veículos e clientes bloqueados;
- controlar créditos de estudantes;
- controlar débitos e inadimplência de empresas;
- bloquear clientes avulsos que se recusam a realizar o pagamento;
- aplicar desconto para clientes avulsos frequentes;
- gerar relatórios gerenciais;
- carregar dados de arquivos CSV na inicialização;
- salvar automaticamente os dados ao encerrar o sistema.

## Tipos de cliente

### Professor

- Pode cadastrar até duas placas.
- Não paga pelo estacionamento.
- Apenas um de seus veículos pode permanecer no estacionamento por vez.

### Estudante

- Pode cadastrar uma placa.
- Utiliza sistema pré-pago.
- É cobrado por ingresso.
- Caso permaneça após a meia-noite, um novo ingresso é cobrado.
- Pode ficar com saldo negativo na saída, mas novas entradas ficam bloqueadas até a regularização.

### Empresa

- Pode cadastrar vários veículos.
- Os veículos podem permanecer simultaneamente no estacionamento.
- A cobrança é feita por diária.
- Permanências após a meia-noite geram multa.
- Os valores são acumulados como débito da empresa.
- Empresas inadimplentes ficam impedidas de utilizar o estacionamento.

### Cliente avulso

- É identificado exclusivamente pela placa.
- Possui cobrança por hora até o limite definido pelo sistema.
- Acima desse período, é aplicada a diária.
- Atravessar a meia-noite gera uma nova diária.
- A recusa de pagamento bloqueia a placa para futuras entradas.
- Clientes frequentes podem receber desconto automático.

## Tecnologias e conceitos utilizados

- JavaScript
- Node.js
- Programação Orientada a Objetos
- Herança
- Encapsulamento
- Classes e métodos privados
- `Map`
- `Set`
- Persistência em CSV
- Tratamento de exceções
- Interface de terminal
- Testes automatizados com `node:assert`

## Estrutura do projeto

```text
estacionamento/
├── dados/
│   ├── clientes.csv
│   ├── registros.csv
│   └── inadimplentes.csv
│
├── App.js
├── CadastroCliente.js
├── Cliente.js
├── Empresa.js
├── Estudante.js
├── InterfaceUsuario.js
├── Professor.js
├── RegistroEntradasSaidas.js
├── RelatoriosGerenciais.js
├── TicketEstacionamento.js
├── main.js
│
├── testeCobrancas.js
├── testeBloqueios.js
├── testeCadastros.js
│
├── package.json
└── package-lock.json
```

## Como executar

É necessário ter o Node.js e o npm instalados.

Clone o repositório e acesse a pasta do projeto:

```bash
git clone URL_DO_REPOSITORIO
cd NOME_DO_REPOSITORIO
```

Instale as dependências:

```bash
npm install
```

Execute o sistema:

```bash
npm start
```

## Testes

Para executar todos os testes automatizados:

```bash
npm test
```

Também é possível executar cada grupo individualmente:

```bash
npm run test:cobrancas
npm run test:bloqueios
npm run test:cadastros
```

Os testes verificam regras de cobrança, bloqueios, limites de placas, duplicidades e operações de cadastro.

## Persistência

Os dados são armazenados na pasta `dados/`.

- `clientes.csv`: cadastro de clientes, placas, saldos e débitos;
- `registros.csv`: histórico de entradas e saídas do estacionamento;
- `inadimplentes.csv`: empresas marcadas como inadimplentes.

Os arquivos são carregados quando o sistema é iniciado e atualizados quando os dados são salvos.

## Relatórios gerenciais

O sistema possui relatórios para:

- valor arrecadado por período e categoria;
- situação de clientes cadastrados;
- histórico de estacionamento de clientes cadastrados;
- histórico de clientes avulsos;
- clientes impedidos de entrar;
- clientes mais frequentes do ano.

## Contexto acadêmico

Projeto desenvolvido para a disciplina de **Programação Orientada a Objetos**, do curso de Análise e Desenvolvimento de Sistemas da PUCRS.

O objetivo do projeto foi aplicar conceitos de orientação a objetos na implementação de um sistema completo, incluindo regras de negócio, estruturas de dados, persistência, interface com o usuário e relatórios.