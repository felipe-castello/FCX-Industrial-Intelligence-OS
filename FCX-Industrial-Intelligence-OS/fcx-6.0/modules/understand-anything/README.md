# Understand Anything

Modulo externo previsto: `felipe-castello/Understand-Anything`.

## Funcao no FCX

Motor de ingestao e document understanding para FCX Knowledge Vault:

- PDFs
- manuais tecnicos
- relatorios
- contratos
- documentos PMOC/NBR/NR10

## Adapter

`fcx-6.0/packages/fcx-knowledge-adapter`

## Status

Submodulo pendente. A tentativa de `git submodule add` foi bloqueada pelo Git local com `Win32 error 5`.

## Comando para ativar

```bash
rm fcx-6.0/modules/understand-anything/README.md
git submodule add https://github.com/felipe-castello/Understand-Anything fcx-6.0/modules/understand-anything
git submodule update --init --recursive
```

## Feature flag

`ENABLE_UNDERSTAND_ANYTHING=false`
