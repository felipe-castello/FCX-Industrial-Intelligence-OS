# agent-skills

Modulo externo previsto: `felipe-castello/agent-skills`.

## Funcao no FCX

Biblioteca de skills operacionais para agentes FCX:

- FCX Technical Knowledge Vault Agent
- FCX Electronics Lab Agent
- FCX Sports Quant Agent
- FCX Industrial Intelligence Agent

## Status

Submodulo pendente. A tentativa de `git submodule add` foi bloqueada pelo Git local com `Win32 error 5`.

## Comando para ativar

```bash
rm fcx-6.0/modules/agent-skills/README.md
git submodule add https://github.com/felipe-castello/agent-skills fcx-6.0/modules/agent-skills
git submodule update --init --recursive
```

## Feature flag

`ENABLE_AGENT_SKILLS=false`
