(async function () {
  'use strict';
  const P=window.Planning,$=id=>document.getElementById(id),E=P.esc,M=P.money,container=$('app');
  try {
    const d=await P.load();
    let events=[],scenarioId='CEN_BASE',policy=P.copy(d.encargos_base||P.payrollDefaults),dashboard=null;
    const job=id=>P.lookup(d.cargos,id)?.nome||id,person=id=>P.lookup(d.pessoas,id)?.nome||'Admissão planejada';
    const opt=(value,text)=>`<option value="${E(value)}">${E(text)}</option>`;
    const months=Array.from({length:12},(_,i)=>`2027-${String(i+1).padStart(2,'0')}`);
    const monthName=m=>new Intl.DateTimeFormat('pt-BR',{month:'short',timeZone:'UTC'}).format(new Date(m+'-01T12:00:00Z')).replace('.','');
    const numberField=(label,id,value,max=100)=>`<label>${label}<input id="${id}" type="number" min="0" max="${max}" step="0.01" value="${value}" required></label>`;
    container.innerHTML=`
      <div class="toolbar">
        <label>Cenário<select id="scenario">${d.cenarios.map(s=>opt(s.id,s.nome)).join('')}</select></label>
        <label>Unidade<select id="unit">${opt('','Todas as unidades')}${d.unidades.map(u=>opt(u.id,u.nome)).join('')}</select></label>
        <label>Mês de acompanhamento<select id="month">${months.map(m=>opt(m,monthName(m)+'/2027')).join('')}</select></label>
      </div>
      <details class="panel" open><summary><strong>Encargos e reflexos de folha</strong></summary>
        <p class="muted">Parâmetros de custeio CLT. Ajuste as alíquotas ao regime, FPAS e enquadramento da operação. Os parâmetros se aplicam a todas as posições do cenário.</p>
        <form id="payroll-policy">
          <div class="policy-grid">
            ${numberField('CPP / INSS patronal (%)','cpp',policy.cpp)}
            ${numberField('RAT (%)','rat',policy.rat)}
            <label>FAP (multiplicador)<input id="fap" type="number" min="0.5" max="2" step="0.0001" value="${policy.fap}" required></label>
            ${numberField('Terceiros (%)','thirdParty',policy.thirdParty)}
            ${numberField('FGTS (%)','fgts',policy.fgts)}
          </div>
          <div class="actions"><label class="check-label"><input id="include13" type="checkbox" ${policy.include13?'checked':''}> Incluir provisão de 13º e encargos</label><label class="check-label"><input id="includeVacation" type="checkbox" ${policy.includeVacation?'checked':''}> Incluir férias, terço e encargos</label></div>
          <div class="actions"><button class="primary" type="submit">Aplicar parâmetros</button><button type="button" id="reset-policy">Restaurar parâmetros</button></div>
          <p id="policy-message" class="live" role="status" aria-live="polite"></p>
        </form>
      </details>
      <p id="premise" class="muted"></p><div class="metrics" id="metrics"></div>
      <section class="panel" aria-labelledby="breakdown-title"><div class="panel-head"><div><h2 id="breakdown-title">Composição do custo no mês</h2><p>Remuneração, encargos, provisões e benefícios conciliados com o total.</p></div><button id="export-breakdown">Exportar composição CSV</button></div><div class="columns"><div id="breakdown" class="table-wrap"></div><div id="cost-notes"></div></div></section>
      <section class="panel" aria-labelledby="forecast-title">
        <div class="panel-head"><div><h2 id="forecast-title">Projeção de custos · 2027</h2><p>O mês selecionado aparece em verde. Visão de custo por competência, com provisões mensalizadas.</p></div><button id="export">Exportar projeção CSV</button></div>
        <div id="chart" class="chart" aria-hidden="true"></div><p id="annual" class="chart-note"></p>
        <details><summary>Conferir os 12 meses</summary><div id="forecast" class="table-wrap"></div></details>
      </section>
      <div class="columns">
        <section class="panel" aria-labelledby="movement-title"><h2 id="movement-title">Simular movimentação</h2><p class="muted">Escolha a movimentação e preencha o pacote mensal. O filtro de unidade só altera a visualização.</p>
          <form id="movement" class="form-grid">
            <label>Tipo<select id="type">${opt('admissao_planejada','Admissão em posição aprovada')}${opt('ajuste_planejado','Ajuste salarial')}${opt('pacote_planejado','Benefícios e verbas variáveis')}${opt('desligamento_planejado','Saída planejada')}</select></label>
            <label>Mês de vigência<select id="effective">${months.map(m=>opt(m,monthName(m)+'/2027')).join('')}</select></label>
            <label id="position-label" class="span-all">Posição aprovada e vaga<select id="position">${d.posicoes.filter(p=>p.aprovada&&!p.ocupante_id).map(p=>opt(p.id,`${p.id} · ${job(p.cargo_id)} · ${P.lookup(d.unidades,p.unidade_id).nome}`)).join('')}</select></label>
            <label id="person-label" class="span-all" hidden>Pessoa<select id="person">${d.pessoas.map(p=>opt(p.id,p.nome)).join('')}</select></label>
            <label id="salary-label">Salário mensal (R$)<input id="salary" type="number" min="0.01" max="1000000" step="0.01" value="4800" required></label>
            <label class="package-field">Benefícios brutos / mês (R$)<input id="benefits" type="number" min="0" max="1000000" step="0.01" value="900" required></label>
            <label class="package-field">Participação do colaborador nos benefícios (R$)<input id="benefit-share" type="number" min="0" max="1000000" step="0.01" value="0" required></label>
            <label class="package-field">Médias remuneratórias / mês (R$)<input id="variables" type="number" min="0" max="1000000" step="0.01" value="0" required></label>
            <label class="package-field">Outras despesas / mês (R$)<input id="other" type="number" min="0" max="1000000" step="0.01" value="0" required></label>
            <p class="span-all muted package-field">Use o total de VT, VA/VR, saúde e demais benefícios sem natureza salarial. Informe em médias remuneratórias os valores já apurados de horas extras, DSR e adicionais que integram remuneração, 13º e férias.</p>
            <div class="span-all"><button class="primary" type="submit">Adicionar ao cenário</button><p id="form-message" class="live" role="status" aria-live="polite"></p></div>
          </form>
        </section>
        <section class="panel" aria-labelledby="events-title"><div class="panel-head"><h2 id="events-title">Movimentações do cenário</h2><button id="reset" class="small">Restaurar cenário</button></div><p class="muted">Remover uma hipótese recalcula todos os meses.</p><ul id="events" class="event-list"></ul></section>
      </div>
      <section class="panel" aria-labelledby="positions-title"><h2 id="positions-title">Quadro e custo por posição</h2><p class="muted">Posições em proposta aparecem no quadro, fora do total aprovado.</p><div id="positions" class="table-wrap"></div></section>
      <p class="footer">Conecte as decisões de quadro à <a href="../carreira/?tela=estrutura">estrutura de cargos e carreira</a>. As alterações reiniciam ao recarregar a página e não são sincronizadas entre abas.</p>`;
    container.setAttribute('aria-busy','false');
    const components=[['salary','Salários'],['variables','Médias remuneratórias'],['cpp','CPP / INSS patronal'],['rat','RAT × FAP'],['thirdParty','Terceiros'],['fgts','FGTS'],['thirteenth','Provisão de 13º · 1/12'],['vacation','Provisão de férias · 1/12'],['vacationThird','Terço de férias · 1/36'],['vacationOffset','Remuneração de férias já incluída nos salários',-1],['provisionCharges','Encargos sobre provisões líquidas'],['grossBenefits','Benefícios brutos'],['benefitDeduction','Participação do colaborador nos benefícios',-1],['other','Outras despesas']];
    const projection=()=>P.project(d,events,policy,$('unit').value);
    const current=()=>projection().find(p=>p.month===$('month').value);
    function metric(title,value,note,accent=false){return `<div class="metric${accent?' accent':''}"><span>${E(title)}</span><strong>${E(value)}</strong><small>${E(note)}</small></div>`;}
    function eventText(e){
      if(e.tipo==='admissao_planejada')return `Admissão · ${e.posicao_id} · ${job(P.lookup(d.posicoes,e.posicao_id).cargo_id)} · ${M(e.salario_base)} · benefícios líquidos ${M((e.beneficios_brutos??e.beneficios_empresa)-(e.coparticipacao_beneficios??0))}`;
      if(e.tipo==='pacote_planejado')return `Pacote mensal · ${person(e.pessoa_id)} · benefícios líquidos ${M(e.beneficios_brutos-e.coparticipacao_beneficios)} · médias ${M(e.medias_remuneratorias)}`;
      return `${e.tipo==='ajuste_planejado'?'Ajuste salarial':'Saída'} · ${person(e.pessoa_id)}${e.tipo==='ajuste_planejado'?' · '+M(e.novo_salario_base):''}`;
    }
    function render(){
      const projections=projection(),selected=projections.find(p=>p.month===$('month').value),b=selected.breakdown;
      const baseline=P.snapshot(d,[],selected.month,policy,$('unit').value),delta=P.round(selected.cost-baseline.cost);
      $('premise').textContent=`${P.lookup(d.cenarios,scenarioId).nome} · ${events.length} movimentação(ões). Orçamento de referência: novembro/2026, constante em 2027. Encargos do mês: ${P.round(policy.cpp+policy.rat*policy.fap+policy.thirdParty+policy.fgts)}% da remuneração, antes das provisões.`;
      $('metrics').innerHTML=metric('Quadro aprovado',selected.approved,`${selected.proposed} posição(ões) em proposta`)+metric('Pessoas no mês',selected.headcount,`${selected.vacancies} posição(ões) aprovada(s) vaga(s)`)+metric('Custo mensal projetado',M(selected.cost),`Variação sobre base: ${M(delta)}`,true)+metric('Saldo do orçamento',M(selected.budget-selected.cost),`Referência mensal: ${M(selected.budget)}`);
      $('breakdown').innerHTML=`<table><caption>Composição de ${monthName(selected.month)}/2027 · ${E($('unit').selectedOptions[0].textContent)}.</caption><thead><tr><th>Componente</th><th class="num">Valor</th></tr></thead><tbody>${components.map(([key,label,sign=1])=>`<tr><td>${E(label)}</td><td class="num">${M(b[key]*sign)}</td></tr>`).join('')}<tr><th>Total do mês</th><th class="num">${M(b.total)}</th></tr></tbody></table>`;
      $('cost-notes').innerHTML=`<div class="path"><strong>Benefícios líquidos da empresa</strong><p>${M(b.grossBenefits)} em benefícios − ${M(b.benefitDeduction)} de participação = <strong>${M(b.netBenefits)}</strong></p><p class="muted">A participação reduz o custo do benefício. A base de encargos permanece a remuneração bruta.</p></div><div class="path"><strong>Férias sem duplicar salários</strong><p class="muted">Os 12 salários já incluem a remuneração do mês de férias. A provisão de férias aparece integralmente e essa remuneração é compensada no total; o terço é acrescentado. O mesmo ajuste vale para os encargos.</p></div><div class="path"><strong>Reflexos sobre as provisões</strong><p class="muted">CPP: ${M(b.provisionCpp)} · RAT/FAP: ${M(b.provisionRat)} · Terceiros: ${M(b.provisionThirdParty)} · FGTS: ${M(b.provisionFgts)}</p><p class="muted">Visão de custo mensalizado, sem calendário de desembolso, saldo acumulado de provisões ou cálculo rescisório.</p></div>`;
      const max=Math.max(1,...projections.map(p=>p.cost));
      $('chart').innerHTML=projections.map(p=>`<div class="chart-col${p.month===selected.month?' selected':''}"><div class="chart-bar" style="height:${Math.max(2,p.cost/max*175)}px"></div><span>${monthName(p.month)}</span></div>`).join('');
      $('annual').textContent=`Custo anual projetado: ${M(projections.reduce((a,p)=>a+p.cost,0))}. Saldo anual frente à referência: ${M(projections.reduce((a,p)=>a+p.budget-p.cost,0))}.`;
      $('forecast').innerHTML=`<table><caption>Custo por competência com provisões mensalizadas; não representa o fluxo de caixa.</caption><thead><tr><th>Mês</th><th class="num">Pessoas</th><th class="num">Remuneração</th><th class="num">Encargos do mês</th><th class="num">Provisões líquidas</th><th class="num">Encargos sobre provisões</th><th class="num">Benefícios líquidos</th><th class="num">Custo total</th><th class="num">Saldo</th></tr></thead><tbody>${projections.map(p=>`<tr><td>${monthName(p.month)}/2027</td><td class="num">${p.headcount}</td>${['remuneration','employerCharges','provisions','provisionCharges','netBenefits'].map(k=>`<td class="num">${M(p.breakdown[k])}</td>`).join('')}<td class="num">${M(p.cost)}</td><td class="num">${M(p.budget-p.cost)}</td></tr>`).join('')}</tbody></table>`;
      $('events').innerHTML=events.length?events.map((e,i)=>`<li><div><p>${E(eventText(e))}</p><span class="muted">Vigência: ${E(e.vigencia.slice(0,7))} · mês integral</span></div><button class="small" data-remove="${i}" aria-label="Remover ${E(eventText(e))}">Remover</button></li>`).join(''):'<li class="muted">Sem movimentações. O quadro atual permanece constante.</li>';
      $('positions').innerHTML=`<table><caption>Quadro de ${monthName(selected.month)}/2027.</caption><thead><tr><th>Posição / cargo</th><th>Unidade</th><th>Ocupação</th><th>Status</th><th class="num">Remuneração</th><th class="num">Encargos</th><th class="num">Provisões líquidas</th><th class="num">Reflexos</th><th class="num">Benefícios líquidos</th><th class="num">Outras despesas</th><th class="num">Custo / mês</th></tr></thead><tbody>${selected.rows.map(p=>`<tr><td>${E(p.id)} · ${E(job(p.cargo_id))}<small>${E(P.lookup(d.centros_custo,p.centro_custo_id).nome)}</small></td><td>${E(P.lookup(d.unidades,p.unidade_id).nome)}</td><td>${p.ocupada?E(person(p.pessoa_planejada_id)):'Sem ocupante'}</td><td><span class="status ${!p.aprovada?'warn':p.ocupada?'good':''}">${!p.aprovada?'Em proposta':p.ocupada?'Ocupada':'Vaga aprovada'}</span></td>${['remuneration','employerCharges','provisions','provisionCharges','netBenefits','other'].map(k=>`<td class="num">${M(p.composicao[k])}</td>`).join('')}<td class="num">${M(p.custo)}</td></tr>`).join('')}</tbody></table>`;
      if(dashboard)dashboard.render();
    }
    function syncForm(){
      const type=$('type').value,hire=type==='admissao_planejada',salary=hire||type==='ajuste_planejado',pack=hire||type==='pacote_planejado';
      $('position-label').hidden=!hire;$('person-label').hidden=hire;$('salary-label').hidden=!salary;$('salary').disabled=!salary;
      document.querySelectorAll('.package-field').forEach(node=>{node.hidden=!pack;node.querySelectorAll('input').forEach(input=>input.disabled=!pack);});
      if(!hire){const c=d.custos_pessoas.find(c=>c.pessoa_id===$('person').value);$('salary').value=c.salario_base;$('benefits').value=c.beneficios_brutos??c.beneficios_empresa;$('benefit-share').value=c.coparticipacao_beneficios??0;$('variables').value=c.medias_remuneratorias??0;$('other').value=c.outras_despesas??0;}
      $('form-message').textContent='';
    }
    $('type').addEventListener('change',syncForm);$('person').addEventListener('change',syncForm);
    $('movement').addEventListener('submit',e=>{
      e.preventDefault();const type=$('type').value,event={tipo:type,vigencia:$('effective').value+'-01'};
      if(type==='admissao_planejada')Object.assign(event,{posicao_id:$('position').value,salario_base:Number($('salary').value)});
      else {event.pessoa_id=$('person').value;if(type==='ajuste_planejado')event.novo_salario_base=Number($('salary').value);}
      if(['admissao_planejada','pacote_planejado'].includes(type))Object.assign(event,{beneficios_brutos:Number($('benefits').value),coparticipacao_beneficios:Number($('benefit-share').value),medias_remuneratorias:Number($('variables').value),outras_despesas:Number($('other').value)});
      const error=P.validateEvent(d,events,event);if(error){$('form-message').textContent=error;return;}
      events.push(event);render();$('form-message').textContent='Hipótese adicionada. Custos e reflexos recalculados.';
    });
    $('events').addEventListener('click',e=>{const button=e.target.closest('[data-remove]');if(button){events.splice(Number(button.dataset.remove),1);render();$('form-message').textContent='Hipótese removida. Projeção recalculada.';}});
    function reset(){events=P.copy(P.lookup(d.cenarios,scenarioId).eventos);render();$('form-message').textContent='Cenário restaurado.';}
    $('scenario').addEventListener('change',()=>{scenarioId=$('scenario').value;reset();});$('reset').addEventListener('click',reset);
    ['unit','month'].forEach(id=>$(id).addEventListener('change',render));
    $('payroll-policy').addEventListener('submit',e=>{
      e.preventDefault();const next=Object.fromEntries(['cpp','rat','fap','thirdParty','fgts'].map(k=>[k,Number($(k).value)]));
      Object.assign(next,{include13:$('include13').checked,includeVacation:$('includeVacation').checked});
      const error=P.validatePayrollPolicy(next);if(error){$('policy-message').textContent=error;return;}
      policy=next;render();$('policy-message').textContent='Parâmetros aplicados. Todos os meses foram recalculados.';
    });
    $('payroll-policy').addEventListener('input',()=>{$('policy-message').textContent='Parâmetros alterados. Use Aplicar parâmetros para recalcular.';});
    $('reset-policy').addEventListener('click',()=>{policy=P.copy(d.encargos_base||P.payrollDefaults);['cpp','rat','fap','thirdParty','fgts'].forEach(k=>$(k).value=policy[k]);$('include13').checked=policy.include13;$('includeVacation').checked=policy.includeVacation;render();$('policy-message').textContent='Parâmetros restaurados.';});
    $('export').addEventListener('click',()=>P.csvDownload('headcount-projecao-2027.csv',['Cenario','Unidade','Mes','Headcount','Remuneracao BRL','CPP BRL','RAT FAP BRL','Terceiros BRL','FGTS BRL','Provisao 13 BRL','Ferias brutas BRL','Terco ferias BRL','Compensacao ferias BRL','Encargos provisoes BRL','Beneficios brutos BRL','Participacao colaborador BRL','Beneficios liquidos BRL','Outras despesas BRL','Custo total BRL','Orcamento referencia BRL','Saldo BRL','CPP %','RAT %','FAP','Terceiros %','FGTS %','Inclui 13','Inclui ferias'],projection().map(p=>[P.lookup(d.cenarios,scenarioId).nome,$('unit').selectedOptions[0].textContent,p.month,p.headcount,...['remuneration','cpp','rat','thirdParty','fgts','thirteenth','vacation','vacationThird','vacationOffset','provisionCharges','grossBenefits','benefitDeduction','netBenefits','other'].map(k=>p.breakdown[k]),p.cost,p.budget,P.round(p.budget-p.cost),policy.cpp,policy.rat,policy.fap,policy.thirdParty,policy.fgts,policy.include13?'Sim':'Não',policy.includeVacation?'Sim':'Não'])));
    $('export-breakdown').addEventListener('click',()=>{const p=current();P.csvDownload('headcount-composicao-'+p.month+'.csv',['Mes','Unidade','Componente','Valor BRL'],[...components.map(([key,label,sign=1])=>[p.month,$('unit').selectedOptions[0].textContent,label,P.round(p.breakdown[key]*sign)]),[p.month,$('unit').selectedOptions[0].textContent,'Total',p.cost]]);});
    const requested=new URLSearchParams(location.search).get('cenario');if(P.lookup(d.cenarios,requested)){scenarioId=requested;$('scenario').value=requested;events=P.copy(P.lookup(d.cenarios,requested).eventos);}
    syncForm();render();
    window.PlanningWorkspace.headcount();
    dashboard=window.PlanningDashboards.headcount(d,{getState:()=>({events,policy,unit:$('unit').value,month:$('month').value}),selectMonth:month=>{$('month').value=month;render();}});
  }catch(error){container.setAttribute('aria-busy','false');container.innerHTML=`<div class="error-box" role="alert"><h2>Não foi possível abrir o simulador</h2><p>${E(error.message)}</p><button onclick="location.reload()">Tentar novamente</button></div>`;}
})();
