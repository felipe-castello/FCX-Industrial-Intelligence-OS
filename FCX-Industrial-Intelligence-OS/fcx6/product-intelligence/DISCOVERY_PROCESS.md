# Discovery Process - FCX 6.0

## Objetivo

Definir um processo padrao para validar problemas, clientes, valor e riscos antes de iniciar desenvolvimento.

## Quando iniciar discovery

- Nova funcionalidade.
- Novo modulo.
- Nova integracao.
- Pedido de cliente relevante.
- Ideia de agente ou automacao.
- Hipotese de monetizacao.

## Etapas

### 1. Formular hipotese

Template:

```text
Acreditamos que [perfil de usuario] tem dificuldade em [problema].
Se entregarmos [solucao], esperamos melhorar [metrica].
Validaremos isso com [experimento].
```

### 2. Identificar usuario e contexto

Mapear:

- Perfil.
- Responsabilidade.
- Frequencia da dor.
- Ferramentas atuais.
- Impacto do problema.
- Quem decide a compra.
- Quem usa diariamente.

### 3. Coletar evidencias

Fontes:

- Entrevistas.
- Logs do FCX.
- Dados de telemetria.
- Alarmes.
- Ordens de servico.
- Planilhas.
- Conversas.
- Tickets.
- Demonstracoes.

### 4. Mapear jornada atual

Responder:

- Como o usuario resolve hoje?
- Onde perde tempo?
- Onde erra?
- Onde ha custo?
- Onde ha risco?
- O que e manual?

### 5. Definir oportunidade

Classificar:

- Dor operacional.
- Dor financeira.
- Dor de compliance.
- Dor de conhecimento.
- Dor de comunicacao.
- Dor de decisao.

### 6. Estimar valor

Medir ou estimar:

- Tempo economizado.
- Falhas evitadas.
- Energia economizada.
- Receita protegida.
- Reducao de retrabalho.
- Aumento de SLA.

### 7. Avaliar viabilidade

Checar:

- Dados existem?
- Dados sao confiaveis?
- Integracao e possivel?
- Ha risco de seguranca?
- Ha risco juridico?
- Custo de IA e aceitavel?
- Time consegue manter?

### 8. Definir MVP

O MVP deve:

- Resolver uma dor clara.
- Ter usuario definido.
- Ter metrica de sucesso.
- Ser testavel em ate 30 dias.
- Nao quebrar o FCX 5.0.
- Ter rollback simples.

### 9. Criar PRD

Usar:

```text
fcx6/product-intelligence/PRD_TEMPLATE.md
```

### 10. Decidir

Possiveis decisoes:

- Construir agora.
- Fazer prototipo.
- Coletar mais dados.
- Aguardar cliente.
- Rejeitar.
- Mover para Labs.

## Perguntas por modulo

### Industrial Intelligence

- Qual decisao operacional o usuario precisa tomar?
- Qual falha ou risco queremos reduzir?
- Quais dados existem hoje?
- O resultado sera confiavel para operacao real?

### Knowledge Vault

- Quais documentos sao mais consultados?
- Onde o conhecimento se perde?
- O usuario precisa de resposta, citacao ou procedimento?
- Quem valida a resposta tecnica?

### Field Service

- Qual etapa do atendimento mais falha?
- O tecnico chega preparado?
- A OS tem informacao suficiente?
- Como medir primeira visita resolutiva?

### Energy Intelligence

- Existe baseline confiavel?
- Ha medicao real ou estimada?
- Qual custo mensal de energia?
- O cliente pode agir sobre a recomendacao?

### Sports Quant

- Qual decisao quantitativa sera melhorada?
- Existem dados historicos confiaveis?
- Como evitar overfitting?
- Ha usuario pagante claro?

### Trade Intelligence

- Qual decisao de risco sera apoiada?
- Ha exigencia regulatoria?
- O sistema apenas analisa ou influencia execucao?
- Como registrar tese, decisao e resultado?

## Artefatos de discovery

- Hipotese.
- Mapa de usuario.
- Jornada atual.
- Evidencias.
- MVP.
- PRD.
- Matriz de risco.
- Decisao final.

## Criterios para aprovar desenvolvimento

- Problema validado.
- Usuario definido.
- Valor mensuravel.
- Dados disponiveis.
- Riscos conhecidos.
- MVP pequeno.
- Plano de rollback.
- Dono de produto definido.

## Cuidados

- Nao construir porque a tecnologia e interessante.
- Nao confundir pedido isolado com mercado.
- Nao iniciar Labs antes de proteger o core.
- Nao prometer automacao autonoma sem auditoria.
- Nao usar dados sensiveis em experimentos sem governanca.
