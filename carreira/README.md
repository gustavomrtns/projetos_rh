# Cargos e carreira

[Abrir demonstração](https://gustavomrtns.github.io/projetos_rh/carreira/) · [Quadro e custos](../headcount/) · [Portfólio](../)

Mapa de arquitetura de cargos para explorar estruturação, acomodação de enquadramento, progressão e sucessão. Aplicação independente conectada ao catálogo fictício do GT360°.

## Funcionalidades

- Catálogo de dez cargos e seis níveis, com missão, faixas fictícias e ocupação por posição.
- Filtro por família, busca e exportação da estrutura em CSV.
- Cinco trajetórias propostas e comparação de cargo atual com cargo de destino.
- Simulação de enquadramento salarial e impacto mensal usando os mesmos parâmetros iniciais de encargos, provisões e benefícios do simulador de quadro.
- Perfis de competências demonstrativos de 1 a 4, requisitos e intervalos a desenvolver.
- Duas acomodações em estudo e indicação manual de sucessores para uma posição crítica, com prontidão, evidências, data de revisão e ações de desenvolvimento existentes na base.

## Origem e limites

Dados em `../shared/planning-data.json`; regras compartilhadas em `planning-core.js`. Os campos das cinco pessoas fictícias são conferidos com `demo-core.js` na abertura. Faixas, perfis de competências, trajetórias, acomodações, sucessão e ações de desenvolvimento são novos dados sintéticos, sem origem em pesquisa salarial ou avaliação real.

Pesquisas anônimas do GT360° não são vinculadas a indivíduos. A responsabilidade por um treinamento não representa participação nem conclusão. Não há pontuação de potencial, ranking ou indicação automática de sucessor. Atender requisitos ilustrativos não autoriza promoção ou reajuste.

Uma trajetória no catálogo não significa que exista posição aprovada e disponível. A proposta exige discussão de responsabilidades, entregas, competências, estrutura e orçamento. Os cadastros atuais permanecem intactos.

Simulações e indicações ficam em memória e reiniciam ao recarregar. Não há sincronização com o headcount ou outras abas. `demoStore` permanece nos projetos anteriores; aqui o estado é local em JavaScript, sem persistência.

## Validação

`node --test tests/planning.test.cjs` confere referências, faixas e intervalos. `tests/test_planning_apps.py` cobre filtros, simulação, indicação, escape de evidências, exportação e reinício em desktop/mobile no workflow.

## Áreas de trabalho

Dashboard; Estrutura de cargos; Trilhas e competências; Acomodação salarial; Sucessão; Desenvolvimento. Cada ação ocupa uma tela própria, com apenas seus controles visíveis. O cabeçalho e as abas seguem o fluxo unificado do GT360°.

[Entrar pelo workspace](../gt360/?modulo=carreira). O acesso direto continua disponível. Trocar telas ou módulos dentro do GT360° preserva os valores em andamento; recarregar reinicia a base. O fragmento `#tela=...` identifica a área atual.

## Dashboard de cargos e carreira

A abertura apresenta enquadramento salarial por pessoa, distribuição por família, cobertura de indicações para posições críticas, horizontes de prontidão, impacto mensal das acomodações em estudo e agenda de revisões/PDI. A cobertura considera posições com indicação registrada e não implica sucessor pronto: os horizontes e candidatos prontos para discussão aparecem separadamente. Não há séries históricas ou evolução temporal inferida das notas de competências.

Cada pessoa ou proposta leva à análise correspondente, já com o contexto selecionado. Alterar indicações atualiza cobertura, prontidão e revisões do painel. Faixas e propostas representam o cadastro atual; hipóteses não salvas de enquadramento permanecem na tela de acomodação.
