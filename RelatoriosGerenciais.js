import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";

export class RelatoriosGerenciais {
  #cadastro;
  #registros;

  constructor(cadastro, registros) {
    this.#cadastro = cadastro;
    this.#registros = registros;
  }

  situacaoCliente(id) {
    const cliente =
      this.#cadastro.buscarPorId(id);
  
    if (!cliente) {
      return null;
    }
  
    const veiculosEstacionados =
      this.#registros.todosTickets
        .filter(ticket =>
          ticket.aberto &&
          cliente.possuiPlaca(ticket.placa)
        )
        .map(ticket => ticket.placa);
  
    const resultado = {
      id: cliente.id,
      nome: cliente.nome,
      tipo: cliente.constructor.name,
      placas: [...cliente.placas],
      veiculosEstacionados
    };
  
    if (cliente instanceof Estudante) {
      resultado.saldo = cliente.saldo;
      resultado.bloqueado = cliente.bloqueado;
    }
  
    if (cliente instanceof Empresa) {
      resultado.debito = cliente.debito;
      resultado.inadimplente =
        cliente.inadimplente;
  
      resultado.bloqueado =
        cliente.bloqueado;
    }
  
    return resultado;
  }

  #categoriaDoTicket(ticket) {
    return ticket.tipoCliente;
  }
  
  arrecadacaoPorPeriodo(
    dataInicial,
    dataFinal,
    categorias = null
  ) {
    const porCategoria = {
      Avulso: 0,
      Professor: 0,
      Estudante: 0,
      Empresa: 0
    };
  
    let total = 0;
    let quantidadeRegistros = 0;
  
    for (const ticket of this.#registros.todosTickets) {
  
      // Ticket aberto ainda não gerou arrecadação.
      if (
        ticket.aberto ||
        !ticket.dataHoraSaida
      ) {
        continue;
      }
  
      // Consideramos a data da saída,
      // pois é quando a cobrança é concluída.
      if (
        ticket.dataHoraSaida < dataInicial ||
        ticket.dataHoraSaida > dataFinal
      ) {
        continue;
      }
  
      const categoria =
        this.#categoriaDoTicket(ticket);
  
      // Se categorias for null, considera todas.
      if (
        categorias !== null &&
        !categorias.includes(categoria)
      ) {
        continue;
      }
  
      const valorPago =
        Number(ticket.valorPago) || 0;
  
      porCategoria[categoria] += valorPago;
      total += valorPago;
      quantidadeRegistros++;
    }
  
    return {
      dataInicial,
      dataFinal,
      categorias,
      total,
      porCategoria,
      quantidadeRegistros
    };
  }

  historicoClienteCadastrado(
    id,
    dataInicial,
    dataFinal
  ) {
    const cliente =
      this.#cadastro.buscarPorId(id);
  
    if (!cliente) {
      return null;
    }
  
    const placas = new Set(cliente.placas);
  
    const registros =
      this.#registros.todosTickets
        .filter(ticket =>
          placas.has(ticket.placa) &&
          ticket.dataHoraEntrada >= dataInicial &&
          ticket.dataHoraEntrada <= dataFinal
        )
        .sort(
          (a, b) =>
            a.dataHoraEntrada - b.dataHoraEntrada
        );
  
    return {
      id: cliente.id,
      nome: cliente.nome,
      tipo: cliente.constructor.name,
      placas: [...cliente.placas],
      registros
    };
  }

  historicoClienteAvulso(
    placa,
    dataInicial,
    dataFinal
  ) {
    const placaNormalizada =
      placa.trim().toUpperCase();
  
    // Se a placa estiver vinculada a um cliente
    // cadastrado, ela não é avulsa.
    const cliente =
      this.#cadastro.buscarPorPlaca(
        placaNormalizada
      );
  
    if (cliente) {
      return {
        placa: placaNormalizada,
        ehAvulso: false,
        registros: []
      };
    }
  
    const registros =
      this.#registros.todosTickets
        .filter(ticket =>
          ticket.placa === placaNormalizada &&
          ticket.dataHoraEntrada >= dataInicial &&
          ticket.dataHoraEntrada <= dataFinal
        )
        .sort(
          (a, b) =>
            a.dataHoraEntrada -
            b.dataHoraEntrada
        );
  
    return {
      placa: placaNormalizada,
      ehAvulso: true,
      registros
    };
  }

  clientesImpedidos() {
    const impedidos = [];
  
    // -------------------------
    // CLIENTES CADASTRADOS
    // -------------------------
    for (const cliente of this.#cadastro.todos) {
  
      if (
        cliente instanceof Estudante &&
        cliente.bloqueado
      ) {
        impedidos.push({
          tipo: "Estudante",
          id: cliente.id,
          nome: cliente.nome,
          placas: [...cliente.placas],
          motivo: "Saldo negativo",
          saldo: cliente.saldo
        });
      }
  
      if (
        cliente instanceof Empresa &&
        cliente.bloqueado
      ) {
        impedidos.push({
          tipo: "Empresa",
          id: cliente.id,
          nome: cliente.nome,
          placas: [...cliente.placas],
          motivo: "Empresa inadimplente",
          debito: cliente.debito
        });
      }
    }
  
    // -------------------------
    // CLIENTES AVULSOS
    // -------------------------
    for (const placa of this.#cadastro.bloqueados) {
      impedidos.push({
        tipo: "Avulso",
        id: null,
        nome: null,
        placas: [placa],
        motivo: "Recusa de pagamento"
      });
    }
  
    return impedidos;
  }

  clientesMaisFrequentes(ano) {
    const frequencias = new Map();
  
    for (const ticket of this.#registros.todosTickets) {
      const dataEntrada = ticket.dataHoraEntrada;
  
      if (dataEntrada.getFullYear() !== ano) {
        continue;
      }
  
      const cliente =
        this.#cadastro.buscarPorPlaca(ticket.placa);
  
      let chave;
      let dados;
  
      // -------------------------
      // CLIENTE CADASTRADO
      // -------------------------
      if (cliente) {
        chave = `CADASTRADO:${cliente.id}`;
  
        dados = {
          tipo: cliente.constructor.name,
          id: cliente.id,
          nome: cliente.nome,
          placa: null,
          quantidade: 0
        };
      }
  
      // -------------------------
      // CLIENTE AVULSO
      // -------------------------
      else {
        chave = `AVULSO:${ticket.placa}`;
  
        dados = {
          tipo: "Avulso",
          id: null,
          nome: null,
          placa: ticket.placa,
          quantidade: 0
        };
      }
  
      if (!frequencias.has(chave)) {
        frequencias.set(chave, dados);
      }
  
      frequencias.get(chave).quantidade++;
    }
  
    return [...frequencias.values()]
      .sort((a, b) => {
        // Primeiro: maior número de utilizações.
        if (b.quantidade !== a.quantidade) {
          return b.quantidade - a.quantidade;
        }
  
        // Desempate apenas para manter
        // o resultado determinístico.
        const nomeA =
          a.nome ?? a.placa ?? "";
  
        const nomeB =
          b.nome ?? b.placa ?? "";
  
        return nomeA.localeCompare(nomeB);
      })
      .slice(0, 10);
  }
}