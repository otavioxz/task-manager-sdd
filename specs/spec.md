# Especificação: Task Manager API

## Contexto

Sistema simples para demonstrar o ciclo completo de engenharia
Spec-Driven Development (SDD): esta especificação é escrita **antes** do
código e é a fonte de verdade sobre o comportamento esperado. Qualquer
mudança de comportamento deve primeiro atualizar este documento.

## Objetivo

Uma API REST para gerenciar uma lista de tarefas (to-do list), com
armazenamento em memória (sem banco de dados, para manter o escopo do
sistema simples).

## Modelo de dados

Uma `Task` tem:

| Campo       | Tipo   | Obrigatório | Regras                                      |
|-------------|--------|-------------|----------------------------------------------|
| `id`        | string | gerado      | UUID v4, gerado pelo servidor                |
| `title`     | string | sim         | não pode ser vazio                           |
| `status`    | string | não         | um de `pending`, `in_progress`, `done`; default `pending` |
| `createdAt` | string | gerado      | ISO 8601, gerado pelo servidor               |

## Endpoints

### `GET /health`
- Retorna `200 { "status": "ok" }`. Usado por health check do Docker e por
  monitoramento externo.

### `GET /tasks`
- Retorna `200` com a lista de todas as tarefas (array, pode ser vazio).

### `POST /tasks`
- Corpo: `{ "title": string, "status"?: string }`
- Sucesso: `201` com a tarefa criada (incluindo `id` e `createdAt`)
- Erro: `400` se `title` ausente/vazio, ou se `status` não for um dos
  valores permitidos

### `GET /tasks/:id`
- Sucesso: `200` com a tarefa
- Erro: `404` se `id` não existir

### `PUT /tasks/:id`
- Corpo: `{ "title"?: string, "status"?: string }` (atualização parcial)
- Sucesso: `200` com a tarefa atualizada
- Erro: `404` se `id` não existir; `400` se `status` inválido ou `title`
  vazio quando enviado

### `DELETE /tasks/:id`
- Sucesso: `204` sem corpo
- Erro: `404` se `id` não existir

## Critérios de aceite (testáveis)

1. `GET /health` sempre responde `200` sem depender de estado.
2. Criar uma tarefa válida via `POST /tasks` retorna `201` e a tarefa
   aparece em `GET /tasks`.
3. Criar uma tarefa sem `title` retorna `400` e nada é persistido.
4. Criar uma tarefa com `status` inválido retorna `400`.
5. Buscar uma tarefa inexistente (`GET /tasks/:id`) retorna `404`.
6. Atualizar uma tarefa existente reflete a mudança em `GET /tasks/:id`.
7. Atualizar uma tarefa inexistente retorna `404`.
8. Deletar uma tarefa existente faz com que `GET /tasks/:id` passe a
   retornar `404`.
9. Deletar uma tarefa inexistente retorna `404`.

## Fora de escopo (explicitamente)

- Autenticação/autorização
- Persistência em banco de dados
- Paginação/filtros na listagem
