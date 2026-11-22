# Quadro e custos

[Abrir aplicação](https://gustavomrtns.github.io/projetos_rh/headcount/) · [Cargos e carreira](../carreira/) · [Portfólio](../)

Simulador de headcount com quadro aprovado, ocupação, orçamento e composição de custos CLT por competência. Compartilha o catálogo de cinco pessoas do GT360°, preservando os campos originais.

## Funcionalidades

- Cenários de quadro constante, preenchimento de posições e acomodação salarial.
- Admissão, ajuste salarial, revisão de benefícios/verbas e saída com vigência mensal.
- CPP/INSS patronal, RAT, FAP, terceiros e FGTS editáveis para o cenário inteiro.
- Seleção de provisões de 13º e férias/terço, com reflexos de encargos.
- Benefícios brutos e participação do colaborador, médias remuneratórias e outras despesas por pessoa.
- Composição do mês, detalhamento por posição, projeção anual e exportações CSV com valores e parâmetros aplicados.

## Modelo de custeio

A base compartilhada é sintética. Os parâmetros iniciais são CPP 20%, RAT 2%, FAP 1, terceiros 5,8% e FGTS 8%. CPP, RAT e terceiros dependem do regime tributário, atividade, FPAS e demais enquadramentos; os percentuais iniciais não são uma regra universal. A interface permite ajustar ou zerar cada alíquota. Não há determinação automática de regime, CPRB ou enquadramento.

Base novembro/2026; projeção janeiro a dezembro/2027. O orçamento de R$ 53.360/mês é referência constante da base e não é recalculado para acomodar aumento de custos. O custo inicial com os parâmetros completos é **R$ 44.636,46/mês**.

1. Remuneração = salário + médias remuneratórias informadas, com incidência nos encargos e provisões.
2. Encargos do mês = CPP + RAT × FAP + terceiros + FGTS, calculados sobre a remuneração.
3. Provisão de 13º = remuneração ÷ 12, quando selecionada.
4. Férias = remuneração ÷ 12; terço = remuneração ÷ 36, quando selecionadas. A remuneração das férias já está nos 12 salários do ano; por isso a parcela de férias é mostrada e compensada, acrescentando ao custo anual apenas o terço e seus reflexos. Não há custo de substituição durante férias.
5. Encargos sobre provisões incidem no 13º e no terço líquidos da compensação acima, às mesmas alíquotas de custeio.
6. Benefícios líquidos = benefícios brutos − participação do colaborador. O desconto não reduz a base dos encargos.
7. Total = remuneração + encargos do mês + provisões líquidas + encargos sobre provisões + benefícios líquidos + outras despesas.

Componentes são arredondados em duas casas por pessoa e somados. As médias de horas extras, DSR e adicionais são informadas já apuradas; não há motor de rubricas, apuração de jornada, cálculo do salário líquido, INSS do empregado ou IRRF. O campo de benefícios destina-se a parcelas sem natureza salarial; verbas remuneratórias devem entrar nas médias.

As movimentações valem por mês integral. Esta é uma visão de custo mensalizado: não agenda pagamentos, não controla saldos contábeis de provisões, não reavalia o saldo anterior após reajustes e não calcula quitação de férias, 13º ou rescisão. Saídas retiram o custo dos meses seguintes à vigência, sem apurar verbas de desligamento.

A revisão de benefícios/verbas substitui o pacote da pessoa a partir da vigência. O salário é alterado em movimentação própria. O sistema impede descontos maiores que os benefícios e revisões duplicadas para a mesma pessoa e mês.

## Dados e funcionamento

Dados: `../shared/planning-data.json`. Regras: `../shared/planning-core.js`. Cenários, parâmetros e indicações permanecem em memória, reiniciando ao recarregar; sem sincronização entre abas. `demoStore` permanece nos cases anteriores. O mapa de carreira usa os mesmos parâmetros iniciais para comparar impactos salariais, sem receber edições de outra aba.

## Referências consultadas em 22/11/2026

- [PGFN: contribuições patronais, terço de férias e descontos na folha](https://www.gov.br/pgfn/pt-br/cidadania-tributaria/por-assunto/tributacao-sobre-a-folhas-de-salarios-e-outras/contribuicoes-previdenciarias-1/patronal-ou-dos-empregadores).
- [eSocial: orientação sobre CPP, RAT/FAP e terceiros por enquadramento](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026-com-marcacoes.pdf).
- [Lei 8.036/1990: FGTS, art. 15](https://www.planalto.gov.br/ccivil_03/leis/l8036compilada.htm).
- [Lei 4.090/1962: décimo terceiro](https://www.planalto.gov.br/ccivil_03/leis/l4090.htm).
- [MTE: FGTS nas férias e no 13º](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/perguntas-frequentes).

## Validação

`node --test tests/planning.test.cjs`: composição, incidências, compensação de férias, descontos, parâmetros, vigências, conciliação e referências. `tests/test_planning_apps.py`: fluxos desktop/mobile, alterações de encargos, limites de participação e exportação, além da navegação existente.
