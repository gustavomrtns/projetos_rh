# GT360° — Diretrizes de evolução do ERP de Gestão de Pessoas

## Linguagem de produto
- O GT360° é o **ERP de Gestão de Pessoas**; eu + horizonte continua **aplicação independente**.
- O workspace organiza nove módulos por jornada, engajamento/saúde, desenvolvimento e qualidade.
- UI editorial **contida**: tipografia objetiva, papel/branco, linhas finas, vermelho usado em ação/foco e verde-limão apenas em destaques positivos. Evitar gradientes fortes, sombras excessivas e títulos decorativos em cada card.
- No mobile o workspace usa menu lateral em gaveta; a navegação entre etapas do módulo permanece dentro do módulo.
- Em uso embarcado, cabeçalhos redundantes dos módulos são ocultados, exceto quando contêm uma escolha de perfil (Riscos Psicossociais).
- Transições curtas (aproximadamente 180–240 ms) para navegação, cartões e modais; preferência `prefers-reduced-motion` respeitada.

## Relatórios
- Avaliação PJ e Questionário de Desligamento abrem uma visualização de documento independente do iframe do workspace.
- A opção **Imprimir / Salvar PDF** utiliza a impressão nativa do navegador; o destino `Salvar como PDF` é escolhido pelo usuário. Não é um PDF gerado por servidor.
- O relatório PJ converte o estado atual de `input`, `select` e `textarea` em valores legíveis, retirando ações e formulários editáveis.
- O relatório Desligamento preserva a composição de relatório e assinatura, com substituição do seletor inválido do logo.
- Revisar no navegador a paginação, quebras, inclusão de dados no relatório, abertura de nova aba e opção alternativa para bloqueadores de pop-up.

## Pesquisa de Engajamento — arquitetura proposta para acesso por QR Code

**Não implementar o compartilhamento de respostas via GitHub Pages como se fosse um backend.**

### Frontend público (futuro)
1. QR Code aponta para endereço de campanha: `https://pesquisa.seudominio.example/p/:codigoCampanha`. O QR não contém nome, telefone, matrícula, e-mail nem resposta.
2. Página pública apresenta prazo da pesquisa, finalidade, aviso de privacidade, tempo estimado, instruções e botão **Iniciar pesquisa**.
3. Questionário por blocos com validação progressiva, estados de carregamento/erro e retomada local **somente em memória**, sem gravar respostas na URL.
4. Na conclusão, enviar somente dados permitidos e mostrar confirmação de recebimento. Desabilitar exibição da resposta completa em parâmetros ou compartilhamentos.

### Backend de Gestão de Pessoas (futuro)
- `GET /api/public/campaigns/:codigo`: retorna configuração publicada e perguntas, sem identificadores de colaborador.
- `POST /api/public/campaigns/:codigo/responses`: recebe respostas sem identidade; validadores de schema, janela de coleta, limites de tamanho e controle antiabuso proporcionais.
- `GET /api/admin/campaigns/:id/summary`: agregações por bloco/dimensão, com permissão de RH e supressão de recortes pequenos.
- Tabelas sugeridas: `campaigns`, `question_blocks`, `questions`, `answer_submissions`, `answer_values`, `aggregated_metrics`. Não manter `employee_id`, `name`, `email`, `phone` ou identificador persistente na tabela de respostas.
- Uma estratégia de participação única requer avaliação independente de privacidade: não vincular códigos de acesso identificados aos resultados; tokens anônimos, de uso único, podem impedir repetição somente quando devidamente desacoplados de identidades.
- Configurar retenção e descarte, transporte HTTPS, autenticação de administradores, auditoria de acessos administrativos e limitação de consultas por recortes com poucas respostas.
- Planejar governança de comentários abertos: textos podem identificar pessoas indiretamente, mesmo sem campo de nome.

### Limite atual
O GitHub Pages hospeda frontend estático; o backend ficará em infraestrutura separada. O recurso de coleta por QR Code **não foi publicado nesta rodada**, por depender das decisões de privacidade, contrato de API, autorização e armazenamento.

## Homologação por fluxo
- Workspace desktop: abrir os nove módulos, trocar de módulo, voltar ao início e confirmar preservação de estado da sessão.
- Workspace mobile: abrir/fechar gaveta, Escape, foco por teclado, rolagem dentro do módulo, rolagem de subtabs, retorno e orientação de tela.
- Onboarding: cadastro, documentos, **Plataforma de Educação Corporativa**, dashboard e exportações.
- Avaliação PJ: preencher notas, parecer, salvar e abrir impressão; verificar todos os campos e resultado no papel.
- Questionário de Desligamento: gerar relatório a partir de formulário e dashboard; imprimir, salvar como PDF e revisar página A4.
- Tempo de Casa: exibir **meses** corretamente em todos os cartões; testar marcos de 6 meses e durações com ano + meses.
- Engajamento: ausência das mensagens sobre persistência local e de emblema administrativo; manter acesso à gestão por botão textual.
- Riscos: unidade/setor compartilhados, navegação sem páginas Banco de Dados/Configurações, ícone redundante ausente e terminologia da avaliação consistente.
- Conferir acessibilidade (rótulos, erros, foco, zoom a 200%, contrastes, leitores de tela), inclusive em modais.

## Convenção do repositório
**Toda e qualquer mensagem de commit: `add`, sem complementos.**
