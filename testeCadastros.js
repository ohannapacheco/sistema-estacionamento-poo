import assert from "node:assert/strict";

import {
  CadastroClientes
} from "./CadastroCliente.js";

import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";


// ======================================================
// PREPARAÇÃO
// ======================================================

const cadastro =
  new CadastroClientes();


// ======================================================
// TESTE 1
// PROFESSOR: MÁXIMO DE 2 PLACAS
// ======================================================

console.log(
  "\n1. Professor - limite de 2 placas"
);

const professor =
  new Professor(
    "11111111111",
    "Professor Teste"
  );

professor.adicionarPlaca("PRF1A11");
professor.adicionarPlaca("PRF2A22");

assert.equal(
  professor.placas.size,
  2
);

assert.throws(
  () => {
    professor.adicionarPlaca(
      "PRF3A33"
    );
  }
);

console.log(
  "✓ Professor não aceitou a 3ª placa"
);

cadastro.cadastrarCliente(
  professor
);


// ======================================================
// TESTE 2
// ESTUDANTE: MÁXIMO DE 1 PLACA
// ======================================================

console.log(
  "\n2. Estudante - limite de 1 placa"
);

const estudante =
  new Estudante(
    "22222222222",
    "Estudante Teste"
  );

estudante.adicionarPlaca(
  "EST1A11"
);

assert.equal(
  estudante.placas.size,
  1
);

assert.throws(
  () => {
    estudante.adicionarPlaca(
      "EST2A22"
    );
  }
);

console.log(
  "✓ Estudante não aceitou a 2ª placa"
);

cadastro.cadastrarCliente(
  estudante
);


// ======================================================
// TESTE 3
// EMPRESA: QUANTIDADE LIVRE DE PLACAS
// ======================================================

console.log(
  "\n3. Empresa - várias placas"
);

const empresa =
  new Empresa(
    "33333333333333",
    "Empresa Teste"
  );

empresa.adicionarPlaca("EMP1A11");
empresa.adicionarPlaca("EMP2A22");
empresa.adicionarPlaca("EMP3A33");
empresa.adicionarPlaca("EMP4A44");
empresa.adicionarPlaca("EMP5A55");

assert.equal(
  empresa.placas.size,
  5
);

cadastro.cadastrarCliente(
  empresa
);

console.log(
  "✓ Empresa aceitou várias placas"
);


// ======================================================
// TESTE 4
// CPF/CNPJ DUPLICADO
// ======================================================

console.log(
  "\n4. CPF/CNPJ duplicado"
);

const outroProfessor =
  new Professor(
    "11111111111",
    "Outro Professor"
  );

outroProfessor.adicionarPlaca(
  "OUT1A11"
);

assert.throws(
  () => {
    cadastro.cadastrarCliente(
      outroProfessor
    );
  }
);

assert.equal(
  cadastro.buscarPorId(
    "11111111111"
  ).nome,
  "Professor Teste"
);

console.log(
  "✓ CPF duplicado foi rejeitado"
);


// ======================================================
// TESTE 5
// MESMA PLACA EM DOIS CLIENTES
// ======================================================

console.log(
  "\n5. Placa pertencendo a dois clientes"
);

const outroEstudante =
  new Estudante(
    "44444444444",
    "Outro Estudante"
  );

// PRF1A11 já pertence ao Professor.
outroEstudante.adicionarPlaca(
  "PRF1A11"
);

assert.throws(
  () => {
    cadastro.cadastrarCliente(
      outroEstudante
    );
  }
);

// O cliente rejeitado não deve
// ter ficado parcialmente cadastrado.
assert.equal(
  cadastro.buscarPorId(
    "44444444444"
  ),
  null
);

// A placa continua pertencendo
// ao Professor original.
assert.equal(
  cadastro.buscarPorPlaca(
    "PRF1A11"
  ).id,
  "11111111111"
);

console.log(
  "✓ Placa duplicada entre clientes foi rejeitada"
);


// ======================================================
// TESTE 6
// REMOVER PLACA E CADASTRÁ-LA NOVAMENTE
// ======================================================

console.log(
  "\n6. Remoção libera a placa"
);

cadastro.removerPlacaCliente(
  "11111111111",
  "PRF2A22"
);

assert.equal(
  cadastro.buscarPorPlaca(
    "PRF2A22"
  ),
  null
);

const novoEstudante =
  new Estudante(
    "55555555555",
    "Novo Estudante"
  );

novoEstudante.adicionarPlaca(
  "PRF2A22"
);

cadastro.cadastrarCliente(
  novoEstudante
);

assert.equal(
  cadastro.buscarPorPlaca(
    "PRF2A22"
  ).id,
  "55555555555"
);

console.log(
  "✓ Placa removida pôde ser usada por outro cliente"
);


// ======================================================
// TESTE 7
// ADICIONAR PLACA PELO CADASTRO
// ======================================================

console.log(
  "\n7. Adição de placa pelo CadastroClientes"
);

// Professor ficou somente com PRF1A11,
// então ainda possui uma vaga disponível.
cadastro.adicionarPlacaCliente(
  "11111111111",
  "NOV1A11"
);

assert.equal(
  cadastro.buscarPorPlaca(
    "NOV1A11"
  ).id,
  "11111111111"
);

console.log(
  "✓ Nova placa foi indexada corretamente"
);


// ======================================================
// RESULTADO
// ======================================================

console.log(
  "\n========================================"
);

console.log(
  "TODOS OS TESTES DE CADASTRO PASSARAM ✓"
);

console.log(
  "========================================\n"
);