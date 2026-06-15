# Vibration Analysis Skill

## 1. Objetivo

Detectar, explicar e priorizar riscos mecanicos a partir de vibracao, tendencia historica, alarmes e contexto do ativo.

## 2. Quando usar

- Para analisar vibracao elevada.
- Para identificar tendencia de falha mecanica.
- Para priorizar ativos com risco de rolamento, desalinhamento, desbalanceamento ou folga.
- Para apoiar manutencao preditiva.
- Para correlacionar vibracao com temperatura, corrente e potencia.

## 3. Inputs necessarios

- Serie historica de vibracao.
- Tipo de ativo e criticidade.
- Temperatura, corrente e potencia associadas.
- Alarmes relacionados.
- Limites ou baseline de vibracao.
- Historico de manutencao.
- Janela de tempo da analise.

## 4. Processo passo a passo

1. Confirmar se a amostra possui volume e recencia suficientes.
2. Calcular media, maximo, variacao e tendencia.
3. Comparar vibracao atual com baseline e limites.
4. Correlacionar vibracao com temperatura e corrente.
5. Identificar padrao: salto brusco, crescimento gradual, oscilacao ou persistencia.
6. Classificar risco por severidade e criticidade do ativo.
7. Sugerir verificacoes mecanicas.
8. Indicar se deve virar ordem de servico ou monitoramento intensivo.

## 5. Criterios de validacao

- Tendencia foi analisada, nao apenas o ultimo valor.
- Baseline ou limite operacional foi considerado.
- Criticidade do ativo influencia a prioridade.
- Recomendacao possui evidencia objetiva.
- Dados insuficientes sao sinalizados.

## 6. Saida esperada

- Classificacao do risco de vibracao.
- Evidencias numericas.
- Tendencia observada.
- Possiveis causas mecanicas.
- Recomendacoes de manutencao.
- Prioridade sugerida.

## 7. Riscos e cuidados

- Nao concluir causa mecanica sem considerar sensor solto ou erro de leitura.
- Nao comparar ativos diferentes sem normalizacao.
- Evitar recomendacao de parada imediata sem limiar critico ou validacao humana.
- Considerar regime de carga antes de interpretar vibracao.
- Confirmar unidade e escala do sensor.
