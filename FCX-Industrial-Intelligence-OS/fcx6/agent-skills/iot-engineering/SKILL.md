# IoT Engineering Skill

## 1. Objetivo

Apoiar engenharia de conectividade, aquisicao de dados, protocolos industriais, gateways IoT e integracao com EMQX/MQTT, Modbus TCP e conectores externos.

## 2. Quando usar

- Para configurar ou diagnosticar comunicacao MQTT.
- Para mapear payloads de telemetria.
- Para analisar falhas de gateway, topicos ou conectores.
- Para planejar integracao com Modbus TCP, Carel BOSS, Sitrad Pro, ThingsBoard ou FCX Gateway.
- Para validar arquitetura de ingestao de campo.

## 3. Inputs necessarios

- Protocolo usado.
- Topico MQTT, endpoint ou registradores Modbus.
- Exemplo de payload.
- Identificador do ativo ou dispositivo.
- Frequencia de envio.
- Logs do gateway, broker ou backend.
- Regras de normalizacao de telemetria.

## 4. Processo passo a passo

1. Identificar protocolo, origem e destino dos dados.
2. Validar conectividade basica: rede, porta, credenciais e disponibilidade.
3. Confirmar formato do payload ou mapa de registradores.
4. Verificar se o ativo e resolvido corretamente no FCX.
5. Validar normalizacao de temperatura, vibracao, corrente, potencia, pressao e umidade.
6. Checar duplicidade de ingestao ou subscribers concorrentes.
7. Avaliar perda de mensagens, atraso, retries e qualidade do dado.
8. Propor ajuste de topico, payload, gateway ou conector.

## 5. Criterios de validacao

- Payload ou registrador foi validado contra o contrato esperado.
- Telemetria bruta e processada podem ser rastreadas.
- O ativo correto foi associado.
- Falhas de comunicacao possuem causa provavel.
- Frequencia de envio esta dentro do limite operacional.
- Nao ha duplicidade evidente de ingestao.

## 6. Saida esperada

- Diagnostico de conectividade.
- Status por protocolo/conector.
- Mapa de payload ou registradores.
- Problemas encontrados.
- Ajustes recomendados.
- Checklist de validacao em campo.

## 7. Riscos e cuidados

- Nao expor credenciais de MQTT, APIs ou gateways.
- Evitar mudancas de topico sem plano de compatibilidade.
- Confirmar unidade de medida antes de normalizar.
- Cuidado com frequencia excessiva de telemetria.
- Em Modbus, validar endereco, escala e endianess antes de concluir falha de sensor.
