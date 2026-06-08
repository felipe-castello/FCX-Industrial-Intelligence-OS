# Integration Hub

## Objetivo

Centralizar integrações industriais e SaaS externas, reduzindo duplicidade entre conectores e padronizando autenticação, sincronização e monitoramento.

## Tecnologias previstas

- Nango para integrações OAuth e SaaS.
- NestJS para conectores industriais.
- EMQX MQTT para dados de campo.
- Modbus TCP para dispositivos industriais.
- PostgreSQL para credenciais e histórico de sync.
- Redis para filas e controle de retries.

## Próximas tarefas

- Inventariar conectores FCX 5.0.
- Definir padrão único de conector.
- Separar conectores industriais de conectores SaaS.
- Criar estratégia de credenciais por tenant.
- Planejar retries, backoff e dead-letter queue.
