export class TicketEstacionamento {
    #placa;
    #tipoCliente;
    #dataHoraEntrada;
    #dataHoraSaida;
    #valorCobrado;
    #descontoId;
    #valorDesconto;
    #valorPago;
  
    constructor(placa, dataHoraEntrada, tipoCliente) {
      if (!placa || !dataHoraEntrada) {
        throw new Error("Placa e data/hora de entrada são obrigatórios");
      }
      this.#placa = placa;
      this.#tipoCliente = tipoCliente;
      this.#dataHoraEntrada = new Date(dataHoraEntrada);
      this.#dataHoraSaida = null;
      this.#valorCobrado = 0;
      this.#descontoId = "nenhum";
      this.#valorDesconto = 0;
      this.#valorPago = 0;
    }
  
    // --- Getters ---
    get placa() { return this.#placa; }
    get tipoCliente() { return this.#tipoCliente; }
    get dataHoraEntrada() { return this.#dataHoraEntrada; }
    get dataHoraSaida() { return this.#dataHoraSaida; }
    get valorCobrado() { return this.#valorCobrado; }
    get descontoId() { return this.#descontoId; }
    get valorDesconto() { return this.#valorDesconto; }
    get valorPago() { return this.#valorPago; }
    get valorDevido() {
      return (
        this.#valorCobrado -
        this.#valorDesconto
      );
    }
  
    // O ticket ainda está aberto? (veículo dentro do estacionamento)
    get aberto() {
      return this.#dataHoraSaida === null;
    }
  
    // Quantas horas o veículo ficou (arredonda pra cima)
    calcularHoras() {
      if (this.aberto) {
        throw new Error("Ticket ainda está aberto");
      }
      let diffMs = this.#dataHoraSaida - this.#dataHoraEntrada;
      return Math.ceil(diffMs / (1000 * 60 * 60));
    }
  
    // Registra a saída com todos os dados de cobrança
    registrarSaida(dataHoraSaida, valorCobrado, descontoId, valorDesconto, valorPago) {
      if (!this.aberto) {
        throw new Error("Ticket já foi encerrado");
      }
      this.#dataHoraSaida = new Date(dataHoraSaida);
      this.#valorCobrado = valorCobrado;
      this.#descontoId = descontoId || "nenhum";
      this.#valorDesconto = valorDesconto;
      this.#valorPago = valorPago;
    }
  
    toString() {
      let str = `${this.#placa} | Entrada: ${this.#dataHoraEntrada.toLocaleString()}`;
      if (!this.aberto) {
        str += ` | Saída: ${this.#dataHoraSaida.toLocaleString()}`;
        str += ` | Cobrado: R$ ${this.#valorCobrado.toFixed(2)}`;
        if (this.#valorDesconto > 0) {
          str += ` | Desconto(${this.#descontoId}): R$ ${this.#valorDesconto.toFixed(2)}`;
        }
        str += ` | Pago: R$ ${this.#valorPago.toFixed(2)}`;
      } else {
        str += " | [ESTACIONADO]";
      }
      return str;
    }
  }