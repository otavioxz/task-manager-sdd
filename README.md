# Task Manager API — SDD + AWS EC2 + CI/CD + Security Scan

Sistema simples de gerenciamento de tarefas, construído para demonstrar o
ciclo completo de engenharia: **especificação → código → infraestrutura →
pipeline → deploy com gate de segurança**.

## Técnica de engenharia: Spec-Driven Development (SDD)

Antes de qualquer linha de código, o comportamento do sistema foi escrito
em [`specs/`](specs/), na ordem em que deve ser lido:

1. [`specs/spec.md`](specs/spec.md) — especificação funcional: endpoints,
   modelo de dados, critérios de aceite testáveis.
2. [`specs/plan.md`](specs/plan.md) — plano técnico: como a spec é
   traduzida em stack, infraestrutura e pipeline.
3. [`specs/tasks.md`](specs/tasks.md) — quebra em tarefas rastreáveis,
   cada uma referenciando a spec.

O código em `app/` implementa exatamente o que está em `spec.md`; os
testes em `app/test/tasks.test.js` cobrem, um a um, os 9 critérios de
aceite listados na spec. Qualquer mudança de comportamento deve começar
atualizando `spec.md`, não o código.

## Arquitetura

```
app/     API Node.js + Express (armazenamento em memória)
infra/   Terraform: 1 EC2 na AWS rodando a imagem Docker da app
.github/workflows/
  ci-cd.yml   test -> scan de seguranca (Trivy) -> build/push imagem -> deploy
  infra.yml   terraform plan -> scan do IaC (Trivy) -> apply manual
```

Sem cluster (ECS/EKS) e sem banco de dados: escopo deliberadamente
reduzido a uma única EC2 para manter o "sistema simples" pedido.

## Rodando localmente

```bash
cd app
npm install
npm test          # roda os 9 testes de aceite
npm start         # sobe em http://localhost:3000
```

Com Docker:

```bash
docker build -t task-manager-api -f app/Dockerfile app
docker run -p 3000:3000 task-manager-api
curl http://localhost:3000/health
```

## Segurança no processo de deploy

O [Trivy](https://trivy.dev) atua como gate obrigatório em dois pontos,
sempre **antes** de qualquer publicação:

- `ci-cd.yml`: escaneia dependências npm (`fs`) e a imagem Docker
  construída (`image`) antes de fazer push para o GHCR.
- `infra.yml`: escaneia o código Terraform (`config`) antes de permitir
  `terraform apply`.

Qualquer vulnerabilidade `CRITICAL` ou `HIGH` interrompe o pipeline
(`exit-code: 1`), impedindo o deploy.

## Provisionando a infraestrutura (AWS)

Pré-requisitos: `terraform` instalado e credenciais AWS configuradas
(`aws configure` ou variáveis de ambiente).

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# edite terraform.tfvars: preencha ssh_allowed_cidr com SEU_IP/32

terraform init
terraform plan
terraform apply   # cria recursos com custo real na conta AWS — revise o plan antes
```

Após o `apply`, capture os outputs (não versionar a chave privada):

```bash
terraform output instance_public_ip
terraform output -raw ssh_private_key_pem > ec2_key.pem
```

## Configurando o pipeline (secrets do GitHub)

No repositório, em Settings → Secrets and variables → Actions:

| Secret                  | Valor                                          |
|--------------------------|-------------------------------------------------|
| `EC2_HOST`                | output `instance_public_ip` do Terraform        |
| `EC2_SSH_PRIVATE_KEY`     | output `ssh_private_key_pem` do Terraform       |
| `AWS_ACCESS_KEY_ID`       | credencial AWS usada pelo workflow `infra.yml`  |
| `AWS_SECRET_ACCESS_KEY`   | credencial AWS usada pelo workflow `infra.yml`  |
| `SSH_ALLOWED_CIDR`        | seu IP público, formato `SEU_IP/32`             |

Um push em `main` dispara `ci-cd.yml` (test → scan → build/push → deploy).
O workflow `infra.yml` é manual (`workflow_dispatch`), para não aplicar
mudanças de infraestrutura a cada commit.
