import { readFileSync, writeFileSync } from "node:fs";

import { Estudante } from "./Estudante.js";
import { Professor } from "./Professor.js";
import { Empresa } from "./Empresa.js";

export class CadastroClientes {
    #clientes;        // Map: id (CPF/CNPJ) → objeto Cliente
    #placaParaCliente; // Map: placa → id do dono
    #listaBloqueio;    // Set: placas bloqueadas (avulsos inadimplentes)
  
    constructor() {
      this.#clientes = new Map();
      this.#placaParaCliente = new Map();
      this.#listaBloqueio = new Set();
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
    
          if (campos.length < 3) {
            throw new Error(
              "quantidade insuficiente de campos"
            );
          }
    
          const id = campos[0];
          const nome = campos[1];
          const terceiroCampo = campos[2];
    
          if (!id) {
            throw new Error(
              "CPF/CNPJ ausente"
            );
          }
    
          if (!nome) {
            throw new Error(
              "nome ausente"
            );
          }
    
          let cliente;
    
          // =================================
          // PROFESSOR
          // =================================
          if (
            terceiroCampo.toUpperCase() ===
            "PROFESSOR"
          ) {
            const placas = campos
              .slice(3)
              .filter(placa => placa.length > 0)
              .map(placa => placa.toUpperCase());
    
            // Impede repetição dentro da
            // própria linha do CSV.
            if (
              new Set(placas).size !==
              placas.length
            ) {
              throw new Error(
                "placa repetida na mesma linha"
              );
            }
    
            cliente =
              new Professor(id, nome);
    
            for (const placa of placas) {
              cliente.adicionarPlaca(placa);
            }
          }
    
          // =================================
          // ESTUDANTE OU EMPRESA
          // =================================
          else {
            if (campos.length < 4) {
              throw new Error(
                "tipo de cliente ausente"
              );
            }
    
            const tipo =
              campos[3].toUpperCase();
    
            if (
              tipo !== "ESTUDANTE" &&
              tipo !== "EMPRESA"
            ) {
              throw new Error(
                "tipo de cliente desconhecido"
              );
            }
    
            const valor =
              Number(terceiroCampo);
    
            if (!Number.isFinite(valor)) {
              throw new Error(
                tipo === "ESTUDANTE"
                  ? "saldo inválido"
                  : "débito inválido"
              );
            }
    
            const placas = campos
              .slice(4)
              .filter(placa => placa.length > 0)
              .map(placa => placa.toUpperCase());
    
            if (
              new Set(placas).size !==
              placas.length
            ) {
              throw new Error(
                "placa repetida na mesma linha"
              );
            }
    
            // -------------------------
            // ESTUDANTE
            // -------------------------
            if (tipo === "ESTUDANTE") {
              cliente =
                new Estudante(id, nome);
    
              // Saldo negativo é válido:
              // estudante pode sair mesmo sem
              // saldo suficiente e ficar bloqueado.
              cliente.carregarSaldo(valor);
    
              for (const placa of placas) {
                cliente.adicionarPlaca(placa);
              }
            }
    
            // -------------------------
            // EMPRESA
            // -------------------------
            else {
              if (valor < 0) {
                throw new Error(
                  "débito da empresa não pode ser negativo"
                );
              }
    
              cliente =
                new Empresa(id, nome);
    
              if (valor > 0) {
                cliente.adicionarDebito(valor);
              }
    
              for (const placa of placas) {
                cliente.adicionarPlaca(placa);
              }
            }
          }
    
          // Só cadastra depois que toda
          // a linha foi validada.
          this.cadastrarCliente(cliente);
        }
        catch (erro) {
          ignoradas++;
    
          console.warn(
            `Linha ${indice + 1} de clientes.csv ignorada: ${erro.message}`
          );
    
          console.warn(
            `  Conteúdo: ${linha}`
          );
        }
      }
    
      if (ignoradas > 0) {
        console.warn(
          `\n${ignoradas} linha(s) inválida(s) de clientes foram ignoradas.`
        );
      }
    
      return this.totalClientes;
    }

    salvarEmCSV(caminhoArquivo) {
      const linhas = [];
    
      for (const cliente of this.todos) {
        const placas = [...cliente.placas];
    
        // -------------------------
        // ESTUDANTE
        // -------------------------
        if (cliente instanceof Estudante) {
          const linha = [
            cliente.id,
            cliente.nome,
            cliente.saldo,
            "Estudante",
            ...placas
          ];
    
          linhas.push(linha.join(","));
        }
    
        // -------------------------
        // PROFESSOR
        // -------------------------
        else if (cliente instanceof Professor) {
          const linha = [
            cliente.id,
            cliente.nome,
            "Professor",
            ...placas
          ];
    
          linhas.push(linha.join(","));
        }
    
        // -------------------------
        // EMPRESA
        // -------------------------
        else if (cliente instanceof Empresa) {
          const linha = [
            cliente.id,
            cliente.nome,
            cliente.debito,
            "Empresa",
            ...placas
          ];
    
          linhas.push(linha.join(","));
        }
    
        else {
          throw new Error(
            `Tipo de cliente desconhecido: ${cliente.constructor.name}`
          );
        }
      }
    
      writeFileSync(
        caminhoArquivo,
        linhas.join("\n"),
        "utf-8"
      );
    
      return linhas.length;
    }

    carregarInadimplentesDeCSV(caminhoArquivo) {
      const conteudo = readFileSync(
        caminhoArquivo,
        "utf-8"
      );

      const linhas = conteudo
        .split(/\r?\n/)
        .filter(linha => linha.trim().length > 0);

      const processados = new Set();

      let carregadas = 0;
      let ignoradas = 0;

      for (
        let indice = 0;
        indice < linhas.length;
        indice++
      ) {
        const linha = linhas[indice];

        try {
          const id = linha.trim();

          // -------------------------
          // IDENTIFICADOR
          // -------------------------
          if (!id) {
            throw new Error(
              "CPF/CNPJ ausente"
            );
          }

          // O formato deste arquivo possui
          // apenas um identificador por linha.
          if (id.includes(",")) {
            throw new Error(
              "formato inválido"
            );
          }

          // -------------------------
          // DUPLICIDADE NO ARQUIVO
          // -------------------------
          if (processados.has(id)) {
            throw new Error(
              "empresa repetida no arquivo"
            );
          }

          processados.add(id);

          // -------------------------
          // CLIENTE EXISTE?
          // -------------------------
          const cliente =
            this.buscarPorId(id);

          if (!cliente) {
            throw new Error(
              "cliente não encontrado"
            );
          }

          // -------------------------
          // É EMPRESA?
          // -------------------------
          if (!(cliente instanceof Empresa)) {
            throw new Error(
              "cliente não é uma Empresa"
            );
          }

          // -------------------------
          // HÁ DÉBITO?
          // -------------------------
          if (cliente.debito <= 0) {
            throw new Error(
              "empresa não possui débito pendente"
            );
          }

          // -------------------------
          // MARCA INADIMPLÊNCIA
          // -------------------------
          cliente.marcarInadimplente();

          carregadas++;
        }
        catch (erro) {
          ignoradas++;

          console.warn(
            `Linha ${indice + 1} de inadimplentes.csv ignorada: ${erro.message}`
          );

          console.warn(
            `  Conteúdo: ${linha}`
          );
        }
      }

      if (ignoradas > 0) {
        console.warn(
          `\n${ignoradas} linha(s) inválida(s) de inadimplência foram ignoradas.`
        );
      }

      return carregadas;
    }

    salvarInadimplentesEmCSV(caminhoArquivo) {
      const idsInadimplentes = [];
    
      for (const cliente of this.todos) {
        if (
          cliente instanceof Empresa &&
          cliente.inadimplente
        ) {
          idsInadimplentes.push(cliente.id);
        }
      }
    
      writeFileSync(
        caminhoArquivo,
        idsInadimplentes.join("\n"),
        "utf-8"
      );
    
      return idsInadimplentes.length;
    }
  
    // --- Cadastro de clientes ---
  
    cadastrarCliente(cliente) {

      // Não permite dois clientes com o mesmo CPF/CNPJ.
      if (this.#clientes.has(cliente.id)) {
        throw new Error(
          `Cliente ${cliente.id} já cadastrado`
        );
      }
    
      // Antes de alterar qualquer Map, verifica
      // se alguma placa já pertence a outro cliente.
      for (const placa of cliente.placas) {
    
        if (this.#placaParaCliente.has(placa)) {
          throw new Error(
            `Placa ${placa} já está cadastrada para outro cliente`
          );
        }
      }
    
      // Só depois de todas as validações
      // fazemos as alterações em memória.
      this.#clientes.set(
        cliente.id,
        cliente
      );
    
      for (const placa of cliente.placas) {
        this.#placaParaCliente.set(
          placa,
          cliente.id
        );
      }
    }
  
    // --- Busca ---
  
    buscarPorId(id) {
      return this.#clientes.get(id) || null;
    }
  
    buscarPorPlaca(placa) {
      let idDono = this.#placaParaCliente.get(placa);
      if (!idDono) return null;
      return this.#clientes.get(idDono);
    }
  
    placaCadastrada(placa) {
      return this.#placaParaCliente.has(placa);
    }
  
    // --- Gerenciamento de placas ---
  
    adicionarPlacaCliente(id, placa) {
      let cliente = this.#clientes.get(id);
      if (!cliente) {
        throw new Error(`Cliente ${id} não encontrado`);
      }
      if (this.#placaParaCliente.has(placa)) {
        throw new Error(`Placa ${placa} já está cadastrada para outro cliente`);
      }
      cliente.adicionarPlaca(placa);              // valida o limite
      this.#placaParaCliente.set(placa, id);      // atualiza mapa reverso
    }
  
    removerPlacaCliente(id, placa) {
      let cliente = this.#clientes.get(id);
      if (!cliente) {
        throw new Error(`Cliente ${id} não encontrado`);
      }
      cliente.removerPlaca(placa);                // valida se a placa existe
      this.#placaParaCliente.delete(placa);       // remove do mapa reverso
    }
  
    // --- Lista de bloqueio (avulsos) ---
  
    bloquearPlaca(placa) {
      this.#listaBloqueio.add(placa);
    }
  
    desbloquearPlaca(placa) {
      this.#listaBloqueio.delete(placa);
    }
  
    placaBloqueada(placa) {
      return this.#listaBloqueio.has(placa);
    }
  
    // --- Consultas ---
  
    get totalClientes() {
      return this.#clientes.size;
    }
  
    // Iterador sobre todos os clientes
    get todos() {
      return this.#clientes.values();
    }
  
    // Retorna Set com todas as placas bloqueadas
    get bloqueados() {
      return new Set(this.#listaBloqueio);
    }
  
    toString() {
      let str = `Cadastro: ${this.#clientes.size} clientes\n`;
      for (const cliente of this.#clientes.values()) {
        str += `  ${cliente.toString()}\n`;
      }
      if (this.#listaBloqueio.size > 0) {
        str += `Bloqueados: ${[...this.#listaBloqueio].join(", ")}`;
      }
      return str;
    }
  }