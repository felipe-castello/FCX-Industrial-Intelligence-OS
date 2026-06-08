# Master Agent Flow

## Objetivo

Definir como o FCX Master Agent recebe o objetivo do usuário, planeja a tarefa, escolhe agentes especialistas, coordena execução, valida resultados, responde e registra memória.

## Fluxo obrigatório

```text
Objetivo do usuário
  ↓
Planejamento
  ↓
Escolha de agentes
  ↓
Execução
  ↓
Validação
  ↓
Resposta final
  ↓
Registro em memória
```

## 1. Objetivo do usuário

Entrada inicial:

- Pergunta.
- Pedido de diagnóstico.
- Pedido de resumo.
- Pedido de recomendação.
- Pedido de preparação de atendimento.
- Pedido Labs, como Sports Quant ou Trade Intelligence.

O Master Agent deve identificar:

- Intenção.
- Domínio.
- Urgência.
- Escopo.
- Tenant.
- Permissões.
- Necessidade de ação ou apenas leitura.

## 2. Planejamento

O Master Agent cria um plano curto contendo:

- Subtarefas.
- Dados necessários.
- Agentes candidatos.
- Ferramentas candidatas.
- Riscos.
- Critério de sucesso.

Exemplo:

```text
Objetivo: diagnosticar vibração alta no compressor FCX-003.
Subtarefas:
1. Consultar telemetria recente.
2. Consultar alarmes.
3. Buscar histórico de OS.
4. Buscar procedimento técnico.
5. Validar evidências.
```

## 3. Escolha de agentes

Critérios:

- Domínio da tarefa.
- Permissão do usuário.
- Fontes necessárias.
- Risco operacional.
- Necessidade de conhecimento técnico.

Tabela de decisão:

| Intenção | Agente principal | Agentes auxiliares |
|---|---|---|
| Status operacional | Industrial Intelligence | Master |
| Procedimento técnico | Knowledge Vault | Industrial, Field Service |
| Diagnóstico de ativo | Industrial Intelligence | Knowledge Vault, Field Service |
| Gateway ou sensor | Electronics Lab | IoT/Knowledge |
| Ordem de serviço | Field Service | Industrial, Knowledge |
| Sports Quant | Sports Quant | Master |
| Trade Intelligence | Trade Intelligence | Master |

## 4. Execução

Regras:

- Executar apenas ferramentas permitidas.
- Coletar evidências antes de recomendar.
- Separar fatos, inferências e recomendações.
- Evitar loops longos.
- Registrar erros de ferramentas.

Tipos de execução:

- Sequencial: quando há dependência entre etapas.
- Paralela: quando consultas são independentes.
- Iterativa: quando a validação pede mais dados.

## 5. Validação

O Master Agent deve verificar:

- A pergunta foi respondida?
- Existem fontes ou evidências suficientes?
- O resultado respeita tenant e permissões?
- Há risco operacional?
- Precisa de aprovação humana?
- Há contradição entre agentes?
- A resposta declara incertezas?

Possíveis resultados:

- `valid`
- `needs_more_data`
- `needs_human_approval`
- `invalid_result`
- `out_of_scope`

## 6. Resposta final

A resposta deve conter:

- Resumo.
- Evidências.
- Recomendação.
- Riscos.
- Próximos passos.
- Fontes, quando houver.
- Limitações.

Formato recomendado:

```text
Resumo:
Evidências:
Análise:
Recomendação:
Riscos:
Próximos passos:
```

## 7. Registro em memória

Registrar:

- Objetivo do usuário.
- Agentes usados.
- Ferramentas chamadas.
- Evidências principais.
- Resultado.
- Decisão ou recomendação.
- Aprovação humana, se houver.
- Feedback do usuário, se houver.

## Regras de escalonamento

Escalar para humano quando:

- Recomendação pode afetar segurança.
- Há intervenção elétrica, mecânica ou operacional crítica.
- Dados são insuficientes.
- Ferramentas retornam conflito.
- Usuário solicita ação irreversível.

## Limites do Master Agent

- Não deve fingir especialidade técnica quando agente especialista é necessário.
- Não deve executar ações críticas.
- Não deve misturar contexto industrial com Labs.
- Não deve acessar dados de outro tenant.
- Não deve responder com certeza quando as evidências são fracas.
