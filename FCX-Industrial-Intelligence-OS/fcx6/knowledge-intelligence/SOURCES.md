# Knowledge Sources - FCX Knowledge Intelligence

## Objetivo

Mapear fontes documentais previstas para o Knowledge Intelligence e definir metadados, uso esperado e cuidados por tipo de fonte.

## 1. PDFs técnicos

Uso esperado:

- Consulta técnica geral.
- Procedimentos.
- Datasheets.
- Diagramas.
- Especificações.

Metadados:

- Título.
- Fabricante.
- Modelo.
- Tipo de equipamento.
- Versão.
- Idioma.
- Fonte.

Cuidados:

- PDFs escaneados podem exigir OCR.
- Tabelas técnicas precisam de preservação especial.
- Versões antigas devem ser sinalizadas.

## 2. Manuais Danfoss

Uso esperado:

- Controladores.
- Válvulas.
- Drives.
- Refrigeração.
- Alarmes e parâmetros.

Metadados:

- Linha de produto.
- Modelo.
- Código do manual.
- Versão.
- Idioma.

Cuidados:

- Confirmar correspondência exata do modelo.
- Não misturar parâmetros de versões diferentes.
- Citar página ou seção.

## 3. Manuais Bitzer

Uso esperado:

- Compressores.
- Óleo.
- Manutenção.
- Diagnóstico.
- Limites operacionais.

Metadados:

- Modelo do compressor.
- Família.
- Tipo de aplicação.
- Refrigerante compatível.
- Versão do manual.

Cuidados:

- Diagnóstico deve considerar aplicação real.
- Não recomendar intervenção mecânica sem técnico qualificado.
- Preservar tabelas de limites.

## 4. Carel

Uso esperado:

- Controladores.
- Parametrização.
- Alarmes.
- Supervisórios.
- Integrações.

Metadados:

- Produto.
- Modelo.
- Firmware, quando disponível.
- Manual.
- Versão.

Cuidados:

- Parâmetros podem variar por firmware.
- Códigos de alarme devem ser indexados com alta precisão.
- Procedimentos devem citar fonte.

## 5. Full Gauge

Uso esperado:

- Controladores.
- Sensores.
- Parametrização.
- Alarmes.
- Instalação.

Metadados:

- Modelo.
- Linha.
- Versão.
- Idioma.
- Tipo de aplicação.

Cuidados:

- Validar modelo antes de responder.
- Preservar códigos de parâmetros.
- Evitar generalizar entre controladores parecidos.

## 6. NR10

Uso esperado:

- Orientações de segurança elétrica.
- Checklist de cuidado antes de intervenção.
- Apoio a procedimentos internos.

Metadados:

- Norma.
- Versão.
- Data.
- Seção.
- Fonte oficial ou controlada.

Cuidados:

- Conteúdo normativo exige alta precisão.
- Respostas devem ser conservadoras.
- Não substituir profissional habilitado ou responsável legal.
- Sempre citar fonte e indicar validação humana.

## 7. PMOC

Uso esperado:

- Procedimentos de manutenção.
- Plano de manutenção.
- Evidências e relatórios.
- Obrigações operacionais.

Metadados:

- Cliente.
- Unidade.
- Sistema.
- Data.
- Responsável técnico.
- Versão.

Cuidados:

- Pode conter dados sensíveis do cliente.
- Deve ser isolado por tenant.
- Respostas devem respeitar contexto da unidade.
- Histórico antigo deve ser identificado por data.

## 8. Relatórios técnicos

Uso esperado:

- Diagnósticos anteriores.
- Laudos.
- Recomendações.
- Evidências de campo.
- Histórico de problemas recorrentes.

Metadados:

- Cliente.
- Unidade.
- Ativo.
- Técnico ou engenheiro.
- Data.
- Tipo de relatório.

Cuidados:

- Podem conter conclusões contextuais, não universais.
- Devem ser vinculados ao ativo correto.
- Relatórios obsoletos devem ser sinalizados.

## 9. Ordens de serviço

Uso esperado:

- Histórico operacional.
- Ações realizadas.
- Peças trocadas.
- Sintomas recorrentes.
- Fechamento técnico.

Metadados:

- `workOrderId`
- `assetId`
- Cliente.
- Unidade.
- Técnico.
- Status.
- Data de abertura.
- Data de fechamento.
- Prioridade.

Cuidados:

- Linguagem pode ser informal.
- Pode haver abreviações e erros de digitação.
- Deve preservar vínculo com ativo e data.
- Dados pessoais de técnicos/clientes devem respeitar política de privacidade.

## Priorização inicial das fontes

1. Ordens de serviço.
2. Relatórios técnicos.
3. Manuais Danfoss.
4. Manuais Bitzer.
5. Carel.
6. Full Gauge.
7. PDFs técnicos gerais.
8. PMOC.
9. NR10.

## Critérios para aceitar uma fonte

- Origem conhecida.
- Permissão de uso.
- Tenant identificado.
- Metadados mínimos preenchidos.
- Versão ou data conhecida.
- Qualidade de extração aceitável.

## Critérios para rejeitar ou pausar ingestão

- Fonte sem permissão.
- Documento ilegível.
- Documento sem tenant.
- Conteúdo sensível sem classificação.
- Norma sem versão.
- Manual sem fabricante/modelo.

## Não implementar ainda

- Upload.
- OCR.
- Extração.
- Embeddings.
- Banco vetorial.
- Busca.
- UI.
