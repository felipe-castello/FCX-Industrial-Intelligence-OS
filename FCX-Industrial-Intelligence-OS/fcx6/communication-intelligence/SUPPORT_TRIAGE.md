# Support Triage - FCX Communication Intelligence

## Objetivo

Planejar a triagem inteligente de suporte técnico, separando mensagens comerciais, suporte, financeiro e técnico, classificando prioridade e sugerindo próximos passos.

## Regra principal

Nenhuma resposta ao cliente deve ser enviada automaticamente sem aprovação humana.

## Categorias

### Comercial

Indícios:

- Pedido de proposta.
- Demonstração.
- Interesse em contratação.
- Comparação de planos.

Ação sugerida:

- Encaminhar para comercial.
- Qualificar lead.

### Suporte

Indícios:

- Erro no sistema.
- Dúvida de uso.
- Login ou acesso.
- Dashboard não carrega.
- Integração falhou.

Ação sugerida:

- Criar triagem de suporte.
- Solicitar evidências.
- Consultar logs, se autorizado.

### Financeiro

Indícios:

- Nota fiscal.
- Pagamento.
- Cobrança.
- Contrato.
- Vencimento.

Ação sugerida:

- Encaminhar para financeiro.
- Não responder valores ou condições sem validação.

### Técnico

Indícios:

- Ativo em falha.
- Alarme crítico.
- Problema de refrigeração.
- Sensor sem comunicação.
- Ordem de serviço.

Ação sugerida:

- Encaminhar para suporte técnico ou Field Service.
- Priorizar conforme risco.
- Solicitar dados operacionais.

## Prioridade

### Crítica

Critérios:

- Operação parada.
- Risco de perda de produto.
- Alarme crítico.
- Segurança elétrica ou mecânica.
- Cliente estratégico.

SLA sugerido:

- Ação imediata.

### Alta

Critérios:

- Incidente relevante.
- Integração crítica indisponível.
- SLA próximo.
- Cliente em implantação.

SLA sugerido:

- Resposta rápida.

### Média

Critérios:

- Dúvida operacional.
- Solicitação sem impacto crítico.
- Problema contornável.

SLA sugerido:

- Atendimento padrão.

### Baixa

Critérios:

- Solicitação informativa.
- Baixo impacto.
- Sem prazo.

SLA sugerido:

- Fila normal.

## Fluxo de triagem

```text
Mensagem recebida
  |
  v
Classificar categoria
  |
  v
Detectar prioridade
  |
  v
Extrair entidades
  |
  v
Vincular cliente/ativo/OS
  |
  v
Sugerir responsável
  |
  v
Gerar rascunho ou checklist
  |
  v
Aprovação humana
```

## Entidades extraídas

- Cliente.
- Unidade.
- Ativo.
- Número de OS.
- E-mail.
- Telefone.
- Produto.
- Integração.
- Alarme.
- Prazo.
- Anexo.

## Saída esperada

```text
Categoria:
Prioridade:
Resumo:
Entidades:
Responsável sugerido:
Próxima ação:
Rascunho sugerido:
Riscos:
```

## Integrações futuras

- Gmail.
- Microsoft 365.
- WhatsApp.
- CRM.
- ERP.
- Field Service.
- Knowledge Vault.
- Industrial Intelligence.

## Riscos

- Prioridade errada.
- Mensagem crítica tratada como comercial.
- Financeiro respondido por agente técnico.
- Dados sensíveis enviados em rascunho.
- Promessa de prazo sem validação.
- Falta de contexto do cliente.

## Controles

- Separação obrigatória entre comercial, suporte, financeiro e técnico.
- Revisão humana obrigatória.
- Auditoria de classificação.
- Reclassificação manual.
- Escalonamento para humano em prioridade crítica.
- Bloqueio de envio automático.

## Não implementar ainda

- Criação automática de ticket.
- Envio de resposta.
- Integração real com caixa de e-mail.
- SLA automático em produção.
