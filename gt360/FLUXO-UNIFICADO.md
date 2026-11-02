# GT360° — Fluxo Unificado em todos os nove módulos

## Padrão aprovado

O GT360° permanece como **ERP de Gestão de Pessoas**. Há dois níveis de navegação:
1. **Workspace GT360°**: menu principal de acesso a cada um dos nove módulos.
2. **Fluxo do módulo**: cabeçalho editorial, abas contextuais e ações associadas à tela.

A padronização evita menus laterais duplicados quando o módulo é exibido no workspace. Os controles internos continuam no DOM; a navegação visual nova delega seus cliques e acompanha os estados de seleção, preservando JavaScript, dados e formulários.

## Cobertura dos nove módulos

| Módulo | Abas/contexto | Ações associadas |
|---|---|---|
| Onboarding | Processo de Onboarding, Controle de Termos, Dashboard | Ações existentes dos formulários |
| Avaliação CLT | 1. Identificação, 2. Desempenho, 3. Competências, 4. Parecer, 5. Assinaturas | Histórico e Dashboard no cabeçalho, abrindo modais originais |
| Avaliação PJ | Avaliação | Histórico e Dashboard no cabeçalho, abrindo modais originais |
| Tempo de Casa | Painel, Colaboradores, Modelos de Cartão, Envios, Integração | Busca e Comemorações de hoje |
| Questionário de Desligamento | Questionário, Dashboard | Ações existentes do questionário |
| Pesquisa de Engajamento Organizacional | Dashboard, Competências e Perguntas, Respostas | Compartilhar pesquisa |
| Gestão de Riscos Psicossociais | Planos de Ação, Análise de Dados | Compartilhar formulário; identificação de perfil |
| Painel de Treinamentos | Cadastro, Fluxo, Impacto, Dashboard | Ações existentes das telas |
| Checklist 5S | Painel gerencial e, durante a auditoria, etapas Seiri, Seiton, Seiso, Seiketsu e Shitsuke | Nova auditoria apenas quando o painel estiver aberto; ações existentes da avaliação |

## Implementação

- `gt360/unified-flow.css`: aparência editorial, cabeçalho, abas, ações contextuais, comportamento mobile e layout do Checklist 5S.
- `gt360/unified-flow.js`: estrutura compartilhada e mapeamento de todos os nove módulos, com espelhamento das ações originais.
- `gt360/modules/*.html`: somente referência ao CSS/JS e atributo `data-unified-module`; não há reescrita de formulário, cálculo, persistência ou exportação.
- A interface unificada entra em funcionamento **somente quando embutida no workspace da mesma origem**. Abas, modais e estado do formulário continuam os mesmos.
- Links públicos de Pesquisa (`#responder`), Riscos (`#gestor`) e Checklist 5S (`#av=`) continuam com apresentação original quando abertos diretamente. Não alteramos a geração ou o processamento desses QR Codes.
- A aplicação **eu + horizonte** permanece independente do ERP GT360° e não é modificada.

## Diretrizes visuais

- Branco/papel com linhas finas e tipografia objetiva; `#c71717` para seleção e foco; `#8fff00` apenas em acentos semânticos e marca.
- Abas com estado ativo, `aria-current`, navegação por teclado e rolagem horizontal em telas estreitas.
- Ações de abrir modal são distintas das abas que alteram a tela.
- No Checklist, não ocultar a barra de ações do formulário nem a lógica do painel; só substituir a navegação lateral quando embutido no workspace.

## Verificações

1. Abrir cada um dos nove módulos pelo menu principal do workspace.
2. Percorrer as abas de todos os módulos e confirmar que os estados ativos refletem a tela selecionada.
3. CLT/PJ: abrir e fechar História/Dashboard sem perder os dados do formulário; testar PDF.
4. Onboarding/Desligamento/Treinamentos: alternar páginas e preservar filtros, seleção, ações de salvar e relatórios.
5. Tempo de Casa: busca, Painel, Colaboradores, Modelos, Envios e Integração.
6. Engajamento e Riscos: compartilhamento e acesso aos painéis; verificar links públicos em abas independentes.
7. Checklist 5S: Painel → Nova auditoria → cinco etapas → retorno ao Painel; validar QR em telefone e exportação.
8. Desktop e mobile: rolagem horizontal das abas, conteúdo interno, foco por teclado, visibilidade dos comandos e responsividade.
9. Garantir que o controle de navegação original e suas funções permanecem no DOM; nenhuma lógica de negócio é substituída.

Foram realizados testes estáticos de sintaxe e testes simulados de espelhamento/clique de navegação para oito módulos, além da troca de estados do Checklist. **A homologação visual/funcional em navegador real ainda é necessária**, sobretudo no mobile e na abertura externa por QR Code.

## Convenção do repositório

Todas as mensagens de commit devem ser exclusivamente `add`, sem descrição.
