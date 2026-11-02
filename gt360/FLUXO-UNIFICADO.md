# GT360° — Fluxo Unificado aprovado

## Abrangência

A interface editorial de navegação foi padronizada nos três módulos que ainda apresentavam diferenças de orientação:

1. Gestão de Tempo de Casa;
2. Pesquisa de Engajamento Organizacional;
3. Gestão de Riscos Psicossociais.

O workspace principal do GT360° continua sendo a **navegação de primeiro nível**. Cada um desses módulos recebe cabeçalho contextual e abas de **segundo nível**, com comportamento responsivo e foco visual nos processos de Gestão de Pessoas.

## Implementação

- `unified-flow.css`: tokens de cor e ritmo editorial, cabeçalho contextual, abas, ajustes de filtros/painéis e navegação horizontal acessível no mobile.
- `unified-flow.js`: replica visualmente os botões originais do módulo nas abas sem retirá-los ou alterar suas funções. Os cliques são delegados à navegação original; os estados ativos são acompanhados.
- Os scripts originais, IDs das rotas e conteúdo de cada tela são preservados.
- Não foram criados indicadores, filtros, notificações, banco de dados, botões de salvamento ou ações inexistentes.
- Nos módulos de Tempo de Casa, a busca e o acesso às comemorações continuam funcionando a partir do novo cabeçalho.
- Na Pesquisa e nos Riscos, os botões de compartilhamento reais permanecem disponíveis.
- A interface unificada é ativada **somente quando o módulo roda embutido no workspace**; o acesso público pelo link/QR Code e a jornada do colaborador ou gestor não são alterados.

## Acessibilidade e mobile

- Abas no fluxo horizontal com rolagem em telas estreitas, botões sem redução abaixo dos tamanhos de toque.
- Foco por teclado e indicação da aba selecionada usando `aria-current`.
- Transições de estado curtas; preferência `prefers-reduced-motion` pode ser respeitada pelos estilos do ERP.
- As abas acionam os controles originais, incluindo os requisitos já aplicados nos formulários.

## Homologação

1. Tempo de Casa — alternar Painel, Colaboradores, Modelos, Envios e Integração, utilizar busca global e consultar comemorações.
2. Engajamento — alternar Dashboard, Competências & Perguntas e Respostas; abrir compartilhamento; verificar que `#responder` fora do workspace preserva o fluxo público.
3. Riscos — alternar Planos de Ação e Análise de Dados; compartilhar `#gestor`; manter formulário independente no acesso direto.
4. Testar os três em desktop e celular, com rolagem de abas, retornos, foco e filtros.
5. Verificar que o menu principal do GT360° continua trocando de módulo e que todos os dados demonstrativos permanecem em memória.

**Limite:** foi validada a sintaxe e a delegação de navegação em teste simulado; a homologação visual real e o uso em smartphone ainda dependem de teste após a publicação do GitHub Pages.

Todos os commits devem se chamar exclusivamente `add`.
