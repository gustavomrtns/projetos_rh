/* Navegação por áreas de trabalho, alinhada ao shell do GT360°. */
(function(window,document){
  'use strict';
  let resolveReady,active=null;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  function element(tag,className,text){const node=document.createElement(tag);node.className=className||'';if(text)node.textContent=text;return node;}
  function panel(title,...nodes){const node=element('section','panel');node.append(element('h2','',title),...nodes);return node;}
  function columns(...nodes){const node=element('div','columns');node.append(...nodes);return node;}
  function actions(items){
    const grid=element('div','process-actions');
    items.forEach(item=>{
      const button=element('button','process-action');button.type='button';button.dataset.openScreen=item.id;
      button.append(element('strong','',item.label),element('span','',item.description));grid.append(button);
    });return grid;
  }
  function mount({module,title,screens,build,aliases={}}){
    const app=document.getElementById('app'),main=document.getElementById('conteudo');
    const notice=main.querySelector('.notice');
    const parts=build({app,notice,panel,columns,actions,element});
    app.replaceChildren(...(parts.context||[]));
    const shell=element('section','erp-unified-shell');shell.id='process-shell';shell.setAttribute('aria-label','Navegação do módulo');
    const head=element('div','erp-unified-head'),text=element('div','erp-unified-text');
    const heading=element('h1','erp-unified-title',title);heading.id='process-title';
    const subtitle=element('p','erp-unified-subtitle');subtitle.id='process-description';
    text.append(element('div','erp-unified-caption','GT360° / Planejamento de Pessoas'),heading,subtitle);head.append(text);
    const tabs=element('div','erp-unified-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Áreas de '+title);
    const panels=new Map(),buttons=new Map();
    screens.forEach(screen=>{
      const button=element('button','erp-unified-tab',screen.label);button.type='button';button.id='process-tab-'+screen.id;
      button.setAttribute('role','tab');button.setAttribute('aria-controls','process-view-'+screen.id);
      button.addEventListener('click',()=>show(screen.id));
      tabs.append(button);buttons.set(screen.id,button);
      const view=element('section','process-view');view.id='process-view-'+screen.id;view.dataset.screen=screen.id;
      view.setAttribute('role','tabpanel');view.setAttribute('aria-labelledby',button.id);view.tabIndex=0;
      view.append(...parts.views[screen.id]);app.append(view);panels.set(screen.id,view);
    });
    shell.append(head,tabs);main.before(shell);main.replaceChildren(app);
    document.documentElement.classList.add('planning-workspace');
    try{if(window.self!==window.top&&window.top.location.origin===location.origin)document.documentElement.classList.add('planning-embedded');}catch(_){}
    function route(){
      const raw=location.hash.slice(1),hash=new URLSearchParams(raw);
      return aliases[hash.get('tela')]||hash.get('tela')||aliases[raw]||aliases[new URLSearchParams(location.search).get('tela')]||new URLSearchParams(location.search).get('tela')||screens[0].id;
    }
    function show(id,{history=true,focus=false}={}){
      id=aliases[id]||id;
      if(!panels.has(id))id=screens[0].id;
      const changed=active!==id;active=id;
      panels.forEach((view,key)=>{const selected=key===id;view.hidden=!selected;view.inert=!selected;});
      buttons.forEach((button,key)=>{const selected=key===id;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
      app.querySelectorAll('[data-for-screens]').forEach(node=>{const selected=node.dataset.forScreens.split(' ').includes(id);node.hidden=!selected;node.inert=!selected;});
      subtitle.textContent=screens.find(s=>s.id===id).description;
      if(history&&changed){const url=new URL(location.href);url.hash='tela='+id;window.history.pushState({},'',url);}
      main.scrollTop=0;
      if(focus)panels.get(id).focus({preventScroll:true});
      if(changed)document.dispatchEvent(new CustomEvent('planning-screen-change',{detail:{screen:id,module}}));
    }
    tabs.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      const keys=screens.map(s=>s.id),index=keys.indexOf(active);
      const next=event.key==='Home'?0:event.key==='End'?keys.length-1:(index+(event.key==='ArrowRight'?1:-1)+keys.length)%keys.length;
      event.preventDefault();show(keys[next]);buttons.get(keys[next]).focus();
    });
    document.addEventListener('click',event=>{
      const action=event.target.closest('[data-open-screen]');
      if(action){show(action.dataset.openScreen,{focus:true});return;}
      const link=event.target.closest('a[href]');
      if(!link||!document.documentElement.classList.contains('planning-embedded')||event.ctrlKey||event.metaKey||event.shiftKey||event.button!==0)return;
      const url=new URL(link.href,location.href);
      if(url.origin!==location.origin)return;
      const target=/\/(headcount|carreira)\/$/.exec(url.pathname);
      if(target&&typeof window.parent.abrirPlanejamento==='function'){
        event.preventDefault();window.parent.abrirPlanejamento(target[1],url.searchParams.get('tela'),url.searchParams.get('cenario'));
      }else if(link.classList.contains('portfolio-return'))link.target='_top';
    });
    const handleHistory=()=>show(route(),{history:false});window.addEventListener('popstate',handleHistory);window.addEventListener('hashchange',handleHistory);
    const api={show,get activeScreen(){return active;}};
    window.PlanningWorkspace.show=show;show(route(),{history:false});resolveReady(api);return api;
  }
  function headcount(){
    const screens=[
      {id:'dashboard',label:'Dashboard',description:'Evolução do quadro, custos, orçamento e antecipação dos impactos do cenário.'},
      {id:'quadro',label:'Quadro de posições',description:'Consulte ocupação, vagas aprovadas e custo de cada posição.'},
      {id:'movimentacoes',label:'Movimentações',description:'Simule admissões, reajustes, benefícios e saídas no cenário selecionado.'},
      {id:'encargos',label:'Encargos e provisões',description:'Configure os parâmetros de custeio e os reflexos de folha.'},
      {id:'composicao',label:'Composição de custos',description:'Confira e exporte os componentes do custo no mês selecionado.'},
      {id:'projecao',label:'Projeção anual',description:'Compare os 12 meses, o orçamento e os impactos do cenário.'}
    ];
    return mount({module:'headcount',title:'Quadro e custos',screens,build:({app,notice,panel,columns,actions,element})=>{
      const $=id=>document.getElementById(id),context=app.querySelector('.toolbar'),metrics=$('metrics'),footer=app.querySelector('.footer');
      const scope='dashboard quadro composicao projecao';
      $('unit').closest('label').dataset.forScreens=scope;$('month').closest('label').dataset.forScreens=scope;
      const premise=$('premise');premise.dataset.forScreens='dashboard quadro composicao projecao';
      const config=$('payroll-policy'),configIntro=config.previousElementSibling;
      const charges=panel('Parâmetros de encargos e provisões',configIntro,config,notice);
      const moves=$('movement').closest('section'),events=$('events').closest('section');
      const positions=$('positions').closest('section'),breakdown=$('breakdown').closest('section'),forecast=$('forecast').closest('section');
      const dashboard=element('div','dashboard-headcount');dashboard.id='headcount-dashboard';
      const overview=element('div');overview.append(element('h2','','Dashboard de quadro e custos'),metrics,dashboard,footer);
      return {context:[context,premise],views:{dashboard:[overview],quadro:[positions],movimentacoes:[columns(moves,events)],encargos:[charges],composicao:[breakdown],projecao:[forecast]}};
    },aliases:{'visao-geral':'dashboard',quadro:'quadro',encargos:'encargos'}});
  }
  function career(){
    const screens=[
      {id:'dashboard',label:'Dashboard',description:'Estrutura, enquadramento salarial, propostas e horizontes de sucessão.'},
      {id:'estrutura',label:'Estrutura de cargos',description:'Consulte famílias, níveis, faixas e ocupação por cargo.'},
      {id:'carreira',label:'Trilhas e competências',description:'Compare o perfil da pessoa com os requisitos e caminhos do cargo.'},
      {id:'acomodacao',label:'Acomodação salarial',description:'Analise enquadramento, faixa e impacto financeiro das propostas.'},
      {id:'sucessao',label:'Sucessão',description:'Registre candidatos, prontidão, evidências e datas de revisão.'},
      {id:'desenvolvimento',label:'Desenvolvimento',description:'Acompanhe competências e ações de desenvolvimento por candidato.'}
    ];
    return mount({module:'carreira',title:'Cargos e carreira',screens,build:({app,notice,panel,columns,actions,element})=>{
      const $=id=>document.getElementById(id),metrics=app.querySelector('.metrics'),footer=app.querySelector('.footer');
      const structure=$('estrutura'),analysis=$('person').closest('.toolbar'),message=$('simulation-message');
      analysis.dataset.forScreens='carreira acomodacao';message.dataset.forScreens='acomodacao';
      $('salary').closest('label').dataset.forScreens='acomodacao';$('simulate').dataset.forScreens='acomodacao';
      const path=$('career-path'),gaps=$('gaps').parentElement,placement=$('placement'),accommodations=$('accommodations').closest('details');
      const nominations=$('nomination').parentElement,nominationList=$('nominations').parentElement;
      const development=$('development');
      const controls=element('div','toolbar');
      [['development-person','Candidato','candidate'],['development-position','Posição de referência','critical']].forEach(([id,label,original])=>{
        const wrapper=element('label','',label),select=element('select');select.id=id;
        [...$(original).options].forEach(option=>select.append(option.cloneNode(true)));wrapper.append(select);controls.append(wrapper);
      });
      metrics.id='career-metrics';
      const dashboard=element('div','dashboard-career');dashboard.id='career-dashboard';
      const overview=element('div');overview.append(element('h2','','Dashboard de cargos e carreira'),metrics,dashboard,footer);
      const careerView=panel('Trilhas e competências',columns(path,gaps),notice);
      const accommodationView=panel('Enquadramento e propostas',placement,accommodations);
      const successionView=panel('Gestão de sucessão',columns(nominations,nominationList));
      const developmentView=panel('Planos de desenvolvimento',controls,development);
      return {context:[analysis,message],views:{dashboard:[overview],estrutura:[structure],carreira:[careerView],acomodacao:[accommodationView],sucessao:[successionView],desenvolvimento:[developmentView]}};
    },aliases:{'visao-geral':'dashboard',estrutura:'estrutura',progressao:'carreira',sucessao:'sucessao'}});
  }
  window.PlanningWorkspace={ready,mount,headcount,career};
})(window,document);
