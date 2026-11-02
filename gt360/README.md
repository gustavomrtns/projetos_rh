# GT360° — Workspace de Gestão de Pessoas

> Um ambiente que reúne nove aplicações de Gestão de Pessoas, organizadas pela jornada do colaborador e pelas rotinas de RH.

[▶ Explorar o workspace](https://gustavomrtns.github.io/projetos_rh/gt360/) · [Ver portfólio](https://gustavomrtns.github.io/projetos_rh/) · [Voltar aos projetos](../README.md)

## Visão do case

| Dimensão | Descrição |
|---|---|
| **Problema** | Fluxos de RH distribuídos em ferramentas e controles diferentes dificultam encontrar informações, acompanhar etapas e analisar cada processo. |
| **Públicos considerados** | Profissionais de RH, lideranças, colaboradores e prestadores, conforme o fluxo de cada aplicação. |
| **Minha atuação** | Levantamento de necessidades, mapeamento de jornadas e processos, definição de escopo, requisitos e regras de negócio, priorização, arquitetura de navegação, experiência de uso, desenvolvimento web e indicadores. |
| **Entrega atual** | Workspace navegável com nove aplicações, agrupadas em quatro frentes. Cada módulo é carregado quando aberto. |
| **Tecnologia e dados** | HTML, CSS e JavaScript; dados demonstrativos fictícios gerenciados em memória pelo `demoStore`, sem persistência após recarregar a página. |

## Problema e abordagem

A operação de RH envolve momentos distintos: entrada, experiência, desenvolvimento, escuta, desligamento e qualidade dos ambientes de trabalho. Quando cada rotina é apresentada isoladamente, fica mais difícil enxergar a jornada completa e localizar a ferramenta certa para cada atividade.

No GT360°, organizei essas necessidades em um workspace. O trabalho combinou o entendimento dos fluxos de Gestão de Pessoas com a definição de requisitos, navegação e interfaces das aplicações. A pergunta orientadora foi: **como tornar esses processos mais fáceis de localizar, executar e acompanhar em um único ponto de acesso?**

## Decisões de produto

1. **Agrupar por tarefa de RH.** Os módulos foram distribuídos em Jornada do Colaborador, Engajamento e Saúde Organizacional, Desenvolvimento de Talentos e Qualidade e Processos.
2. **Manter os fluxos próprios de cada aplicação.** Onboarding, avaliações, pesquisa e treinamentos têm etapas e informações diferentes; o workspace dá acesso a eles sem reduzir tudo a um formulário único.
3. **Permitir acesso direto a um módulo.** Links específicos abrem cada aplicação dentro do workspace e permitem compartilhar diretamente o módulo desejado.
4. **Manter uma base temporária e fictícia para a demonstração.** Os módulos compartilham o `demoStore` enquanto o workspace está aberto. Os dados inseridos são descartados ao recarregar a página; o workspace não oferece backup nem restauração de registros.
5. **Mostrar as capacidades sem atribuir resultados não medidos.** Indicadores existentes nas aplicações demonstram acompanhamento e análise; este case não afirma ganhos percentuais ou ROI já comprovados.

## Módulos

| Frente | Aplicação | O que a pessoa pode explorar |
|---|---|---|
| Jornada do Colaborador | [Fluxo de Onboarding](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=onboarding) | Registro e acompanhamento da integração. |
| Jornada do Colaborador | [Avaliação de Experiência](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=avaliacao-clt) | Avaliação e parecer do período de experiência. |
| Jornada do Colaborador | [Avaliação de PJ](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=avaliacao-pj) | Acompanhamento e avaliação de prestadores. |
| Jornada do Colaborador | [Gestão de Tempo de Casa](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=tempo-casa) | Marcos da jornada e celebrações. |
| Jornada do Colaborador | [Questionário de Desligamento](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=desligamento) | Coleta e organização de devolutivas de saída. |
| Engajamento e Saúde Organizacional | [Pesquisa de Engajamento](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=engajamento) | Aplicação de pesquisa e leitura dos resultados de engajamento. |
| Engajamento e Saúde Organizacional | [Gestão de Riscos Psicossociais](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=riscos-psicossociais) | Organização de avaliações e planos de ação. |
| Desenvolvimento de Talentos | [Painel de Treinamentos](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=treinamentos) | Treinamentos, turmas, certificações e indicadores. |
| Qualidade e Processos | [Checklist 5S](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=checklist-5s) | Auditorias e acompanhamento da conformidade. |

> **Distinção conceitual:** a Pesquisa de Engajamento Organizacional é apresentada como pesquisa de engajamento, não como pesquisa de clima organizacional.

## Percurso sugerido para conhecer o produto

1. Abra a [página inicial do workspace](https://gustavomrtns.github.io/projetos_rh/gt360/) e observe como as aplicações foram agrupadas.
2. Explore o [Onboarding](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=onboarding) para ver um fluxo operacional.
3. Acesse a [Pesquisa de Engajamento](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=engajamento) e o [Painel de Treinamentos](https://gustavomrtns.github.io/projetos_rh/gt360/?modulo=treinamentos) para conhecer frentes de escuta e desenvolvimento.

![Capa editorial do GT360° — Workspace de Gestão de Pessoas](./gt360-case-editorial.svg)

*Imagem ilustrativa da organização do workspace. Abra a aplicação para conhecer a interface em funcionamento.*

## Estágio atual e próximos passos

Esta versão demonstra as interfaces e fluxos das aplicações. A integração **atual é de navegação**, com uma base fictícia compartilhada entre os módulos por `shared/demo-core.js`, e não um banco de dados central. Cada módulo é carregado em um arquivo HTML próprio quando aberto. O `demoStore` mantém as alterações **somente na memória da sessão da página**: os módulos acessam esse estado enquanto o workspace está aberto, mas atualizar ou fechar a página reinicia os dados de demonstração. Não há sincronização entre pessoas, dispositivos ou abas independentes. **Não cadastre informações pessoais reais no endereço público.**

**Backup e restauração:** o workspace atual **não possui** os botões "Baixar backup" e "Restaurar backup". Esses recursos foram retirados da demonstração; os registros temporários não são enviados ao servidor nem preservados entre recarregamentos. Exportações e relatórios específicos de alguns módulos, quando oferecidos, são funcionalidades distintas e não representam backup completo do workspace.

As próximas evoluções técnicas incluem validar a experiência em dispositivos e navegadores reais, ampliar os testes de acessibilidade e, para uso compartilhado, planejar autenticação, permissões, banco de dados e rotinas de auditoria.

[▶ Abrir GT360°](https://gustavomrtns.github.io/projetos_rh/gt360/) · [Voltar ao portfólio](https://gustavomrtns.github.io/projetos_rh/)
