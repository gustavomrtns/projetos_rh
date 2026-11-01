# GT360° — Retificação v2

## Alterações desta versão

- Avisos de interação com fundo grafite e texto branco, contraste reforçado e anúncio acessível de status.
- Remoção de caracteres decorativos e emojis dos nove módulos do ERP. Controles de ação passam a usar SVGs vetoriais com rótulo acessível, títulos e confirmação para excluir registros relevantes.
- Reorganização visual de itens dos históricos de CLT, PJ e 5S, principalmente em celulares: descrição, status e exclusão em áreas separadas.
- Remoção de todas as três referências `FM-GT-04 A` do Questionário de Desligamento, inclusive do documento para impressão.
- Componente reutilizável de compartilhamento: `share-modal.js`, `share-modal.css`, `qr-generator.js`.
- Pesquisa de Engajamento: acesso **Compartilhar pesquisa**, com link direto `modules/engajamento.html#responder`, QR Code, cópia, download SVG e abertura externa. Ao entrar pelo QR, abre a jornada do respondente e oculta os controles de gestão.
- Riscos Psicossociais: acesso **Compartilhar formulário**, com link direto `modules/riscos-psicossociais.html#gestor`, QR Code, cópia, download SVG e abertura externa. O link abre o formulário do gestor.
- Checklist 5S: o QR de convite/retorno aponta diretamente para `modules/checklist-5s.html#av=...`, em vez de depender do shell do GT360°. O código de leitura e a importação do resultado permanecem.

## Dependências e limite técnico

O GitHub Pages entrega HTML/JavaScript estático. Os três códigos permitem **abrir os formulários em outro dispositivo**, mas isso **não cria uma base compartilhada de respostas nem sincroniza alterações entre celulares e painel gerencial**. A base fictícia continua em memória do navegador, conforme a etapa anterior.

No 5S, o fluxo de retorno existente depende do compartilhamento posterior do link do resultado, incluindo preparação de e-mail pelo navegador; não equivale à confirmação de recebimento em servidor. Convites podem conter dados enviados pelo usuário no fragmento da URL; não utilizar informações reais nessa versão pública.

## Verificações técnicas

1. Abrir os três links diretos no navegador, sem carregar primeiro o workspace.
2. Pesquisa: usar **Compartilhar pesquisa**; copiar link; baixar SVG; escanear com segundo aparelho; conferir que a página inicia em **Responder**.
3. Riscos: abrir `#gestor` fora do iframe, conferir a etapa inicial e o preenchimento do plano.
4. Checklist 5S: gerar convite no painel, abrir QR pelo celular e confirmar que os dados da auditoria preenchem o formulário; concluir e devolver resultado pelo link de retorno.
5. Nos históricos, testar teclado, exclusão confirmada e leitura do status em largura de 360 px.
6. Testar aviso de sucesso e erro sobre fundo escuro e claro, inclusive no mobile.
7. Abrir a impressão do Desligamento e conferir ausência de `FM-GT-04 A`.

O novo gerador de QR é executado no próprio navegador; a biblioteca usada é o código MIT que já estava incorporado ao módulo Checklist 5S. Não depende de serviços externos.

A mensagem de commit é sempre **`add`**, sem complementos.

## Status de homologação

Verificações de sintaxe JavaScript e geração de SVG dos QR Codes são automatizáveis. A abertura por câmera, impressão e renderização real em Chrome/Safari requerem testes em dispositivos; não classificar como homologados sem reproduzi-los.
