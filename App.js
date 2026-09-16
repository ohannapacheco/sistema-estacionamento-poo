import {
  existsSync,
  mkdirSync,
  writeFileSync
} from "node:fs";
import { RelatoriosGerenciais } from "./RelatoriosGerenciais.js";
import { CadastroClientes } from "./CadastroCliente.js";
import {
  RegistroDeEntradas_E_Saidas
} from "./RegistroEntradasSaidas.js";

export class App {
    #cadastro;
    #registros;
    #relatorios;
  
    constructor() {
        this.#cadastro = new CadastroClientes();
  
        this.#registros =
            new RegistroDeEntradas_E_Saidas(
                this.#cadastro
            );

        this.#relatorios =
            new RelatoriosGerenciais(
              this.#cadastro,
              this.#registros
            );
        
        process.on("SIGINT", () => {
            this.salvarDados();
        
            console.log("\nSistema encerrado.");
        
            process.exit(0);
        });
    }
  
    get cadastro() {
      return this.#cadastro;
    }
  
    get registros() {
      return this.#registros;
    }

    get relatorios() {
      return this.#relatorios;
    }

    inicializar() {
      console.log("Carregando dados...");
    
      this.#garantirArquivosDeDados();
    
      this.#cadastro.carregarDeCSV(
        "./dados/clientes.csv"
      );
    
      this.#cadastro.carregarInadimplentesDeCSV(
        "./dados/inadimplentes.csv"
      );
    
      this.#registros.carregarDeCSV(
        "./dados/registros.csv"
      );
    
      console.log("Dados carregados com sucesso.");
    }

    salvarDados() {
        console.log("\nSalvando dados...");
      
        this.#cadastro.salvarEmCSV(
          "./dados/clientes.csv"
        );
      
        this.#cadastro.salvarInadimplentesEmCSV(
          "./dados/inadimplentes.csv"
        );
      
        this.#registros.salvarEmCSV(
          "./dados/registros.csv"
        );
      
        console.log("Dados salvos com sucesso.");
    }

    #garantirArquivosDeDados() {

      // Se a pasta "dados" não existir,
      // cria automaticamente.
      if (!existsSync("./dados")) {
        mkdirSync("./dados");
      }
    
      const arquivos = [
        "./dados/clientes.csv",
        "./dados/registros.csv",
        "./dados/inadimplentes.csv"
      ];
    
      for (const caminho of arquivos) {
    
        // Se o arquivo não existir,
        // cria um CSV vazio.
        if (!existsSync(caminho)) {
          writeFileSync(
            caminho,
            "",
            "utf-8"
          );
    
          console.log(
            `Arquivo criado: ${caminho}`
          );
        }
      }
    }


  }

