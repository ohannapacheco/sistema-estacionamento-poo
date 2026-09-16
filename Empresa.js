import { Cliente } from "./Cliente.js";

export class Empresa extends Cliente {
  #debito;
  #inadimplente;

  constructor(cnpj, nome) {
    super(cnpj, nome, Infinity);  // sem limite de placas
    this.#debito = 0;
    this.#inadimplente = false;
  }

  get debito() { return this.#debito; }
  get inadimplente() { return this.#inadimplente; }

  adicionarDebito(valor) {
    if (valor <= 0) {
      throw new Error("Valor deve ser positivo");
    }
    this.#debito += valor;
  }

  registrarPagamento(valor) {
    this.#debito -= valor;
    if (this.#debito <= 0) {
      this.#debito = 0;
      this.#inadimplente = false;
    }
  }

  marcarInadimplente() {
    this.#inadimplente = true;
  }

  get bloqueado() {
    return this.#inadimplente;
  }

  toString() {
    let str = `${super.toString()} | Débito: R$ ${this.#debito.toFixed(2)}`;
    if (this.#inadimplente) str += " [INADIMPLENTE]";
    return str;
  }
}