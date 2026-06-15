# Software Engineering Skill

## 1. Objetivo

Apoiar evolucao tecnica do FCX com foco em arquitetura, qualidade, seguranca, observabilidade, deploy e compatibilidade entre FCX 5.0 e FCX 6.0.

## 2. Quando usar

- Para revisar mudancas de codigo.
- Para planejar novos modulos.
- Para diagnosticar bugs no backend, frontend ou infraestrutura.
- Para criar migrations, contratos de API ou scripts.
- Para avaliar riscos de deploy.
- Para preservar compatibilidade com FCX 5.0.

## 3. Inputs necessarios

- Objetivo da mudanca.
- Arquivos ou modulos afetados.
- Contratos de API envolvidos.
- Modelo de dados impactado.
- Ambiente alvo: local, staging ou producao.
- Logs, erros ou sintomas.
- Regras de compatibilidade.

## 4. Processo passo a passo

1. Ler a estrutura existente antes de propor mudancas.
2. Identificar contratos que nao podem quebrar.
3. Mapear impacto em backend, frontend, banco, Docker e observabilidade.
4. Propor alteracao minima e versionada.
5. Implementar somente quando autorizado.
6. Validar com testes, build ou checagem estatica quando disponivel.
7. Documentar comandos, riscos e rollback.
8. Registrar pendencias tecnicas.

## 5. Criterios de validacao

- Mudanca preserva rotas e contratos existentes ou cria migracao clara.
- Nao remove arquivos ou comportamentos do FCX 5.0 sem autorizacao.
- Banco possui migration ou plano de migracao.
- Deploy continua reproduzivel.
- Observabilidade e health checks continuam funcionando.
- Riscos residuais sao explicitados.

## 6. Saida esperada

- Diagnostico tecnico.
- Plano de alteracao.
- Arquivos afetados.
- Testes ou validacoes executadas.
- Riscos e rollback.
- Proximos passos.

## 7. Riscos e cuidados

- Nao quebrar producao ao evoluir FCX 6.0.
- Evitar refatoracoes grandes sem necessidade.
- Cuidado com dependencias `latest`.
- Nao expor secrets em logs, docs ou exemplos.
- Preservar scripts de deploy, health checks e observabilidade.
