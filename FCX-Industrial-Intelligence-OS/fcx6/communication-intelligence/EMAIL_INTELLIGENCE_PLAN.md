# Email Intelligence Plan - FCX Communication Intelligence

## Objetivo

Planejar o módulo futuro de inteligência de e-mails do FCX 6.0 para classificar mensagens, identificar prioridade, separar áreas, extrair ações e preparar rascunhos com aprovação humana.

## Regra principal

O FCX nunca deve enviar e-mail automaticamente sem aprovação humana.

O sistema pode:

- Ler e classificar e-mails autorizados.
- Extrair intenção.
- Sugerir prioridade.
- Sugerir responsável.
- Criar rascunho.
- Recomendar resposta.

O sistema não pode:

- Enviar e-mail sem revisão.
- Responder em nome de usuário sem aprovação.
- Alterar dados comerciais ou financeiros sem autorização.

## Categorias de e-mail

### Comercial

Exemplos:

- Lead novo.
- Pedido de proposta.
- Solicitação de demonstração.
- Negociação.
- Follow-up comercial.

### Suporte

Exemplos:

- Erro no sistema.
- Dúvida de uso.
- Solicitação de acesso.
- Problema em dashboard.
- Falha de integração.

### Financeiro

Exemplos:

- Cobrança.
- Nota fiscal.
- Pagamento.
- Contrato.
- Reajuste.

### Técnico

Exemplos:

- Falha em ativo.
- Alarme crítico.
- Dúvida sobre manutenção.
- Relatório técnico.
- Solicitação de diagnóstico.

## Classificação por prioridade

### Crítica

Critérios:

- Risco operacional.
- Cliente parado.
- Alarme crítico.
- Falha de refrigeração.
- Risco de segurança.
- Executivo ou cliente estratégico.

### Alta

Critérios:

- SLA próximo de vencer.
- Suporte técnico urgente.
- Proposta comercial quente.
- Financeiro com bloqueio operacional.

### Média

Critérios:

- Dúvida comum.
- Solicitação técnica sem urgência.
- Lead em avaliação.
- Follow-up pendente.

### Baixa

Critérios:

- Newsletter.
- Mensagem informativa.
- Solicitação sem prazo.
- Baixo impacto.

## Pipeline conceitual

```text
E-mail recebido
  |
  v
Validação de origem e permissão
  |
  v
Classificação: comercial, suporte, financeiro, técnico
  |
  v
Prioridade
  |
  v
Extração de entidades
  |
  v
Vínculo com cliente, ativo, OS ou lead
  |
  v
Rascunho ou recomendação
  |
  v
Aprovação humana
```

## Dados extraídos

- Remetente.
- Empresa.
- Cliente.
- Assunto.
- Categoria.
- Prioridade.
- Intenção.
- Prazo citado.
- Ativo citado.
- Unidade citada.
- Produto citado.
- Valor ou contrato citado.
- Anexos.
- Próxima ação sugerida.

## Integrações previstas

- Gmail.
- Microsoft 365.
- CRM.
- ERP.
- Knowledge Vault.
- Field Service.
- Support Triage.

## Métricas

- E-mails classificados.
- Tempo até primeira resposta.
- Prioridade por categoria.
- Rascunhos aprovados.
- Rascunhos rejeitados.
- Leads qualificados.
- Tickets criados.
- Incidentes técnicos detectados.

## Riscos

- Dados pessoais.
- E-mails confidenciais.
- Classificação incorreta.
- Resposta inadequada.
- Envio sem aprovação.
- Mistura entre comercial, suporte, financeiro e técnico.

## Controles obrigatórios

- Separar categorias.
- Exigir aprovação para envio.
- Registrar auditoria.
- Permitir correção manual.
- Mascarar dados sensíveis quando necessário.
- Respeitar tenant e permissões.

## Não implementar ainda

- Conexão Gmail/Microsoft real.
- Envio de e-mail.
- Criação automática de tickets.
- Rascunho automático em provedor.
