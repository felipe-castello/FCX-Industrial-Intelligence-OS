# langchain

Modulo externo previsto: `felipe-castello/langchain`.

## Funcao no FCX

Base para pipelines de agentes, chains, RAG e LangGraph.

## Adapter

`fcx-6.0/packages/fcx-langchain-adapter`

## Status

Submodulo pendente. A tentativa de `git submodule add` foi bloqueada pelo Git local com `Win32 error 5`.

## Comando para ativar

```bash
rm fcx-6.0/modules/langchain/README.md
git submodule add https://github.com/felipe-castello/langchain fcx-6.0/modules/langchain
git submodule update --init --recursive
```

## Feature flag

`ENABLE_LANGCHAIN=true`
