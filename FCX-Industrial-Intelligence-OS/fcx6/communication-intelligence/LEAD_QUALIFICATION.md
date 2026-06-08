# Lead Qualification - FCX Communication Intelligence

## Objetivo

Planejar como o FCX 6.0 irá classificar, qualificar e priorizar leads recebidos por e-mail, formulários, CRM ou canais de comunicação.

## Regra principal

Nenhuma resposta comercial deve ser enviada automaticamente sem aprovação humana.

## Fontes de leads

- E-mails comerciais.
- Formulários do site.
- CRM.
- WhatsApp.
- Indicações.
- Eventos.
- Contatos manuais.

## Classificação inicial

### Comercial

Lead interessado em produto, demonstração, orçamento ou parceria.

### Suporte

Contato que parece lead, mas na verdade busca ajuda técnica ou acesso.

### Financeiro

Contato relacionado a cobrança, contrato ou pagamento.

### Técnico

Contato técnico pedindo diagnóstico, integração, manutenção ou informação operacional.

## Campos de qualificação

- Nome.
- Empresa.
- Cargo.
- E-mail.
- Telefone.
- Segmento.
- Número de unidades.
- Quantidade estimada de ativos.
- Dor principal.
- Urgência.
- Orçamento estimado.
- Autoridade de decisão.
- Prazo.
- Módulo de interesse.

## Módulos de interesse

- Industrial Intelligence.
- Knowledge Vault.
- Field Service.
- Energy Intelligence.
- Communication Intelligence.
- Decision Intelligence.

## Score de lead

### Critérios positivos

- Dor operacional clara.
- Alto número de ativos.
- Múltiplas unidades.
- Custo energético relevante.
- Falhas recorrentes.
- SLA crítico.
- Decisor envolvido.
- Prazo definido.

### Critérios negativos

- Sem dor clara.
- Apenas curiosidade.
- Fora do ICP.
- Sem orçamento.
- Pedido não relacionado ao FCX.
- Alto risco regulatório sem fit.

## Prioridade

### Alta

- Cliente com dor clara, urgência e potencial de receita.

### Média

- Cliente com fit, mas sem urgência ou sem decisor.

### Baixa

- Lead pouco qualificado ou fora do ICP.

## Fluxo proposto

```text
Entrada do lead
  |
  v
Classificação de categoria
  |
  v
Extração de dados
  |
  v
Score de fit
  |
  v
Prioridade
  |
  v
Rascunho de resposta
  |
  v
Aprovação humana
  |
  v
Registro no CRM
```

## Saída esperada

- Categoria.
- Score.
- Prioridade.
- Resumo do lead.
- Dor identificada.
- Módulo de interesse.
- Próxima ação sugerida.
- Rascunho de resposta.

## Riscos

- Classificar suporte como lead.
- Responder comercialmente a uma emergência técnica.
- Enviar proposta sem contexto.
- Misturar dados de CRM entre tenants.
- Prometer funcionalidades inexistentes.

## Controles

- Revisão humana obrigatória.
- CRM como fonte de verdade comercial.
- Registro de justificativa do score.
- Possibilidade de reclassificação.
- Separação entre comercial, suporte, financeiro e técnico.

## Não implementar ainda

- Integração CRM real.
- Envio automático.
- Scoring automático em produção.
- Criação automática de oportunidade.
