# Document Pipeline - FCX Knowledge Intelligence

## Objetivo

Definir o pipeline documental para preparar PDFs, manuais, normas, relatórios técnicos e ordens de serviço para uso em RAG.

## Fluxo proposto

```text
Fonte documental
  |
  v
Upload ou sincronização
  |
  v
Classificação
  |
  v
Extração de texto
  |
  v
Normalização
  |
  v
Chunking técnico
  |
  v
Enriquecimento de metadados
  |
  v
Embedding
  |
  v
Vector Database
  |
  v
Busca RAG com citações
```

## Etapas

### 1. Entrada do documento

Fontes possíveis:

- Upload manual.
- Pasta sincronizada.
- Importação via integração.
- Anexo de ordem de serviço.
- Documento associado a fabricante ou ativo.

Metadados mínimos:

- `tenantId`
- `sourceType`
- `documentTitle`
- `manufacturer`
- `assetType`
- `assetId`, quando aplicável
- `version`
- `language`
- `uploadedBy`
- `uploadedAt`

### 2. Classificação

Classes iniciais:

- Manual técnico.
- Norma.
- Procedimento.
- Relatório técnico.
- Ordem de serviço.
- Datasheet.
- Diagrama.
- Evidência de campo.

### 3. Extração de texto

Estratégias:

- Extração nativa para PDFs com texto.
- OCR futuro para PDFs escaneados.
- Extração de tabelas quando necessário.
- Preservação de páginas e seções para citação.

### 4. Normalização

Regras:

- Remover cabeçalhos repetitivos quando atrapalharem a busca.
- Preservar unidades de medida.
- Preservar códigos de erro, modelos e tabelas técnicas.
- Manter referência de página.
- Não traduzir automaticamente conteúdo técnico na primeira fase.

### 5. Chunking técnico

Estratégia inicial:

- Chunk por seção quando possível.
- Chunk por página quando a estrutura for ruim.
- Tamanho moderado para preservar contexto técnico.
- Overlap controlado.

Metadados por chunk:

- `documentId`
- `chunkId`
- `page`
- `section`
- `manufacturer`
- `assetType`
- `model`
- `sourceType`
- `tenantId`

### 6. Enriquecimento

Adicionar:

- Fabricante detectado.
- Modelo detectado.
- Tipo de equipamento.
- Termos técnicos.
- Normas citadas.
- Ativos relacionados.
- Ordens de serviço relacionadas.

### 7. Embeddings

Requisitos:

- Embedding versionado.
- Registro do modelo usado.
- Reprocessamento planejado em troca de modelo.
- Separação por tenant.

### 8. Indexação

Enviar chunks para banco vetorial com metadados filtráveis.

Filtros obrigatórios:

- Tenant.
- Fonte.
- Fabricante.
- Tipo de documento.
- Ativo, quando existir.

### 9. Validação

Critérios:

- Documento classificado corretamente.
- Texto extraído com qualidade aceitável.
- Páginas e seções preservadas.
- Chunks recuperáveis por busca.
- Citações apontam para fonte correta.

## Não escopo inicial

- Implementar ingestão real.
- Implementar OCR.
- Criar banco vetorial.
- Criar UI de upload.
- Automatizar sincronização externa.

## Riscos

- PDF escaneado sem OCR pode gerar pouco valor.
- Chunking ruim pode produzir respostas incorretas.
- Documentos sem versão podem gerar orientação obsoleta.
- Mistura entre tenants é risco crítico.
- Conteúdo normativo deve ser tratado com cuidado e validação humana.
