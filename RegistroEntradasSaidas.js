import { readFileSync, writeFileSync } from "node:fs";

import { TicketEstacionamento } from "./TicketEstacionamento.js";
import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";

// Valores de cobrança (podem vir de arquivo futuramente)
export const VALORES = {
  HORA_AVULSO: 10,
  DIARIA_AVULSO: 50,
  INGRESSO_ESTUDANTE: 25,
  DIARIA_EMPRESA: 20,
  MULTA_EMPRESA_POR_DIA: 50,
  MAX_HORAS_ANTES_DIARIA: 6,
  TOTAL_VAGAS: 9000,
  DESCONTO_FREQUENTE: 0.20,
};

export class RegistroDeEntradas_E_Saidas {
  #tickets;           // Array: todos os tickets (histórico completo)
  #ticketsAbertos;     // Map: placa → ticket (só os que estão dentro)
  #cadastro;           // referência ao CadastroClientes

  constructor(cadastroClientes) {
    this.#tickets = [];
    this.#ticketsAbertos = new Map();
    this.#cadastro = cadastroClientes;
  }

  carregarDeCSV(caminhoArquivo) {
    const conteudo = readFileSync(
      caminhoArquivo,
      "utf-8"
    );
  
    const linhas = conteudo
      .split(/\r?\n/)
      .filter(linha => linha.trim().length > 0);
  
    let ignoradas = 0;
  
    for (
      let indice = 0;
      indice < linhas.length;
      indice++
    ) {
      const linha = linhas[indice];
  
      try {
        const campos = linha
          .split(",")
          .map(campo => campo.trim());
  
        // O formato oficial possui 6 campos.
        if (campos.length !== 6) {
          throw new Error(
            "quantidade incorreta de campos"
          );
        }
  
        const [
          placa,
          entradaTexto,
          saidaTexto,
          valorCobradoTexto,
          valorDescontoTexto,
          valorPagoTexto
        ] = campos;
  
        // -------------------------
        // PLACA
        // -------------------------
        if (!placa) {
          throw new Error("placa vazia");
        }
  
        // -------------------------
        // DATA DE ENTRADA
        // -------------------------
        if (!entradaTexto) {
          throw new Error(
            "data de entrada ausente"
          );
        }
  
        const dataHoraEntrada =
          new Date(entradaTexto);
  
        if (
          Number.isNaN(
            dataHoraEntrada.getTime()
          )
        ) {
          throw new Error(
            "data de entrada inválida"
          );
        }
  
        const cliente =
          this.#cadastro.buscarPorPlaca(
            placa
          );
  
        const tipoCliente =
          cliente
            ? cliente.constructor.name
            : "Avulso";
  
        const ticket =
          new TicketEstacionamento(
            placa,
            dataHoraEntrada,
            tipoCliente
          );
  
        // =================================
        // TICKET FECHADO
        // =================================
        if (saidaTexto) {
          const dataHoraSaida =
            new Date(saidaTexto);
  
          if (
            Number.isNaN(
              dataHoraSaida.getTime()
            )
          ) {
            throw new Error(
              "data de saída inválida"
            );
          }
  
          if (
            dataHoraSaida <
            dataHoraEntrada
          ) {
            throw new Error(
              "saída anterior à entrada"
            );
          }
  
          const valorCobrado =
            Number(valorCobradoTexto);
  
          const valorDesconto =
            Number(valorDescontoTexto);
  
          const valorPago =
            Number(valorPagoTexto);
  
          if (
            !Number.isFinite(valorCobrado) ||
            !Number.isFinite(valorDesconto) ||
            !Number.isFinite(valorPago)
          ) {
            throw new Error(
              "valor financeiro inválido"
            );
          }
  
          if (
            valorCobrado < 0 ||
            valorDesconto < 0 ||
            valorPago < 0
          ) {
            throw new Error(
              "valores financeiros não podem ser negativos"
            );
          }
  
          if (
            valorDesconto >
            valorCobrado
          ) {
            throw new Error(
              "desconto maior que o valor cobrado"
            );
          }
  
          const descontoId =
            valorDesconto > 0
              ? "ClienteFrequente"
              : "nenhum";
  
          ticket.registrarSaida(
            dataHoraSaida,
            valorCobrado,
            descontoId,
            valorDesconto,
            valorPago
          );
  
          // Reconstrói bloqueio de
          // avulso que não pagou.
          if (
            !cliente &&
            valorCobrado > 0 &&
            valorPago === 0
          ) {
            this.#cadastro.bloquearPlaca(
              placa
            );
          }
        }
  
        // =================================
        // TICKET ABERTO
        // =================================
        else {
          // Um ticket aberto deve ter
          // os campos financeiros vazios.
          if (
            valorCobradoTexto ||
            valorDescontoTexto ||
            valorPagoTexto
          ) {
            throw new Error(
              "ticket aberto possui valores de saída"
            );
          }
  
          // Não podem existir dois veículos
          // abertos com a mesma placa.
          if (
            this.#ticketsAbertos.has(placa)
          ) {
            throw new Error(
              "já existe ticket aberto para essa placa"
            );
          }
        }
  
        // Só adicionamos depois que toda
        // a linha foi validada.
        this.#tickets.push(ticket);
  
        if (ticket.aberto) {
          this.#ticketsAbertos.set(
            placa,
            ticket
          );
        }
      }
      catch (erro) {
        ignoradas++;
  
        console.warn(
          `Linha ${indice + 1} de registros.csv ignorada: ${erro.message}`
        );
  
        console.warn(
          `  Conteúdo: ${linha}`
        );
      }
    }
  
    if (ignoradas > 0) {
      console.warn(
        `\n${ignoradas} linha(s) inválida(s) foram ignoradas.`
      );
    }
  
    return this.totalTickets;
  }

  #formatarDataCSV(data) {
    const ano = data.getFullYear();
  
    const mes = String(
      data.getMonth() + 1
    ).padStart(2, "0");
  
    const dia = String(
      data.getDate()
    ).padStart(2, "0");
  
    const hora = String(
      data.getHours()
    ).padStart(2, "0");
  
    const minuto = String(
      data.getMinutes()
    ).padStart(2, "0");
  
    const segundo = String(
      data.getSeconds()
    ).padStart(2, "0");
  
    return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
  }

  salvarEmCSV(caminhoArquivo) {
    const linhas = [];
  
    for (const ticket of this.#tickets) {
      const entrada =
        this.#formatarDataCSV(ticket.dataHoraEntrada);
  
      // -------------------------
      // TICKET AINDA ABERTO
      // -------------------------
      if (ticket.aberto) {
        const linha = [
          ticket.placa,
          entrada,
          "",
          "",
          "",
          ""
        ];
  
        linhas.push(linha.join(","));
      }
  
      // -------------------------
      // TICKET FECHADO
      // -------------------------
      else {
        const saida =
          this.#formatarDataCSV(ticket.dataHoraSaida);
  
        const linha = [
          ticket.placa,
          entrada,
          saida,
          ticket.valorCobrado,
          ticket.valorDesconto,
          ticket.valorPago
        ];
  
        linhas.push(linha.join(","));
      }
    }
  
    writeFileSync(
      caminhoArquivo,
      linhas.join("\n"),
      "utf-8"
    );
  
    return linhas.length;
  }

  // --- Consultas básicas ---

  get totalTickets() { return this.#tickets.length; }

  get vagasOcupadas() { return this.#ticketsAbertos.size; }

  get vagasDisponiveis() { return VALORES.TOTAL_VAGAS - this.vagasOcupadas; }

  veiculoEstacionado(placa) {
    return this.#ticketsAbertos.has(placa);
  }

  buscarTicketAberto(placa) {
    return this.#ticketsAbertos.get(placa) || null;
  }

  get todosTickets() { return this.#tickets; }

  // --- Entrada ---

  registrarEntrada(placa, dataHoraEntrada) {

    // 1. Placa bloqueada?
    if (this.#cadastro.placaBloqueada(placa)) {
      throw new Error(`Placa ${placa} está bloqueada`);
    }
  
    // 2. Já está estacionado?
    if (this.#ticketsAbertos.has(placa)) {
      throw new Error(
        `Veículo ${placa} já está no estacionamento`
      );
    }
  
    // 3. Tem vaga?
    if (this.vagasDisponiveis <= 0) {
      throw new Error("Estacionamento lotado");
    }
  
    // 4. Descobre se a placa pertence a um cliente cadastrado
    const cliente =
      this.#cadastro.buscarPorPlaca(placa);
  
    // Guarda o tipo que o cliente possuía
    // no momento da entrada.
    const tipoCliente =
      cliente
        ? cliente.constructor.name
        : "Avulso";
  
    // 5. Verifica regras específicas
    if (cliente) {
  
      if (cliente instanceof Professor) {
  
        // Professor pode ter duas placas cadastradas,
        // mas apenas um veículo estacionado por vez.
        if (this.#professorTemVeiculoDentro(cliente)) {
          throw new Error(
            `Professor ${cliente.nome} já possui um veículo estacionado`
          );
        }
      }
  
      else if (cliente instanceof Estudante) {
  
        // Estudante não entra com saldo negativo.
        if (cliente.bloqueado) {
          throw new Error(
            `Estudante ${cliente.nome} bloqueado (saldo negativo)`
          );
        }
      }
  
      else if (cliente instanceof Empresa) {
  
        // Empresa inadimplente não pode entrar.
        if (cliente.bloqueado) {
          throw new Error(
            `Empresa ${cliente.nome} bloqueada (inadimplente)`
          );
        }
      }
    }
  
    // 6. Tudo certo: cria o ticket
    const ticket = new TicketEstacionamento(
      placa,
      dataHoraEntrada,
      tipoCliente
    );
  
    this.#tickets.push(ticket);
  
    this.#ticketsAbertos.set(
      placa,
      ticket
    );
  
    return ticket;
  }

  // Verifica se algum veículo do professor
  // já está estacionado.
  #professorTemVeiculoDentro(professor) {
    for (const placa of professor.placas) {
      if (this.#ticketsAbertos.has(placa)) {
        return true;
      }
    }

    return false;
  }

  registrarSaida(placa, dataHoraSaida) {
    // 1. Busca o ticket aberto
    let ticket = this.#ticketsAbertos.get(placa);
    if (!ticket) {
      throw new Error(`Veículo ${placa} não está no estacionamento`);
    }

    let saida = new Date(dataHoraSaida);
    let cliente = this.#cadastro.buscarPorPlaca(placa);

    // 2. Calcula o custo conforme o tipo de cliente
    let valorCobrado = 0;
    if (!cliente) {
      valorCobrado = this.#calcularCustoAvulso(ticket, saida);
    } else if (cliente instanceof Professor) {
      valorCobrado = 0;  // gratuito
    } else if (cliente instanceof Estudante) {
      valorCobrado = this.#calcularCustoEstudante(ticket, saida);
    } else if (cliente instanceof Empresa) {
      valorCobrado = this.#calcularCustoEmpresa(ticket, saida);
    }

    // 3. Verifica desconto (só avulsos por enquanto)
    let descontoId = "nenhum";
    let valorDesconto = 0;
    if (!cliente) {
      let desconto = this.#verificarDesconto(placa, saida);
      descontoId = desconto.id;
      valorDesconto = Math.round(valorCobrado * desconto.percentual * 100) / 100;
    }

    let valorPago = valorCobrado - valorDesconto;

    // 4. Fecha o ticket
    ticket.registrarSaida(saida, valorCobrado, descontoId, valorDesconto, valorPago);
    this.#ticketsAbertos.delete(placa);

    // 5. Aplica efeitos no cliente (debitar estudante, acumular empresa)
    if (cliente instanceof Estudante) {
      cliente.debitarIngresso(valorPago);
    } else if (cliente instanceof Empresa) {
      if (valorPago > 0) {
        cliente.adicionarDebito(valorPago);
      }
    }

    return ticket;
  }

  // Avulso recusa pagar: libera saída mas bloqueia placa
  registrarSaidaSemPagamento(placa, dataHoraSaida) {
    let ticket = this.#ticketsAbertos.get(placa);
    if (!ticket) {
      throw new Error(`Veículo ${placa} não está no estacionamento`);
    }

    let saida = new Date(dataHoraSaida);
    let valorCobrado = this.#calcularCustoAvulso(ticket, saida);

    ticket.registrarSaida(saida, valorCobrado, "nenhum", 0, 0);
    this.#ticketsAbertos.delete(placa);
    this.#cadastro.bloquearPlaca(placa);

    return ticket;
  }

  // --- Cálculos de custo (métodos privados) ---

  // Avulso: R$ por hora até 6h, depois diária. Nova diária após meia-noite.
  #calcularCustoAvulso(ticket, saida) {
    const entrada = ticket.dataHoraEntrada;
  
    // Data correspondente ao final do dia da entrada:
    // meia-noite que inicia o dia seguinte.
    const proximaMeiaNoite = new Date(
      entrada.getFullYear(),
      entrada.getMonth(),
      entrada.getDate() + 1,
      0,
      0,
      0
    );
  
    // =====================================
    // NÃO PASSOU DA MEIA-NOITE
    // =====================================
    if (saida < proximaMeiaNoite) {
  
      const horas = Math.ceil(
        (saida - entrada) /
        (1000 * 60 * 60)
      );
  
      if (
        horas >
        VALORES.MAX_HORAS_ANTES_DIARIA
      ) {
        return VALORES.DIARIA_AVULSO;
      }
  
      return (
        horas *
        VALORES.HORA_AVULSO
      );
    }
  
    // =====================================
    // PASSOU DA MEIA-NOITE
    // =====================================
  
    // Primeiro calculamos quanto seria cobrado
    // pelo período do dia da entrada.
    const horasPrimeiroDia = Math.ceil(
      (proximaMeiaNoite - entrada) /
      (1000 * 60 * 60)
    );
  
    let custoPrimeiroDia;
  
    if (
      horasPrimeiroDia >
      VALORES.MAX_HORAS_ANTES_DIARIA
    ) {
      custoPrimeiroDia =
        VALORES.DIARIA_AVULSO;
    }
    else {
      custoPrimeiroDia =
        horasPrimeiroDia *
        VALORES.HORA_AVULSO;
    }
  
    // Quantas meias-noites foram atravessadas?
    const inicioDiaEntrada = new Date(
      entrada.getFullYear(),
      entrada.getMonth(),
      entrada.getDate()
    );
  
    const inicioDiaSaida = new Date(
      saida.getFullYear(),
      saida.getMonth(),
      saida.getDate()
    );
  
    const diasAtravessados = Math.round(
      (inicioDiaSaida - inicioDiaEntrada) /
      (1000 * 60 * 60 * 24)
    );
  
    // Cada nova data iniciada gera uma diária.
    const custoNovasDiarias =
      diasAtravessados *
      VALORES.DIARIA_AVULSO;
  
    return (
      custoPrimeiroDia +
      custoNovasDiarias
    );
  }

  // Estudante: valor fixo por ingresso. Novo ingresso se passou meia-noite.
  #calcularCustoEstudante(ticket, saida) {
    let totalDiarias = this.#contarDiarias(ticket.dataHoraEntrada, saida);
    return totalDiarias * VALORES.INGRESSO_ESTUDANTE;
  }

  // Empresa: diária. Multa se passou meia-noite.
  #calcularCustoEmpresa(ticket, saida) {
    let totalDiarias = this.#contarDiarias(ticket.dataHoraEntrada, saida);
    let custo = VALORES.DIARIA_EMPRESA;
    if (totalDiarias > 1) {
      custo += (totalDiarias - 1) * VALORES.MULTA_EMPRESA_POR_DIA;
    }
    return custo;
  }

  // Conta quantos "dias" a permanência abrange (1 = mesmo dia, 2 = cruzou 1 meia-noite)
  #contarDiarias(entrada, saida) {
    let diaEntrada = new Date(entrada.getFullYear(), entrada.getMonth(), entrada.getDate());
    let diaSaida = new Date(saida.getFullYear(), saida.getMonth(), saida.getDate());
    let diffDias = Math.round((diaSaida - diaEntrada) / (1000 * 60 * 60 * 24));
    return diffDias + 1;  // mesmo dia = 1
  }

  // --- Desconto ---

  // ClienteFrequente: avulso com 3+ visitas nos últimos 5 dias → 20% desconto
  #verificarDesconto(placa, dataSaida) {
    const cincoDiasAtras = new Date(dataSaida);
  
    cincoDiasAtras.setDate(
      cincoDiasAtras.getDate() - 5
    );
  
    // A utilização atual também conta.
    // Este método só é chamado na saída de um avulso.
    let visitas = 1;
  
    for (const ticket of this.#tickets) {
  
      // O ticket atual ainda está aberto,
      // portanto não deve ser contado novamente.
      if (ticket.aberto) {
        continue;
      }
  
      // Considera apenas utilizações anteriores
      // da mesma placa como cliente avulso.
      if (
        ticket.placa === placa &&
        ticket.tipoCliente === "Avulso" &&
        ticket.dataHoraEntrada >= cincoDiasAtras &&
        ticket.dataHoraEntrada <= dataSaida
      ) {
        visitas++;
      }
    }
  
    if (visitas >= 3) {
      return {
        id: "ClienteFrequente",
        percentual: VALORES.DESCONTO_FREQUENTE
      };
    }
  
    return {
      id: "nenhum",
      percentual: 0
    };
  }
}