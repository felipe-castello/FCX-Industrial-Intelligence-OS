# Refrigeration Diagnostics Skill

## 1. Objetivo

Apoiar diagnosticos de sistemas de refrigeracao industrial e comercial usando telemetria, alarmes, pressoes, temperatura, corrente, potencia e historico de manutencao.

## 2. Quando usar

- Para investigar temperatura fora de faixa.
- Para analisar pressao de succao ou descarga anormal.
- Para correlacionar consumo energetico com desempenho termico.
- Para avaliar compressores, racks, evaporadores, condensadores e cameras frias.
- Para apoiar tecnico de campo antes de uma intervencao.

## 3. Inputs necessarios

- Tipo de ativo.
- Temperatura.
- Pressao de succao.
- Pressao de descarga.
- Corrente, tensao e potencia.
- Alarmes ativos e recentes.
- Setpoints e faixa operacional esperada.
- Historico de ordens de servico.
- Condicoes ambientais, se disponiveis.

## 4. Processo passo a passo

1. Identificar o tipo de sistema e o ativo afetado.
2. Validar se a telemetria e recente e confiavel.
3. Comparar temperatura e pressoes com a faixa esperada.
4. Verificar corrente, tensao e potencia para sinais de sobrecarga.
5. Correlacionar alarmes com mudancas nas series temporais.
6. Avaliar hipoteses: falta de fluido, sujeira em condensador, falha de ventilacao, sensor defeituoso, carga termica elevada ou problema de controle.
7. Priorizar hipoteses por evidencia.
8. Recomendar verificacoes de campo e acoes seguras.

## 5. Criterios de validacao

- Diagnostico considera pelo menos temperatura, pressao e energia quando disponiveis.
- Hipoteses sao classificadas por probabilidade.
- Recomendacoes diferenciam verificacao remota e acao em campo.
- Limites de dados incompletos sao declarados.
- A resposta nao recomenda intervencoes perigosas sem tecnico qualificado.

## 6. Saida esperada

- Resumo do problema.
- Hipoteses mais provaveis.
- Evidencias usadas.
- Verificacoes recomendadas.
- Prioridade da intervencao.
- Riscos operacionais.

## 7. Riscos e cuidados

- Nao diagnosticar carga de fluido apenas por uma variavel isolada.
- Nao sugerir manuseio de refrigerante sem profissional habilitado.
- Confirmar calibracao e posicao dos sensores.
- Considerar degelo, abertura de portas e carga termica como causas externas.
- Diferenciar falha real de problema de comunicacao ou sensor.
