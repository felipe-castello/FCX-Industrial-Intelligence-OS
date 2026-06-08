# OAuth Security - FCX Integration Hub

## Objetivo

Definir regras de segurança para integrações OAuth e conectores externos do FCX 6.0 usando Nango ou componente equivalente.

## Princípios

- Menor privilégio possível.
- Consentimento explícito.
- Isolamento por tenant.
- Revogação simples.
- Auditoria completa.
- Escrita externa somente com aprovação humana.
- Nenhum token exposto a agentes ou frontend.

## Escopos

### Regras para escopos

- Solicitar apenas escopos necessários.
- Separar leitura e escrita.
- Evitar escopos globais quando houver escopo por pasta, repositório ou label.
- Revisar escopos por integração antes do go-live.
- Registrar escopos concedidos por conexão.

### Escopos proibidos no MVP

- Escrita ampla em e-mail.
- Escrita ampla em ERP.
- Administração de tenant Microsoft/Google.
- Acesso total a Drive/SharePoint sem restrição.
- Execução financeira ou trading.

## Armazenamento de tokens

Requisitos:

- Tokens armazenados somente no Nango ou vault aprovado.
- Nunca persistir tokens em logs.
- Nunca retornar tokens para agentes.
- Nunca expor tokens para frontend.
- Rotação e revogação documentadas.

## Fluxo de autorização

```text
Usuário autorizado
  |
  v
FCX valida tenant e permissão
  |
  v
Nango inicia OAuth
  |
  v
Provedor solicita consentimento
  |
  v
Nango armazena credencial
  |
  v
FCX registra conexão e escopos
```

## Controle por tenant

Cada conexão deve conter:

- `tenantId`
- `provider`
- `connectionId`
- `connectedBy`
- `scopes`
- `createdAt`
- `status`

Regras:

- Uma conexão nunca pode ser usada por outro tenant.
- Usuário só visualiza conexões do próprio tenant.
- Agentes só usam ferramentas permitidas para o tenant.

## Auditoria

Registrar:

- Quem conectou.
- Quando conectou.
- Provedor.
- Escopos.
- Sync executado.
- Dados acessados em resumo.
- Erros.
- Revogações.
- Ferramentas MCP que usaram a integração.

## Revogação

Deve existir processo para:

- Desconectar integração.
- Revogar token no provedor.
- Parar syncs.
- Remover webhooks.
- Marcar dados como desconectados.
- Definir se dados já ingeridos serão mantidos ou removidos.

## Webhooks

Requisitos:

- Validar assinatura quando o provedor oferecer.
- Validar origem.
- Aplicar rate limit.
- Registrar payload resumido.
- Não confiar em tenant vindo apenas do payload.
- Usar mapeamento interno de conexão.

## Sincronização

Requisitos:

- Idempotência.
- Retry com backoff.
- Dead-letter para falhas.
- Limite de volume.
- Paginação segura.
- Checkpoint por conexão.
- Observabilidade por job.

## Agentes e OAuth

Regras:

- Agentes não recebem tokens.
- Agentes solicitam ações via MCP Tools.
- MCP Tools validam permissão.
- Ferramentas retornam apenas dados necessários.
- Escrita externa exige aprovação humana.

## Classificação de risco

### Baixo

- Leitura de metadados não sensíveis.
- Repositórios públicos autorizados.

### Médio

- Issues, documentos técnicos, CRM sem dados financeiros.

### Alto

- E-mails, Drive, Microsoft 365, WhatsApp, dados pessoais.

### Crítico

- ERP, financeiro, estoque, dados regulados, escrita externa.

## Checklist antes de ativar uma integração

- Finalidade documentada.
- Escopos revisados.
- Tenant isolation validado.
- Revogação testada.
- Logs sem tokens.
- Sync idempotente.
- Rate limit configurado.
- Dono de produto definido.
- Aprovação de segurança.

## Não implementar ainda

- Fluxo OAuth real.
- Nango em produção.
- Sync scripts.
- Webhooks reais.
- Escrita externa.
