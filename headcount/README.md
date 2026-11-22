# Quadro e custos

[Abrir demonstração](https://gustavomrtns.github.io/projetos_rh/headcount/) · [Cargos e carreira](../carreira/) · [Portfólio](../)

Simulador de headcount com quadro aprovado, ocupação, posições em proposta, orçamento de referência e projeção mensal de custos. Aplicação independente, acessível também pela navegação do GT360°.

## Funcionalidades

- Comparação de três cenários: quadro constante, preenchimento de duas posições e acomodação salarial de Camila.
- Admissão em vaga aprovada, ajuste salarial e saída planejada, com vigência mensal e remoção de hipóteses.
- Filtro por unidade e mês; fator de custo editável; projeção anual e exportação CSV.
- Quadro por posição, separando vagas aprovadas de posições ainda em proposta.

## Dados e cálculo

`../shared/planning-data.json` amplia o catálogo de cinco pessoas fictícias de `demo-core.js`. `planning-core.js` confere os campos originais na abertura. Nenhum cadastro atual do GT360° é alterado.

Base: novembro/2026. Projeção: janeiro a dezembro/2027. Orçamento mensal constante de referência, sem alegação de aprovação real para 2027.

**Custo mensal = salário × (1 + fator simulado) + benefícios + outras despesas.**

O fator inicial de 30% é ilustrativo. Não representa cálculo legal de folha; não há 13º, férias, provisões, tributos reais, rescisão, inflação ou proporcionalidade diária. Saídas retiram o custo mensal, sem calcular verbas rescisórias. Hipóteses de admissão preenchem somente as duas vagas aprovadas da base; não criam pessoas nem autorizam novas posições.

| Conferência | Resultado inicial |
|---|---:|
| Posições aprovadas | 7 |
| Ocupadas | 5 |
| Vagas aprovadas | 2 |
| Posição em proposta, fora do aprovado | 1 |
| Custo mensal simulado | R$ 39.080,00 |
| Orçamento mensal de referência | R$ 53.360,00 |

Alterações ficam em memória nesta página e reiniciam ao recarregar. O catálogo comum não sincroniza cenários entre abas. `demoStore` continua sendo o mecanismo dos cases anteriores; este simulador usa estado JavaScript local, sem gravação no navegador.

## Validação

`node --test tests/planning.test.cjs` verifica projeções, vínculos, campos originais, premissas e rejeição de movimentos incoerentes. Os fluxos de interface desktop/mobile estão em `tests/test_planning_apps.py` e no workflow de validação.
