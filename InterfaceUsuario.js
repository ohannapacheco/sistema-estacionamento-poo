import promptSync from "prompt-sync";

import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";

export class InterfaceUsuario {
  #app;
  #prompt;
  #executando;

  constructor(app) {
    this.#app = app;

    this.#prompt = promptSync({
      sigint: false
    });

    this.#executando = true;
  }

  #mostrarMenuPrincipal() {
    console.log("\n==============================");
    console.log("       ESTACME");
    console.log("==============================");
    console.log("1 - Clientes");
    console.log("2 - Entrada de veículo");
    console.log("3 - Saída de veículo");
    console.log("4 - Consultas");
    console.log("5 - Relatórios");
    console.log("0 - Sair");
  
    console.log("==============================");
  }

  #menuClientes() {
    let noMenuClientes = true;
  
    while (noMenuClientes) {
      console.log("\n==============================");
      console.log("          CLIENTES");
      console.log("==============================");
      console.log("1 - Cadastrar cliente");
      console.log("2 - Adicionar placa");
      console.log("3 - Remover placa");
      console.log("4 - Consultar cliente");
      console.log("5 - Listar clientes");
      console.log("6 - Adicionar créditos ao estudante");
      console.log("7 - Operações de empresa");
      console.log("0 - Voltar");
      console.log("==============================");
  
      const opcao = this.#lerEntrada(
        "Escolha uma opção: "
      );
  
      switch (opcao) {
        case "1":
            this.#cadastrarCliente();
            break;
         
  
        case "2":
            this.#adicionarPlaca();
            break;
  
        case "3":
            this.#removerPlaca();
            break;
  
        case "4":
            this.#consultarCliente();
            break;
  
        case "5":
            this.#listarClientes();
            break;
        
        case "6":
            this.#adicionarCreditosEstudante();
            break;

        case "7":
            this.#menuEmpresa();
            break;
  
        case "0":
            noMenuClientes = false;
            break;
  
        default:
            console.log(
              "\nOpção inválida. Tente novamente."
            );
      }
    }
  }

  #cadastrarCliente() {
    console.log("\n==============================");
    console.log("      CADASTRAR CLIENTE");
    console.log("==============================");
    console.log("1 - Professor");
    console.log("2 - Estudante");
    console.log("3 - Empresa");
    console.log("0 - Cancelar");
    console.log("==============================");
  
    const tipo = this.#lerEntrada(
      "Escolha o tipo de cliente: "
    );
  
    if (tipo === "0") {
      console.log("\nCadastro cancelado.");
      return;
    }
  
    try {
      switch (tipo) {
        case "1":
          this.#cadastrarProfessor();
          break;
  
        case "2":
          this.#cadastrarEstudante();
          break;
  
        case "3":
          this.#cadastrarEmpresa();
          break;
  
        default:
          console.log("\nTipo de cliente inválido.");
      }
    }
    catch (erro) {
      console.log(
        `\nNão foi possível cadastrar o cliente: ${erro.message}`
      );
    }
  }

  #cadastrarProfessor() {
    console.log("\n--- Novo Professor ---");
  
    const cpf = this.#lerEntrada(
      "CPF: "
    );
  
    const nome = this.#lerEntrada(
      "Nome: "
    );
  
    const professor =
      new Professor(cpf, nome);
  
    this.#app.cadastro.cadastrarCliente(
      professor
    );
  
    console.log(
      "\nProfessor cadastrado com sucesso."
    );
  }

  #cadastrarEstudante() {
    console.log("\n--- Novo Estudante ---");
  
    const cpf = this.#lerEntrada(
      "CPF: "
    );
  
    const nome = this.#lerEntrada(
      "Nome: "
    );
  
    const estudante =
      new Estudante(cpf, nome);
  
    this.#app.cadastro.cadastrarCliente(
      estudante
    );
  
    console.log(
      "\nEstudante cadastrado com sucesso."
    );
  }

  #cadastrarEmpresa() {
    console.log("\n--- Nova Empresa ---");
  
    const cnpj = this.#lerEntrada(
      "CNPJ: "
    );
  
    const nome = this.#lerEntrada(
      "Nome: "
    );
  
    const empresa =
      new Empresa(cnpj, nome);
  
    this.#app.cadastro.cadastrarCliente(
      empresa
    );
  
    console.log(
      "\nEmpresa cadastrada com sucesso."
    );
  }

  #adicionarPlaca() {
    console.log("\n--- ADICIONAR PLACA ---");
  
    const id = this.#lerEntrada(
      "CPF/CNPJ do cliente: "
    );
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    try {
      // A placa não pode mudar de situação cadastral
      // enquanto o veículo estiver estacionado.
      if (
        this.#app.registros.veiculoEstacionado(
          placa
        )
      ) {
        throw new Error(
          "não é possível cadastrar a placa enquanto o veículo está estacionado"
        );
      }
  
      this.#app.cadastro.adicionarPlacaCliente(
        id,
        placa
      );
  
      console.log(
        `\nPlaca ${placa} adicionada com sucesso.`
      );
    }
    catch (erro) {
      console.log(
        `\nNão foi possível adicionar a placa: ${erro.message}`
      );
    }
  }

  #listarClientes() {
    console.log("\n=== CLIENTES CADASTRADOS ===");
  
    if (this.#app.cadastro.totalClientes === 0) {
      console.log("Nenhum cliente cadastrado.");
      return;
    }
  
    for (const cliente of this.#app.cadastro.todos) {
      console.log(cliente.toString());
    }
  }

  #removerPlaca() {
    console.log("\n--- REMOVER PLACA ---");
  
    const id = this.#lerEntrada(
      "CPF/CNPJ do cliente: "
    );
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    try {
      // Não permite remover a placa de um cliente
      // enquanto o veículo ainda estiver estacionado.
      if (
        this.#app.registros.veiculoEstacionado(
          placa
        )
      ) {
        throw new Error(
          "não é possível remover a placa enquanto o veículo está estacionado"
        );
      }
  
      this.#app.cadastro.removerPlacaCliente(
        id,
        placa
      );
  
      console.log(
        `\nPlaca ${placa} removida com sucesso.`
      );
    }
    catch (erro) {
      console.log(
        `\nNão foi possível remover a placa: ${erro.message}`
      );
    }
  }

  #consultarCliente() {
    console.log("\n==============================");
    console.log("       CONSULTAR CLIENTE");
    console.log("==============================");
    console.log("1 - Buscar por CPF/CNPJ");
    console.log("2 - Buscar por placa");
    console.log("0 - Cancelar");
    console.log("==============================");
  
    const opcao = this.#lerEntrada(
      "Escolha uma opção: "
    );
  
    if (opcao === "0") {
      console.log("\nConsulta cancelada.");
      return;
    }
  
    let cliente;
  
    switch (opcao) {
      case "1": {
        const id = this.#lerEntrada(
          "CPF/CNPJ: "
        );
  
        cliente =
          this.#app.cadastro.buscarPorId(id);
  
        break;
      }
  
      case "2": {
        const placa = this.#lerEntrada(
          "Placa: "
        ).toUpperCase();
  
        cliente =
          this.#app.cadastro.buscarPorPlaca(
            placa
          );
  
        break;
      }
  
      default:
        console.log("\nOpção inválida.");
        return;
    }
  
    if (!cliente) {
      console.log(
        "\nCliente não encontrado."
      );
      return;
    }
  
    console.log("\n=== CLIENTE ENCONTRADO ===");
    console.log(cliente.toString());
  }

  #adicionarCreditosEstudante() {
    console.log("\n--- ADICIONAR CRÉDITOS ---");
  
    const cpf = this.#lerEntrada(
      "CPF do estudante: "
    );
  
    const cliente =
      this.#app.cadastro.buscarPorId(cpf);
  
    if (!cliente) {
      console.log("\nCliente não encontrado.");
      return;
    }
  
    if (!(cliente instanceof Estudante)) {
      console.log(
        "\nO cliente informado não é um estudante."
      );
      return;
    }
  
    console.log(
      `Saldo atual: R$ ${cliente.saldo.toFixed(2)}`
    );
  
    const valorTexto = this.#lerEntrada(
      "Valor a adicionar: R$ "
    );
  
    const valor = Number(
      valorTexto.replace(",", ".")
    );
  
    if (
      Number.isNaN(valor) ||
      valor <= 0
    ) {
      console.log(
        "\nInforme um valor maior que zero."
      );
      return;
    }
  
    try {
      cliente.adicionarCreditos(valor);
  
      console.log(
        `\nCréditos adicionados com sucesso.`
      );
  
      console.log(
        `Novo saldo: R$ ${cliente.saldo.toFixed(2)}`
      );
    }
    catch (erro) {
      console.log(
        `\nNão foi possível adicionar os créditos: ${erro.message}`
      );
    }
  }

  #menuEmpresa() {
    let noMenuEmpresa = true;
  
    while (noMenuEmpresa) {
      console.log("\n==============================");
      console.log("       OPERAÇÕES EMPRESA");
      console.log("==============================");
      console.log("1 - Registrar pagamento");
      console.log("2 - Marcar como inadimplente");
      console.log("0 - Voltar");
      console.log("==============================");
  
      const opcao = this.#lerEntrada(
        "Escolha uma opção: "
      );
  
      switch (opcao) {
        case "1":
          this.#registrarPagamentoEmpresa();
          break;
  
        case "2":
          this.#marcarEmpresaInadimplente();
          break;
  
        case "0":
          noMenuEmpresa = false;
          break;
  
        default:
          console.log(
            "\nOpção inválida. Tente novamente."
          );
      }
    }
  }

  #registrarPagamentoEmpresa() {
    console.log("\n--- REGISTRAR PAGAMENTO ---");
  
    const cnpj = this.#lerEntrada(
      "CNPJ da empresa: "
    );
  
    const cliente =
      this.#app.cadastro.buscarPorId(cnpj);
  
    if (!cliente) {
      console.log("\nCliente não encontrado.");
      return;
    }
  
    if (!(cliente instanceof Empresa)) {
      console.log(
        "\nO cliente informado não é uma empresa."
      );
      return;
    }
  
    console.log(
      `Débito atual: R$ ${cliente.debito.toFixed(2)}`
    );
  
    console.log(
      `Inadimplente: ${cliente.inadimplente ? "Sim" : "Não"}`
    );
  
    const valorTexto = this.#lerEntrada(
      "Valor do pagamento: R$ "
    );
  
    const valor = Number(
      valorTexto.replace(",", ".")
    );
  
    if (
      Number.isNaN(valor) ||
      valor <= 0
    ) {
      console.log(
        "\nInforme um valor maior que zero."
      );
      return;
    }
  
    try {
      cliente.registrarPagamento(valor);
  
      console.log(
        "\nPagamento registrado com sucesso."
      );
  
      console.log(
        `Débito restante: R$ ${cliente.debito.toFixed(2)}`
      );
  
      console.log(
        `Inadimplente: ${cliente.inadimplente ? "Sim" : "Não"}`
      );
    }
    catch (erro) {
      console.log(
        `\nNão foi possível registrar o pagamento: ${erro.message}`
      );
    }
  }

  #marcarEmpresaInadimplente() {
    console.log("\n--- MARCAR INADIMPLÊNCIA ---");
  
    const cnpj = this.#lerEntrada(
      "CNPJ da empresa: "
    );
  
    const cliente =
      this.#app.cadastro.buscarPorId(cnpj);
  
    if (!cliente) {
      console.log("\nCliente não encontrado.");
      return;
    }
  
    if (!(cliente instanceof Empresa)) {
      console.log(
        "\nO cliente informado não é uma empresa."
      );
      return;
    }
  
    if (cliente.inadimplente) {
      console.log(
        "\nA empresa já está marcada como inadimplente."
      );
      return;
    }
  
    if (cliente.debito <= 0) {
      console.log(
        "\nA empresa não possui débito pendente."
      );
      return;
    }
  
    cliente.marcarInadimplente();
  
    console.log(
      "\nEmpresa marcada como inadimplente."
    );
  
    console.log(
      "Seus veículos ficarão impedidos de entrar até a regularização."
    );
  }

  #registrarEntradaVeiculo() {
    console.log("\n==============================");
    console.log("       ENTRADA DE VEÍCULO");
    console.log("==============================");
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    try {
      const dataHoraEntrada = new Date();
  
      this.#app.registros.registrarEntrada(
        placa,
        dataHoraEntrada
      );
  
      const ticket =
        this.#app.registros.buscarTicketAberto(placa);
  
      const cliente =
        this.#app.cadastro.buscarPorPlaca(placa);
  
      console.log(
        "\nEntrada autorizada com sucesso."
      );
  
      console.log(`Placa: ${placa}`);
  
      console.log(
        `Tipo: ${
          cliente
            ? cliente.constructor.name
            : "Avulso"
        }`
      );
  
      console.log(
        `Entrada: ${ticket.dataHoraEntrada.toLocaleString("pt-BR")}`
      );
  
      console.log(
        `Vagas ocupadas: ${this.#app.registros.vagasOcupadas}`
      );
  
      console.log(
        `Vagas disponíveis: ${this.#app.registros.vagasDisponiveis}`
      );
    }
    catch (erro) {
      console.log(
        `\nEntrada não autorizada: ${erro.message}`
      );
    }
  }

  #registrarSaidaVeiculo() {
    console.log("\n==============================");
    console.log("        SAÍDA DE VEÍCULO");
    console.log("==============================");
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    const ticketAberto =
      this.#app.registros.buscarTicketAberto(placa);
  
    if (!ticketAberto) {
      console.log(
        `\nVeículo ${placa} não está no estacionamento.`
      );
      return;
    }
  
    const cliente =
      this.#app.cadastro.buscarPorPlaca(placa);
  
    const tipoCliente =
      cliente
        ? cliente.constructor.name
        : "Avulso";
  
    const dataHoraSaida = new Date();
  
    try {
      let ticket;
  
      // Cliente avulso pode se recusar a pagar.
      if (!cliente) {
        let resposta;
  
        do {
          resposta = this.#lerEntrada(
            "O cliente avulso recusou o pagamento? (S/N): "
          ).toUpperCase();
  
          if (
            resposta !== "S" &&
            resposta !== "N"
          ) {
            console.log(
              "\nDigite apenas S ou N."
            );
          }
        } while (
          resposta !== "S" &&
          resposta !== "N"
        );
  
        if (resposta === "S") {
          ticket =
            this.#app.registros.registrarSaidaSemPagamento(
              placa,
              dataHoraSaida
            );
        }
        else {
          ticket =
            this.#app.registros.registrarSaida(
              placa,
              dataHoraSaida
            );
        }
      }
  
      // Professor, Estudante ou Empresa.
      else {
        ticket =
          this.#app.registros.registrarSaida(
            placa,
            dataHoraSaida
          );
      }
  
      const valorDevido =
        ticket.valorCobrado -
        ticket.valorDesconto;
  
      console.log("\nSaída registrada com sucesso.");
      console.log(`Placa: ${ticket.placa}`);
      console.log(`Tipo: ${tipoCliente}`);
  
      console.log(
        `Saída: ${ticket.dataHoraSaida.toLocaleString("pt-BR")}`
      );
  
      console.log(
        `Valor cobrado: R$ ${ticket.valorCobrado.toFixed(2)}`
      );
  
      console.log(
        `Desconto: ${ticket.descontoId}`
      );
  
      console.log(
        `Valor do desconto: R$ ${ticket.valorDesconto.toFixed(2)}`
      );
  
      console.log(
        `Valor devido: R$ ${ticket.valorDevido.toFixed(2)}`
      );
  
      console.log(
        `Valor pago: R$ ${ticket.valorPago.toFixed(2)}`
      );
  
      // Informações adicionais conforme o tipo.
      if (cliente instanceof Estudante) {
        console.log(
          `Saldo atual do estudante: R$ ${cliente.saldo.toFixed(2)}`
        );
      }
  
      if (cliente instanceof Empresa) {
        console.log(
          `Débito atual da empresa: R$ ${cliente.debito.toFixed(2)}`
        );
      }
  
      if (
        !cliente &&
        ticket.valorPago === 0
      ) {
        console.log(
          "Placa bloqueada por recusa de pagamento."
        );
      }
  
      console.log(
        `Vagas ocupadas: ${this.#app.registros.vagasOcupadas}`
      );
  
      console.log(
        `Vagas disponíveis: ${this.#app.registros.vagasDisponiveis}`
      );
    }
    catch (erro) {
      console.log(
        `\nNão foi possível registrar a saída: ${erro.message}`
      );
    }
  }

  #menuConsultas() {
    let noMenuConsultas = true;
  
    while (noMenuConsultas) {
      console.log("\n==============================");
      console.log("          CONSULTAS");
      console.log("==============================");
      console.log("1 - Situação do estacionamento");
      console.log("2 - Consultar veículo por placa");
      console.log("3 - Verificar bloqueio de placa");
      console.log("0 - Voltar");
      console.log("==============================");
  
      const opcao = this.#lerEntrada(
        "Escolha uma opção: "
      );
  
      switch (opcao) {
        case "1":
          this.#consultarSituacaoEstacionamento();
          break;
  
        case "2":
          this.#consultarVeiculo();
          break;
  
        case "3":
          this.#consultarBloqueioPlaca();
          break;
  
        case "0":
          noMenuConsultas = false;
          break;
  
        default:
          console.log(
            "\nOpção inválida. Tente novamente."
          );
      }
    }
  }

  #consultarSituacaoEstacionamento() {
    console.log("\n=== SITUAÇÃO DO ESTACIONAMENTO ===");
  
    console.log(
      `Vagas ocupadas: ${this.#app.registros.vagasOcupadas}`
    );
  
    console.log(
      `Vagas disponíveis: ${this.#app.registros.vagasDisponiveis}`
    );
  
    console.log(
      `Total de registros: ${this.#app.registros.totalTickets}`
    );
  
    console.log("\nVeículos atualmente estacionados:");
  
    const estacionados =
      this.#app.registros.todosTickets.filter(
        ticket => ticket.aberto
      );
  
    if (estacionados.length === 0) {
      console.log("Nenhum veículo estacionado.");
      return;
    }
  
    for (const ticket of estacionados) {
      console.log(ticket.toString());
    }
  }

  #consultarVeiculo() {
    console.log("\n--- CONSULTAR VEÍCULO ---");
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    const cliente =
      this.#app.cadastro.buscarPorPlaca(placa);
  
    const ticket =
      this.#app.registros.buscarTicketAberto(placa);
  
    console.log("\n=== RESULTADO ===");
    console.log(`Placa: ${placa}`);
  
    if (cliente) {
      console.log(
        `Cliente: ${cliente.nome}`
      );
  
      console.log(
        `Tipo: ${cliente.constructor.name}`
      );
    }
    else {
      console.log("Cliente: Avulso");
    }
  
    if (ticket) {
      console.log("Situação: ESTACIONADO");
  
      console.log(
        `Entrada: ${ticket.dataHoraEntrada.toLocaleString("pt-BR")}`
      );
    }
    else {
      console.log(
        "Situação: NÃO ESTÁ NO ESTACIONAMENTO"
      );
    }
  }

  #consultarBloqueioPlaca() {
    console.log("\n--- VERIFICAR BLOQUEIO ---");
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    const cliente =
      this.#app.cadastro.buscarPorPlaca(placa);
  
    // Avulso
    if (!cliente) {
      const bloqueada =
        this.#app.cadastro.placaBloqueada(placa);
  
      console.log(
        bloqueada
          ? "\nPlaca bloqueada."
          : "\nPlaca não está bloqueada."
      );
  
      return;
    }
  
    // Cliente cadastrado
    console.log(
      `\nCliente: ${cliente.nome}`
    );
  
    console.log(
      `Tipo: ${cliente.constructor.name}`
    );
  
    console.log(
      cliente.bloqueado
        ? "Situação: BLOQUEADO"
        : "Situação: LIBERADO"
    );
  
    if (cliente instanceof Estudante) {
      console.log(
        `Saldo: R$ ${cliente.saldo.toFixed(2)}`
      );
    }
  
    if (cliente instanceof Empresa) {
      console.log(
        `Débito: R$ ${cliente.debito.toFixed(2)}`
      );
  
      console.log(
        `Inadimplente: ${
          cliente.inadimplente ? "Sim" : "Não"
        }`
      );
    }
  }

  #menuRelatorios() {
    let noMenuRelatorios = true;
  
    while (noMenuRelatorios) {
      console.log("\n==============================");
      console.log("          RELATÓRIOS");
      console.log("==============================");
      console.log("1 - Arrecadação por período");
      console.log("2 - Situação de cliente");
      console.log("3 - Histórico de cliente cadastrado");
      console.log("4 - Histórico de cliente avulso");
      console.log("5 - Clientes impedidos");
      console.log("6 - 10 clientes mais frequentes");
      console.log("0 - Voltar");
      console.log("==============================");
  
      const opcao = this.#lerEntrada(
        "Escolha uma opção: "
      );
  
      switch (opcao) {
        case "1":
          this.#relatorioArrecadacao();
          break;
  
        case "2":
          this.#relatorioSituacaoCliente();
          break;
  
        case "3":
          this.#relatorioHistoricoCliente();
          break;
  
        case "4":
          this.#relatorioHistoricoAvulso();
          break;
  
        case "5":
          this.#relatorioClientesImpedidos();
          break;
  
        case "6":
          this.#relatorioMaisFrequentes();
          break;
  
        case "0":
          noMenuRelatorios = false;
          break;
  
        default:
          console.log(
            "\nOpção inválida. Tente novamente."
          );
      }
    }
  }

  #relatorioSituacaoCliente() {
    console.log("\n=== SITUAÇÃO DO CLIENTE ===");
  
    const id = this.#lerEntrada(
      "CPF/CNPJ: "
    );
  
    const relatorio =
      this.#app.relatorios.situacaoCliente(id);
  
    if (!relatorio) {
      console.log(
        "\nCliente não encontrado."
      );
      return;
    }
  
    console.log(`\nNome: ${relatorio.nome}`);
    console.log(`CPF/CNPJ: ${relatorio.id}`);
    console.log(`Tipo: ${relatorio.tipo}`);
  
    console.log(
      `Placas cadastradas: ${
        relatorio.placas.length > 0
          ? relatorio.placas.join(", ")
          : "Nenhuma"
      }`
    );
  
    console.log(
      `Veículos estacionados: ${
        relatorio.veiculosEstacionados.length > 0
          ? relatorio.veiculosEstacionados.join(", ")
          : "Nenhum"
      }`
    );
  
    if (relatorio.tipo === "Estudante") {
      console.log(
        `Saldo: R$ ${relatorio.saldo.toFixed(2)}`
      );
  
      console.log(
        `Situação: ${
          relatorio.bloqueado
            ? "BLOQUEADO"
            : "LIBERADO"
        }`
      );
    }
  
    if (relatorio.tipo === "Empresa") {
      console.log(
        `Débito: R$ ${relatorio.debito.toFixed(2)}`
      );
  
      console.log(
        `Inadimplente: ${
          relatorio.inadimplente
            ? "Sim"
            : "Não"
        }`
      );
  
      console.log(
        `Situação: ${
          relatorio.bloqueado
            ? "BLOQUEADA"
            : "LIBERADA"
        }`
      );
    }
  }

  #lerData(mensagem, fimDoDia = false) {
    while (true) {
      const texto = this.#lerEntrada(
        `${mensagem} (DD/MM/AAAA): `
      );
  
      const partes = texto.split("/");
  
      if (partes.length !== 3) {
        console.log(
          "\nData inválida. Use DD/MM/AAAA."
        );
        continue;
      }
  
      const dia = Number(partes[0]);
      const mes = Number(partes[1]);
      const ano = Number(partes[2]);
  
      if (
        !Number.isInteger(dia) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(ano)
      ) {
        console.log(
          "\nData inválida. Use DD/MM/AAAA."
        );
        continue;
      }
  
      const data = fimDoDia
        ? new Date(
            ano,
            mes - 1,
            dia,
            23,
            59,
            59,
            999
          )
        : new Date(
            ano,
            mes - 1,
            dia,
            0,
            0,
            0,
            0
          );
  
      // Evita aceitar datas como 31/02.
      if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
      ) {
        console.log(
          "\nData inexistente. Tente novamente."
        );
        continue;
      }
  
      return data;
    }
  }

  #relatorioArrecadacao() {
    console.log("\n==============================");
    console.log("     RELATÓRIO DE ARRECADAÇÃO");
    console.log("==============================");
  
    const dataInicial =
      this.#lerData("Data inicial");
  
    const dataFinal =
      this.#lerData("Data final", true);
  
    if (dataInicial > dataFinal) {
      console.log(
        "\nA data inicial não pode ser posterior à data final."
      );
      return;
    }
  
    console.log("\nCategorias:");
    console.log("1 - Avulso");
    console.log("2 - Professor");
    console.log("3 - Estudante");
    console.log("4 - Empresa");
    console.log("0 - Todas");
  
    console.log(
      "\nVocê pode combinar categorias. Exemplo: 1,3"
    );
  
    const entradaCategorias =
      this.#lerEntrada(
        "Categorias: "
      );
  
    const mapaCategorias = {
      "1": "Avulso",
      "2": "Professor",
      "3": "Estudante",
      "4": "Empresa"
    };
  
    let categorias = null;
  
    if (entradaCategorias !== "0") {
      const codigos = [
        ...new Set(
          entradaCategorias
            .split(",")
            .map(codigo => codigo.trim())
        )
      ];
  
      const existeInvalida =
        codigos.some(
          codigo => !mapaCategorias[codigo]
        );
  
      if (existeInvalida) {
        console.log(
          "\nCategoria inválida."
        );
        return;
      }
  
      categorias =
        codigos.map(
          codigo => mapaCategorias[codigo]
        );
    }
  
    const relatorio =
      this.#app.relatorios.arrecadacaoPorPeriodo(
        dataInicial,
        dataFinal,
        categorias
      );
  
    console.log("\n=== RESULTADO ===");
  
    console.log(
      `Período: ${
        dataInicial.toLocaleDateString("pt-BR")
      } a ${
        dataFinal.toLocaleDateString("pt-BR")
      }`
    );
  
    console.log(
      `Registros considerados: ${relatorio.quantidadeRegistros}`
    );
  
    const categoriasExibidas =
      categorias ?? [
        "Avulso",
        "Professor",
        "Estudante",
        "Empresa"
      ];
  
    for (const categoria of categoriasExibidas) {
      console.log(
        `${categoria}: R$ ${
          relatorio.porCategoria[categoria].toFixed(2)
        }`
      );
    }
  
    console.log(
      `TOTAL: R$ ${relatorio.total.toFixed(2)}`
    );
  }

  #relatorioHistoricoCliente() {
    console.log("\n==============================");
    console.log("   HISTÓRICO DE CLIENTE");
    console.log("==============================");
  
    const id = this.#lerEntrada(
      "CPF/CNPJ: "
    );
  
    const dataInicial =
      this.#lerData("Data inicial");
  
    const dataFinal =
      this.#lerData("Data final", true);
  
    if (dataInicial > dataFinal) {
      console.log(
        "\nA data inicial não pode ser posterior à data final."
      );
      return;
    }
  
    const relatorio =
      this.#app.relatorios
        .historicoClienteCadastrado(
          id,
          dataInicial,
          dataFinal
        );
  
    if (!relatorio) {
      console.log(
        "\nCliente não encontrado."
      );
      return;
    }
  
    console.log("\n=== CLIENTE ===");
    console.log(`Nome: ${relatorio.nome}`);
    console.log(`CPF/CNPJ: ${relatorio.id}`);
    console.log(`Tipo: ${relatorio.tipo}`);
  
    console.log(
      `Placas: ${
        relatorio.placas.length > 0
          ? relatorio.placas.join(", ")
          : "Nenhuma"
      }`
    );
  
    console.log(
      `Período: ${
        dataInicial.toLocaleDateString("pt-BR")
      } a ${
        dataFinal.toLocaleDateString("pt-BR")
      }`
    );
  
    console.log(
      `Total de registros: ${relatorio.registros.length}`
    );
  
    if (relatorio.registros.length === 0) {
      console.log(
        "\nNenhum registro encontrado no período."
      );
      return;
    }
  
    console.log("\n=== REGISTROS ===");
  
    for (const ticket of relatorio.registros) {
      console.log(ticket.toString());
    }
  }

  #relatorioHistoricoAvulso() {
    console.log("\n==============================");
    console.log("     HISTÓRICO DE AVULSO");
    console.log("==============================");
  
    const placa = this.#lerEntrada(
      "Placa do veículo: "
    ).toUpperCase();
  
    const dataInicial =
      this.#lerData("Data inicial");
  
    const dataFinal =
      this.#lerData("Data final", true);
  
    if (dataInicial > dataFinal) {
      console.log(
        "\nA data inicial não pode ser posterior à data final."
      );
      return;
    }
  
    const relatorio =
      this.#app.relatorios
        .historicoClienteAvulso(
          placa,
          dataInicial,
          dataFinal
        );
  
    if (!relatorio.ehAvulso) {
      console.log(
        "\nA placa informada pertence a um cliente cadastrado."
      );
      return;
    }
  
    console.log("\n=== CLIENTE AVULSO ===");
    console.log(`Placa: ${relatorio.placa}`);
  
    console.log(
      `Período: ${
        dataInicial.toLocaleDateString("pt-BR")
      } a ${
        dataFinal.toLocaleDateString("pt-BR")
      }`
    );
  
    console.log(
      `Total de registros: ${relatorio.registros.length}`
    );
  
    if (relatorio.registros.length === 0) {
      console.log(
        "\nNenhum registro encontrado no período."
      );
      return;
    }
  
    console.log("\n=== REGISTROS ===");
  
    for (const ticket of relatorio.registros) {
      console.log(ticket.toString());
    }
  }

  #relatorioClientesImpedidos() {
    console.log("\n==============================");
    console.log("       CLIENTES IMPEDIDOS");
    console.log("==============================");
  
    const impedidos =
      this.#app.relatorios.clientesImpedidos();
  
    if (impedidos.length === 0) {
      console.log(
        "\nNão há clientes impedidos de entrar."
      );
      return;
    }
  
    console.log(
      `\nTotal de impedidos: ${impedidos.length}`
    );
  
    for (const item of impedidos) {
      console.log("\n------------------------------");
  
      console.log(
        `Tipo: ${item.tipo}`
      );
  
      if (item.id) {
        console.log(
          `CPF/CNPJ: ${item.id}`
        );
      }
  
      if (item.nome) {
        console.log(
          `Nome: ${item.nome}`
        );
      }
  
      console.log(
        `Placa(s): ${item.placas.join(", ")}`
      );
  
      console.log(
        `Motivo: ${item.motivo}`
      );
  
      if (item.tipo === "Estudante") {
        console.log(
          `Saldo: R$ ${item.saldo.toFixed(2)}`
        );
      }
  
      if (item.tipo === "Empresa") {
        console.log(
          `Débito: R$ ${item.debito.toFixed(2)}`
        );
      }
    }
  }

  #relatorioMaisFrequentes() {
    console.log("\n==============================");
    console.log("     CLIENTES MAIS FREQUENTES");
    console.log("==============================");
  
    const anoTexto = this.#lerEntrada(
      "Ano do relatório: "
    );
  
    const ano = Number(anoTexto);
  
    if (
      !Number.isInteger(ano) ||
      ano < 1900 ||
      ano > 9999
    ) {
      console.log("\nAno inválido.");
      return;
    }
  
    const ranking =
      this.#app.relatorios
        .clientesMaisFrequentes(ano);
  
    console.log(
      `\n=== TOP 10 - ${ano} ===`
    );
  
    if (ranking.length === 0) {
      console.log(
        "Nenhum registro encontrado para esse ano."
      );
      return;
    }
  
    ranking.forEach((item, indice) => {
      console.log("\n------------------------------");
  
      console.log(
        `${indice + 1}º lugar`
      );
  
      console.log(
        `Tipo: ${item.tipo}`
      );
  
      if (item.id) {
        console.log(
          `CPF/CNPJ: ${item.id}`
        );
  
        console.log(
          `Nome: ${item.nome}`
        );
      }
      else {
        console.log(
          `Placa: ${item.placa}`
        );
      }
  
      console.log(
        `Utilizações: ${item.quantidade}`
      );
    });
  }

  iniciar() {
    while (this.#executando) {
      this.#mostrarMenuPrincipal();
  
      const opcao = this.#lerEntrada(
        "Escolha uma opção: "
      );
  
      this.#processarOpcaoPrincipal(opcao);
    }
  }

  #processarOpcaoPrincipal(opcao) {
    switch (opcao) {
        case "1":
            this.#menuClientes();
            break;
  
        case "2":
            this.#registrarEntradaVeiculo();
            break;
  
        case "3":
            this.#registrarSaidaVeiculo();
            break;
  
        case "4":
            this.#menuConsultas();
            break;
  
        case "5":
            this.#menuRelatorios();
            break;
  
        case "0":
            this.#encerrar();
            break;
  
        default:
            console.log(
            "\nOpção inválida. Tente novamente."
            );
    }
  }

  #encerrar() {
    console.log("\nEncerrando sistema...");
  
    this.#app.salvarDados();
  
    this.#executando = false;
  
    console.log("Sistema encerrado.");
  }

  #lerEntrada(mensagem) {
    const resposta = this.#prompt(mensagem);
  
    if (resposta === null) {
      console.log("\nEncerramento solicitado.");
  
      this.#app.salvarDados();
  
      console.log("Sistema encerrado.");
  
      process.exit(0);
    }
  
    return resposta.trim();
  }
}

