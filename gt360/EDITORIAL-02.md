# GT360° — Identidade Editorial 02 (piloto)

## Escopo aplicado nesta branch

- `gt360/index.html` — workspace de acesso aos nove módulos.
- `gt360/modules/avaliacao-clt.html` — avaliação por etapas.
- `gt360/modules/onboarding.html` — cadastro, termos e dashboard.
- `gt360/modules/treinamentos.html` — cadastro, fluxo, impacto e dashboard.
- `gt360/editorial-02.css` — camada de estilos compartilhada e tokens da IDV.

## Diretrizes

- Paleta: vermelho `#c71717`, verde-limão `#8fff00`, branco e neutros quentes.
- Priorizar legibilidade e estados semânticos: alerta em âmbar, erro em vermelho, concluído em verde-limão com texto escuro.
- Preservar textos, campos, IDs, scripts, filtros, cálculos, persistência, exports, modais e rotas já existentes.
- A camada CSS é carregada **depois** dos estilos originais para facilitar rollback.
- A substituição de valores hexadecimais existentes é apenas apresentação visual, inclusive onde são usados em gráficos/renderização JavaScript.

## Fora do escopo deste piloto

- Os outros cinco módulos GT360° ainda não foram migrados nesta branch.
- `eu + horizonte` é um **case independente**, fora do workspace GT360°, com sua navegação e acesso próprios; recebe a identidade editorial em uma etapa separada.
- Nenhum cadastro, integração ou funcionalidade foi adicionado/removido.

## Validação efetuada

- Conferidos links relativos do CSS nas quatro páginas e existência do arquivo na branch.
- Estrutura e quantidade de blocos de script dos HTMLs mantidas.
- Verificação estática de que apenas referências de cor e a importação da camada CSS foram alteradas.
- Tokens anteriores da paleta arco-íris substituídos nas quatro páginas.

## QA manual antes do merge

1. Abrir o workspace em desktop e mobile; acessar cada módulo piloto pelo menu e retornar.
2. CLT: preencher identificação, avaliar desempenho e competências, navegar para parecer, assinaturas e exportar PDF.
3. Onboarding: criar/editar colaborador, atualizar status, registrar termos, filtrar dashboard e exportar CSV.
4. Treinamentos: cadastrar evento, percorrer fluxo, listar participantes, consultar impacto e indicadores.
5. Validar foco, contraste de badges, alertas, formulários, modais, impressão/PDF e persistência após recarregar.

**Nota:** QA de navegação em navegador real não foi executado nesta etapa; a validação foi estática, e o merge deve ocorrer depois da revisão visual e funcional.
