import { Cliente } from "./Cliente.js";

export class Estudante extends Cliente {
  #saldo;

  constructor(cpf, nome) {
    super(cpf, nome, 1);  // limite de 1 placa
    this.#saldo = 0;
  }

  get saldo() { return this.#saldo; }

  adicionarCreditos(valor) {
    if (valor <= 0) {
      throw new Error("Valor deve ser positivo");
    }
    this.#saldo += valor;
  }

  debitarIngresso(valor) {
    this.#saldo -= valor;  // pode ficar negativo
  }

  // Usado para carregar saldo do arquivo CSV
  carregarSaldo(valor) {
    this.#saldo = valor;
  }

  get bloqueado() {
    return this.#saldo < 0;
  }

  toString() {
    let str = `${super.toString()} | Saldo: R$ ${this.#saldo.toFixed(2)}`;
    if (this.bloqueado) str += " [BLOQUEADO]";
    return str;
  }
}