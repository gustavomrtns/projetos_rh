/* Fluxo Unificado GT360°
 * Espelha a navegação existente sem realocar ou remover seus botões.
 * Aplica-se apenas no workspace embutido; não altera acessos por QR.
 */
(function(window,document){
"use strict";
const META={
 "tempo-casa":{
   label:"Gestão de Tempo de Casa",
   subtitle:"Colaboradores, marcos de vínculo e ações de reconhecimento.",
   nav:"#sidebar-nav",host:".workspace-body",topbar:".topbar"
 },
 "engajamento":{
   label:"Pesquisa de Engajamento Organizacional",
   subtitle:"Questionário, acompanhamento e análise das respostas.",
   nav:"#admin-sidebar-nav",host:".admin-workspace-body",topbar:".topbar"
 },
 "riscos":{
   label:"Gestão de Riscos Psicossociais",
   subtitle:"Planos de ação e acompanhamento por unidade e setor.",
   nav:"#sidebar-nav",host:".workspace-body",topbar:"header"
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
function init(){
 const id=document.body.getAttribute("data-unified-module"),info=META[id];
 if(!info||!useAdminView(id))return;
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
     notice.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();notice.click();}});
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
 document.documentElement.classList.add("erp-unified-flow");
 let pending=false,signature="";
 function sync(){
   pending=false;
   const buttons=[...original.querySelectorAll("button")].filter(button=>
     !button.hidden&&button.style.display!=="none"&&
     !/^sair$/i.test((button.getAttribute("title")||button.textContent||"").trim()));
   const state=buttons.map(b=>[(b.getAttribute("title")||b.textContent).trim(),b.classList.contains("active"),b.id].join("|")).join(";");
   if(state===signature)return;
   signature=state;tabs.replaceChildren();
   buttons.forEach(button=>{
     const label=button.getAttribute("title")||button.textContent.trim().replace(/\s+/g," ");
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