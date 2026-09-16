export class Cliente {
    #id;
    #nome;
    #placas;
    #maxPlacas;
  
    constructor(id, nome, maxPlacas) {
      if (!id || !nome) {
        throw new Error("ID e nome são obrigatórios");
      }
      this.#id = id;
      this.#nome = nome;
      this.#maxPlacas = maxPlacas;
      this.#placas = new Set();
    }
  
    get id() { return this.#id; }
    get nome() { return this.#nome; }
    get placas() { return this.#placas; }
    get maxPlacas() { return this.#maxPlacas; }
  
    adicionarPlaca(placa) {
      if (!placa) {
        throw new Error("Placa inválida");
      }
      if (this.#placas.size >= this.#maxPlacas) {
        throw new Error("Limite de placas atingido");
      }
      this.#placas.add(placa);
    }
  
    removerPlaca(placa) {
      if (!this.#placas.has(placa)) {
        throw new Error("Placa não encontrada");
      }
      this.#placas.delete(placa);
    }
  
    possuiPlaca(placa) {
      return this.#placas.has(placa);
    }
  
    toString() {
      return `${this.#id} - ${this.#nome} [${[...this.#placas].join(", ")}]`;
    }
  }