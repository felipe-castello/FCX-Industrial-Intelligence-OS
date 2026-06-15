# Nango Plan - FCX Integration Hub

## Objetivo

Planejar o uso do Nango como camada central de integrações externas do FCX 6.0, padronizando OAuth, credenciais, sincronização, webhooks, auditoria e segurança por tenant.

## Papel do Nango

Nango será avaliado como componente para:

- Gerenciar OAuth de integrações SaaS.
- Armazenar tokens de forma segura.
- Padronizar conectores externos.
- Executar sincronizações.
- Receber webhooks.
- Reduzir código customizado de autenticação.
- Separar credenciais por tenant.

## Arquitetura alvo

```text
FCX Frontend / AI Command Center
  |
  v
FCX Integration Hub API
  |
  v
Nango
  |
  |-- GitHub
  |-- Google Drive
  |-- Gmail
  |-- Microsoft 365
  |-- WhatsApp
  |-- CRM
  |-- ERP
  |
  v
FCX Data Normalization Layer
  |
  v
PostgreSQL / Knowledge Vault / Communication Intelligence / Product Intelligence
```

## Responsabilidades do Integration Hub

- Registrar integrações por tenant.
- Controlar escopos permitidos.
- Mapear permissões por usuário e módulo.
- Sincronizar dados externos.
- Normalizar entidades.
- Auditar acessos.
- Revogar conexões.
- Monitorar falhas de sincronização.

## Responsabilidades do Nango

- Fluxo OAuth.
- Refresh token.
- Armazenamento de credenciais.
- Execução de sync scripts.
- Webhooks de mudanças.
- Abstração de provedores.

## Entidades conceituais

### IntegrationConnection

- `id`
- `tenantId`
- `provider`
- `status`
- `connectedBy`
- `createdAt`
- `lastSyncAt`
- `scopes`
- `riskLevel`

### IntegrationSyncJob

- `id`
- `connectionId`
- `syncType`
- `status`
- `startedAt`
- `finishedAt`
- `recordsProcessed`
- `error`

### ExternalRecordReference

- `id`
- `tenantId`
- `provider`
- `externalId`
- `entityType`
- `fcxEntityId`
- `lastSeenAt`

## Fluxo de conexão

1. Usuário solicita conexão de integração.
2. FCX valida perfil, tenant e permissão.
3. FCX inicia fluxo Nango.
4. Usuário autoriza no provedor.
5. Nango armazena credenciais.
6. FCX registra conexão.
7. Sync inicial é executado.
8. Logs e auditoria são registrados.

## Fluxo de sincronização

1. Nango executa sync ou recebe webhook.
2. Dados externos são normalizados.
3. FCX valida tenant e origem.
4. Dados são roteados para módulo apropriado.
5. Registros são vinculados a entidades FCX.
6. Erros são registrados para retry.

## Integrações previstas

- GitHub.
- Google Drive.
- Gmail.
- Microsoft 365.
- WhatsApp.
- CRM.
- ERP.

## Critérios para adicionar integração

- Finalidade clara.
- Dono de produto definido.
- Escopos mínimos necessários.
- Risco de dados classificado.
- Processo de revogação.
- Plano de auditoria.
- Plano de sync e retenção.

## Não escopo inicial

- Instalar Nango.
- Criar sync scripts.
- Conectar provedores reais.
- Armazenar tokens reais.
- Implementar UI de conexão.

## Prioridade recomendada

1. Google Drive.
2. Gmail.
3. Microsoft 365.
4. WhatsApp.
5. CRM.
6. ERP.
7. GitHub.

## Riscos gerais

- Escopos OAuth excessivos.
- Vazamento de documentos ou e-mails.
- Mistura de dados entre tenants.
- Tokens sem rotação ou revogação.
- Falhas silenciosas de sincronização.
- Uso indevido por agentes.

## Métricas operacionais

- Conexões ativas por provedor.
- Falhas de OAuth.
- Syncs executados.
- Syncs com erro.
- Tempo médio de sincronização.
- Registros processados.
- Tokens revogados.
- Webhooks recebidos.
