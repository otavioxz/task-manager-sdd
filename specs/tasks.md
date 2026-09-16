# Tasks: Task Manager API

Terceira etapa do ciclo SDD (spec → plan → **tasks** → código). Cada item
referencia o critério de aceite ou seção do [plan.md](./plan.md) que atende.

## Aplicação

- [x] `store.js` com CRUD em memória sobre `Map` (modelo `Task` da spec)
- [x] `routes/tasks.js`: `POST/GET/PUT/DELETE /tasks[/:id]` com validação
      de `title` e `status` (spec: critérios 3, 4, 7)
- [x] `app.js`: monta rotas + `GET /health` (spec: critério 1)
- [x] `server.js`: sobe o app na porta `PORT` (default 3000)
- [x] `test/tasks.test.js`: um teste por critério de aceite (1–9)

## Empacotamento

- [x] `Dockerfile` multi-stage, usuário não-root, `HEALTHCHECK`
- [x] `.dockerignore`

## Infraestrutura (Terraform)

- [x] `variables.tf`: `aws_region`, `instance_type`, `ssh_allowed_cidr`
      (sem default)
- [x] `main.tf`: AMI, security group, key pair gerado, instância EC2 com
      `user_data`
- [x] `user_data.sh.tpl`: instala Docker e sobe o container da app
- [x] `outputs.tf`: IP público + chave privada (sensível)
- [x] `terraform.tfvars.example`

## Pipeline

- [x] `.github/workflows/ci-cd.yml`: test → scan (Trivy fs + image) →
      build/push GHCR → deploy SSH
- [x] `.github/workflows/infra.yml`: plan → scan (Trivy config) → apply
      manual

## Pendente (depende de ação do usuário, fora do escopo de código)

- [ ] Instalar `gh` CLI e autenticar (`gh auth login`)
- [ ] Criar repositório remoto e dar push
- [ ] Configurar credenciais AWS (`aws configure`)
- [ ] `terraform apply` (aprovação explícita — custo real)
- [ ] Registrar secrets do GitHub (`EC2_HOST`, `EC2_SSH_PRIVATE_KEY`)
- [ ] Validar pipeline end-to-end e o deploy na EC2
