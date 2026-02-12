#!/usr/bin/env node

const { z } = require('zod');
const fs = require('fs');
const path = require('path');

// Schemas
const cardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  image: z.string().min(1),
});
const memberSchema = z.string().min(1);
const assignmentSchema = z.object({
  date: z.string().min(1),
  member: z.string().min(1),
  cardId: z.string().min(1),
});

// Read files
const cardsPath = path.join(__dirname, '..', 'data', 'cards.json');
const membersPath = path.join(__dirname, '..', 'data', 'members.json');
const assignmentsPath = path.join(__dirname, '..', 'data', 'assignments.json');

let cards, members, assignments;

try {
  cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
  assignments = fs.existsSync(assignmentsPath) ? JSON.parse(fs.readFileSync(assignmentsPath, 'utf-8')) : [];
} catch (err) {
  console.error('❌ Erro ao ler arquivos:', err.message);
  process.exit(1);
}

console.log('\n📊 ANÁLISE COMPLETA DE DADOS\n');

// Validate cards
console.log('1️⃣  Validação de Cards:');
let cardsOk = true;
cards.forEach((card, idx) => {
  const res = cardSchema.safeParse(card);
  if (!res.success) {
    console.error(`   🚨 Card inválido no índice ${idx}: ${res.error.message}`);
    cardsOk = false;
  }
});
if (cardsOk) console.log('   ✅ Todos os cards válidos\n');

// Validate members
console.log('2️⃣  Validação de Membros:');
let membersOk = true;
members.forEach((member, idx) => {
  const res = memberSchema.safeParse(member);
  if (!res.success) {
    console.error(`   🚨 Nome inválido no índice ${idx}: ${res.error.message}`);
    membersOk = false;
  }
});
if (membersOk) console.log('   ✅ Todos os membros válidos\n');

// Validate assignments
console.log('3️⃣  Validação de Sorteios:');
let assignmentsOk = true;
assignments.forEach((a, idx) => {
  const res = assignmentSchema.safeParse(a);
  if (!res.success) {
    console.error(`   🚨 Sorteio inválido no índice ${idx}: ${res.error.message}`);
    assignmentsOk = false;
  }
});
if (assignmentsOk) console.log('   ✅ Todos os sorteios válidos\n');

// Check card-member mismatch
console.log('4️⃣  Integração Front/Back:');
const cardIds = cards.map(c => c.id);
const assignmentCardIds = new Set(assignments.map(a => a.cardId));
const invalidCardIds = Array.from(assignmentCardIds).filter(cid => !cardIds.includes(cid));
if (invalidCardIds.length > 0) {
  console.error(`   🚨 Card IDs não encontrados em cards.json: ${invalidCardIds.join(', ')}`);
} else {
  console.log('   ✅ Todos os card IDs em sorteios existem em cards.json');
}

const assignmentMembers = new Set(assignments.map(a => a.member));
const invalidMembers = Array.from(assignmentMembers).filter(m => !members.includes(m));
if (invalidMembers.length > 0) {
  console.error(`   🚨 Membros em sorteios não encontrados em members.json: ${invalidMembers.join(', ')}`);
} else {
  console.log('   ✅ Todos os membros em sorteios existem em members.json');
}
console.log();

// Check duplicates per date
console.log('5️⃣  Duplicidade de Funções por Data:');
const byDate = {};
let duplicatesFound = false;
assignments.forEach(a => {
  byDate[a.date] = byDate[a.date] || {};
  if (byDate[a.date][a.cardId]) {
    console.warn(`   ⚠️ Data ${a.date} - Função "${a.cardId}" atribuída a múltiplos membros: ${byDate[a.date][a.cardId]}, ${a.member}`);
    duplicatesFound = true;
  } else {
    byDate[a.date][a.cardId] = a.member;
  }
});
if (!duplicatesFound) console.log('   ✅ Nenhuma duplicidade encontrada\n');

// Check repeated function for same member
console.log('6️⃣  Repetição de Função para o Mesmo Membro:');
const memberAssignments = {};
assignments.forEach(a => {
  memberAssignments[a.member] = memberAssignments[a.member] || [];
  memberAssignments[a.member].push(a);
});
let repetitionsFound = false;
Object.keys(memberAssignments).forEach(member => {
  const sorted = memberAssignments[member].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.cardId === curr.cardId) {
      console.warn(`   ⚠️ ${member} repetiu a função "${curr.cardId}" em ${prev.date} e ${curr.date}`);
      repetitionsFound = true;
    }
  }
});
if (!repetitionsFound) console.log('   ✅ Nenhuma repetição encontrada\n');

// Summary
console.log('═══════════════════════════════════════');
console.log('📈 RESUMO:');
console.log(`   Cards: ${cards.length}`);
console.log(`   Membros: ${members.length}`);
console.log(`   Sorteios gravados: ${assignments.length}`);
console.log('═══════════════════════════════════════\n');
