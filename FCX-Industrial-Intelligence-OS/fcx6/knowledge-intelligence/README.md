# FCX Knowledge Intelligence

## Objetivo

Preparar a base arquitetural para RAG, busca técnica, recuperação de conhecimento e suporte aos agentes do FCX Intelligence Platform 6.0.

O módulo deve transformar documentos técnicos, manuais, normas, relatórios e histórico operacional em conhecimento consultável, auditável e vinculado a ativos, fabricantes, unidades e ordens de serviço.

## Escopo inicial

- Arquitetura RAG com LlamaIndex.
- Compatibilidade futura com Haystack.
- Planejamento de banco vetorial.
- Pipeline documental.
- Catálogo de fontes previstas.
- Regras de governança, segurança e qualidade.

## Fontes previstas

1. PDFs técnicos.
2. Manuais Danfoss.
3. Manuais Bitzer.
4. Carel.
5. Full Gauge.
6. NR10.
7. PMOC.
8. Relatórios técnicos.
9. Ordens de serviço.

## Componentes previstos

- Document Pipeline.
- Metadata Registry.
- Vector Database.
- RAG API.
- Citation Engine.
- Knowledge Evaluation.
- Tenant Isolation.
- Agent Tools.

## Integração com agentes

O Knowledge Intelligence deve alimentar:

- FCX Technical Knowledge Vault Agent.
- FCX Industrial Intelligence Agent.
- FCX Electronics Lab Agent.
- FCX Field Service Agent.
- FCX Master Agent.

## Princípios

- Toda resposta técnica deve citar fonte quando possível.
- Documentos devem ser isolados por tenant.
- Conteúdo normativo deve preservar versão, data e origem.
- Respostas devem declarar incerteza quando a fonte for insuficiente.
- Nenhuma ingestão deve ocorrer sem classificação e metadados mínimos.
- O FCX 5.0 não deve ser alterado por este módulo.

## Documentos deste módulo

- `DOCUMENT_PIPELINE.md`
- `RAG_ARCHITECTURE.md`
- `VECTOR_DATABASE_PLAN.md`
- `SOURCES.md`
