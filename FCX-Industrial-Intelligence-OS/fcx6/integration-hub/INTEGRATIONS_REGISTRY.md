# Integrations Registry - FCX Integration Hub

## Objetivo

Mapear integrações externas previstas para o FCX 6.0, incluindo finalidade, dados acessados, riscos e permissões necessárias.

## 1. GitHub

### Finalidade

- Apoiar Architecture Intelligence e Software Engineering Agent.
- Ler repositórios autorizados.
- Gerar visão de arquitetura, mudanças e issues.
- Relacionar código, documentação e decisões técnicas.

### Dados acessados

- Repositórios.
- Pull requests.
- Issues.
- Commits.
- Arquivos de documentação.
- Workflows e status de CI, se autorizado.

### Permissões necessárias

- Leitura de repositórios selecionados.
- Leitura de issues e pull requests.
- Opcional: criação de issues ou comentários, sempre com aprovação humana.

### Riscos

- Exposição de código proprietário.
- Vazamento de secrets presentes no repositório.
- Acesso a repositórios fora do escopo.
- Agente sugerir alteração sem revisão humana.

### Cuidados

- Começar somente com leitura.
- Restringir por repositório.
- Não conceder permissão de escrita no MVP.
- Registrar todo acesso feito por agentes.

## 2. Google Drive

### Finalidade

- Alimentar Knowledge Vault.
- Ingerir PDFs, manuais, relatórios e documentos técnicos.
- Permitir busca documental por agentes.

### Dados acessados

- Arquivos selecionados.
- Pastas autorizadas.
- Metadados de documentos.
- Conteúdo de PDFs, Docs e planilhas autorizadas.

### Permissões necessárias

- Leitura de arquivos/pastas selecionadas.
- Listagem de metadados.
- Opcional: download/exportação para ingestão.

### Riscos

- Acesso a documentos sensíveis.
- Mistura de documentos entre tenants.
- Ingestão de documento sem permissão.
- Retenção indevida de conteúdo.

### Cuidados

- Escopo por pasta.
- Classificação de documento antes da ingestão.
- Auditoria por documento acessado.
- Política de remoção quando o acesso for revogado.

## 3. Gmail

### Finalidade

- Alimentar Communication Intelligence.
- Classificar conversas operacionais.
- Extrair pendências, incidentes e solicitações.
- Vincular e-mails a ativos, alarmes ou ordens de serviço.

### Dados acessados

- E-mails autorizados.
- Assunto.
- Corpo.
- Remetente/destinatário.
- Anexos autorizados.
- Threads.

### Permissões necessárias

- Leitura de e-mails autorizados.
- Leitura de anexos, se necessário.
- Opcional: criação de rascunhos, não envio automático.

### Riscos

- Dados pessoais.
- Informações comerciais sensíveis.
- Conteúdo fora do escopo operacional.
- Respostas automáticas indevidas.

### Cuidados

- Começar com labels ou caixas específicas.
- Não enviar e-mail automaticamente.
- Mascarar dados sensíveis.
- Definir retenção e exclusão.

## 4. Microsoft 365

### Finalidade

- Integrar e-mail, calendário, SharePoint, OneDrive e Teams ao Communication Intelligence e Knowledge Vault.

### Dados acessados

- E-mails autorizados.
- Calendários.
- Arquivos do OneDrive/SharePoint.
- Mensagens ou canais autorizados do Teams.
- Metadados de usuários, quando necessário.

### Permissões necessárias

- Leitura de arquivos/pastas selecionadas.
- Leitura de e-mails/caixas autorizadas.
- Leitura de calendário, se houver caso de uso.
- Opcional: criação de rascunhos ou eventos com aprovação.

### Riscos

- Escopos amplos demais no Microsoft Graph.
- Exposição de dados corporativos.
- Mistura de dados entre grupos.
- Compliance e retenção.

### Cuidados

- Usar consentimento administrativo quando necessário.
- Restringir escopos.
- Separar dados por tenant.
- Auditar webhooks e syncs.

## 5. WhatsApp

### Finalidade

- Comunicação operacional.
- Alertas.
- Recebimento de evidências de campo.
- Comunicação com técnicos e gestores.
- Base para Communication Intelligence.

### Dados acessados

- Mensagens recebidas.
- Status de entrega.
- Números autorizados.
- Anexos enviados.
- Templates e respostas.

### Permissões necessárias

- WhatsApp Cloud API.
- Envio de mensagens por templates aprovados.
- Recebimento via webhook.
- Gestão de número autorizado.

### Riscos

- Dados pessoais.
- Envio indevido de mensagens.
- Custos por conversa.
- Dependência de políticas da Meta.
- Exposição de incidentes sensíveis.

### Cuidados

- Usar templates aprovados.
- Registrar consentimento.
- Limitar grupos ou destinatários.
- Evitar dados sensíveis em mensagens.
- Auditar alertas enviados.

## 6. CRM

### Finalidade

- Relacionar clientes, oportunidades, contratos e contexto comercial ao Product Intelligence.
- Apoiar visão de cliente, saúde da conta e expansão.

### Dados acessados

- Contas.
- Contatos.
- Oportunidades.
- Contratos.
- Tickets ou atividades, dependendo do CRM.
- Status comercial.

### Permissões necessárias

- Leitura de contas e contatos.
- Leitura de oportunidades.
- Leitura de contratos ou campos comerciais autorizados.
- Opcional: criação de atividade ou nota com aprovação.

### Riscos

- Dados comerciais sensíveis.
- Dados pessoais.
- Impacto em pipeline de vendas.
- Campos customizados com informações confidenciais.

### Cuidados

- Definir CRM alvo antes de implementar.
- Mapear campos mínimos.
- Não alterar oportunidade automaticamente.
- Segregar acesso por perfil.

## 7. ERP

### Finalidade

- Integrar dados financeiros, compras, estoque, contratos, ativos e manutenção ao FCX.
- Apoiar Field Service, Energy Intelligence e Decision Intelligence.

### Dados acessados

- Cadastro de clientes.
- Contratos.
- Ordens internas.
- Estoque.
- Peças.
- Custos.
- Notas ou lançamentos, conforme ERP.

### Permissões necessárias

- Leitura de cadastros relevantes.
- Leitura de estoque e peças.
- Leitura de contratos ou centros de custo.
- Escrita somente em fase futura, com aprovação formal.

### Riscos

- Alto impacto operacional.
- Dados financeiros sensíveis.
- Integração complexa e customizada.
- Escrita indevida pode afetar faturamento ou estoque.

### Cuidados

- Começar somente leitura.
- Definir entidade por entidade.
- Validar com área financeira/operacional.
- Criar ambiente de homologação.
- Auditoria obrigatória.

## Matriz resumo

| Integração | Finalidade principal | Risco | MVP recomendado |
|---|---|---|---|
| GitHub | Arquitetura e engenharia | Médio | Leitura |
| Google Drive | Knowledge Vault | Alto | Leitura por pasta |
| Gmail | Communication Intelligence | Alto | Leitura por label |
| Microsoft 365 | Knowledge e comunicação | Alto | Leitura restrita |
| WhatsApp | Comunicação e alertas | Alto | Webhook + templates |
| CRM | Produto e cliente | Médio/Alto | Leitura |
| ERP | Operação e financeiro | Crítico | Leitura homologada |

## Regra geral

Toda integração começa como leitura. Escrita, automação ou envio externo exigem PRD, aprovação de segurança e validação humana.
