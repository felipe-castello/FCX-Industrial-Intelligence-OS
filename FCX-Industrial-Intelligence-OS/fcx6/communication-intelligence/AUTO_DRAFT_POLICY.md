# Auto Draft Policy - FCX Communication Intelligence

## Objetivo

Definir a política para criação de rascunhos automáticos de e-mail, mensagens e respostas operacionais no FCX 6.0.

## Regra inegociável

O FCX nunca envia e-mail automaticamente sem aprovação humana.

Esta regra vale para:

- Comercial.
- Suporte.
- Financeiro.
- Técnico.
- Field Service.
- Alertas.
- Comunicação com cliente.

## O que o sistema pode fazer

- Sugerir resposta.
- Criar rascunho.
- Resumir conversa.
- Listar próximos passos.
- Sugerir prioridade.
- Sugerir responsável.
- Preparar checklist.
- Sugerir anexos ou fontes.

## O que o sistema não pode fazer

- Enviar e-mail.
- Confirmar proposta.
- Assumir compromisso financeiro.
- Admitir falha contratual.
- Encerrar chamado.
- Prometer prazo.
- Enviar dados sensíveis.
- Acionar cliente sem revisão.

## Tipos de rascunho

### Comercial

Uso:

- Responder lead.
- Agendar demonstração.
- Solicitar informações.
- Preparar follow-up.

Revisão obrigatória:

- Comercial ou gestor.

### Suporte

Uso:

- Responder dúvida.
- Solicitar evidências.
- Orientar abertura de chamado.
- Atualizar status.

Revisão obrigatória:

- Suporte ou responsável técnico.

### Financeiro

Uso:

- Solicitar dados.
- Responder dúvida simples.
- Encaminhar para financeiro.

Revisão obrigatória:

- Financeiro.

### Técnico

Uso:

- Responder diagnóstico preliminar.
- Solicitar logs ou fotos.
- Enviar checklist.
- Encaminhar para Field Service.

Revisão obrigatória:

- Engenharia, suporte técnico ou gestor autorizado.

## Estrutura do rascunho

Todo rascunho deve conter:

- Categoria.
- Prioridade.
- Resumo da mensagem original.
- Resposta sugerida.
- Evidências usadas.
- Pontos que precisam revisão humana.
- Riscos de envio.

## Níveis de confiança

### Alta

- Mensagem simples.
- Contexto claro.
- Sem risco contratual ou técnico.

### Média

- Depende de contexto operacional.
- Pode exigir ajuste humano.

### Baixa

- Dados incompletos.
- Risco financeiro, técnico ou jurídico.
- Deve ser tratado com cautela.

## Política por prioridade

### Crítica

- Não gerar resposta final automaticamente.
- Gerar resumo e proposta de ação.
- Solicitar revisão imediata.

### Alta

- Gerar rascunho com alerta.
- Exigir revisão.

### Média

- Gerar rascunho padrão.
- Exigir revisão.

### Baixa

- Gerar rascunho opcional.
- Exigir revisão antes de envio.

## Auditoria

Registrar:

- E-mail original.
- Categoria.
- Prioridade.
- Quem gerou rascunho.
- Modelo/agente usado.
- Quem aprovou.
- Quem editou.
- Horário de envio, se aprovado.

## Bloqueios automáticos

Bloquear rascunho quando:

- Houver dados sensíveis sem autorização.
- Houver pedido jurídico.
- Houver admissão de responsabilidade.
- Houver promessa de SLA não validada.
- Houver risco de segurança.
- Houver linguagem ofensiva ou ambígua.

## Não implementar ainda

- Envio automático.
- Rascunho dentro de Gmail/Microsoft.
- Aprovação em UI.
- Integração com CRM.
