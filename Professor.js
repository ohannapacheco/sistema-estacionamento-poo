import { Cliente } from "./Cliente.js";

export class Professor extends Cliente {
  constructor(cpf, nome) {
    super(cpf, nome, 2);  // limite de 2 placas
  }
}