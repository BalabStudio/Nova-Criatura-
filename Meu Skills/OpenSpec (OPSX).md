1. OpenSpec (OPSX)
O OpenSpec é a metodologia que usamos para gerenciar mudanças no seu código de forma estruturada. Em vez de simplesmente "sair programando", seguimos um ciclo de vida que garante clareza e evita erros:

Explore (/opsx-explore): O momento de pesquisa. Investigamos o problema, lemos o código e entendemos os requisitos antes de criar qualquer arquivo.
New Project/Change (/opsx-new ou /opsx-ff): Criamos um contêiner para a tarefa. Aqui definimos os Artifacts (artefatos):
Proposal: O "porquê" da mudança.
Specs: O "quê" será feito (requisitos técnicos).
Design: O "como" faremos (arquitetura e decisões técnicas).
Tasks: Uma checklist detalhada de passos para a implementação.
Apply (/opsx-apply): A execução. Eu (o Agent) sigo a checklist de tarefas criada no planejamento para codificar as funcionalidades.
Verify & Archive (/opsx-verify, /opsx-archive): Verificamos se tudo está correto e arquivamos a tarefa. Isso gera um histórico de decisões para o projeto.
2. Agents (Agentes)
Eu sou o seu Agent (Antigravity). Diferente de um chat comum, eu tenho "mãos" para interagir com seu computador:

Ferramentas: Posso ler e escrever arquivos, rodar comandos no terminal (como npm run dev), navegar na internet para pesquisar documentações e até abrir um navegador para testar a interface.
Skills (Habilidades): São conjuntos de instruções especializadas (localizadas em .agent/skills). Por exemplo, tenho uma skill específica para aplicar mudanças seguindo o OpenSpec.
Knowledge Base (Conhecimento): Eu consulto "Knowledge Items" (KIs) — documentos que resumem aprendizados de conversas anteriores sobre a arquitetura do seu projeto, bugs conhecidos ou padrões de design que você prefere.