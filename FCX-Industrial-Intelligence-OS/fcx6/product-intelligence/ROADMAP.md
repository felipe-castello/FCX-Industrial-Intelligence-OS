# FCX 6.0 Product Roadmap

## Objetivo

Organizar a evolucao do FCX 6.0 por fases de produto, evitando desenvolvimento disperso e protegendo o FCX 5.0.

## Fase 0 - Fundacao de Produto

Meta: preparar governanca antes de construir.

Entregas:

- Estrategia de produto definida.
- Processo de discovery.
- Template de PRD.
- Framework de pricing.
- Criterios de priorizacao.
- Lista de hipoteses por modulo.

## Fase 1 - Industrial Intelligence Core

Meta: consolidar o nucleo industrial.

Entregas:

- Migracao gradual para `telemetry_processed`.
- Dashboard industrial baseado em dados reais.
- Health Score revisado.
- Priorizacao de ativos.
- Recomendacoes operacionais explicaveis.
- Auditoria de decisoes sugeridas.

Metricas:

- Reducao de alarmes recorrentes.
- Tempo medio para diagnostico.
- Ativos criticos monitorados.
- Ordens geradas por recomendacao.

## Fase 2 - Knowledge Vault

Meta: criar base de conhecimento consultavel.

Entregas:

- Ingestao de manuais e documentos.
- Busca com citacoes.
- Associacao entre documento, ativo e fabricante.
- Respostas tecnicas com evidencias.
- Base de conhecimento por tenant.

Metricas:

- Tempo para encontrar informacao tecnica.
- Perguntas respondidas com citacao.
- Documentos processados.
- Uso por equipe tecnica.

## Fase 3 - Field Service

Meta: conectar inteligencia operacional com execucao em campo.

Entregas:

- Checklist inteligente por ativo.
- Resumo tecnico para OS.
- Priorizacao por SLA e risco.
- Fechamento assistido.
- Historico de atendimento enriquecido.

Metricas:

- Tempo de preparo de atendimento.
- Taxa de primeira visita resolutiva.
- Tempo medio de fechamento de OS.
- Reincidencia por ativo.

## Fase 4 - Energy Intelligence

Meta: transformar consumo energetico em oportunidade operacional e financeira.

Entregas:

- Baseline de consumo por ativo/unidade.
- Anomalias energeticas.
- Previsao de consumo.
- Ranking de desperdicio.
- Recomendacoes de eficiencia.

Metricas:

- kWh monitorado.
- Economia estimada.
- Desvios detectados.
- Consumo previsto versus realizado.

## Fase 5 - Communication Intelligence

Meta: estruturar conversas operacionais.

Entregas:

- Ingestao de WhatsApp/e-mail/chamados.
- Classificacao de mensagens.
- Vinculo com ativos, alarmes e OS.
- Resumo por turno/unidade.
- Pendencias e compromissos.

Metricas:

- Mensagens classificadas.
- Incidentes detectados em comunicacao.
- Pendencias resolvidas.
- Tempo de resposta.

## Fase 6 - Decision Intelligence

Meta: apoiar decisao com recomendacoes explicaveis e resultado observado.

Entregas:

- Motor de recomendacao.
- Matriz de risco.
- Simulacao de cenarios.
- Registro de decisao.
- Aprendizado por resultado.

Metricas:

- Recomendacoes aceitas.
- Impacto das decisoes.
- Risco reduzido.
- Acuracia das previsoes.

## Fase Labs - Sports Quant

Meta: validar oportunidade fora do core industrial.

Entregas:

- Discovery separado.
- Dataset inicial.
- Backtesting simples.
- Dashboard experimental.
- Avaliacao de compliance.

Criterio de continuidade:

- Validar usuario pagante ou caso de uso claro sem desviar o core.

## Fase Labs - Trade Intelligence

Meta: testar inteligencia de decisoes financeiras em ambiente isolado.

Entregas:

- Discovery separado.
- Registro de tese.
- Analise de risco.
- Simulacao sem execucao real.
- Avaliacao juridica/compliance.

Criterio de continuidade:

- Somente evoluir com governanca regulatoria e separacao total do produto industrial.

## Regras de priorizacao

1. Core industrial antes de labs.
2. Discovery antes de build.
3. Cliente real antes de abstracao.
4. Valor mensuravel antes de automacao.
5. Auditoria antes de agente autonomo.
