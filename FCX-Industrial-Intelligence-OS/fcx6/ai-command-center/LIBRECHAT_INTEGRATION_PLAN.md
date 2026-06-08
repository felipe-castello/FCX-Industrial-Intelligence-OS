# LibreChat Integration Plan - FCX AI Command Center

## Objetivo

Preparar o FCX Intelligence Platform 6.0 para usar o LibreChat como interface conversacional dos agentes FCX, sem impactar o FCX 5.0.

## Papel do LibreChat

LibreChat sera avaliado como camada de interface para:

- Conversas com agentes especializados.
- Selecao de agente por perfil ou tarefa.
- Historico conversacional.
- Entrada multimodal futura.
- Execucao de ferramentas via MCP.
- Experiencia de comando operacional para usuarios FCX.

## Principios de integracao

- Nao acoplar agentes diretamente ao frontend FCX 5.0.
- Manter LibreChat como componente separado.
- Usar APIs e MCP Tools para conectar o LibreChat ao FCX.
- Isolar dados por tenant.
- Registrar auditoria de toda resposta e acao sensivel.
- Exigir human-in-the-loop para decisoes operacionais criticas.

## Arquitetura alvo

```text
Usuario
  |
  v
LibreChat - FCX AI Command Center
  |
  |-- Agent Registry
  |-- Model Provider
  |-- MCP Tools
  |
  v
FCX Agent Gateway
  |
  |-- FCX APIs
  |-- Knowledge Vault
  |-- Telemetry/Alarms/Assets
  |-- Field Service
  |-- Decision Intelligence
```

## Componentes previstos

### LibreChat

Interface principal de chat e selecao de agentes.

Responsabilidades:

- Autenticacao ou federacao com identidade FCX.
- Historico de conversas.
- Escolha de agente.
- Execucao de ferramentas autorizadas.
- Renderizacao de respostas, fontes e acoes recomendadas.

### FCX Agent Gateway

Camada futura entre LibreChat e backend FCX.

Responsabilidades:

- Validar tenant e usuario.
- Aplicar RBAC.
- Resolver agente solicitado.
- Controlar ferramentas permitidas.
- Registrar auditoria.
- Encaminhar chamadas para APIs FCX.

### MCP Tools

Ferramentas expostas aos agentes.

Exemplos:

- Buscar ativo.
- Consultar telemetria.
- Consultar alarmes.
- Buscar documentos.
- Criar resumo de OS.
- Consultar KPIs industriais.
- Registrar recomendacao.

### Agent Registry

Catalogo dos agentes disponiveis, perfis permitidos, proposito e ferramentas.

## Fases de integracao

### Fase 0 - Preparacao

- Definir agentes.
- Definir ferramentas MCP.
- Definir modelo de permissao.
- Definir isolamento por tenant.
- Documentar contratos de contexto.

### Fase 1 - Prova de conceito isolada

- Subir LibreChat em ambiente separado.
- Criar configuracao basica de modelos.
- Criar agentes sem acesso real a producao.
- Usar dados mock ou ambiente staging.

### Fase 2 - Conexao com FCX APIs

- Criar Agent Gateway.
- Expor ferramentas de leitura.
- Conectar ativos, alarmes, telemetria e dashboards.
- Registrar auditoria de prompts e respostas.

### Fase 3 - Knowledge Vault

- Conectar base documental.
- Permitir respostas com citacoes.
- Separar documentos por tenant.
- Validar qualidade do RAG.

### Fase 4 - Acoes assistidas

- Permitir criacao de rascunhos:
  - ordem de servico;
  - recomendacao;
  - resumo executivo;
  - checklist tecnico.
- Exigir aprovacao humana antes de gravar ou executar.

### Fase 5 - Operacao controlada

- Liberar para pilotos.
- Monitorar uso, custo, erros e satisfacao.
- Ajustar agentes e ferramentas.
- Definir SLA e suporte.

## Requisitos de seguranca

- Autenticacao obrigatoria.
- RBAC por perfil.
- Isolamento por tenant.
- Logs sem secrets.
- Auditoria de uso.
- Rate limit por usuario e tenant.
- Bloqueio de comandos destrutivos.
- Politica de retencao de conversas.

## Requisitos de observabilidade

- Total de conversas por agente.
- Tokens por agente e tenant.
- Erros de ferramenta.
- Latencia por chamada.
- Custo estimado por tenant.
- Feedback positivo/negativo.
- Alertas para falhas de MCP Tools.

## Dados que podem ser acessados

Por padrao, os agentes devem acessar somente:

- Dados do tenant do usuario.
- Dados necessarios para a tarefa.
- Leituras por API autorizada.
- Documentos com permissao explicita.

Dados sensiveis devem ser mascarados ou bloqueados.

## Nao escopo inicial

- Instalar LibreChat.
- Substituir o frontend FCX.
- Permitir automacao autonoma.
- Permitir escrita direta em producao sem aprovacao.
- Usar Sports Quant ou Trade Intelligence no mesmo contexto do core industrial.

## Decisoes pendentes

- Modelo de autenticacao entre FCX e LibreChat.
- Provider de LLM.
- Estrategia de hosting do LibreChat.
- Banco de historico de conversas.
- Politica de retencao.
- Modelo de custos por tenant.
- Padrao oficial de MCP Tools.
