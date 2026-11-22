/* Indicadores e visuais de planejamento, calculados a partir do cenário aberto. */
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./planning-core.js'):root.Planning);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PlanningDashboards=api;
})(typeof window!=='undefined'?window:globalThis,function(P){
  'use strict';
  const E=P.esc,M=P.money,R=P.round;
  const sum=(rows,key)=>R(rows.reduce((total,row)=>total+row[key],0));
  const pct=(value,total)=>total?R(value/total*100):0;
  const month=m=>new Intl.DateTimeFormat('pt-BR',{month:'short',timeZone:'UTC'}).format(new Date(m+'-01T12:00:00Z')).replace('.','');
  const date=s=>s.split('-').reverse().join('/');
  function headcountSummary(data,events,policy,unit='',selectedMonth='2027-01'){
    const projections=P.project(data,events,policy,unit),baseline=P.project(data,[],policy,unit);
    const selected=projections.find(p=>p.month===selectedMonth)||projections[0],last=projections.at(-1);
    const annualCost=sum(projections,'cost'),annualBudget=sum(projections,'budget'),baseCost=sum(baseline,'cost');
    const firstOver=projections.find(p=>p.cost>p.budget),peak=projections.reduce((a,p)=>p.cost>a.cost?p:a,projections[0]);
    const units=data.unidades.filter(u=>!unit||u.id===unit).map(u=>{
      const rows=selected.rows.filter(p=>p.unidade_id===u.id);
      return {...u,cost:R(rows.reduce((n,p)=>n+p.custo,0)),occupied:rows.filter(p=>p.ocupada).length,approved:rows.filter(p=>p.aprovada).length};
    });
    return {projections,baseline,selected,last,annualCost,annualBudget,annualBalance:R(annualBudget-annualCost),annualDelta:R(annualCost-baseCost),firstOver:firstOver?.month||null,peak,units,occupation:pct(selected.headcount,selected.approved)};
  }
  function careerSummary(data,nominations=data.sucessao){
    const people=data.pessoas.map(p=>{
      const record=data.custos_pessoas.find(c=>c.pessoa_id===p.id),job=P.lookup(data.cargos,p.cargo_id),range=P.band(data,job.id,record.salario_base);
      const status=record.salario_base<range.minimo?'below':record.salario_base>range.maximo?'above':'within';
      return {...p,salary:record.salario_base,range,status};
    });
    const salaryCounts={below:0,within:0,above:0};people.forEach(p=>salaryCounts[p.status]++);
    const critical=data.posicoes.filter(p=>p.critica),criticalIds=new Set(critical.map(p=>p.id));
    const indications=nominations.filter(n=>criticalIds.has(n.posicao_alvo_id));
    const covered=new Set(indications.map(n=>n.posicao_alvo_id)).size;
    const readiness=[{id:'pronto_para_discussao',label:'Pronto para discussão'},{id:'em_desenvolvimento_ate_12_meses',label:'Até 12 meses'},{id:'em_desenvolvimento_12_24_meses',label:'12 a 24 meses'}].map(r=>({...r,count:indications.filter(n=>n.prontidao===r.id).length}));
    const proposals=data.acomodacoes_propostas.filter(a=>a.status==='em_estudo').map(a=>{
      const base=data.custos_pessoas.find(c=>c.pessoa_id===a.pessoa_id);
      return {...a,person:P.lookup(data.pessoas,a.pessoa_id),job:P.lookup(data.cargos,a.cargo_proposto_id),delta:R(P.payrollCost({...base,salario_base:a.salario_proposto},data.encargos_base).total-P.payrollCost(base,data.encargos_base).total)};
    });
    const families=[...new Set(data.cargos.map(j=>j.familia))].map(name=>({name,jobs:data.cargos.filter(j=>j.familia===name).length,people:people.filter(p=>P.lookup(data.cargos,p.cargo_id).familia===name).length}));
    const agenda=[...indications.map(n=>({date:n.data_revisao,type:'Revisão de sucessão',personId:n.candidato_pessoa_id,positionId:n.posicao_alvo_id,label:P.lookup(data.pessoas,n.candidato_pessoa_id).nome,screen:'sucessao'})),...data.planos_desenvolvimento.filter(a=>a.status!=='concluido').map(a=>({date:a.prazo,type:'Plano de desenvolvimento',personId:a.pessoa_id,label:a.acao,screen:'desenvolvimento'}))].sort((a,b)=>a.date.localeCompare(b.date));
    return {people,salaryCounts,critical,indications,covered,coverage:pct(covered,critical.length),readiness,proposals,proposalDelta:sum(proposals,'delta'),families,agenda,reference:data.meta.gerado_em};
  }
  const action=(label,screen,extra='')=>`<button type="button" class="small" data-open-screen="${E(screen)}" ${extra}>${E(label)}</button>`;
  function card(title,description,body,screen,label='Abrir análise'){
    return `<section class="panel dashboard-card"><div class="panel-head"><div><h3>${E(title)}</h3><p>${E(description)}</p></div>${screen?action(label,screen):''}</div>${body}</section>`;
  }
  function stat(label,value,note,screen,accent=false){return `<button type="button" class="metric${accent?' accent':''}" data-open-screen="${E(screen)}"><span>${E(label)}</span><strong>${E(value)}</strong><small>${E(note)}</small></button>`;}
  function lines(series,max,width=850,height=215){
    const left=66,right=20,top=20,bottom=height-26,span=width-left-right;
    const y=value=>bottom-(value/max)*(bottom-top);
    return {left,right,top,bottom,span,y,path:values=>values.map((v,i)=>(i?'L':'M')+(left+i*span/11).toFixed(2)+','+y(v).toFixed(2)).join(' ')};
  }
  function costChart(summary){
    const rows=summary.projections,base=summary.baseline,max=Math.max(1,...rows.flatMap(p=>[p.cost,p.budget]),...base.map(p=>p.cost))*1.12,geometry=lines(rows,max);
    const {left,right,bottom,span,y,path}=geometry;
    const marks=[0,.5,1].map(p=>{const v=max*p;return `<line x1="${left}" x2="${850-right}" y1="${y(v)}" y2="${y(v)}" class="dash-grid-line"/><text x="${left-8}" y="${y(v)+4}" text-anchor="end">${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(v/1000)} mil</text>`;}).join('');
    const selectedIndex=rows.findIndex(p=>p.month===summary.selected.month),cx=left+selectedIndex*span/11;
    return `<div class="dashboard-legend"><span><i class="legend-scenario"></i>Cenário</span><span><i class="legend-baseline"></i>Quadro atual constante</span><span><i class="legend-budget"></i>Orçamento de referência</span></div><div class="dashboard-chart-scroll"><div class="dashboard-plot"><svg viewBox="0 0 850 215" role="img" aria-labelledby="cost-chart-title cost-chart-description"><title id="cost-chart-title">Projeção mensal de custos em 2027</title><desc id="cost-chart-description">Custos do cenário, quadro constante e orçamento mensal. Os valores exatos estão na tabela de projeção anual.</desc>${marks}<line x1="${cx}" x2="${cx}" y1="20" y2="${bottom}" class="dash-selected-line"/><path d="${path(rows.map(p=>p.budget))}" class="dash-line budget"/><path d="${path(base.map(p=>p.cost))}" class="dash-line baseline"/><path d="${path(rows.map(p=>p.cost))}" class="dash-line scenario"/>${rows.map((p,i)=>`<circle cx="${left+i*span/11}" cy="${y(p.cost)}" r="${i===selectedIndex?5:3}" class="dash-point"><title>${month(p.month)}/2027 · ${M(p.cost)}</title></circle>`).join('')}</svg><div class="dashboard-months">${rows.map(p=>`<button type="button" data-dashboard-month="${p.month}" aria-pressed="${p.month===summary.selected.month}" aria-label="Selecionar ${month(p.month)} de 2027">${month(p.month)}</button>`).join('')}</div></div></div>`;
  }
  function hcChart(summary){
    const max=Math.max(1,...summary.projections.map(p=>Math.max(p.headcount,p.approved)));
    return `<div class="dashboard-chart-scroll"><div class="dashboard-hc-chart">${summary.projections.map(p=>`<button type="button" class="dashboard-hc-column" data-dashboard-month="${p.month}" aria-pressed="${p.month===summary.selected.month}" aria-label="${month(p.month)}: ${p.headcount} pessoas de ${p.approved} posições aprovadas"><span class="hc-value">${p.headcount}</span><span class="hc-track" style="height:130px"><i class="hc-approved" style="height:${p.approved/max*100}%"></i><i class="hc-occupied" style="height:${p.headcount/max*100}%"></i></span><span>${month(p.month)}</span></button>`).join('')}</div></div><p class="muted">Pessoas projetadas em vermelho; capacidade aprovada em cinza. Dezembro: ${summary.last.headcount} pessoas em ${summary.last.approved} posições.</p>`;
  }
  function createHeadcount(data,{getState,selectMonth}){
    const root=document.getElementById('headcount-dashboard');
    function render(){
      const state=getState(),s=headcountSummary(data,state.events,state.policy,state.unit,state.month),b=s.selected.breakdown;
      const groups=[{name:'Remuneração',value:b.remuneration,color:'#c71717'},{name:'Encargos do mês',value:b.employerCharges,color:'#303b35'},{name:'Provisões e reflexos',value:R(b.provisions+b.provisionCharges),color:'#557b29'},{name:'Benefícios líquidos',value:b.netBenefits,color:'#8ba89b'},{name:'Outras despesas',value:b.other,color:'#b79e82'}];
      const unitsMax=Math.max(1,...s.units.map(u=>u.cost));
      const first=s.firstOver?`A partir de ${month(s.firstOver)}/2027, o custo mensal supera a referência de orçamento.`:'O cenário permanece dentro do orçamento mensal de referência nos 12 meses.';
      const alerts=`<div class="dashboard-insight ${s.firstOver?'is-warning':''}" id="budget-outlook" data-first-over="${s.firstOver||''}"><span class="eyebrow">Leitura do cenário</span><h3>${s.firstOver?'Pressão de orçamento prevista':'Orçamento com margem no horizonte'}</h3><p>${E(first)}</p><dl class="dashboard-summary"><div><dt>Custo anual projetado</dt><dd>${M(s.annualCost)}</dd></div><div><dt>Impacto anual das movimentações</dt><dd>${M(s.annualDelta)}</dd></div><div><dt>Saldo anual da referência</dt><dd>${M(s.annualBalance)}</dd></div><div><dt>Vagas aprovadas em dezembro</dt><dd>${s.last.vacancies}</dd></div></dl>${action('Revisar movimentações','movimentacoes')}</div>`;
      const split=`<div class="dashboard-segments" role="img" aria-label="Distribuição do custo: ${E(groups.map(g=>g.name+' '+M(g.value)).join('; '))}">${groups.filter(g=>g.value>0).map(g=>`<span style="width:${pct(g.value,s.selected.cost)}%;background:${g.color}"></span>`).join('')}</div><ul class="dashboard-values">${groups.map(g=>`<li><span><i style="background:${g.color}"></i>${E(g.name)}</span><strong>${M(g.value)} <small>${pct(g.value,s.selected.cost)}%</small></strong></li>`).join('')}</ul>`;
      const units=`<div class="dashboard-bars">${s.units.map(u=>`<button type="button" class="dashboard-bar-row" data-open-screen="quadro"><span>${E(u.nome)}<small>${u.occupied} pessoas · ${u.approved} posições aprovadas</small></span><strong>${M(u.cost)}</strong><i class="dashboard-bar-track"><i style="width:${u.cost/unitsMax*100}%"></i></i></button>`).join('')}</div>`;
      root.innerHTML=`<div class="dashboard-grid">${card('Custos no horizonte de 2027','Selecione um mês no gráfico para atualizar os indicadores.',costChart(s),'projecao','Abrir projeção')}${alerts}${card('Evolução do quadro','Ocupação prevista ao longo dos meses.',hcChart(s),'quadro','Consultar quadro')}${card('Composição do custo · '+month(s.selected.month)+'/2027','Participação de cada componente no custo do mês.',split,'composicao','Detalhar custos')}${card('Custo por unidade','Distribuição na unidade e no mês dos filtros.',units,'quadro','Consultar posições')}</div>`;
      const destinations=['quadro','quadro','composicao','projecao'];
      document.querySelectorAll('#metrics .metric').forEach((old,i)=>{
        if(old.tagName==='BUTTON')return;
        const button=document.createElement('button');button.type='button';button.className=old.className;button.innerHTML=old.innerHTML;button.dataset.openScreen=destinations[i];old.replaceWith(button);
      });
    }
    root.addEventListener('click',event=>{const button=event.target.closest('[data-dashboard-month]');if(button)selectMonth(button.dataset.dashboardMonth);});
    render();return {render};
  }
  function createCareer(data,{getNominations}){
    const root=document.getElementById('career-dashboard');
    function render(){
      const s=careerSummary(data,getNominations()),counts=s.salaryCounts;
      document.getElementById('career-metrics').innerHTML=stat('Enquadramentos a revisar',counts.below+counts.above,`${counts.below} abaixo · ${counts.above} acima da faixa`,'acomodacao')+stat('Posições críticas com indicação',s.covered+'/'+s.critical.length,`${s.coverage}% com candidato registrado`,'sucessao',true)+stat('Acomodações em estudo',s.proposals.length,`Impacto mensal proposto: ${M(s.proposalDelta)}`,'acomodacao')+stat('Ações de desenvolvimento',data.planos_desenvolvimento.filter(p=>p.status!=='concluido').length,'Prazos e ações para acompanhamento','desenvolvimento');
      const statuses={below:{label:'Abaixo da faixa',color:'#c71717'},within:{label:'Dentro da faixa',color:'#557b29'},above:{label:'Acima da faixa',color:'#a36411'}};
      const segment=`<div class="dashboard-segments" role="img" aria-label="${counts.below} abaixo, ${counts.within} dentro e ${counts.above} acima da faixa">${Object.entries(statuses).map(([key,st])=>`<span style="width:${pct(counts[key],s.people.length)}%;background:${st.color}"></span>`).join('')}</div><div class="dashboard-legend">${Object.entries(statuses).map(([key,st])=>`<span><i style="background:${st.color}"></i>${st.label}: ${counts[key]}</span>`).join('')}</div>`;
      const bands=`<div class="salary-bands">${s.people.map(p=>{
        const domainMin=Math.min(p.range.minimo*.8,p.salary*.9),domainMax=Math.max(p.range.maximo*1.15,p.salary*1.1),width=domainMax-domainMin;
        const start=(p.range.minimo-domainMin)/width*100,end=(p.range.maximo-domainMin)/width*100,point=(p.salary-domainMin)/width*100;
        return `<button type="button" class="salary-band-row" data-dashboard-person="${p.id}" data-open-screen="acomodacao" aria-label="Analisar ${E(p.nome)}: ${E(statuses[p.status].label)}"><span>${E(p.nome)}<small>${E(p.cargo)}</small></span><strong>${M(p.salary)}</strong><span class="salary-band-track" aria-hidden="true"><i class="salary-band-range" style="left:${start}%;width:${end-start}%"></i><i class="salary-band-marker" style="left:${point}%;background:${statuses[p.status].color}"></i></span><small class="salary-band-caption">Faixa: ${M(p.range.minimo)} a ${M(p.range.maximo)} · ${statuses[p.status].label}</small></button>`;
      }).join('')}</div>`;
      const readiness=`<div class="dashboard-insight compact"><strong>${s.covered} de ${s.critical.length} posições críticas com indicação</strong><p class="muted">${s.readiness[0].count} candidato(s) registrado(s) como pronto(s) para discussão. Indicação e prontidão são analisadas separadamente.</p></div><div class="dashboard-bars">${s.readiness.map(r=>`<div class="dashboard-bar-row"><span>${r.label}</span><strong>${r.count}</strong><i class="dashboard-bar-track"><i style="width:${pct(r.count,s.indications.length)}%"></i></i></div>`).join('')}</div>${s.critical.length>s.covered?`<p class="dashboard-warning">${s.critical.length-s.covered} posição(ões) crítica(s) sem candidato registrado.</p>`:''}`;
      const max=Math.max(1,...s.families.map(f=>Math.max(f.jobs,f.people)));
      const families=`<div class="dashboard-legend"><span><i class="legend-scenario"></i>Cargos no catálogo</span><span><i class="legend-baseline"></i>Pessoas no quadro</span></div><div class="dashboard-bars">${s.families.map(f=>`<button type="button" class="dashboard-bar-row" data-open-screen="estrutura"><span>${E(f.name)}</span><strong>${f.jobs} cargos · ${f.people} pessoa(s)</strong><span class="dashboard-dual-bars" aria-hidden="true"><i style="width:${f.jobs/max*100}%"></i><i style="width:${f.people/max*100}%"></i></span></button>`).join('')}</div>`;
      const proposals=`<p class="dashboard-highlight">${M(s.proposalDelta)}<span>de impacto mensal nas propostas em estudo</span></p><div class="dashboard-proposals">${s.proposals.map(p=>`<button type="button" data-dashboard-person="${p.pessoa_id}" data-dashboard-job="${p.cargo_proposto_id}" data-dashboard-salary="${p.salario_proposto}" data-open-screen="acomodacao"><strong>${E(p.person.nome)}</strong><span>${E(p.job.nome)}</span><small>Salário proposto: ${M(p.salario_proposto)} · impacto: ${M(p.delta)}/mês</small></button>`).join('')||'<p class="muted">Sem propostas em estudo.</p>'}</div>`;
      const agenda=`<ul class="dashboard-agenda">${s.agenda.map(a=>`<li><button type="button" data-dashboard-candidate="${a.personId}" ${a.positionId?`data-dashboard-position="${a.positionId}"`:''} data-open-screen="${a.screen}"><time datetime="${a.date}">${date(a.date)}</time><span><small>${E(a.type)}</small><strong>${E(a.label)}</strong></span></button></li>`).join('')||'<li class="muted">Sem revisões ou entregas previstas.</li>'}</ul>`;
      root.innerHTML=`<p class="muted dashboard-reference">Estrutura e faixas do cadastro atual · referência ${date(s.reference)}. Os impactos abaixo correspondem às propostas em estudo.</p><div class="dashboard-grid">${card('Enquadramento salarial','Selecione uma pessoa para analisar seu enquadramento.',segment+bands,'acomodacao','Analisar faixas')}${card('Sucessão e horizontes de prontidão','Candidatos registrados para as posições críticas.',readiness,'sucessao','Gerir sucessão')}${card('Estrutura por família','Catálogo de cargos e distribuição das pessoas.',families,'estrutura','Explorar estrutura')}${card('Impacto das acomodações','Valores com os parâmetros iniciais de encargos e provisões.',proposals,'acomodacao','Revisar propostas')}${card('Revisões e entregas previstas','Agenda dos registros de sucessão e desenvolvimento.',agenda,'desenvolvimento','Acompanhar planos')}</div>`;
    }
    root.addEventListener('click',event=>{
      const person=event.target.closest('[data-dashboard-person]');
      if(person){
        window.PlanningWorkspace.show('acomodacao');
        const p=P.lookup(data.pessoas,person.dataset.dashboardPerson),select=document.getElementById('person');
        select.value=p.id;select.dispatchEvent(new Event('change',{bubbles:true}));
        const target=document.getElementById('target');target.value=person.dataset.dashboardJob||p.cargo_id;target.dispatchEvent(new Event('change',{bubbles:true}));
        document.getElementById('salary').value=person.dataset.dashboardSalary||data.custos_pessoas.find(c=>c.pessoa_id===p.id).salario_base;
        document.getElementById('simulate').click();
      }
      const candidate=event.target.closest('[data-dashboard-candidate]');
      if(candidate){
        document.getElementById('candidate').value=candidate.dataset.dashboardCandidate;
        if(candidate.dataset.dashboardPosition)document.getElementById('critical').value=candidate.dataset.dashboardPosition;
        document.getElementById('candidate').dispatchEvent(new Event('change',{bubbles:true}));
      }
    });
    render();return {render};
  }
  return {headcountSummary,careerSummary,headcount:createHeadcount,career:createCareer};
});
