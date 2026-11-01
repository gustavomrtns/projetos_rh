/* Portfólio — base de demonstração comum a GT360° e eu + horizonte.
 * Nenhum dado é enviado a servidor ou mantido entre visitas.
 * Identidades inteiramente fictícias; domínios .invalid não recebem e-mail.
 */
(function(w){
  "use strict";
  var people=[
    {id:"D001",nome:"Ana Ribeiro",cargo:"Analista de Comunicação",setor:"Comunicação",unidade:"UNIDADE 1 - FILIAL 1",admissao:"2023-04-10",email:"ana.ribeiro@example.invalid",ramal:"2101"},
    {id:"D002",nome:"Bruno Almeida",cargo:"Analista de Tecnologia",setor:"Tecnologia",unidade:"UNIDADE 1 - FILIAL 1",admissao:"2025-02-03",email:"bruno.almeida@example.invalid",ramal:"2102"},
    {id:"D003",nome:"Camila Rocha",cargo:"Analista de Gestão de Pessoas",setor:"Gestão de Pessoas",unidade:"UNIDADE 2",admissao:"2024-08-15",email:"camila.rocha@example.invalid",ramal:"2201"},
    {id:"D004",nome:"Daniel Costa",cargo:"Assistente Administrativo",setor:"Administrativo",unidade:"UNIDADE 3",admissao:"2026-02-09",email:"daniel.costa@example.invalid",ramal:"2301"},
    {id:"D005",nome:"Elisa Martins",cargo:"Coordenadora de Projetos",setor:"Projetos",unidade:"UNIDADE 1 - FILIAL 2",admissao:"2022-11-07",email:"elisa.martins@example.invalid",ramal:"2103"}
  ];
  var clone=function(x){return JSON.parse(JSON.stringify(x));};
  var redactedKey=/^(?:onb_|clt_|pj_|tempoDeCasaDB_|desl_|peo_|psicossocial_|riscos_|trn_|5s_|gt360_|tc_|eu_mais_horizonte_)/;
  function purgeOldBrowserData(){
    /* Limpa somente chaves destes cases, jamais as de outros projetos do domínio. */
    try {
      var storage=w.localStorage, keys=[],i,key;
      for(i=0;i<storage.length;i++){key=storage.key(i);if(key&&redactedKey.test(key))keys.push(key);}
      keys.forEach(function(k){storage.removeItem(k);});
    } catch(_) {}
    try {
      var session=w.sessionStorage, items=[];
      for(var j=0;j<session.length;j++){var k=session.key(j);if(k&&redactedKey.test(k))items.push(k);}
      items.forEach(function(k){session.removeItem(k);});
    } catch(_) {}
  }
  purgeOldBrowserData();
  var root=w;
  try{ if(w.top&&w.top.location.origin===w.location.origin)root=w.top; }catch(_){}
  if(!root.__portfolioDemoRoot){
    var state=Object.create(null);
    var history=Object.create(null);
    var samples=people.map(function(p,i){return{
      id:100+i,colaborador:p.nome,matricula:"DEMO-00"+(i+1),
      setor:p.setor,cargo:p.cargo,contato:p.email,datainicio:p.admissao,
      unidade:p.unidade,integracao:"Sim",condutor:"Equipe de Pessoas",
      st_envio:"Enviado",st_assinatura:"Assinado",st_uniglobo:"Cadastrado",
      st_cursos:i<3?"Realizados completamente":"Em andamento",
      parecer_data:"",parecer_obs:"",salvo_em:"2026-09-01T10:00:00.000Z"
    };});
    var trainings=[
      {id:9001,nome:"Integração e Cultura",modalidade:"Presencial",categoria:"Onboarding",inicio:"2026-09-08",termino:"2026-09-08",carga:"4",facilitador:"Equipe de Pessoas",publico:"Todas as unidades",participantes:"5",descricao:"Conhecer os processos e valores.",responsavel:people[2].nome,st_treinamento:"Concluído",st_comunicacao:"Enviado",st_material:"Pronto",st_certificado:"Emitido",st_avaliacao:"Avaliado",realizados:"5",conclusao_real:"2026-09-08",fluxo_obs:""},
      {id:9002,nome:"Comunicação e Colaboração",modalidade:"Online — Síncrono",categoria:"Desenvolvimento",inicio:"2026-11-18",termino:"2026-11-18",carga:"2",facilitador:"Equipe de Projetos",publico:"Todas as unidades",participantes:"5",descricao:"Práticas de colaboração.",responsavel:people[4].nome,st_treinamento:"Planejado",st_comunicacao:"Enviado",st_material:"Pronto",st_certificado:"Não emitido",st_avaliacao:"Pendente",realizados:"",conclusao_real:"",fluxo_obs:""}
    ];
    state.onb_colaboradores=JSON.stringify(samples);
    state.onb_termosMap=JSON.stringify({});
    state.onb_condutor="Equipe de Pessoas";
    state.trn_treinamentos=JSON.stringify(trainings);
    state.trn_impactos="[]"; state.trn_questionarios="[]"; state.trn_inscricoes="[]";
    root.__portfolioDemoRoot={state:state,history:history};
  }
  var rootState=root.__portfolioDemoRoot.state;
  var store={
    getItem:function(key){return Object.prototype.hasOwnProperty.call(rootState,String(key))?rootState[String(key)]:null;},
    setItem:function(key,val){rootState[String(key)]=String(val);},
    removeItem:function(key){delete rootState[String(key)];},
    clear:function(){Object.keys(rootState).forEach(function(k){delete rootState[k];});},
    key:function(n){return Object.keys(rootState)[n]||null;}
  };
  Object.defineProperty(store,"length",{get:function(){return Object.keys(rootState).length;}});
  w.demoStore=store;
  w.PortfolioDemo={people:clone(people), units:["UNIDADE 1 - FILIAL 1","UNIDADE 1 - FILIAL 2","UNIDADE 2","UNIDADE 3"],copyPeople:function(){return clone(people);},reset:function(){w.location.reload();}};

  /* Acessibilidade básica para formulários que já têm rótulos visíveis. */
  function associateLabels(rootEl){
    var fields=(rootEl||document).querySelectorAll(".field, .sig-row, .form-field, .campo");
    for(var i=0;i<fields.length;i++){
      var wrap=fields[i],lbl=wrap.querySelector("label:not([for])"),input=wrap.querySelector("input,select,textarea");
      if(lbl&&input&&!lbl.contains(input)){
        if(!input.id)input.id="demo-campo-"+i+"-"+Math.random().toString(36).slice(2,7);
        lbl.setAttribute("for",input.id);
      }
    }
    var clickable=(rootEl||document).querySelectorAll("div[onclick],article[onclick],section[onclick]");
    for(var j=0;j<clickable.length;j++){
      var el=clickable[j];
      if(el.hasAttribute("tabindex")||el.querySelector("button,a,input,select,textarea"))continue;
      el.setAttribute("tabindex","0");el.setAttribute("role","button");
      if(!el.__demoKeyAccess){el.__demoKeyAccess=true;el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();this.click();}});}
    }
  }
  function startA11y(){
    associateLabels(document);
    if(typeof MutationObserver==="function"){
      var pending=false;
      new MutationObserver(function(){if(!pending){pending=true;requestAnimationFrame(function(){pending=false;associateLabels(document);});}}).observe(document.body,{subtree:true,childList:true});
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startA11y);
  else startA11y();
})(window);
