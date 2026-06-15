# Vector Database Plan - FCX Knowledge Intelligence

## Objetivo

Planejar a camada vetorial para busca semântica, RAG e recuperação de conhecimento técnico no FCX 6.0.

## Requisitos

- Isolamento por tenant.
- Filtros por metadados.
- Suporte a busca semântica.
- Capacidade de reindexação.
- Baixo custo operacional no MVP.
- Possibilidade de escalar para ambiente SaaS.
- Compatibilidade com LlamaIndex e Haystack.

## Opções candidatas

### pgvector

Vantagens:

- Usa PostgreSQL existente.
- Menor complexidade operacional.
- Bom para MVP e primeiros pilotos.
- Backup junto ao banco principal.
- Fácil filtro por metadados relacionais.

Desvantagens:

- Pode competir com carga transacional.
- Escala limitada para volumes muito grandes.
- Requer cuidado com índices e performance.

Uso recomendado:

- MVP FCX 6.0.
- Pilotos.
- Knowledge Vault inicial.

### Qdrant

Vantagens:

- Especializado em vetores.
- Bom suporte a payload/metadados.
- Simples de operar em Docker.
- Escala melhor que pgvector para busca vetorial dedicada.

Desvantagens:

- Mais um serviço para operar.
- Backup e restore separados.
- Exige governança adicional.

Uso recomendado:

- Quando o volume documental crescer.
- Quando busca vetorial afetar PostgreSQL.

### Weaviate

Vantagens:

- Plataforma rica para busca semântica.
- Recursos avançados de schema e classificação.

Desvantagens:

- Maior complexidade.
- Pode ser excesso para o MVP.

Uso recomendado:

- Avaliação futura em ambiente maior.

### Milvus

Vantagens:

- Escala alta.
- Bom para grandes volumes vetoriais.

Desvantagens:

- Operação mais complexa.
- Não indicado para começo em VPS simples.

Uso recomendado:

- Escala avançada, fora do MVP.

## Recomendação inicial

Começar com `pgvector` para reduzir complexidade e acelerar validação.

Evoluir para Qdrant quando:

- A base documental crescer muito.
- Consultas RAG ficarem lentas.
- For necessário isolar carga vetorial.
- Houver múltiplos tenants com alto volume.

## Modelo conceitual

### documents

- `id`
- `tenant_id`
- `title`
- `source_type`
- `manufacturer`
- `version`
- `language`
- `uploaded_by`
- `created_at`

### document_chunks

- `id`
- `document_id`
- `tenant_id`
- `content`
- `page`
- `section`
- `metadata`
- `embedding_model`
- `embedding_version`
- `created_at`

### document_embeddings

- `chunk_id`
- `embedding`
- `embedding_model`
- `dimensions`
- `created_at`

## Filtros obrigatórios

- `tenant_id`
- `source_type`
- `manufacturer`
- `asset_type`
- `asset_id`
- `document_version`
- `language`

## Estratégia de reindexação

Reindexar quando:

- Modelo de embedding mudar.
- Chunking mudar.
- Documento for atualizado.
- Metadados críticos forem corrigidos.

Requisitos:

- Manter versão anterior até validação.
- Registrar modelo e versão.
- Permitir rollback.

## Segurança

- Nunca consultar embeddings sem filtro de tenant.
- Não armazenar secrets em metadados.
- Documentos confidenciais devem ter nível de acesso.
- Logs de busca não devem expor conteúdo sensível completo.

## Métricas

- Total de documentos.
- Total de chunks.
- Tempo médio de busca.
- Taxa de queries sem resultado.
- Uso por tenant.
- Tamanho do índice.
- Custo de embedding.

## Decisão inicial

Para FCX 6.0:

- Planejar com pgvector no MVP.
- Manter contrato portável para Qdrant.
- Não implementar banco vetorial ainda.
