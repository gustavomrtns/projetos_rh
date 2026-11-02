# Base única de demonstração — GT360° e eu + horizonte

## Objetivo
Os dois cases continuam **aplicações independentes**, mas compartilham as mesmas cinco pessoas **inteiramente fictícias** por meio de `shared/demo-core.js`. O catálogo de pessoas é a única fonte autoritativa para dados demonstrativos de colaboradores. Não foram usadas planilhas reais, credenciais ou dados de colaboradores.

## Escopo dos dados fictícios
- Cinco pessoas criadas exclusivamente para o portfólio, com matrículas `DEMO-001` a `DEMO-005` e e-mails no domínio reservado `example.invalid`.
- GT360°: Onboarding e Tempo de Casa partem da mesma lista. Treinamentos inicia com dois eventos curtos, que utilizam responsáveis dessa lista. Os demais formulários podem ser percorridos com sugestões das mesmas pessoas e recebem registros enquanto o site estiver aberto.
- Pesquisa de Engajamento: três respostas sintéticas, sem nomes, e-mails, matrículas, telefone ou identificador de pessoa. Respostas novas também não gravam dados identificadores.
- eu + horizonte: diretório de cinco pessoas, quatro publicações e pequena seleção de ativações, eventos, espaços, arquivos e conversas, todos de demonstração.

## Armazenamento e limpeza
- Todas as páginas usam `demoStore`, uma interface compatível com os métodos básicos do armazenamento do navegador, **mas com estado exclusivo em memória**. Nada é gravado em `localStorage` ou `sessionStorage` durante o uso dos cases.
- Ao abrir uma dessas páginas, a rotina inicial remove **somente as chaves antigas reconhecidas** dos próprios projetos, incluindo a intranet, caso ainda existam neste navegador.
- A limpeza não atua remotamente em dispositivos que não revisitem a página, não altera backups pessoais previamente baixados e não apaga histórico antigo de commits por si só.
- Recarregar a página reinicia os dados fictícios e descarta as alterações realizadas naquela instância. No GT360°, os iframes compartilham o mesmo estado em memória enquanto o workspace permanece aberto.
- **Não existe sincronização durável entre dispositivos ou entre abas independentes.** A integração entre GT360° e intranet é de **cadastro e referência visual**, não um backend de produção.
- Os botões de backup/restauração anteriormente expostos no **workspace GT360°** foram retirados. As exportações/relatórios disponíveis em alguns módulos não correspondem ao backup completo do workspace.
- Webhooks de Tempo de Casa funcionam apenas como simulação e não executam POSTs externos.

## Limites de confidencialidade
- O portfólio é público, baseado em GitHub Pages e HTML estático. Não permite oferecer sigilo de dados de produção ou autenticação real; **não usar nomes, documentos, e-mails ou avaliações reais**.
- Não há credencial para o painel de Riscos Psicossociais.
- A Pesquisa de Engajamento registra respostas sem identificação direta. Suas perguntas de contexto e comentários abertos devem ser avaliados antes de qualquer uso fora da demonstração; a ausência de nome não elimina todos os riscos indiretos de identificação.
- Convites, QR Codes e integrações entre dispositivos não são um serviço funcional multiusuário; essa evolução foi deixada fora do escopo por solicitação expressa.

## Acessibilidade e comportamento
- Rótulos de campos são associados a inputs quando possível sem alterar a marcação original.
- Componentes não semânticos com clique recebem suporte a Enter/Espaço quando não contêm botões internos.
- Sugestões de nomes fictícios aparecem em inputs de colaborador/gestor.
- Os componentes precisam de QA manual em dispositivos reais para verificação final de foco, responsividade, navegação, leitura de tela, exportações e relatórios.

## Checklist mínimo de homologação
1. `index.html`: GT360° e intranet devem abrir como cases separados.
2. GT360°: todos os nove módulos devem carregar sem erros; alternar menu e retornar.
3. Onboarding: cinco pessoas iniciais, editar uma, verificar reflexo no menu de importação de Tempo de Casa.
4. Tempo de Casa: cinco pessoas iniciais, visualizar cartão e simular envio sem rede.
5. Treinamentos: dois registros iniciais, criar um terceiro, abrir detalhes, dashboard e fluxo.
6. Avaliação CLT e PJ: preencher usando pessoas de demonstração, percorrer etapas, salvar e exportar.
7. Desligamento e Checklist 5S: testar formulário, indicadores e geração de relatório.
8. Riscos Psicossociais: acessar gestor e painel gerencial diretamente, sem senha.
9. Engajamento: dashboard com três respostas sintéticas; preencher novo questionário e conferir ausência de identificação.
10. Intranet: conferir as mesmas cinco pessoas, quatro publicações e ações de mural, diretório e espaços.
11. Em DevTools: confirmar que os cases não gravam dados em Local Storage ou Session Storage depois de interagir; conferir exclusão de chaves antigas previamente salvas.
12. Atualizar as páginas: estado deve ser reiniciado a partir do mesmo catálogo fictício.

**Convenção de commits: apenas `add`, sem descrição.**
