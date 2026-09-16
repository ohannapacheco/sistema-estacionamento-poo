import assert from "node:assert/strict";

import {
  CadastroClientes
} from "./CadastroCliente.js";

import {
  RegistroDeEntradas_E_Saidas
} from "./RegistroEntradasSaidas.js";

import { Professor } from "./Professor.js";
import { Estudante } from "./Estudante.js";
import { Empresa } from "./Empresa.js";


// ======================================================
// PREPARAÇÃO
// ======================================================

const cadastro =
  new CadastroClientes();

const registros =
  new RegistroDeEntradas_E_Saidas(
    cadastro
  );

function data(
  dia,
  hora,
  minuto = 0
) {
  return new Date(
    2026,
    8, // setembro
    dia,
    hora,
    minuto,
    0
  );
}


// ======================================================
// TESTE 1
// PROFESSOR: APENAS UM VEÍCULO POR VEZ
// ======================================================

console.log(
  "\n1. Professor - um veículo por vez"
);

const professor =
  new Professor(
    "11111111111",
    "Professor Teste"
  );

professor.adicionarPlaca(
  "PRF1A11"
);

professor.adicionarPlaca(
  "PRF2A22"
);

cadastro.cadastrarCliente(
  professor
);

// Primeiro carro entra normalmente.
registros.registrarEntrada(
  "PRF1A11",
  data(5, 8)
);

// Segundo carro deve ser rejeitado.
assert.throws(
  () => {
    registros.registrarEntrada(
      "PRF2A22",
      data(5, 9)
    );
  },
  /já possui um veículo estacionado/
);

console.log(
  "✓ Segundo veículo foi bloqueado"
);

// Depois da saída do primeiro,
// o segundo deve poder entrar.
registros.registrarSaida(
  "PRF1A11",
  data(5, 10)
);

registros.registrarEntrada(
  "PRF2A22",
  data(5, 11)
);

assert.equal(
  registros.veiculoEstacionado(
    "PRF2A22"
  ),
  true
);

console.log(
  "✓ Segundo veículo entrou após a saída do primeiro"
);

// Fecha o ticket para não interferir
// nos testes seguintes.
registros.registrarSaida(
  "PRF2A22",
  data(5, 12)
);


// ======================================================
// TESTE 2
// ESTUDANTE: SALDO NEGATIVO BLOQUEIA NOVA ENTRADA
// ======================================================

console.log(
  "\n2. Estudante - saldo negativo"
);

const estudante =
  new Estudante(
    "22222222222",
    "Estudante Teste"
  );

estudante.adicionarPlaca(
  "EST1A11"
);

// Só R$ 10 de saldo.
// O ingresso custa R$ 25.
estudante.carregarSaldo(10);

cadastro.cadastrarCliente(
  estudante
);

// A entrada é permitida,
// pois o saldo ainda não é negativo.
registros.registrarEntrada(
  "EST1A11",
  data(6, 8)
);

// Na saída, o saldo pode ficar negativo.
registros.registrarSaida(
  "EST1A11",
  data(6, 10)
);

assert.equal(
  estudante.saldo,
  -15
);

assert.equal(
  estudante.bloqueado,
  true
);

console.log(
  `✓ Saldo ficou negativo: R$ ${estudante.saldo}`
);

// Agora uma nova entrada deve ser bloqueada.
assert.throws(
  () => {
    registros.registrarEntrada(
      "EST1A11",
      data(6, 11)
    );
  },
  /saldo negativo/
);

console.log(
  "✓ Nova entrada foi corretamente bloqueada"
);


// ======================================================
// TESTE 3
// EMPRESA: DÉBITO NÃO BLOQUEIA,
// MAS INADIMPLÊNCIA BLOQUEIA TODOS OS VEÍCULOS
// ======================================================

console.log(
  "\n3. Empresa - inadimplência"
);

const empresa =
  new Empresa(
    "33333333333333",
    "Empresa Teste"
  );

empresa.adicionarPlaca(
  "EMP1A11"
);

empresa.adicionarPlaca(
  "EMP2A22"
);

cadastro.cadastrarCliente(
  empresa
);

// Gera débito com o primeiro carro.
registros.registrarEntrada(
  "EMP1A11",
  data(7, 8)
);

registros.registrarSaida(
  "EMP1A11",
  data(7, 12)
);

assert.equal(
  empresa.debito,
  20
);

// Ter débito, por si só,
// ainda não significa inadimplência.
assert.equal(
  empresa.bloqueado,
  false
);

console.log(
  "✓ Empresa com débito ainda não está bloqueada"
);

// Agora marcamos como inadimplente.
empresa.marcarInadimplente();

assert.equal(
  empresa.bloqueado,
  true
);

console.log(
  "✓ Empresa ficou inadimplente"
);

// Outro veículo da mesma empresa
// também deve ser impedido de entrar.
assert.throws(
  () => {
    registros.registrarEntrada(
      "EMP2A22",
      data(7, 13)
    );
  },
  /inadimplente/
);

console.log(
  "✓ Outro veículo da empresa também foi bloqueado"
);

// Quitação completa.
empresa.registrarPagamento(
  empresa.debito
);

assert.equal(
  empresa.debito,
  0
);

assert.equal(
  empresa.inadimplente,
  false
);

assert.equal(
  empresa.bloqueado,
  false
);

console.log(
  "✓ Pagamento total regularizou a empresa"
);

// Agora o segundo veículo deve entrar.
registros.registrarEntrada(
  "EMP2A22",
  data(7, 14)
);

assert.equal(
  registros.veiculoEstacionado(
    "EMP2A22"
  ),
  true
);

console.log(
  "✓ Veículo voltou a ter entrada autorizada"
);

registros.registrarSaida(
  "EMP2A22",
  data(7, 16)
);


// ======================================================
// TESTE 4
// AVULSO: RECUSA DE PAGAMENTO BLOQUEIA A PLACA
// ======================================================

console.log(
  "\n4. Avulso - recusa de pagamento"
);

registros.registrarEntrada(
  "AVU1B11",
  data(8, 8)
);

registros.registrarSaidaSemPagamento(
  "AVU1B11",
  data(8, 10)
);

assert.equal(
  cadastro.placaBloqueada(
    "AVU1B11"
  ),
  true
);

console.log(
  "✓ Placa foi incluída na lista de bloqueio"
);

// Nova entrada deve ser recusada.
assert.throws(
  () => {
    registros.registrarEntrada(
      "AVU1B11",
      data(8, 11)
    );
  },
  /está bloqueada/
);

console.log(
  "✓ Nova entrada do avulso foi recusada"
);


// ======================================================
// RESULTADO FINAL
// ======================================================

console.log(
  "\n========================================"
);

console.log(
  "TODOS OS TESTES DE BLOQUEIO PASSARAM ✓"
);

console.log(
  "========================================\n"
);