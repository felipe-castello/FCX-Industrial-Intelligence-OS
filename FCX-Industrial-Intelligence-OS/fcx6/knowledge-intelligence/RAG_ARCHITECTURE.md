# RAG Architecture - FCX Knowledge Intelligence

## Objetivo

Definir a arquitetura de recuperação aumentada por geração para o FCX 6.0, usando LlamaIndex como base inicial e mantendo suporte futuro ao Haystack.

## Arquitetura lógica

```text
Usuário ou Agente
  |
  v
Knowledge Query API
  |
  v
Tenant + Permission Filter
  |
  v
Query Rewriter
  |
  v
Retriever
  |
  |-- Vector Search
  |-- Metadata Filter
  |-- Keyword Search futura
  |
  v
Reranking futuro
  |
  v
Context Builder
  |
  v
LLM Response
  |
  v
Citation + Safety Layer
  |
  v
Resposta com fontes
```

## LlamaIndex como caminho inicial

Uso previsto:

- Ingestão documental.
- Criação de índices.
- Retrieval com filtros de metadados.
- Composição de contexto.
- Integração com agentes.

Motivos:

- Boa produtividade para RAG.
- Flexibilidade para múltiplos conectores.
- Compatibilidade com diferentes vector stores.
- Suporte a pipelines de query.

## Haystack como suporte futuro

Uso potencial:

- Pipelines RAG mais explícitos.
- Avaliação comparativa.
- Busca híbrida.
- Reranking.
- Experimentos de qualidade.

Estratégia:

- Não acoplar documentos ao LlamaIndex de forma irreversível.
- Manter metadados e chunks em formato portável.
- Definir contratos de retrieval independentes da biblioteca.

## Tipos de consulta

### Consulta técnica

Exemplo:

```text
Qual o procedimento para alarme X no controlador Carel?
```

Resposta esperada:

- Procedimento.
- Fonte.
- Página ou seção.
- Incerteza se documento insuficiente.

### Consulta por ativo

Exemplo:

```text
Quais documentos se aplicam ao compressor FCX-003?
```

Resposta esperada:

- Documentos vinculados.
- Fabricante.
- Modelo.
- Ordens relacionadas.

### Consulta normativa

Exemplo:

```text
Quais cuidados de NR10 se aplicam antes de intervenção elétrica?
```

Resposta esperada:

- Resumo conservador.
- Fonte normativa.
- Alerta de validação humana.

### Consulta de histórico

Exemplo:

```text
O que já foi feito nesse ativo em ordens anteriores?
```

Resposta esperada:

- Histórico resumido.
- OS relacionadas.
- Evidências.

## Camadas de segurança

- Filtro obrigatório por tenant.
- RBAC por tipo de fonte.
- Bloqueio de fontes confidenciais sem permissão.
- Mascaramento de dados sensíveis.
- Registro de pergunta, fontes usadas e resposta.
- Retenção configurável.

## Camada de citações

Toda resposta deve tentar retornar:

- Documento.
- Página.
- Seção.
- Fabricante.
- Versão.
- Link ou identificador interno.

Se a resposta não tiver fonte suficiente, deve dizer explicitamente.

## Métricas de qualidade

- Taxa de respostas com fonte.
- Taxa de respostas sem evidência.
- Feedback positivo/negativo.
- Tempo de resposta.
- Top documentos consultados.
- Perguntas sem resposta.
- Alucinação reportada.

## Integração com MCP Tools

Ferramentas previstas:

- `knowledge.search_documents`
- `knowledge.get_document`
- `knowledge.cite_sources`
- `knowledge.find_asset_documents`
- `knowledge.search_work_order_history`

## Requisitos para FCX 6.0

- Contrato de query independente da biblioteca RAG.
- Separação clara entre fonte, chunk e embedding.
- Metadados ricos.
- Auditoria.
- Citações.
- Compatibilidade com múltiplos tenants.

## Não implementar ainda

- Pipeline de ingestão real.
- Banco vetorial real.
- UI de busca.
- Integração com LibreChat.
- MCP Tools executáveis.
