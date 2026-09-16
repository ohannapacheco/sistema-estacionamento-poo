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
// PREPARAÇÃO DO AMBIENTE DE TESTE
// ======================================================

const cadastro = new CadastroClientes();

const registros =
  new RegistroDeEntradas_E_Saidas(
    cadastro
  );


// ------------------------------------------------------
// Professor
// ------------------------------------------------------

const professor =
  new Professor(
    "11111111111",
    "Professor Teste"
  );

professor.adicionarPlaca(
  "PRO1A11"
);

cadastro.cadastrarCliente(
  professor
);


// ------------------------------------------------------
// Estudante
// ------------------------------------------------------

const estudante =
  new Estudante(
    "22222222222",
    "Estudante Teste"
  );

estudante.adicionarPlaca(
  "EST1A11"
);

// Colocamos crédito suficiente para
// executar os dois testes.
estudante.carregarSaldo(200);

cadastro.cadastrarCliente(
  estudante
);


// ------------------------------------------------------
// Empresa
// ------------------------------------------------------

const empresa =
  new Empresa(
    "33333333333333",
    "Empresa Teste"
  );

empresa.adicionarPlaca(
  "EMP1A11"
);

cadastro.cadastrarCliente(
  empresa
);


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

// Setembro = mês 8 porque os meses no Date
// começam em zero:
// janeiro = 0
// setembro = 8
function data(
  dia,
  hora,
  minuto = 0
) {
  return new Date(
    2026,
    8,
    dia,
    hora,
    minuto,
    0
  );
}


// Executa entrada + saída e devolve
// o ticket já fechado.
function testarPermanencia(
  placa,
  entrada,
  saida
) {
  registros.registrarEntrada(
    placa,
    entrada
  );

  return registros.registrarSaida(
    placa,
    saida
  );
}


// ======================================================
// TESTE 1
// AVULSO - 2 HORAS
// ======================================================

console.log(
  "\n1. Avulso - 2 horas"
);

const avulso2h =
  testarPermanencia(
    "AVU1A11",
    data(5, 8),
    data(5, 10)
  );

assert.equal(
  avulso2h.valorCobrado,
  20
);

console.log(
  "✓ Esperado: R$ 20"
);

console.log(
  `✓ Obtido: R$ ${avulso2h.valorCobrado}`
);


// ======================================================
// TESTE 2
// AVULSO - EXATAMENTE 6 HORAS
// ======================================================

console.log(
  "\n2. Avulso - exatamente 6 horas"
);

const avulso6h =
  testarPermanencia(
    "AVU2A22",
    data(5, 8),
    data(5, 14)
  );

assert.equal(
  avulso6h.valorCobrado,
  60
);

console.log(
  "✓ Esperado: R$ 60"
);

console.log(
  `✓ Obtido: R$ ${avulso6h.valorCobrado}`
);


// ======================================================
// TESTE 3
// AVULSO - MAIS DE 6 HORAS
// ======================================================

console.log(
  "\n3. Avulso - mais de 6 horas"
);

const avulsoMais6h =
  testarPermanencia(
    "AVU3A33",
    data(5, 8),
    data(5, 14, 1)
  );

assert.equal(
  avulsoMais6h.valorCobrado,
  50
);

console.log(
  "✓ Esperado: R$ 50"
);

console.log(
  `✓ Obtido: R$ ${avulsoMais6h.valorCobrado}`
);


// ======================================================
// TESTE 4
// AVULSO - ATRAVESSA A MEIA-NOITE
// ======================================================

console.log(
  "\n4. Avulso - atravessa a meia-noite"
);

const avulsoMeiaNoite =
  testarPermanencia(
    "AVU4A44",
    data(5, 23, 30),
    data(6, 0, 30)
  );

assert.equal(
  avulsoMeiaNoite.valorCobrado,
  60
);

console.log(
  "✓ Esperado: R$ 60"
);

console.log(
  `✓ Obtido: R$ ${avulsoMeiaNoite.valorCobrado}`
);


// ======================================================
// TESTE 5
// PROFESSOR - GRATUITO
// ======================================================

console.log(
  "\n5. Professor"
);

const ticketProfessor =
  testarPermanencia(
    "PRO1A11",
    data(5, 8),
    data(5, 17)
  );

assert.equal(
  ticketProfessor.valorCobrado,
  0
);

console.log(
  "✓ Esperado: R$ 0"
);

console.log(
  `✓ Obtido: R$ ${ticketProfessor.valorCobrado}`
);


// ======================================================
// TESTE 6
// ESTUDANTE - MESMO DIA
// ======================================================

console.log(
  "\n6. Estudante - mesmo dia"
);

const saldoAntes1 =
  estudante.saldo;

const ticketEstudante1 =
  testarPermanencia(
    "EST1A11",
    data(5, 8),
    data(5, 15)
  );

assert.equal(
  ticketEstudante1.valorCobrado,
  25
);

assert.equal(
  estudante.saldo,
  saldoAntes1 - 25
);

console.log(
  "✓ Cobrança esperada: R$ 25"
);

console.log(
  `✓ Cobrança obtida: R$ ${ticketEstudante1.valorCobrado}`
);

console.log(
  `✓ Saldo após saída: R$ ${estudante.saldo}`
);


// ======================================================
// TESTE 7
// ESTUDANTE - ATRAVESSA A MEIA-NOITE
// ======================================================

console.log(
  "\n7. Estudante - atravessa a meia-noite"
);

const saldoAntes2 =
  estudante.saldo;

const ticketEstudante2 =
  testarPermanencia(
    "EST1A11",
    data(6, 23),
    data(7, 1)
  );

assert.equal(
  ticketEstudante2.valorCobrado,
  50
);

assert.equal(
  estudante.saldo,
  saldoAntes2 - 50
);

console.log(
  "✓ Cobrança esperada: R$ 50"
);

console.log(
  `✓ Cobrança obtida: R$ ${ticketEstudante2.valorCobrado}`
);

console.log(
  `✓ Saldo após saída: R$ ${estudante.saldo}`
);


// ======================================================
// TESTE 8
// EMPRESA - MESMO DIA
// ======================================================

console.log(
  "\n8. Empresa - mesmo dia"
);

const debitoAntes1 =
  empresa.debito;

const ticketEmpresa1 =
  testarPermanencia(
    "EMP1A11",
    data(5, 8),
    data(5, 18)
  );

assert.equal(
  ticketEmpresa1.valorCobrado,
  20
);

assert.equal(
  empresa.debito,
  debitoAntes1 + 20
);

console.log(
  "✓ Cobrança esperada: R$ 20"
);

console.log(
  `✓ Cobrança obtida: R$ ${ticketEmpresa1.valorCobrado}`
);

console.log(
  `✓ Débito da empresa: R$ ${empresa.debito}`
);


// ======================================================
// TESTE 9
// EMPRESA - ATRAVESSA A MEIA-NOITE
// ======================================================

console.log(
  "\n9. Empresa - atravessa a meia-noite"
);

const debitoAntes2 =
  empresa.debito;

const ticketEmpresa2 =
  testarPermanencia(
    "EMP1A11",
    data(6, 20),
    data(7, 8)
  );

assert.equal(
  ticketEmpresa2.valorCobrado,
  70
);

assert.equal(
  empresa.debito,
  debitoAntes2 + 70
);

console.log(
  "✓ Cobrança esperada: R$ 70"
);

console.log(
  `✓ Cobrança obtida: R$ ${ticketEmpresa2.valorCobrado}`
);

console.log(
  `✓ Débito da empresa: R$ ${empresa.debito}`
);


// ======================================================
// RESULTADO FINAL
// ======================================================

console.log(
  "\n================================"
);

console.log(
  "TODOS OS TESTES DE COBRANÇA PASSARAM ✓"
);

console.log(
  "================================\n"
);