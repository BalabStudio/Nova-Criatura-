
import { getAllowedCards } from '../lib/assignments';
import members from '../data/members.json';

async function testRestrictions() {
  console.log("--- Testando Restrições de Membros ---");
  
  const testCases = [
    { name: "Ana Letícia", expected: ["oracao", "quebra-gelo", "lanche"] },
    { name: "Hiris", expected: ["oracao", "quebra-gelo", "lanche"] },
    { name: "Richard", expected: [] } // Vazio significa sem restrições
  ];

  testCases.forEach(t => {
    const allowed = getAllowedCards(t.name);
    console.log(`${t.name} pode realizar: ${allowed.length > 0 ? allowed.join(", ") : "Qualquer função"}`);
    
    const isCorrect = JSON.stringify(allowed) === JSON.stringify(t.expected);
    if (!isCorrect) {
      console.error(`❌ ERRO: Restrição para ${t.name} está incorreta!`);
    } else {
      console.log(`✅ OK: Regra para ${t.name} validada.`);
    }
  });

  console.log("\n--- Validando Membros Totais ---");
  console.log(`Total de membros carregados: ${members.length}`);
}

testRestrictions();
