# Identidade visual Editorial 02 — implantação no portfólio

## Escopo

Identidade autoral aplicada aos HTMLs existentes, sem redesenhar o fluxo de trabalho:
- **Portfólio público**: `../index.html`, com links distintos para cada case.
- **GT360°**: workspace `index.html` e **nove módulos** em `modules/`.
- **eu + horizonte**: `../eu-horizonte-intranet/index.html`, aplicação independente do GT360°.

## Paleta e arquivos de estilo

- Vermelho institucional: `#c71717`.
- Verde-limão de destaque: `#8fff00`.
- Branco, superfícies off-white e neutros quentes, com contraste em grafite.
- Tokens compartilhados do GT360°: `editorial-02.css` (carregado nos nove módulos e no workspace).
- Tokens próprios da intranet: `../eu-horizonte-intranet/editorial-02.css`.
- A página de apresentação do portfólio usa os mesmos valores de vermelho e verde no CSS local.

## Escopo funcional protegido

Permanecem os identificadores HTML, campos, formulários, menus e eventos, scripts de regras de negócio, navegação, filtros, cálculos, importação/exportação, estrutura do armazenamento local e URLs de acesso. Foram atualizados exclusivamente valores de cor e folhas de estilo. Cores em strings de JavaScript destinadas à renderização receberam equivalentes da nova paleta.

## Separação arquitetural

`/gt360/` hospeda o workspace com nove módulos internos. `/eu-horizonte-intranet/` é uma aplicação externa/independente, acessada diretamente pelo portfólio, com seus próprios menus e telas. A folha visual da intranet é independente e não tem dependência da estrutura do GT360°.

## Implantação GitHub Pages

A branch `main` é a base solicitada para publicação automática. O deploy depende da configuração e do processamento do GitHub Pages; após a integração, consultar o site publicado e atualizar a página caso o cache permaneça antigo.

## Verificações

- HTMLs legíveis e links relativos de CSS em cada módulo;
- Quantidade de blocos de scripts HTML preservada;
- Ausência da paleta-arco-íris histórica nos arquivos alterados;
- Substituições limitadas à apresentação (cores + inclusão do CSS);
- Links públicos dos dois cases mantidos no portfólio;
- QA visual e funcional em navegador real ainda recomendado para todos os fluxos, especialmente exportação PDF, QR Code, modais, responsividade e persistência.

## Checklist de aceitação pós-publicação

1. Portfólio: abrir os links de GT360° e de eu + horizonte separadamente.
2. GT360°: navegar pelos nove módulos via workspace e alternar telas internas.
3. Avaliação CLT: identificação, desempenho, competências, parecer, assinaturas e PDF.
4. Avaliação PJ: identificação, notas, resultado e ciência do prestador.
5. Onboarding: cadastro, termos, dashboard, filtro e CSV.
6. Tempo de Casa: colaboradores, marcos, cartões e histórico.
7. Desligamento: questionário, respostas, dashboard e PDF/CSV.
8. Engajamento: resposta, construtor, resultados e exportação.
9. Riscos Psicossociais: gestor, plano de ação e painel.
10. Treinamentos: cadastro, fluxo, impacto, certificados e relatórios.
11. Checklist 5S: auditoria, pontuação, histórico e relatório.
12. Intranet eu + horizonte: mural, ativações, agenda, acervo, pessoas, espaços e mensagens.

Nenhum sistema comercial, login remoto ou integração de produção foi acrescentado aos cases.
