# Nova Criatura — Paz Church Funções

Este projeto gerencia as funções da célula (Sorteio Justo, programação, etc.) usando Next.js e Supabase.

---

## 🚀 Orientações de Git (Para IAs e Devs)

* **Multi-Contas Git:** A máquina de desenvolvimento possui múltiplos perfis do GitHub configurados globalmente (incluindo contas corporativas).
* **Configuração do Remote:** O remote local `origin` já foi configurado para usar a URL HTTPS contendo o Personal Access Token (PAT) correto diretamente.
* **Comando para Push:** Sempre que for instruir ou realizar um `git push`, utilize apenas:
  ```bash
  git push
  ```
  Isso utilizará a URL autenticada salva no `.git/config` local (`https://<TOKEN>@github.com/BalabStudio/Nova-Criatura-.git`), contornando restrições do Keychain global.

---

## ⚙️ Variáveis de Ambiente (`.env.local`)

Este projeto necessita de conexão com o projeto do Supabase correto. Certifique-se de configurar:
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (Chave Service Role privada, nunca expor no cliente)
* `ADMIN_PASSWORD` (Senha de controle do Administrador)
