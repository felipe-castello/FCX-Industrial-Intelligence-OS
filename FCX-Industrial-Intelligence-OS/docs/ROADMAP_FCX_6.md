# Roadmap FCX Intelligence Platform 6.0

Objetivo: evoluir o FCX Industrial Intelligence OS 5.0 para uma plataforma de inteligencia industrial, agentes, integracoes e decisao operacional sem afetar a linha de producao.

Branch alvo: `fcx-6.0-dev`

## Principios da evolucao

- Preservar contratos atuais do FCX 5.0 ate existir versionamento formal de API.
- Evoluir novos recursos atras de modulos isolados, flags ou rotas versionadas.
- Separar dados operacionais, dados de conhecimento e dados de decisao.
- Manter observabilidade, seguranca e deploy como requisitos de primeira classe.
- Preparar base multi-tenant para SaaS industrial.

## Fase 1 - Agent Skills

Objetivo: criar uma camada de habilidades industriais reutilizaveis para agentes.

Entregas:

- Catalogo de skills por dominio: refrigeracao, energia, manutencao, alarmes, ativos e telemetria.
- Contrato padrao de skill: entrada, contexto, ferramentas permitidas, saida e criterios de seguranca.
- Executor interno de skills integrado ao backend.
- Registro de auditoria para toda execucao de skill.
- Primeiras skills:
  - diagnostico de alarme;
  - resumo de ativo;
  - analise de tendencia;
  - recomendacao de ordem de servico;
  - explicacao de falha provavel.

## Fase 2 - Product Intelligence

Objetivo: transformar o FCX em um produto que entende uso, valor entregue e saude operacional por cliente.

Entregas:

- Eventos de produto para telas, consultas, alertas e automacoes.
- KPIs de uso por tenant.
- Analise de features mais usadas.
- Mapa de jornada operacional.
- Indicadores de valor:
  - alarmes evitados;
  - consumo energetico previsto versus realizado;
  - ativos criticos reduzidos;
  - tempo medio de resposta;
  - ordens de servico abertas e fechadas.

## Fase 3 - LibreChat

Objetivo: avaliar LibreChat como interface conversacional para operadores, gestores e engenharia.

Entregas:

- Prova de conceito com LibreChat conectado ao FCX.
- Autenticacao alinhada ao tenant.
- Conectores para APIs FCX.
- Prompt base por perfil:
  - operador;
  - gestor;
  - tecnico;
  - engenharia;
  - administrador.
- Politicas de seguranca para impedir acesso cruzado entre clientes.

## Fase 4 - LlamaIndex

Objetivo: criar camada RAG para documentos tecnicos, manuais, historico operacional e conhecimento industrial.

Entregas:

- Indice vetorial para manuais, PDFs, procedimentos e historico de manutencao.
- Pipeline de ingestao documental.
- Chunking especializado para documentacao tecnica.
- Busca contextual por ativo, fabricante, modelo e unidade.
- Respostas com citacoes e rastreabilidade.

## Fase 5 - LangGraph

Objetivo: orquestrar agentes industriais com fluxos de decisao controlados.

Entregas:

- Grafo de diagnostico de falha.
- Grafo de resposta a alarme critico.
- Grafo de analise de eficiencia energetica.
- Grafo de abertura assistida de ordem de servico.
- Human-in-the-loop para decisoes sensiveis.
- Estados persistentes para investigacoes longas.

## Fase 6 - Nango

Objetivo: padronizar integracoes SaaS externas e conectores empresariais.

Entregas:

- Avaliacao de Nango para OAuth e sincronizacao de APIs externas.
- Conectores candidatos:
  - ERP;
  - CMMS;
  - WhatsApp/Meta;
  - Google Workspace;
  - Microsoft 365;
  - sistemas de chamados.
- Gestao segura de credenciais por tenant.
- Sincronizacao agendada e webhooks.

## Fase 7 - Haystack

Objetivo: avaliar Haystack como alternativa/complemento para pipelines de busca, RAG e avaliacao.

Entregas:

- Benchmark Haystack versus LlamaIndex.
- Pipeline de recuperacao hibrida: vetorial + keyword.
- Avaliacao de qualidade de respostas.
- Reranking para documentos tecnicos.
- Experimentos com perguntas frequentes de operacao industrial.

## Fase 8 - Understand Anything

Objetivo: criar capacidade de entendimento multimodal e documental para ativos e operacoes.

Entregas:

- Ingestao de imagens, PDFs, diagramas, fotos de campo e prints de supervisores.
- Extracao de dados de placas, etiquetas e telas industriais.
- Classificacao de documentos por ativo/unidade.
- Resumo tecnico automatico.
- Associacao entre evidencia visual, telemetria e alarmes.

## Fase 9 - Communication Intelligence

Objetivo: transformar comunicacoes operacionais em conhecimento acionavel.

Entregas:

- Ingestao de mensagens WhatsApp, e-mail e chamados.
- Classificacao de intencao:
  - incidente;
  - duvida;
  - manutencao;
  - escalonamento;
  - aprovacao.
- Resumos automaticos por turno, unidade e cliente.
- Extracao de compromissos e pendencias.
- Vinculo entre conversas, ativos, alarmes e ordens de servico.

## Fase 10 - Decision Intelligence

Objetivo: apoiar decisoes executivas e operacionais com recomendacoes explicaveis.

Entregas:

- Motor de recomendacao por severidade, custo, risco e SLA.
- Priorizacao de manutencao.
- Analise de impacto energetico.
- Simulacao de cenarios:
  - nao agir;
  - manutencao preventiva;
  - troca de componente;
  - ajuste operacional.
- Score de confianca por recomendacao.
- Registro de decisao tomada e resultado observado.

## Sequencia recomendada

1. Consolidar base FCX 5.0:
   - contratos de API;
   - autenticação formal;
   - modelo multi-tenant;
   - TimescaleDB com retencao e agregados.

2. Criar camada Agent Skills.

3. Adicionar RAG com LlamaIndex e/ou Haystack.

4. Integrar interface conversacional com LibreChat.

5. Orquestrar fluxos com LangGraph.

6. Padronizar integracoes externas com Nango.

7. Evoluir para Communication Intelligence.

8. Fechar o ciclo com Decision Intelligence.

## Riscos principais

- Quebrar dashboards atuais ao migrar de `telemetry` para `telemetry_processed`.
- Introduzir agentes sem trilha de auditoria.
- Misturar dados entre tenants.
- Expor informacoes sensiveis em prompts, logs ou historico de chat.
- Criar recomendacoes automaticas sem aprovacao humana.
- Aumentar custo computacional antes de medir uso real.

## Contratos que devem permanecer estaveis

- Rotas atuais do frontend.
- Endpoints REST usados pelo dashboard.
- Topico MQTT `fcx/telemetry/+`.
- Variaveis de deploy e observabilidade.
- Scripts de producao.
- Health check `/health`.
- Metrics endpoint `/metrics`.

## Marco de saida do FCX 6.0

O FCX Intelligence Platform 6.0 deve entregar:

- Plataforma multi-tenant.
- Autenticacao e autorizacao formais.
- Camada oficial de ingestao industrial.
- Base de conhecimento industrial consultavel.
- Agentes auditaveis.
- Chat operacional conectado ao contexto FCX.
- Recomendacoes explicaveis.
- Observabilidade completa.
- Deploy seguro e reproduzivel.
