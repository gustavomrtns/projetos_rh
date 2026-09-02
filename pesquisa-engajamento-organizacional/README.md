# Pesquisa de Engajamento Organizacional

Solução digital para estruturar, aplicar e tabular pesquisas internas de engajamento, conectando experiência do colaborador, construção do questionário, respostas e análise de dados em um único fluxo.

[▶ Abrir aplicação](https://gustavomrtns.github.io/projetos_rh/pesquisa-engajamento-organizacional/) · [🌐 Portfólio Profissional](https://gustavomrtns.github.io/projetos_rh/) · [← Todos os projetos](../README.md)

> **Status:** protótipo funcional front-end para demonstração em portfólio. A persistência é local no navegador (`localStorage`), sem autenticação real, backend ou banco de dados externo.

## Visão executiva

**Área:** Recursos Humanos · People Analytics · Employee Experience  
**Frente:** Pesquisa Organizacional · Engajamento · Dados  
**Objetivo:** estruturar a aplicação de pesquisas de engajamento e transformar respostas em indicadores e recortes demográficos úteis para análise.  
**Minha atuação:** modelagem dos blocos e perguntas, desenho do fluxo do colaborador, estruturação do painel administrativo, regras de tabulação, filtros demográficos, experiência da interface e desenvolvimento da solução digital.  
**Abordagens:** People Analytics · Pesquisa Organizacional · Employee Experience · Process Design · Analytics · UX/UI  
**Tecnologia:** HTML · CSS · JavaScript · localStorage

## O desafio

Pesquisas internas podem gerar grande volume de informações, mas nem sempre o processo de aplicação, tabulação e análise está conectado. Quando questionários, respostas e recortes demográficos ficam dispersos, aumenta o esforço operacional e diminui a velocidade para transformar percepções dos colaboradores em informação estruturada para tomada de decisão.

O projeto foi concebido para reunir essas etapas em uma experiência única, permitindo administrar a pesquisa, disponibilizá-la ao colaborador e acompanhar os resultados de forma organizada.

## Minha atuação

Estruturei o projeto como um fluxo completo de pesquisa organizacional. A solução contempla definição de competências e blocos temáticos, banco de perguntas, experiência de resposta, persistência local dos dados, tabulação das respostas e construção de uma camada gerencial para leitura dos resultados.

Também foi desenvolvida uma lógica de segmentação demográfica para permitir recortes por estado e tempo de casa, além de regras explícitas para cálculo da média geral, percentual geral e desempenho por competência.

## A solução

A aplicação é dividida em duas experiências complementares:

**Portal do Colaborador** — apresenta a pesquisa e conduz o preenchimento dos blocos e perguntas em uma jornada guiada.

**Painel Administrativo — Demonstração** — reúne dashboard, construtor da pesquisa e consulta às respostas, permitindo visualizar e editar a estrutura do questionário e acompanhar a tabulação.

## Como funciona

**1. Estruturação da pesquisa** — organização das competências/blocos e das perguntas que compõem o questionário.

**2. Aplicação** — disponibilização de uma jornada de resposta orientada ao colaborador.

**3. Registro das respostas** — armazenamento local das respostas e dados necessários à demonstração do fluxo.

**4. Tabulação** — consolidação das notas válidas das perguntas em escala de 1 a 5.

**5. Recortes demográficos** — aplicação combinada de filtros por estado e tempo de casa.

**6. Análise gerencial** — visualização de respostas recebidas, respostas pontuadas, média geral, porcentagem geral e desempenho por competência.

## Metodologia de cálculo

A solução utiliza as notas válidas das perguntas de escala para calcular os indicadores.

**Média geral = soma das notas ÷ quantidade de respostas pontuadas.**

**Porcentagem geral = ((média geral − 1) ÷ 4) × 100.**

A conversão considera 1 como 0% e 5 como 100%. Campos demográficos, respostas abertas, valores ausentes e registros fora da escala não entram no cálculo.

## Estrutura temática

A pesquisa padrão foi organizada em sete blocos:

**Perfil Demográfico → Engajamento → Desenvolvimento → Lideranças e Comunicação → Condições de Trabalho → Cultura → Sugestões**

Essa arquitetura permite combinar dados quantitativos, contexto demográfico e espaço qualitativo para sugestões.

## Valor potencial

- Redução do esforço manual de organização e tabulação de pesquisas internas.
- Padronização da estrutura de perguntas e competências avaliadas.
- Maior rastreabilidade entre questionário, respostas e indicadores.
- Possibilidade de analisar percepções por diferentes recortes demográficos.
- Base estruturada para apoiar diagnósticos de engajamento e priorização de ações de Gestão de Pessoas.
- Demonstração prática da aplicação de People Analytics em processos de pesquisa organizacional.

## Competências demonstradas

People Analytics · Pesquisa Organizacional · Employee Experience · Gestão de Dados · Estruturação de Indicadores · Desenho de Processos · UX/UI · HTML · CSS · JavaScript

## Tecnologias e abordagens

HTML · CSS · JavaScript · localStorage · UX/UI · Survey Design · Scoring · Demographic Filtering · Analytics

## Observação técnica

Esta versão foi preparada especificamente para portfólio público. O acesso administrativo funciona em **modo demonstração** e não representa um mecanismo real de autenticação. Os dados são persistidos apenas no navegador do usuário e não são enviados para servidor externo.
