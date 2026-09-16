# Plano Técnico: Task Manager API

Traduz [spec.md](./spec.md) em decisões de implementação. Segunda etapa do
ciclo SDD (spec → **plan** → tasks → código).

## Stack

- **Runtime**: Node.js 20 + Express — leve, suficiente para os 6 endpoints
  da spec, sem necessidade de framework mais pesado.
- **Armazenamento**: `Map` em memória, encapsulado em `src/store.js`. Sem
  banco de dados: reduz a superfície de infraestrutura na AWS a uma única
  instância EC2, sem estado persistente a proteger/migrar.
- **Testes**: Jest + Supertest, cobrindo os 9 critérios de aceite da spec
  diretamente contra o app Express (sem subir servidor de verdade).
- **Empacotamento**: Docker multi-stage (`node:20-alpine`), usuário
  não-root, `HEALTHCHECK` batendo em `/health`.

## Mapeamento spec → código

| Item da spec              | Arquivo                        |
|----------------------------|---------------------------------|
| Modelo `Task`               | `src/store.js`                 |
| `GET /health`                | `src/app.js`                   |
| CRUD de `/tasks`             | `src/routes/tasks.js`          |
| Validação de `title`/`status`| `src/routes/tasks.js`          |
| Critérios de aceite 1–9      | `test/tasks.test.js`           |

## Infraestrutura

- **AWS EC2 simples** (não cluster): 1 instância `t3.micro` (free-tier),
  Amazon Linux 2023, provisionada via Terraform (`infra/`).
- A instância roda a imagem Docker publicada no GitHub Container Registry
  (GHCR) — evita provisionar ECR só para este sistema simples.
- Security group restringe SSH ao IP do operador (variável obrigatória,
  sem default) e libera a porta 3000 publicamente (a própria API).
- Terraform gera seu próprio par de chaves SSH (`tls_private_key`), evitando
  dependência de key pair pré-existente na conta AWS.

## Pipeline / Deploy

- **CI (`ci-cd.yml`)**: testes → scan de segurança (Trivy) → build/push da
  imagem no GHCR → deploy via SSH na EC2 existente.
- **Infra (`infra.yml`)**: plano do Terraform → scan de configuração
  (Trivy) do próprio IaC → apply manual aprovado.
- Scanner de segurança (Trivy) age como **gate obrigatório antes de
  qualquer deploy** (imagem ou infra): severidade `CRITICAL`/`HIGH` quebra
  o pipeline.

## Fora de escopo (consistente com a spec)

- Sem orquestrador de containers (ECS/EKS) — EC2 único é suficiente para o
  objetivo de demonstrar o ciclo, e foi a opção escolhida.
- Sem banco de dados gerenciado (RDS) — não há necessidade, dado que a
  spec não exige persistência entre reinícios.
