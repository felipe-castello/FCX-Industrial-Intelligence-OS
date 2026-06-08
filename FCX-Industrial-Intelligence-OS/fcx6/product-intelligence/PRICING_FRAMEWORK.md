# Pricing Framework - FCX 6.0

## Objetivo

Definir um modelo de precificacao modular, mensuravel e alinhado ao valor entregue.

## Principios

- Preco deve refletir valor operacional.
- Modulos core e labs devem ter precificacao separada.
- Evitar cobrar apenas por usuario quando o valor vem de ativos, telemetria e decisoes.
- Permitir expansao por cliente sem redesenhar contrato.
- Separar uso humano, dados e automacoes.

## Dimensoes de precificacao

### Por tenant

Base SaaS mensal por cliente.

Inclui:

- Ambiente.
- Usuarios administrativos.
- Observabilidade basica.
- Suporte padrao.

### Por ativo monitorado

Aplicavel a:

- Industrial Intelligence.
- Energy Intelligence.
- Field Service.

Metrica:

- Quantidade de ativos ativos no mes.

### Por volume de telemetria

Aplicavel quando o cliente envia alta frequencia de dados.

Metrica:

- Mensagens por mes.
- Retencao de dados.
- Agregacoes historicas.

### Por usuario

Aplicavel a:

- AI Command Center.
- Knowledge Vault.
- Field Service.

Metrica:

- Usuarios ativos mensais.

### Por automacao/agente

Aplicavel a:

- Agent Skills.
- Decision Intelligence.
- Communication Intelligence.

Metrica:

- Execucoes de agentes.
- Fluxos automatizados.
- Recomendacoes geradas.

### Por integracao

Aplicavel a:

- Integration Hub.
- Nango.
- Conectores industriais.

Metrica:

- Conectores ativos.
- Sincronizacoes.
- Webhooks.

## Pacotes sugeridos

### Starter Industrial

Para pilotos e clientes pequenos.

Inclui:

- Industrial Intelligence basico.
- Dashboard operacional.
- Ate um limite de ativos.
- Retencao curta.
- Sem agentes avancados.

### Professional Operations

Para operacoes em crescimento.

Inclui:

- Industrial Intelligence.
- Field Service.
- Energy Intelligence basico.
- Alertas e relatórios.
- Knowledge Vault limitado.

### Enterprise Intelligence

Para clientes multiunidade.

Inclui:

- Todos os modulos core.
- Agent Skills.
- Knowledge Vault completo.
- Decision Intelligence.
- Integrações avançadas.
- SLA e suporte premium.

### Labs

Separado do core.

Inclui:

- Sports Quant.
- Trade Intelligence.

Observacao:

- Labs nao devem ser misturados no contrato industrial sem clareza juridica e comercial.

## Modulos e monetizacao

| Modulo | Driver principal | Modelo recomendado |
|---|---|---|
| Industrial Intelligence | Ativos + telemetria | Base + ativo monitorado |
| Knowledge Vault | Usuarios + documentos | Usuario + volume documental |
| Field Service | Tecnicos + OS | Usuario + ordens processadas |
| Energy Intelligence | Ativos + economia | Ativo + valor premium |
| Sports Quant | Usuarios + modelos | Assinatura separada |
| Trade Intelligence | Usuarios + sinais | Assinatura separada com compliance |

## Metricas comerciais

- MRR.
- ARR.
- Receita por ativo.
- Receita por tenant.
- Margem por cliente.
- Custo de infraestrutura por tenant.
- Uso de IA por cliente.
- Retencao e expansao.

## Perguntas antes de precificar

- O cliente paga para monitorar ativos ou para reduzir risco?
- Qual e o custo de uma falha evitada?
- Qual e o custo mensal de energia?
- Quantos tecnicos usam o sistema?
- Quanto historico precisa ser retido?
- Ha exigencia de SLA?
- Ha integracoes especificas?

## Cuidados

- Nao prometer economia sem baseline.
- Nao incluir IA ilimitada sem controle de custo.
- Nao misturar produtos regulados com operacao industrial.
- Nao cobrar por dimensoes que o cliente nao entende.
- Sempre medir custo de infraestrutura por cliente.
