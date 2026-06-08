# LibreChat

Modulo externo previsto: `felipe-castello/LibreChat`.

## Funcao no FCX

Interface conversacional opcional para o ecossistema FCX. Nao substitui o dashboard principal.

## Rota FCX

`fcx-6.0/apps/fcx-agent-console`

## Status

Submodulo pendente. A tentativa de `git submodule add` foi bloqueada pelo Git local com `Win32 error 5`.

## Comando para ativar

```bash
rm fcx-6.0/modules/librechat/README.md
git submodule add https://github.com/felipe-castello/LibreChat fcx-6.0/modules/librechat
git submodule update --init --recursive
```

## Feature flag

`ENABLE_LIBRECHAT=false`
