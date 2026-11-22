(async function () {
  'use strict';
  const P = window.Planning, $ = id => document.getElementById(id), E = P.esc, M = P.money;
  const container = $('app');
  try {
    const d = await P.load();
    let events = [], scenarioId = 'CEN_BASE', activeFactor = 0.3;
    const job = id => P.lookup(d.cargos,id)?.nome || id;
    const person = id => P.lookup(d.pessoas,id)?.nome || 'Admissão planejada';
    const opt = (value,text) => `<option value="${E(value)}">${E(text)}</option>`;
    const months = Array.from({length:12},(_,i)=>`2027-${String(i+1).padStart(2,'0')}`);
    const monthName = m => new Intl.DateTimeFormat('pt-BR',{month:'short',timeZone:'UTC'}).format(new Date(m+'-01T12:00:00Z')).replace('.','');
    container.innerHTML = `
      <div class="toolbar">
        <label>Cenário<select id="scenario">${d.cenarios.map(s=>opt(s.id,s.nome)).join('')}</select></label>
        <label>Unidade<select id="unit">${opt('','Todas as unidades')}${d.unidades.map(u=>opt(u.id,u.nome)).join('')}</select></label>
        <label>Mês de acompanhamento<select id="month">${months.map(m=>opt(m,monthName(m)+'/2027')).join('')}</select></label>
        <label>Fator de custo simulado (%)<input id="factor" type="number" min="0" max="200" step="0.1" value="30" required></label>
      </div>
      <p id="premise" class="muted"></p><div class="metrics" id="metrics"></div>
      <section class="panel" aria-labelledby="forecast-title">
        <div class="panel-head"><div><h2 id="forecast-title">Projeção de custos · 2027</h2><p>O mês selecionado aparece em verde. Valores exatos na tabela abaixo.</p></div><button id="export">Exportar projeção CSV</button></div>
        <div id="chart" class="chart" aria-hidden="true"></div>
        <p id="annual" class="chart-note"></p>
        <details><summary>Conferir os 12 meses</summary><div id="forecast" class="table-wrap"></div></details>
      </section>
      <div class="columns">
        <section class="panel" aria-labelledby="movement-title"><h2 id="movement-title">Simular movimentação</h2><p class="muted">Aplique uma hipótese ao cenário aberto. O filtro de unidade só altera a visualização.</p>
          <form id="movement" class="form-grid">
            <label>Tipo<select id="type">${opt('admissao_planejada','Admissão em posição aprovada')}${opt('ajuste_planejado','Ajuste salarial')}${opt('desligamento_planejado','Saída planejada')}</select></label>
            <label>Mês de vigência<select id="effective">${months.map(m=>opt(m,monthName(m)+'/2027')).join('')}</select></label>
            <label id="position-label" class="span-all">Posição aprovada e vaga<select id="position">${d.posicoes.filter(p=>p.aprovada&&!p.ocupante_id).map(p=>opt(p.id,`${p.id} · ${job(p.cargo_id)} · ${P.lookup(d.unidades,p.unidade_id).nome}`)).join('')}</select></label>
            <label id="person-label" class="span-all" hidden>Pessoa<select id="person">${d.pessoas.map(p=>opt(p.id,p.nome)).join('')}</select></label>
            <label id="salary-label">Salário mensal (R$)<input id="salary" type="number" min="0.01" max="1000000" step="0.01" value="4800" required></label>
            <label id="benefits-label">Benefícios / mês (R$)<input id="benefits" type="number" min="0" max="1000000" step="0.01" value="900" required></label>
            <div class="span-all"><button class="primary" type="submit">Adicionar ao cenário</button><p id="form-message" class="live" role="status" aria-live="polite"></p></div>
          </form>
        </section>
        <section class="panel" aria-labelledby="events-title"><div class="panel-head"><h2 id="events-title">Movimentações do cenário</h2><button id="reset" class="small">Restaurar cenário</button></div><p class="muted">Remover uma hipótese recalcula todos os meses.</p><ul id="events" class="event-list"></ul></section>
      </div>
      <section class="panel" aria-labelledby="positions-title"><h2 id="positions-title">Quadro por posição</h2><p class="muted">Posições em proposta aparecem no quadro, fora do total aprovado. Uma admissão simulada não cria cadastro no GT360°.</p><div id="positions" class="table-wrap"></div></section>
      <p class="footer">Conecte as decisões de quadro à <a href="../carreira/">estrutura de cargos e carreira</a>. Valores salariais e orçamentos são ilustrativos.</p>`;
    container.setAttribute('aria-busy','false');
    function metric(title,value,note,accent=false) {return `<div class="metric${accent?' accent':''}"><span>${E(title)}</span><strong>${E(value)}</strong><small>${E(note)}</small></div>`;}
    function factor() {return activeFactor;}
    function projection() {return P.project(d,events,factor(),$('unit').value);}
    function eventText(e) {
      if(e.tipo==='admissao_planejada') return `Admissão · ${e.posicao_id} · ${job(P.lookup(d.posicoes,e.posicao_id).cargo_id)} · ${M(e.salario_base)}`;
      return `${e.tipo==='ajuste_planejado'?'Ajuste salarial':'Saída'} · ${person(e.pessoa_id)}${e.tipo==='ajuste_planejado'?' · '+M(e.novo_salario_base):''}`;
    }
    function render() {
      const projections = projection(), selected = projections.find(p=>p.month===$('month').value);
      const baseline = P.snapshot(d,[],selected.month,factor(),$('unit').value);
      const delta = P.round(selected.cost-baseline.cost), balance = P.round(selected.budget-selected.cost);
      $('premise').textContent = `${P.lookup(d.cenarios,scenarioId).nome}${events.length?' · '+events.length+' movimentação(ões) no cenário':''}. Orçamento de referência: novembro/2026, mantido constante em 2027.`;
      $('metrics').innerHTML = metric('Quadro aprovado',selected.approved,`${selected.proposed} posição(ões) em proposta`) + metric('Pessoas no mês',selected.headcount,`${selected.vacancies} posição(ões) aprovada(s) vaga(s)`) + metric('Custo mensal simulado',M(selected.cost),`Variação sobre base: ${M(delta)}`,true) + metric('Saldo do orçamento',M(balance),`Referência mensal: ${M(selected.budget)}`);
      const max = Math.max(1,...projections.map(p=>p.cost));
      $('chart').innerHTML = projections.map(p=>`<div class="chart-col${p.month===selected.month?' selected':''}"><div class="chart-bar" style="height:${Math.max(2,p.cost/max*175)}px"></div><span>${monthName(p.month)}</span></div>`).join('');
      $('annual').textContent = `Custo anual projetado: ${M(projections.reduce((a,p)=>a+p.cost,0))}. Saldo anual frente à referência: ${M(projections.reduce((a,p)=>a+p.budget-p.cost,0))}.`;
      $('forecast').innerHTML = `<table><caption>Projeção mensal; custos de pessoas, sem provisões.</caption><thead><tr><th>Mês</th><th class="num">Pessoas</th><th class="num">Custo</th><th class="num">Orçamento de referência</th><th class="num">Saldo</th></tr></thead><tbody>${projections.map(p=>`<tr><td>${monthName(p.month)}/2027</td><td class="num">${p.headcount}</td><td class="num">${M(p.cost)}</td><td class="num">${M(p.budget)}</td><td class="num">${M(p.budget-p.cost)}</td></tr>`).join('')}</tbody></table>`;
      $('events').innerHTML = events.length ? events.map((e,i)=>`<li><div><p>${E(eventText(e))}</p><span class="muted">Vigência: ${E(e.vigencia.slice(0,7))} · mês integral</span></div><button class="small" data-remove="${i}" aria-label="Remover ${E(eventText(e))}">Remover</button></li>`).join('') : '<li class="muted">Sem movimentações. O quadro atual permanece constante.</li>';
      $('positions').innerHTML = `<table><caption>Quadro de ${monthName(selected.month)}/2027 · ${E($('unit').selectedOptions[0].textContent)}.</caption><thead><tr><th>Posição / cargo</th><th>Unidade</th><th>Ocupação no cenário</th><th>Status</th><th class="num">Custo / mês</th></tr></thead><tbody>${selected.rows.map(p=>`<tr><td>${E(p.id)} · ${E(job(p.cargo_id))}<small>${E(P.lookup(d.centros_custo,p.centro_custo_id).nome)}</small></td><td>${E(P.lookup(d.unidades,p.unidade_id).nome)}</td><td>${p.ocupada?E(person(p.pessoa_planejada_id)):'Sem ocupante'}</td><td><span class="status ${!p.aprovada?'warn':p.ocupada?'good':''}">${!p.aprovada?'Em proposta':p.ocupada?'Ocupada':'Vaga aprovada'}</span></td><td class="num">${M(p.custo)}</td></tr>`).join('')}</tbody></table>`;
    }
    $('type').addEventListener('change',()=>{
      const hire = $('type').value==='admissao_planejada', exit=$('type').value==='desligamento_planejado';
      $('position-label').hidden=!hire; $('person-label').hidden=hire;
      $('salary-label').hidden=exit; $('salary').disabled=exit;
      $('benefits-label').hidden=!hire; $('benefits').disabled=!hire;
      $('form-message').textContent='';
    });
    $('movement').addEventListener('submit',e=>{
      e.preventDefault(); const type=$('type').value;
      const event={tipo:type,vigencia:$('effective').value+'-01'};
      if(type==='admissao_planejada') Object.assign(event,{posicao_id:$('position').value,salario_base:Number($('salary').value),beneficios_empresa:Number($('benefits').value)});
      else {event.pessoa_id=$('person').value;if(type==='ajuste_planejado')event.novo_salario_base=Number($('salary').value);}
      const error=P.validateEvent(d,events,event);
      if(error){$('form-message').textContent=error;return;}
      events.push(event); render(); $('form-message').textContent='Hipótese adicionada. Projeção recalculada.';
    });
    $('events').addEventListener('click',e=>{const button=e.target.closest('[data-remove]');if(button){events.splice(Number(button.dataset.remove),1);render();$('form-message').textContent='Hipótese removida. Projeção recalculada.';}});
    function reset(){events=P.copy(P.lookup(d.cenarios,scenarioId).eventos);render();$('form-message').textContent='Cenário restaurado.';}
    $('scenario').addEventListener('change',()=>{scenarioId=$('scenario').value;reset();});
    $('reset').addEventListener('click',reset);
    ['unit','month'].forEach(id=>$(id).addEventListener('change',render));
    $('factor').addEventListener('change',()=>{if(!$('factor').checkValidity()||$('factor').value===''){$('factor').reportValidity();return;}activeFactor=Number($('factor').value)/100;render();});
    $('export').addEventListener('click',()=>{
      if(!$('factor').checkValidity()||$('factor').value===''){$('factor').reportValidity();return;}
      P.csvDownload('headcount-projecao-2027-ficticia.csv',['Cenario','Unidade','Mes','Headcount','Custo projetado BRL','Orcamento referencia BRL','Saldo BRL','Fator simulado','Tipo'],projection().map(p=>[P.lookup(d.cenarios,scenarioId).nome,$('unit').selectedOptions[0].textContent,p.month,p.headcount,p.cost,p.budget,P.round(p.budget-p.cost),factor(),'projecao ficticia']));
    });
    const requested=new URLSearchParams(location.search).get('cenario');
    if(P.lookup(d.cenarios,requested)){scenarioId=requested;$('scenario').value=requested;events=P.copy(P.lookup(d.cenarios,requested).eventos);}
    render();
  } catch(error) {
    container.setAttribute('aria-busy','false');
    container.innerHTML=`<div class="error-box" role="alert"><h2>Não foi possível abrir o simulador</h2><p>${E(error.message)}</p><button onclick="location.reload()">Tentar novamente</button></div>`;
  }
})();
