# MCP Tools Plan - FCX AI Command Center

## Objetivo

Planejar as ferramentas MCP que conectarao LibreChat e agentes FCX aos dados, documentos e acoes controladas da plataforma.

## Principios

- Ferramentas devem ser pequenas, auditaveis e permissionadas.
- Toda ferramenta deve receber contexto de tenant e usuario.
- Ferramentas de escrita devem criar rascunhos ou exigir confirmacao humana.
- Nenhuma ferramenta deve retornar secrets.
- Toda chamada deve gerar log de auditoria.

## Categorias de ferramentas

### 1. Contexto e identidade

#### `fcx.get_user_context`

Objetivo:

- Obter tenant, perfil, permissoes e escopo do usuario.

Inputs:

- `userId`
- `sessionId`

Saida:

- Tenant.
- Role.
- Permissoes.
- Unidades autorizadas.

#### `fcx.get_tenant_summary`

Objetivo:

- Obter resumo operacional do tenant.

Inputs:

- `tenantId`

Saida:

- Unidades.
- Ativos.
- Alertas.
- Modulos habilitados.

### 2. Ativos

#### `assets.search`

Objetivo:

- Buscar ativos por nome, unidade, tipo, status ou criticidade.

Inputs:

- `query`
- `unit`
- `status`
- `criticality`

Saida:

- Lista de ativos autorizados.

#### `assets.get_details`

Objetivo:

- Obter contexto completo de um ativo.

Inputs:

- `assetId`

Saida:

- Cadastro.
- Status.
- Alarmes recentes.
- Ultima telemetria.
- Ordens recentes.

### 3. Telemetria

#### `telemetry.query`

Objetivo:

- Consultar series de telemetria.

Inputs:

- `assetId`
- `metrics`
- `from`
- `to`
- `source`

Saida:

- Serie temporal.
- Qualidade do dado.
- Fonte usada.

#### `telemetry.get_latest`

Objetivo:

- Obter ultimo pacote de telemetria por ativo.

Inputs:

- `assetId`

Saida:

- Temperatura.
- Vibracao.
- Corrente.
- Tensao.
- Potencia.
- Pressao.
- Umidade.
- Timestamp.

### 4. Alarmes

#### `alarms.query`

Objetivo:

- Consultar alarmes por ativo, severidade, status ou periodo.

Inputs:

- `assetId`
- `severity`
- `status`
- `from`
- `to`

Saida:

- Lista de alarmes.
- Contagem por severidade.

#### `alarms.explain`

Objetivo:

- Gerar explicacao baseada em telemetria e historico.

Inputs:

- `alarmId`

Saida:

- Descricao.
- Possiveis causas.
- Evidencias.
- Recomendacoes.

### 5. Ordens de servico

#### `work_orders.search`

Objetivo:

- Buscar ordens por ativo, tecnico, prioridade, status ou periodo.

Inputs:

- `assetId`
- `status`
- `technician`
- `from`
- `to`

Saida:

- Lista de ordens.

#### `work_orders.create_draft`

Objetivo:

- Criar rascunho de ordem de servico para aprovacao humana.

Inputs:

- `assetId`
- `priority`
- `description`
- `evidence`

Saida:

- Rascunho.
- Justificativa.
- Pendencias para aprovacao.

Restricao:

- Nao deve abrir OS final sem confirmacao.

### 6. Knowledge Vault

#### `knowledge.search_documents`

Objetivo:

- Buscar documentos tecnicos autorizados.

Inputs:

- `query`
- `assetId`
- `manufacturer`
- `documentType`

Saida:

- Trechos relevantes.
- Fontes.
- Confianca.

#### `knowledge.get_document`

Objetivo:

- Recuperar metadados e conteudo autorizado de documento.

Inputs:

- `documentId`

Saida:

- Titulo.
- Tipo.
- Trechos.
- Fonte.

### 7. IoT e engenharia

#### `iot.validate_payload`

Objetivo:

- Validar payload de telemetria contra contrato FCX.

Inputs:

- `payload`
- `protocol`

Saida:

- Campos reconhecidos.
- Campos invalidos.
- Sugestoes de normalizacao.

#### `iot.map_modbus_registers`

Objetivo:

- Ajudar a interpretar mapa Modbus.

Inputs:

- `registers`
- `unitId`
- `scales`

Saida:

- Mapa interpretado.
- Incertezas.
- Pontos de validacao.

### 8. Dashboards e preditivo

#### `dashboards.get_overview`

Objetivo:

- Obter KPIs executivos.

Inputs:

- `tenantId`
- `unit`
- `from`
- `to`

Saida:

- KPIs.
- Widgets.
- Ranking de risco.

#### `predictive.get_health`

Objetivo:

- Obter Health Score por ativo.

Inputs:

- `assetId`
- `unit`

Saida:

- Score.
- Classificacao.
- Evidencias.

### 9. Sports Quant

#### `sports_quant.query_dataset`

Objetivo:

- Consultar datasets esportivos autorizados.

Restricao:

- Ambiente Labs separado.

#### `sports_quant.run_backtest`

Objetivo:

- Executar backtest controlado.

Restricao:

- Nao executar aposta ou ordem real.

### 10. Trade Intelligence

#### `trade.query_market_data`

Objetivo:

- Consultar dados de mercado autorizados.

Restricao:

- Ambiente Labs separado.

#### `trade.register_thesis`

Objetivo:

- Registrar tese e racional.

Restricao:

- Nao executar ordem financeira.

## Matriz agente x ferramentas

| Agente | Ferramentas principais |
|---|---|
| FCX Master Agent | `fcx.get_user_context`, `fcx.get_tenant_summary`, `agent.route_task` |
| Technical Knowledge Vault Agent | `knowledge.search_documents`, `knowledge.get_document`, `assets.get_details` |
| Industrial Intelligence Agent | `assets.search`, `telemetry.query`, `alarms.query`, `dashboards.get_overview`, `predictive.get_health` |
| Electronics Lab Agent | `iot.validate_payload`, `iot.map_modbus_registers`, `knowledge.search_documents` |
| Field Service Agent | `work_orders.search`, `work_orders.create_draft`, `assets.get_details`, `knowledge.search_documents` |
| Sports Quant Agent | `sports_quant.query_dataset`, `sports_quant.run_backtest` |
| Trade Intelligence Agent | `trade.query_market_data`, `trade.register_thesis`, `trade.evaluate_risk` |

## Requisitos de auditoria

Cada chamada MCP deve registrar:

- Usuario.
- Tenant.
- Agente.
- Ferramenta.
- Inputs sanitizados.
- Timestamp.
- Resultado resumido.
- Erro, se houver.
- Custo estimado, quando aplicavel.

## Requisitos de seguranca

- Validar tenant em todas as chamadas.
- Aplicar RBAC por ferramenta.
- Mascarar dados sensiveis.
- Bloquear ferramentas Labs para usuarios industriais.
- Rate limit por usuario, agente e tenant.
- Timeout por ferramenta.
- Circuit breaker para APIs externas.

## Fases de implementacao

### Fase 1 - Ferramentas de leitura

- Contexto do usuario.
- Busca de ativos.
- Consulta de alarmes.
- Consulta de telemetria.
- Overview de dashboard.

### Fase 2 - Knowledge Vault

- Busca documental.
- Recuperacao de fontes.
- Respostas com citacoes.

### Fase 3 - Rascunhos controlados

- Rascunho de OS.
- Rascunho de recomendacao.
- Rascunho de relatorio.

### Fase 4 - Labs isolados

- Sports Quant.
- Trade Intelligence.

### Fase 5 - Acoes aprovadas

- Fluxos com aprovacao humana.
- Registro de decisao.
- Medicao de resultado.
