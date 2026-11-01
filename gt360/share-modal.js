/* Compartilhamento público: link direto e QR Code offline, sem serviço externo. */
(function(){
"use strict";
let previous=null,currentUrl="",currentSvg="";
const html=[
'<div class="erp-share-dialog" role="dialog" aria-modal="true" aria-labelledby="erp-share-title" aria-describedby="erp-share-description">',
'<div class="erp-share-head"><div><h2 id="erp-share-title">Compartilhar formulário</h2><p id="erp-share-description">Compartilhe o acesso pelo link ou QR Code.</p></div>',
'<button type="button" class="erp-share-close" aria-label="Fechar compartilhamento" title="Fechar">Fechar</button></div>',
'<div class="erp-share-body"><label for="erp-share-link">Link do formulário</label>',
'<div class="erp-share-link-row"><input type="text" readonly id="erp-share-link" aria-label="Endereço público">',
'<button type="button" id="erp-share-copy">Copiar link</button></div>',
'<div class="erp-share-qr" id="erp-share-qr" role="img" aria-label="QR Code para abrir o formulário"></div>',
'<p id="erp-share-feedback" role="status" aria-live="polite"></p>',
'<div class="erp-share-actions"><button type="button" id="erp-share-download">Baixar QR Code</button>',
'<a id="erp-share-visit" target="_blank" rel="noopener noreferrer">Abrir formulário</a></div></div></div>'
].join("");
function init(){
 if(document.getElementById('erp-share-overlay'))return;
 const overlay=document.createElement('div');overlay.id='erp-share-overlay';
 overlay.className='erp-share-overlay';overlay.hidden=true;overlay.innerHTML=html;
 document.body.append(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 overlay.querySelector('.erp-share-close').addEventListener('click',close);
 document.getElementById('erp-share-copy').addEventListener('click',copyLink);
 document.getElementById('erp-share-download').addEventListener('click',downloadSvg);
 document.addEventListener('keydown',onKey);
}
function onKey(e){
 const overlay=document.getElementById('erp-share-overlay');if(!overlay||overlay.hidden)return;
 if(e.key==='Escape'){e.preventDefault();close();return}
 if(e.key==='Tab'){const all=[...overlay.querySelectorAll('button:not([disabled]),a[href],input')];
 const first=all[0],last=all[all.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
}
function notify(msg){document.getElementById('erp-share-feedback').textContent=msg}
function sameOrigin(raw){
 const url=new URL(raw,location.href);
 if(!['https:','http:'].includes(url.protocol)||url.origin!==location.origin)throw Error('O acesso deve apontar para este site.');
 return url.href;
}
function open(options){
 init();options=options||{};try{currentUrl=sameOrigin(options.url)}catch(e){alert(e.message);return}
 previous=document.activeElement;
 document.getElementById('erp-share-title').textContent=options.title||'Compartilhar formulário';
 document.getElementById('erp-share-description').textContent=options.description||'Compartilhe o link para acessar o formulário.';
 document.getElementById('erp-share-link').value=currentUrl;
 document.getElementById('erp-share-visit').href=currentUrl;
 notify('');
 try{
  if(typeof qrcode!=='function')throw Error('Gerador indisponível');
  const qr=qrcode(0,'M');qr.addData(currentUrl);qr.make();
  currentSvg=qr.createSvgTag(6,4).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  document.getElementById('erp-share-qr').innerHTML=currentSvg;
 }catch(e){
  currentSvg='';document.getElementById('erp-share-qr').textContent='QR Code indisponível; copie o link.';
  notify('Não foi possível gerar o código. O link continua disponível.');
 }
 document.getElementById('erp-share-overlay').hidden=false;
 document.querySelector('.erp-share-close').focus();
}
function close(){
 const el=document.getElementById('erp-share-overlay');if(el)el.hidden=true;
 if(previous&&previous.focus)previous.focus();
}
async function copyLink(){
 try{
  if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(currentUrl);
  else{const input=document.getElementById('erp-share-link');input.focus();input.select();
   if(!document.execCommand('copy'))throw Error('Cópia indisponível')}
  notify('Link copiado.');
 }catch(e){notify('Selecione e copie o endereço manualmente.')}
}
function downloadSvg(){
 if(!currentSvg){notify('QR Code indisponível.');return}
 const blob=new Blob([currentSvg],{type:'image/svg+xml;charset=utf-8'});
 const objectURL=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=objectURL;link.download='gt360-qr-acesso.svg';document.body.append(link);
 link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),1500);
 notify('Download do QR Code iniciado.');
}
window.GTShare={open,close,publicModuleUrl:function(hash){
 const filename=location.pathname.split('/').pop();
 return new URL(filename+(hash||''),location.href).href;
}};
})();
