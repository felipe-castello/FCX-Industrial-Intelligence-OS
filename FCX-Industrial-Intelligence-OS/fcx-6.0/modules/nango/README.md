# nango

Modulo externo previsto: `felipe-castello/nango`.

## Funcao no FCX

Hub de integracoes externas com conectores para Gmail, Google Drive, Google Sheets, GitHub, ERP, Sitrad, ThingsBoard e APIs externas.

## Adapter

`fcx-6.0/packages/fcx-nango-adapter`

## Status

Submodulo pendente. A tentativa de `git submodule add` foi bloqueada pelo Git local com `Win32 error 5`.

## Comando para ativar

```bash
rm fcx-6.0/modules/nango/README.md
git submodule add https://github.com/felipe-castello/nango fcx-6.0/modules/nango
git submodule update --init --recursive
```

## Feature flag

`ENABLE_NANGO=false`
