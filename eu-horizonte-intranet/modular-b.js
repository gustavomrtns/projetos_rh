/* eu + horizonte · Direção B / Modular System
 * Nova navegação desktop e composição visual do HTML existente.
 * Reutiliza os mesmos data-acao e IDs; não replica dados nem altera o demoStore.
 */
(function(){
  'use strict';
  var desktopQuery=window.matchMedia('(min-width:960px)');
  var icons={
    inicio:'<path d="M3 10.5 12 3l9 7.5V21h-7v-7h-4v7H3z"/>',
    agenda:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    acervo:'<path d="M3 7a2 2 0 0 1 2-2h4l2.5 2.5H19a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    buscar:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
    pessoas:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2c0-3 2.7-5.4 6-5.4s6 2.4 6 5.4v2"/><circle cx="18" cy="8.5" r="2.3"/><path d="M17.5 14c2.5.4 4 2 4 4.4V20"/>',
    cracha:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2.2"/><path d="M5.8 16.3c.4-2.4 6.1-2.4 6.5 0M15 9h4M15 13h4M15 16h3"/>',
    criar:'<path d="M12 4v16M4 12h16"/>',
    mensagens:'<path d="M21 11a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5a8.5 8.5 0 1 1 16.1-5z"/>'
  };
  function svg(key){return '<svg aria-hidden="true" viewBox="0 0 24 24">'+icons[key]+'</svg>';}
  var sections=[
    {id:'inicio',label:'Início',action:'tela',value:'inicio'},
    {id:'agenda',label:'Agenda',action:'tela',value:'agenda'},
    {id:'acervo',label:'Acervo',action:'tela',value:'acervo'},
    {id:'buscar',label:'Buscar',action:'tela',value:'buscar'},
    {id:'pessoas',label:'Pessoas',action:'diretorio'},
    {id:'cracha',label:'Seu crachá',action:'tela',value:'eu'}
  ];
  var originalHomeChildren=null,mainWrap=null,asideWrap=null;

  function item(section){
    var button=document.createElement('button');
    button.type='button';
    button.className='eh-nav-item';
    button.setAttribute('data-id',section.id);
    button.setAttribute('data-acao',section.action);
    if(section.value)button.setAttribute('data-valor',section.value);
    button.innerHTML=svg(section.id)+'<span>'+section.label+'</span>';
    return button;
  }
  function mountSidebar(){
    var app=document.querySelector('.aparelho'),top=document.querySelector('.topo');
    if(!app||!top||document.querySelector('.eh-desktop-nav'))return;
    var nav=document.createElement('aside');
    nav.className='eh-desktop-nav';
    nav.setAttribute('aria-label','Menu da intranet no computador');
    nav.innerHTML='<div class="eh-desktop-logo"><span>eu <em>+</em></span><span>horizonte</span></div>'+
      '<div class="eh-desktop-caption">Navegação</div>';
    var group=document.createElement('nav');
    group.className='eh-desktop-links';
    group.setAttribute('aria-label','Navegação principal');
    sections.forEach(function(section){group.appendChild(item(section));});
    nav.appendChild(group);
    var divider=document.createElement('div');
    divider.className='eh-nav-divider';
    nav.appendChild(divider);
    var create=item({id:'criar',label:'Criar publicação',action:'criar'});
    nav.appendChild(create);
    var user=document.createElement('div');
    user.className='eh-desktop-user';
    user.innerHTML='<div class="eh-user-avatar" id="eh-user-avatar">EH</div>'+
      '<div class="eh-user-text"><b id="eh-user-name">Colaborador</b><small id="eh-user-role">eu + horizonte</small></div>';
    nav.appendChild(user);
    app.insertBefore(nav,top);
    var actualName=document.getElementById('cracha-nome');
    var actualRole=document.getElementById('cracha-cargo');
    var actualInitials=document.getElementById('avatar-eu');
    document.getElementById('eh-user-name').textContent=actualName&&actualName.textContent!=='—'?actualName.textContent:'Colaborador';
    document.getElementById('eh-user-role').textContent=actualRole&&actualRole.textContent!=='—'?actualRole.textContent:'eu + horizonte';
    document.getElementById('eh-user-avatar').textContent=actualInitials?actualInitials.textContent:'EH';
    syncActive();
  }
  function mountMobileBrand(){
    var top=document.querySelector('.topo');
    if(!top||top.querySelector('.eh-mobile-brand'))return;
    var brand=document.createElement('div');
    brand.className='eh-mobile-brand';
    brand.innerHTML='<span>eu <strong>+</strong> horizonte</span><small>Comunicação interna</small>';
    top.insertBefore(brand,top.firstChild);
  }
  function mountSearch(){
    var topRow=document.querySelector('.topo-linha'),actions=document.querySelector('.topo-acoes');
    if(!topRow||!actions||document.querySelector('.eh-search'))return;
    var container=document.createElement('label');
    container.className='eh-search';
    container.innerHTML=svg('buscar')+'<input id="eh-global-search" type="search" autocomplete="off" aria-label="Buscar em toda a intranet" placeholder="Buscar comunicados, pessoas e documentos…">';
    topRow.insertBefore(container,actions);
    var input=container.querySelector('input');
    input.addEventListener('input',function(){
      if(typeof window.irPara==='function')window.irPara('buscar');
      var search=document.getElementById('campo-busca');
      if(search){
        search.value=input.value;
        search.dispatchEvent(new Event('input',{bubbles:true}));
      }
      syncActive();
    });
    input.addEventListener('focus',function(){
      if(typeof window.irPara==='function')window.irPara('buscar');
      syncActive();
    });
    document.addEventListener('keydown',function(event){
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();
        if(desktopQuery.matches)input.focus();
        else{
          var native=document.querySelector('.doca [data-valor="buscar"]');
          if(native)native.click();
        }
      }
    });
  }
  function quickButton(key,label,action,value){
    var b=document.createElement('button');b.type='button';b.className='eh-quick-link';
    b.setAttribute('data-acao',action);
    if(value)b.setAttribute('data-valor',value);
    b.innerHTML=svg(key)+'<span>'+label+'</span>';
    return b;
  }
  function organizeDesktop(){
    var home=document.getElementById('tela-inicio');
    if(!home||mainWrap)return;
    originalHomeChildren=Array.from(home.children);
    if(originalHomeChildren.length<6)return;
    mainWrap=document.createElement('div');
    asideWrap=document.createElement('div');
    mainWrap.className='eh-home-main';asideWrap.className='eh-home-aside';
    var topActivation=originalHomeChildren[0],activationList=document.getElementById('trilha-ativacoes');
    var muralHeader=originalHomeChildren[2],feed=document.getElementById('feed');
    var portal=home.querySelector('.portal'),sign=home.querySelector('.assinatura');
    mainWrap.appendChild(muralHeader);
    var toolbar=document.createElement('div');toolbar.className='eh-home-toolbar';
    toolbar.innerHTML='<button type="button" data-acao="compor">+ Nova publicação</button><button type="button" data-acao="tela" data-valor="agenda">Ver agenda</button>';
    mainWrap.appendChild(toolbar);
    mainWrap.appendChild(feed);
    asideWrap.appendChild(topActivation);
    asideWrap.appendChild(activationList);
    var quick=document.createElement('section');quick.className='eh-side-card';
    var h=document.createElement('h3');h.textContent='Acessos rápidos';quick.appendChild(h);
    var quickGrid=document.createElement('div');quickGrid.className='eh-quick-grid';
    quickGrid.appendChild(quickButton('agenda','Agenda','tela','agenda'));
    quickGrid.appendChild(quickButton('acervo','Acervo','tela','acervo'));
    quickGrid.appendChild(quickButton('pessoas','Pessoas','diretorio'));
    quickGrid.appendChild(quickButton('cracha','Meu crachá','tela','eu'));
    quick.appendChild(quickGrid);asideWrap.appendChild(quick);
    if(portal)asideWrap.appendChild(portal);
    if(sign)asideWrap.appendChild(sign);
    home.appendChild(mainWrap);home.appendChild(asideWrap);
    home.classList.add('eh-home-grid');
  }
  function restoreMobile(){
    if(!mainWrap)return;
    var home=document.getElementById('tela-inicio');
    if(!home)return;
    originalHomeChildren.forEach(function(node){home.appendChild(node);});
    mainWrap.remove();asideWrap.remove();mainWrap=null;asideWrap=null;
    home.classList.remove('eh-home-grid');
  }
  function syncActive(){
    var active=document.querySelector('.tela.ativa');
    var id=active?active.id.replace('tela-',''):'inicio';
    document.querySelectorAll('.eh-desktop-nav .eh-nav-item').forEach(function(b){
      var yes=b.getAttribute('data-id')===(id==='eu'?'cracha':id);
      b.classList.toggle('active',yes);
      if(yes)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
  }
  function syncLayout(){
    if(desktopQuery.matches)organizeDesktop();
    else restoreMobile();
    syncActive();
  }
  function setup(){
    mountSidebar();mountMobileBrand();mountSearch();
    syncLayout();
    document.querySelectorAll('.tela').forEach(function(t){
      new MutationObserver(syncActive).observe(t,{attributes:true,attributeFilter:['class']});
    });
    if(desktopQuery.addEventListener)desktopQuery.addEventListener('change',syncLayout);
    else if(desktopQuery.addListener)desktopQuery.addListener(syncLayout);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();