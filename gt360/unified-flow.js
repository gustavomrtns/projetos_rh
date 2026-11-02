/* Fluxo Unificado GT360°
 * Espelha a navegação existente sem realocar ou remover seus botões.
 * Aplica-se apenas no workspace embutido; não altera acessos por QR.
 */
(function(window,document){
"use strict";
const META={
 "onboarding":{
  label:"Fluxo de Onboarding",subtitle:"Integração, acompanhamento e documentação de colaboradores.",
  nav:"#sidebar-nav",host:".workspace-body"
 },
 "avaliacao-clt":{
  label:"Avaliação de Período de Experiência",subtitle:"Desempenho, competências, parecer e assinaturas.",
  nav:"#sidebar-nav",host:".workspace-body",utilityTitles:["Histórico","Dashboard"]
 },
 "avaliacao-pj":{
  label:"Avaliação de Prestadores de Serviço",subtitle:"Critérios de qualidade, resultados e ciência do prestador.",
  nav:"#sidebar-nav",host:".workspace-body",utilityTitles:["Histórico","Dashboard"]
 },
 "tempo-casa":{
  label:"Gestão de Tempo de Casa",subtitle:"Colaboradores, marcos de vínculo e ações de reconhecimento.",
  nav:"#sidebar-nav",host:".workspace-body"
 },
 "desligamento":{
  label:"Questionário de Desligamento",subtitle:"Formulário, acompanhamento e análise gerencial.",
  nav:"#sidebar-nav",host:".workspace-body"
 },
 "engajamento":{
  label:"Pesquisa de Engajamento Organizacional",subtitle:"Questionário, acompanhamento e análise das respostas.",
  nav:"#admin-sidebar-nav",host:".admin-workspace-body"
 },
 "riscos":{
  label:"Gestão de Riscos Psicossociais",subtitle:"Planos de ação e acompanhamento por unidade e setor.",
  nav:"#sidebar-nav",host:".workspace-body"
 },
 "treinamentos":{
  label:"Painel de Treinamentos",subtitle:"Cadastro, fluxo de execução, impacto e indicadores.",
  nav:"#sidebar-nav",host:".workspace-body"
 },
 "checklist-5s":{
  label:"Checklist 5S",subtitle:"Auditorias, organização e qualidade do ambiente de trabalho.",
  special:"five-s"
 }
};
function embedded(){
 try{return window.self!==window.top&&window.top.location.origin===window.location.origin;}
 catch(_){return false;}
}
function useAdminView(name){
 if(!embedded())return false;
 if(name==="engajamento"&&location.hash==="#responder")return false;
 if(name==="riscos"&&location.hash==="#gestor")return false;
 return true;
}
function makeElement(tag,className,text){
 const el=document.createElement(tag);el.className=className;
 if(text!==undefined)el.textContent=text;return el;
}
/* O Checklist 5S tem duas experiências: painel e formulário de auditoria.
 * A barra é persistente no workspace; o QR público continua independente. */
function init5S(info){
 const panel=document.getElementById("view-painel");
 const audit=document.getElementById("view-checklist");
 const original=document.getElementById("check-sidebar-nav");
 if(!panel||!audit||!original)return;
 const shell=makeElement("section","erp-unified-shell");
 shell.id="erp-unified-shell";shell.setAttribute("aria-label","Navegação do módulo");
 const head=makeElement("div","erp-unified-head");
 const wrap=makeElement("div","erp-unified-text");
 wrap.append(makeElement("div","erp-unified-caption","GT360°  /  Gestão de Pessoas"));
 wrap.append(makeElement("h1","erp-unified-title",info.label));
 wrap.append(makeElement("p","erp-unified-subtitle",info.subtitle));
 const tools=makeElement("div","erp-unified-tools");
 const originalCreate=panel.querySelector('.header-card button[onclick*="abrirModalNovaAuditoria"]');
 if(originalCreate){
   const create=makeElement("button","erp-unified-create","Nova auditoria");
   create.type="button";create.addEventListener("click",()=>originalCreate.click());
   tools.append(create);
 }
 head.append(wrap,tools);
 const tabs=makeElement("nav","erp-unified-tabs");
 tabs.setAttribute("aria-label","Navegação de auditorias e etapas do 5S");
 shell.append(head,tabs);
 document.body.insertBefore(shell,panel);
 document.documentElement.classList.add("erp-unified-flow","erp-unified-five-s");
 let pending=false,signature="";
 function sync(){
   pending=false;
   const checklistOpen=!audit.classList.contains("hidden-view");
   const buttons=checklistOpen?[...original.querySelectorAll("button.check-side-item")]:[];
   const active=buttons.find(b=>b.classList.contains("active"));
   const state=[checklistOpen,active&&active.dataset.s,buttons.length].join("|");
   if(state===signature)return;
   signature=state;tabs.replaceChildren();
   const panelTab=makeElement("button","erp-unified-tab"+(!checklistOpen?" active":""),"Painel gerencial");
   panelTab.type="button";
   if(!checklistOpen)panelTab.setAttribute("aria-current","page");
   panelTab.addEventListener("click",()=>{
     if(typeof window.mostrarPainel==="function")window.mostrarPainel();
     signature="";requestAnimationFrame(sync);
   });
   tabs.append(panelTab);
   buttons.forEach(button=>{
     const label=button.textContent.trim().replace(/\s+/g," ");
     const selected=button.classList.contains("active");
     const tab=makeElement("button","erp-unified-tab"+(selected?" active":""),label);
     tab.type="button";
     tab.setAttribute("aria-label","Abrir "+label);
     if(selected)tab.setAttribute("aria-current","page");
     tab.addEventListener("click",()=>{button.click();signature="";requestAnimationFrame(sync)});
     tabs.append(tab);
   });
 }
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(sync)}
 sync();
 const monitor=new MutationObserver(schedule);
 monitor.observe(audit,{attributes:true,attributeFilter:["class"]});
 monitor.observe(original,{subtree:true,attributes:true,attributeFilter:["class"],childList:true});
}
function init(){
 const id=document.body.getAttribute("data-unified-module"),info=META[id];
 if(!info||!useAdminView(id))return;
 if(info.special==="five-s"){init5S(info);return;}
 const host=document.querySelector(info.host),original=document.querySelector(info.nav);
 if(!host||!original||document.getElementById("erp-unified-shell"))return;
 const shell=makeElement("section","erp-unified-shell");
 shell.id="erp-unified-shell";shell.setAttribute("aria-label","Navegação do módulo");
 const head=makeElement("div","erp-unified-head");
 const textWrap=makeElement("div","erp-unified-text");
 textWrap.append(makeElement("div","erp-unified-caption","GT360°  /  Gestão de Pessoas"));
 textWrap.append(makeElement("h1","erp-unified-title",info.label));
 textWrap.append(makeElement("p","erp-unified-subtitle",info.subtitle));
 const tools=makeElement("div","erp-unified-tools");
 const tabs=makeElement("nav","erp-unified-tabs");
 tabs.setAttribute("aria-label","Etapas e seções de "+info.label);
 head.append(textWrap,tools);shell.append(head,tabs);
 host.insertBefore(shell,host.querySelector("main"));
 /* As ações continuam sendo as ações originais dos módulos. */
 if(id==="tempo-casa"){
   const search=document.querySelector(".topbar-search");
   if(search)tools.append(search);
   const notice=document.querySelector(".notif-link");
   if(notice){
     notice.setAttribute("role","button");notice.setAttribute("tabindex","0");
     notice.setAttribute("aria-label","Comemorações de hoje");
     if(!notice.__demoKeyAccess){
       notice.__demoKeyAccess=true;
       notice.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();notice.click();}});
     }
     tools.append(notice);
   }
 }
 if(id==="engajamento"){
   const share=document.querySelector('.topbar-right button[aria-label="Compartilhar pesquisa"]');
   if(share)tools.append(share);
 }
 if(id==="riscos"){
   const share=document.querySelector('.header-role button[title="Compartilhar com gestores"]');
   const role=document.getElementById("role-chip");
   if(share)tools.append(share);
   if(role)tools.append(role);
 }
 (info.utilityTitles||[]).forEach(title=>{
   const source=[...original.querySelectorAll("button")].find(b=>b.getAttribute("title")===title);
   if(!source)return;
   const action=makeElement("button","erp-unified-utility",title);
   action.type="button";
   action.setAttribute("aria-label","Abrir "+title);
   action.addEventListener("click",()=>source.click());
   tools.append(action);
 });
 document.documentElement.classList.add("erp-unified-flow");
 let pending=false,signature="";
 function sync(){
   pending=false;
   const buttons=[...original.querySelectorAll("button")].filter(button=>
     !button.hidden&&button.style.display!=="none"&&
     !/^sair$/i.test((button.getAttribute("title")||button.textContent||"").trim())&&
     !(info.utilityTitles||[]).includes(button.getAttribute("title")||""));
   const state=buttons.map(b=>[(b.getAttribute("title")||b.textContent).trim(),b.classList.contains("active"),b.id].join("|")).join(";");
   if(state===signature)return;
   signature=state;tabs.replaceChildren();
   buttons.forEach(button=>{
     const label=button.hasAttribute("data-step")?button.textContent.trim().replace(/\s+/g," "):
       (button.getAttribute("title")||button.textContent.trim().replace(/\s+/g," "));
     const mirror=makeElement("button","erp-unified-tab"+(button.classList.contains("active")?" active":""),label);
     mirror.type="button";mirror.setAttribute("aria-label","Abrir "+label);
     if(button.classList.contains("active"))mirror.setAttribute("aria-current","page");
     mirror.addEventListener("click",()=>{
       button.click();
       requestAnimationFrame(()=>{signature="";sync()});
     });
     tabs.append(mirror);
   });
 }
 function schedule(){
   if(pending)return;pending=true;requestAnimationFrame(sync);
 }
 sync();
 new MutationObserver(schedule).observe(original,{childList:true,subtree:true,attributes:true,attributeFilter:["class","style","hidden"]});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})(window,document);