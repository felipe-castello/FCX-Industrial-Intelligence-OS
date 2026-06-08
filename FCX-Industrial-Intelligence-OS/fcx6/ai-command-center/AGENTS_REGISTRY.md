# FCX Agents Registry

## Objetivo

Mapear os agentes previstos para o FCX AI Command Center, suas responsabilidades, usuarios-alvo, ferramentas permitidas e limites operacionais.

## Padrao de cadastro de agente

Cada agente deve possuir:

- Nome.
- Objetivo.
- Usuarios autorizados.
- Contexto permitido.
- Ferramentas permitidas.
- Saida esperada.
- Limites e restricoes.
- Requisitos de auditoria.

## 1. FCX Master Agent

### Objetivo

Atuar como agente coordenador da plataforma, roteando perguntas e tarefas para agentes especialistas.

### Usuarios autorizados

- Administrador.
- Gestor.
- Engenharia.
- Operador autorizado.

### Contexto permitido

- Metadados do tenant.
- Lista de agentes disponiveis.
- Resumo operacional de alto nivel.
- Permissoes do usuario.

### Ferramentas previstas

- `agent.route_task`
- `fcx.get_user_context`
- `fcx.get_tenant_summary`
- `agent.request_handoff`
- `audit.register_interaction`

### Saida esperada

- Resposta direta quando a tarefa for simples.
- Encaminhamento para agente especialista.
- Plano de acao de alto nivel.
- Perguntas de esclarecimento quando necessario.

### Limites e restricoes

- Nao deve executar diagnostico tecnico profundo sozinho.
- Nao deve tomar decisoes operacionais criticas.
- Nao deve acessar dados fora do tenant.

## 2. FCX Technical Knowledge Vault Agent

### Objetivo

Responder perguntas tecnicas usando documentos, manuais, procedimentos, historico e conhecimento validado.

### Usuarios autorizados

- Engenharia.
- Tecnicos.
- Gestores.
- Suporte.

### Contexto permitido

- Documentos do tenant.
- Manuais tecnicos.
- Procedimentos operacionais.
- Historico tecnico autorizado.

### Ferramentas previstas

- `knowledge.search_documents`
- `knowledge.get_document`
- `knowledge.cite_sources`
- `assets.get_asset_context`
- `audit.register_interaction`

### Saida esperada

- Resposta tecnica com fontes.
- Resumo de procedimento.
- Lista de documentos relacionados.
- Alertas de incerteza quando a fonte for insuficiente.

### Limites e restricoes

- Nao inventar procedimento.
- Nao responder sem fonte quando a pergunta exigir evidencia.
- Nao expor documentos de outro tenant.

## 3. FCX Industrial Intelligence Agent

### Objetivo

Analisar ativos, alarmes, telemetria, saude operacional e riscos industriais.

### Usuarios autorizados

- Operadores.
- Gestores.
- Engenharia.
- Administradores.

### Contexto permitido

- Ativos.
- Telemetria.
- Alarmes.
- Ordens de servico.
- KPIs industriais.
- Scores preditivos.

### Ferramentas previstas

- `assets.search`
- `assets.get_details`
- `telemetry.query`
- `alarms.query`
- `dashboards.get_overview`
- `predictive.get_health`
- `audit.register_interaction`

### Saida esperada

- Diagnostico operacional.
- Priorizacao de ativos.
- Explicacao de alarmes.
- Recomendacoes com justificativa.
- Riscos e incertezas.

### Limites e restricoes

- Nao recomendar intervencao critica sem validacao humana.
- Nao misturar telemetria simulada com real sem aviso.
- Nao assumir causa raiz sem dados suficientes.

## 4. FCX Electronics Lab Agent

### Objetivo

Apoiar bancada eletronica, prototipos, sensores, gateways, placas, comunicacao e instrumentacao.

### Usuarios autorizados

- Engenharia.
- Laboratorio.
- Tecnicos autorizados.

### Contexto permitido

- Documentacao de sensores.
- Esquemas e notas tecnicas autorizadas.
- Logs de gateway.
- Payloads e mapas de registradores.
- Procedimentos de bancada.

### Ferramentas previstas

- `knowledge.search_documents`
- `iot.validate_payload`
- `iot.map_modbus_registers`
- `gateway.get_logs`
- `audit.register_interaction`

### Saida esperada

- Analise tecnica de bancada.
- Checklist de teste.
- Hipoteses de falha.
- Orientacao de validacao de sensor/gateway.

### Limites e restricoes

- Nao orientar procedimento eletrico perigoso sem alerta.
- Nao substituir norma de seguranca.
- Nao expor credenciais de dispositivos.

## 5. FCX Field Service Agent

### Objetivo

Apoiar tecnicos e gestores de campo na preparacao, execucao e fechamento de ordens de servico.

### Usuarios autorizados

- Tecnicos.
- Coordenadores de campo.
- Gestores.
- Engenharia.

### Contexto permitido

- Ordens de servico.
- Historico do ativo.
- Alarmes recentes.
- Telemetria relevante.
- Checklists.
- Procedimentos autorizados.

### Ferramentas previstas

- `work_orders.search`
- `work_orders.create_draft`
- `assets.get_details`
- `alarms.query`
- `telemetry.query`
- `knowledge.search_documents`
- `audit.register_interaction`

### Saida esperada

- Resumo para atendimento.
- Checklist tecnico.
- Prioridade sugerida.
- Rascunho de OS.
- Resumo de fechamento.

### Limites e restricoes

- Criar apenas rascunhos sem aprovacao humana.
- Nao executar fechamento automatico.
- Nao sugerir acao insegura.

## 6. FCX Sports Quant Agent

### Objetivo

Apoiar analises quantitativas esportivas em ambiente separado do core industrial.

### Usuarios autorizados

- Analistas autorizados.
- Equipe Labs.

### Contexto permitido

- Datasets esportivos autorizados.
- Modelos quantitativos.
- Resultados historicos.
- Backtests.

### Ferramentas previstas

- `sports_quant.query_dataset`
- `sports_quant.run_backtest`
- `sports_quant.compare_models`
- `audit.register_interaction`

### Saida esperada

- Analise probabilistica.
- Resultado de backtest.
- Hipoteses de modelo.
- Riscos de overfitting.

### Limites e restricoes

- Deve ficar isolado do core industrial.
- Nao deve executar aposta ou transacao.
- Deve explicitar incerteza estatistica.

## 7. FCX Trade Intelligence Agent

### Objetivo

Apoiar analise de mercado, teses, risco e decisoes financeiras em ambiente separado e controlado.

### Usuarios autorizados

- Analistas autorizados.
- Equipe Labs.
- Gestores com permissao explicita.

### Contexto permitido

- Dados de mercado autorizados.
- Historico de teses.
- Indicadores de risco.
- Resultados observados.

### Ferramentas previstas

- `trade.query_market_data`
- `trade.register_thesis`
- `trade.evaluate_risk`
- `trade.run_scenario`
- `audit.register_interaction`

### Saida esperada

- Analise de tese.
- Cenários de risco.
- Registro de decisao.
- Explicacao de incertezas.

### Limites e restricoes

- Nao executar ordens financeiras.
- Nao fornecer promessa de retorno.
- Requer avaliacao de compliance.
- Deve ficar separado do produto industrial.

## Regras globais dos agentes

- Respeitar tenant, usuario e permissoes.
- Registrar auditoria.
- Explicar evidencias.
- Declarar incerteza.
- Solicitar aprovacao humana para acoes sensiveis.
- Nao expor secrets.
- Nao acessar dados fora do escopo.
