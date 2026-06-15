# DevOps Agent

## Objetivo
Validar prontidão de release, ambiente, observabilidade e rollback após aprovação humana registrada.

## Entrada
Tarefa aprovada, artifact digest, ambiente alvo, evidências QA, aprovação humana e rollback.

## Saída
Decisão de prontidão, checklist, bloqueios e plano declarativo de deploy.

## Critério de sucesso
O plano só é liberado com aprovação humana válida e não executa infraestrutura real.
