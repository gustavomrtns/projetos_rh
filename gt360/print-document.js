/* GT360° · Visualização de relatórios isolada da interface ERP.
 * Usa a caixa de impressão nativa: selecione "Salvar como PDF".
 * Sem serviços externos e sem transferência dos dados do documento.
 */
(function(w) {
  "use strict";
  function cleanMarkup(input) {
    var template=document.createElement("template");
    template.innerHTML=String(input||"");
    template.content.querySelectorAll("script,iframe,object,embed,form").forEach(function(el) {
      /* Preservar campos quando houver formulário (conversão feita antes). */
      if(el.tagName==="FORM"){el.replaceWith.apply(el,Array.from(el.childNodes));}
      else el.remove();
    });
    template.content.querySelectorAll("*").forEach(function(el) {
      for(var i=el.attributes.length-1;i>=0;i--) {
        var name=el.attributes[i].name;
        if(/^on/i.test(name)||name==="srcdoc")el.removeAttribute(name);
      }
    });
    return template.innerHTML;
  }
  function snapshot(node) {
    var clone=node.cloneNode(true);
    var originals=node.querySelectorAll("input,textarea,select");
    var fields=clone.querySelectorAll("input,textarea,select");
    for(var i=0;i<fields.length;i++){
      var source=originals[i],field=fields[i];
      if(!source||!field)continue;
      var value=source.tagName==="SELECT"?
        (source.options[source.selectedIndex]&&source.options[source.selectedIndex].textContent)||"—":
        source.type==="checkbox"||source.type==="radio"?(source.checked?"Sim":"Não"):source.value;
      var display=document.createElement("span");
      display.className="erp-print-value";display.textContent=value||"—";
      field.replaceWith(display);
    }
    /* As opções de notas somem na CSS de impressão original. Substituí-las
       pelo valor selecionado antes de remover os botões evita um PDF sem notas. */
    clone.querySelectorAll(".criteria-item .note-options").forEach(function(group){
      var buttons=Array.from(group.querySelectorAll(".note-btn"));
      var selected=buttons.findIndex(function(b){return b.classList.contains("active");});
      var summary=document.createElement("div");summary.className="erp-print-score";
      summary.textContent=selected>=0 ? "Nota atribuída: "+(selected+1)+" / "+buttons.length : "Nota não atribuída";
      group.replaceWith(summary);
    });
    clone.querySelectorAll("button,.submit-bar,.no-print,.toast,.modal-bg,[data-print-hide]").forEach(function(el){el.remove();});
    return cleanMarkup(clone.outerHTML);
  }
  function build(options) {
    var title=String(options.title||"Relatório · Gestão de Pessoas").replace(/[<>]/g,"");
    var sheets=Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter(function(el){return !/fonts\.googleapis/i.test(el.href||"");})
      .map(function(el){return '<link rel="stylesheet" href="'+el.href.replace(/"/g,"&quot;")+'">';}).join("");
    var css=Array.from(document.querySelectorAll("style")).map(function(el){return el.textContent;}).join("\n");
    var report=options.node?snapshot(options.node):cleanMarkup(options.html);
    return '<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8">'+
      '<meta name="viewport" content="width=device-width, initial-scale=1">'+
      '<title>'+title+'</title>'+sheets+'<style>'+css+'</style>'+
      '<style>'+
      'html,body{height:auto!important;min-height:100%;overflow:auto!important;display:block!important;background:#fff!important;color:#232220!important}'+
      '#print-overlay,#print-overlay.visible{display:block!important;position:static!important;inset:auto!important;overflow:visible!important;min-height:0!important;max-height:none!important;padding:0!important;box-shadow:none!important}'+
      '.erp-print-tools{position:sticky;top:0;z-index:99999;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 18px;background:#232220;color:#fff;font:500 13px system-ui,sans-serif}'+
      '.erp-print-tools button{background:#8fff00;color:#232220;border:0;border-radius:8px;padding:12px 15px;font:700 13px system-ui,sans-serif;cursor:pointer;min-height:44px}'+
      '.erp-print-value{display:block;min-height:18px;padding:6px 0;font-weight:600;white-space:pre-wrap;overflow-wrap:anywhere}'+
      '.erp-print-score{padding:9px 18px 14px;font-size:12px;font-weight:700;color:#252320}'+
      '.print-only{display:block!important}.print-header{display:flex!important}'+
      '.container,.pdf-doc{max-width:950px!important;width:100%!important;margin:0 auto!important}'+
      '.card,.header,.section{break-inside:avoid}'+
      '@page{size:A4;margin:12mm}'+
      '@media print{.erp-print-tools{display:none!important}'+
      'body>.erp-print-tools{display:none!important}'+
      '.erp-print-root{display:block!important}'+
      '.container,.pdf-doc{max-width:100%!important;box-shadow:none!important}'+
      '.section,.psect{break-inside:avoid}}'+
      '</style></head><body>'+
      '<div class="erp-print-tools"><span>Visualização do documento</span>'+
      '<button type="button" onclick="window.print()">Imprimir / Salvar PDF</button></div>'+
      '<div class="erp-print-root" id="print-overlay"><div id="print-content">'+report+'</div></div>'+
      '</body></html>';
  }
  function open(options) {
    var html=build(options||{});
    var popup=null;
    try{popup=w.open("","_blank");}catch(_){}
    if(popup){
      popup.document.open();popup.document.write(html);popup.document.close();
      try{popup.opener=null;}catch(_){}
      popup.focus();return true;
    }
    /* Navegadores que bloqueiam novas abas: impressão de um iframe temporário. */
    var iframe=document.createElement("iframe");
    iframe.title="Documento para impressão";
    iframe.style.cssText="position:fixed;left:-9999px;top:0;width:850px;height:1100px;border:0";
    iframe.onload=function(){
      try{iframe.contentWindow.focus();iframe.contentWindow.print();}
      catch(e){w.alert("Não foi possível abrir a impressão. Habilite a impressão neste navegador.");}
      setTimeout(function(){iframe.remove();},15000);
    };
    document.body.appendChild(iframe);
    iframe.srcdoc=html;
    return false;
  }
  w.ERPPrint={open:open,snapshot:snapshot};
})(window);
