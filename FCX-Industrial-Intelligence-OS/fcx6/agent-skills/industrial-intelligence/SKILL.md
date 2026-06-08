# Industrial Intelligence Skill

## 1. Objetivo

Apoiar analises industriais integradas combinando ativos, telemetria, alarmes, ordens de servico, consumo energetico e contexto operacional.

## 2. Quando usar

- Para gerar visao executiva de uma unidade, cliente ou conjunto de ativos.
- Para explicar a situacao operacional atual.
- Para correlacionar alarmes, telemetria e manutencao.
- Para priorizar riscos industriais.
- Para apoiar reunioes de operacao, engenharia ou gestao.

## 3. Inputs necessarios

- Lista de ativos e criticidade.
- Telemetria recente e historica.
- Alarmes ativos e historicos.
- Ordens de servico abertas e fechadas.
- Unidade, cliente ou escopo analisado.
- Janela de tempo da analise.
- Regras de negocio ou SLAs aplicaveis.

## 4. Processo passo a passo

1. Definir o escopo da analise: cliente, unidade, ativo ou periodo.
2. Coletar KPIs principais: ativos online, alarmes ativos, ordens abertas, temperatura media, vibracao media e consumo.
3. Identificar ativos criticos por status, criticidade, alarmes e tendencias.
4. Correlacionar eventos: telemetria anomala, alarmes e ordens de servico.
5. Separar sinais operacionais de ruido ou dados incompletos.
6. Gerar diagnostico executivo com prioridades.
7. Recomendar proximas acoes com justificativa.
8. Registrar incertezas, lacunas de dados e riscos.

## 5. Criterios de validacao

- A analise cita o periodo e o escopo usados.
- Todos os indicadores numericos possuem origem clara.
- Recomendações possuem justificativa baseada em dados.
- Ativos criticos aparecem ordenados por risco.
- Lacunas ou baixa qualidade de dados sao explicitadas.
- Nenhuma decisao critica e apresentada como absoluta sem evidencia suficiente.

## 6. Saida esperada

- Resumo executivo.
- KPIs principais.
- Lista de ativos prioritarios.
- Correlacoes relevantes.
- Recomendacoes operacionais.
- Riscos e incertezas.
- Proximos passos sugeridos.

## 7. Riscos e cuidados

- Nao confundir dados simulados com dados reais.
- Nao misturar clientes ou unidades sem autorizacao.
- Nao recomendar desligamento, bypass ou intervencao critica sem validacao humana.
- Verificar se os dados vêm de `telemetry`, `telemetry_processed` ou outra fonte.
- Explicitar quando a amostra de telemetria for pequena ou antiga.
