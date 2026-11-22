(async function () {
  'use strict';
  const P=window.Planning, $=id=>document.getElementById(id), E=P.esc, M=P.money, container=$('app');
  try {
    const d=await P.load();
    const job=id=>P.lookup(d.cargos,id), person=id=>P.lookup(d.pessoas,id);
    const opt=(id,name)=>`<option value="${E(id)}">${E(name)}</option>`;
    let nominations=P.copy(d.sucessao);
    const readiness={em_desenvolvimento_12_24_meses:'Em desenvolvimento · 12 a 24 meses',em_desenvolvimento_ate_12_meses:'Em desenvolvimento · até 12 meses',pronto_para_discussao:'Pronto para discussão'};
    const families=[...new Set(d.cargos.map(c=>c.familia))];
    container.innerHTML=`
      <nav class="tabs" aria-label="Seções do mapa"><a href="#estrutura">Estrutura de cargos</a><a href="#progressao">Carreira e acomodação</a><a href="#sucessao">Sucessão e desenvolvimento</a></nav>
      <div class="metrics"><div class="metric"><span>Arquitetura</span><strong>${d.cargos.length} cargos</strong><small>${d.niveis.length} níveis fictícios</small></div><div class="metric"><span>Quadro de referência</span><strong>${d.pessoas.length} pessoas</strong><small>Catálogo compartilhado com o GT360°</small></div><div class="metric accent"><span>Trajetórias propostas</span><strong>${d.trilhas_carreira.length} caminhos</strong><small>Progressão e especialização</small></div><div class="metric"><span>Posição crítica</span><strong>${d.posicoes.filter(p=>p.critica).length} posição</strong><small>Indicações manuais para discussão</small></div></div>
      <section id="estrutura" class="panel" aria-labelledby="structure-title"><div class="panel-head"><div><h2 id="structure-title">Estrutura de cargos</h2><p>Missões, níveis, faixas e ocupação. Cargos de destino podem existir no catálogo sem posição aprovada.</p></div><button id="export-jobs">Exportar estrutura CSV</button></div>
        <div class="toolbar"><label>Família de cargos<select id="family">${opt('','Todas as famílias')}${families.map(f=>opt(f,f)).join('')}</select></label><label>Buscar cargo<input id="search" type="search" placeholder="Ex.: Tecnologia"></label></div><div id="jobs" class="job-grid"></div><p id="job-count" class="muted" role="status"></p>
      </section>
      <section id="progressao" class="panel" aria-labelledby="career-title"><h2 id="career-title">Carreira e acomodação</h2><p class="muted">Acomodar é revisar o enquadramento entre responsabilidades, cargo e faixa. Escolha uma pessoa e um destino para explorar a hipótese.</p>
        <div class="toolbar"><label>Pessoa<select id="person">${d.pessoas.map(p=>opt(p.id,p.nome)).join('')}</select></label><label>Cargo para comparação<select id="target">${d.cargos.map(c=>opt(c.id,c.nome)).join('')}</select></label><label>Salário proposto (R$)<input id="salary" type="number" min="0.01" max="1000000" step="0.01" value="4800" required></label><button id="simulate" class="primary">Simular enquadramento</button></div>
        <p id="simulation-message" class="live" aria-live="polite" role="status"></p>
        <div class="columns"><div><div id="career-path"></div><div id="placement"></div></div><div><h3>Competências para o cargo comparado</h3><p class="muted">Escala ilustrativa de 1 a 4. O intervalo indica temas a desenvolver, sem ranking de pessoas.</p><div id="gaps" class="table-wrap"></div></div></div>
        <details><summary>Acomodações em estudo na base</summary><div id="accommodations" class="table-wrap"></div></details>
      </section>
      <section id="sucessao" class="panel" aria-labelledby="succession-title"><h2 id="succession-title">Sucessão e desenvolvimento</h2><p class="muted">Indicações manuais de demonstração. A prontidão precisa de discussão e evidências; não há escolha automática de sucessor.</p>
        <div class="columns"><div>
          <form id="nomination" class="form-grid">
            <label class="span-all">Posição crítica<select id="critical">${d.posicoes.filter(p=>p.critica).map(p=>opt(p.id,`${p.id} · ${job(p.cargo_id).nome} · titular: ${person(p.ocupante_id)?.nome||'vaga'}`)).join('')}</select></label>
            <label>Candidato<select id="candidate">${d.pessoas.map(p=>opt(p.id,p.nome)).join('')}</select></label>
            <label>Prontidão para discussão<select id="readiness">${Object.entries(readiness).map(([id,text])=>opt(id,text)).join('')}</select></label>
            <label>Revisão<input id="review" type="date" min="2026-11-22" value="2027-06-30" required></label>
            <label class="span-all">Evidências e pontos para discussão<textarea id="evidence" maxlength="600" required placeholder="Registre uma hipótese fictícia e os temas a validar."></textarea></label>
            <div class="span-all"><button class="primary" type="submit">Registrar indicação fictícia</button><p id="nomination-message" class="live" role="status" aria-live="polite"></p></div>
          </form>
        </div><div><h3>Indicações para a posição</h3><div id="nominations"></div></div></div>
        <h3>Plano de desenvolvimento do candidato selecionado</h3><p class="muted">Ações fictícias de desenvolvimento disponíveis na base. Responsáveis de treinamentos não equivalem a participantes ou conclusões.</p><div id="development" class="table-wrap"></div>
      </section><p class="footer">Confira a viabilidade de custos no <a href="../headcount/">simulador de quadro</a>. As faixas apresentadas são fictícias, sem referência de mercado.</p>`;
    container.setAttribute('aria-busy','false');
    function filteredJobs(){const search=$('search').value.toLocaleLowerCase('pt-BR');return d.cargos.filter(c=>(!$('family').value||c.familia===$('family').value)&&c.nome.toLocaleLowerCase('pt-BR').includes(search));}
    function renderJobs(){
      const jobs=filteredJobs();
      $('jobs').innerHTML=jobs.map(c=>{
        const positions=d.posicoes.filter(p=>p.cargo_id===c.id),band=d.faixas_salariais.find(f=>f.nivel_id===c.nivel_id);
        return `<article class="job"><span class="eyebrow">${E(c.familia)} · ${E(c.nivel_id)}</span><h3>${E(c.nome)}</h3><p>${E(c.missao_demo)}</p><p>Faixa fictícia: <strong>${M(band.minimo)} a ${M(band.maximo)}</strong></p><footer>${positions.filter(p=>p.aprovada).length} posição(ões) aprovada(s) · ${positions.filter(p=>p.ocupante_id).length} ocupada(s) · ${positions.filter(p=>!p.aprovada).length} em proposta</footer></article>`;
      }).join('')||'<p class="muted">Nenhum cargo encontrado. Ajuste os filtros.</p>';
      $('job-count').textContent=`${jobs.length} de ${d.cargos.length} cargos.`;
    }
    function gapTable(personId,jobId){
      const rows=P.gaps(d,personId,jobId);
      return `<table><caption>Perfil e requisitos inteiramente fictícios.</caption><thead><tr><th>Competência</th><th class="num">Perfil</th><th class="num">Requisito</th><th class="num">Intervalo</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${E(r.name)}<div class="gap-meter" aria-hidden="true">${[1,2,3,4].map(i=>`<i class="${r.actual>=i?'filled':''}"></i>`).join('')}</div></td><td class="num">${r.actual??'Não avaliado'}</td><td class="num">${r.required}</td><td class="num">${r.gap===null?'Sem avaliação':r.gap===0?'Atendido':r.gap}</td></tr>`).join('')}</tbody></table>`;
    }
    function renderCareer(){
      if(!$('salary').checkValidity()||$('salary').value===''){$('salary').reportValidity();return false;}
      const p=person($('person').value), current=job(p.cargo_id), target=job($('target').value),salary=Number($('salary').value);
      const base=d.custos_pessoas.find(c=>c.pessoa_id===p.id),range=P.band(d,target.id,salary);
      const paths=d.trilhas_carreira.filter(t=>t.cargo_origem_id===current.id);
      $('career-path').innerHTML=`<div class="path"><span class="muted">Cargo atual · ${E(p.nome)}</span><strong>${E(current.nome)}</strong>${paths.map(t=>`<p>Possível próximo passo: <strong>${E(job(t.cargo_destino_id).nome)}</strong></p><ol>${t.criterios_demo.map(c=>`<li>${E(c)}</li>`).join('')}</ol>`).join('')||'<p>Sem trajetória cadastrada para este cargo.</p>'}</div>`;
      const vacancy=d.posicoes.filter(pos=>pos.cargo_id===target.id&&pos.aprovada&&!pos.ocupante_id).length;
      const currentJob=target.id===current.id;
      $('placement').innerHTML=`<h3>Hipótese de enquadramento</h3><p>${E(target.nome)} · ${E(target.nivel_id)}</p><p><span class="status ${range.status.startsWith('Dentro')?'good':'warn'}">${E(range.status)}</span></p><p class="muted">Faixa: ${M(range.minimo)} a ${M(range.maximo)}<br>Salário atual: ${M(base.salario_base)} · proposto: ${M(salary)}<br>Variação salarial: ${M(salary-base.salario_base)}<br>Impacto mensal estimado a 30%: <strong>${M(P.cost(salary,base.beneficios_empresa,.3,base.outras_despesas)-P.cost(base.salario_base,base.beneficios_empresa,.3,base.outras_despesas))}</strong></p><p class="muted">${currentJob?'Comparação no mesmo cargo; revisão salarial em estudo.':vacancy?`${vacancy} posição(ões) aprovada(s) vaga(s) no cargo de destino; unidade e orçamento ainda precisam ser validados.`:'Sem posição aprovada vaga no cargo de destino. A trajetória depende de estrutura e orçamento.'}</p><a href="../headcount/">Explorar cenário de custos</a>`;
      $('gaps').innerHTML=gapTable(p.id,target.id);return true;
    }
    function selectPerson(){
      const p=person($('person').value),path=d.trilhas_carreira.find(t=>t.cargo_origem_id===p.cargo_id);
      $('target').value=path?.cargo_destino_id||p.cargo_id;
      $('salary').value=d.custos_pessoas.find(c=>c.pessoa_id===p.id).salario_base;
      $('simulation-message').textContent='';renderCareer();
    }
    $('accommodations').innerHTML=`<table><caption>Propostas em estudo; nenhuma alteração aplicada ao cadastro.</caption><thead><tr><th>Pessoa</th><th>Cargo proposto</th><th class="num">Salário proposto</th><th>Justificativa fictícia</th></tr></thead><tbody>${d.acomodacoes_propostas.map(a=>`<tr><td>${E(person(a.pessoa_id).nome)}</td><td>${E(job(a.cargo_proposto_id).nome)}</td><td class="num">${M(a.salario_proposto)}</td><td>${E(a.justificativa_demo)}${a.id==='AC002'?' <a href="../headcount/?cenario=CEN_ACOM">Ver cenário de custos</a>':''}</td></tr>`).join('')}</tbody></table>`;
    function renderSuccession(){
      const critical=$('critical').value,candidate=$('candidate').value,target=job(P.lookup(d.posicoes,critical).cargo_id);
      const selected=nominations.filter(n=>n.posicao_alvo_id===critical);
      $('nominations').innerHTML=selected.map(n=>`<article class="path"><strong>${E(person(n.candidato_pessoa_id).nome)}</strong><span class="status">${E(readiness[n.prontidao])}</span><p class="muted">Revisão: ${E(n.data_revisao.split('-').reverse().join('/'))}</p><p>${E(n.evidencia)}</p><p class="muted">Temas a desenvolver: ${P.gaps(d,n.candidato_pessoa_id,target.id).filter(g=>g.gap>0).map(g=>E(g.name)).join(', ')||'Sem intervalo no perfil demonstrativo; validar evidências.'}</p><button class="small" data-remove="${E(n.id)}" aria-label="Remover indicação de ${E(person(n.candidato_pessoa_id).nome)}">Remover indicação</button></article>`).join('')||'<p class="muted">Nenhuma indicação registrada para esta posição.</p>';
      const actions=d.planos_desenvolvimento.filter(p=>p.pessoa_id===candidate);
      $('development').innerHTML=`<h3>${E(person(candidate).nome)} · comparação com ${E(target.nome)}</h3>${gapTable(candidate,target.id)}`+(actions.length?`<table><caption>Ações de desenvolvimento fictícias de ${E(person(candidate).nome)}.</caption><thead><tr><th>Competência</th><th>Ação</th><th>Prazo</th><th>Status</th></tr></thead><tbody>${actions.map(a=>`<tr><td>${E(P.lookup(d.competencias,a.competencia_id).nome)}</td><td>${E(a.acao)}</td><td>${E(a.prazo.split('-').reverse().join('/'))}</td><td>${E(a.status)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Sem ações cadastradas para esta pessoa. A indicação ainda precisa de um plano de desenvolvimento.</p>');
    }
    $('nomination').addEventListener('submit',e=>{
      e.preventDefault();const position=P.lookup(d.posicoes,$('critical').value),candidate=$('candidate').value;
      if(position.ocupante_id===candidate){$('nomination-message').textContent='O titular já ocupa a posição. Escolha outra pessoa para a indicação.';return;}
      const nomination={id:'SIM-'+Date.now(),posicao_alvo_id:position.id,candidato_pessoa_id:candidate,prontidao:$('readiness').value,data_revisao:$('review').value,evidencia:$('evidence').value.trim()};
      if(!nomination.evidencia){$('nomination-message').textContent='Descreva as evidências e os pontos a validar.';return;}
      const existing=nominations.findIndex(n=>n.posicao_alvo_id===position.id&&n.candidato_pessoa_id===candidate);
      if(existing>=0)nominations[existing]=nomination;else nominations.push(nomination);
      renderSuccession();$('nomination-message').textContent='Indicação fictícia registrada nesta página. Nenhuma alteração aplicada ao quadro.';
    });
    $('nominations').addEventListener('click',e=>{const button=e.target.closest('[data-remove]');if(button){nominations=nominations.filter(n=>n.id!==button.dataset.remove);renderSuccession();$('nomination-message').textContent='Indicação removida nesta página.';}});
    ['critical','candidate'].forEach(id=>$(id).addEventListener('change',renderSuccession));
    $('candidate').value='D003';
    $('family').addEventListener('change',renderJobs);$('search').addEventListener('input',renderJobs);
    $('person').addEventListener('change',selectPerson);
    $('target').addEventListener('change',()=>{if(renderCareer())$('simulation-message').textContent='Comparação atualizada para o cargo selecionado.';});
    $('simulate').addEventListener('click',()=>{if(renderCareer())$('simulation-message').textContent='Hipótese recalculada. Os cadastros atuais permanecem como referência.';});
    $('salary').addEventListener('input',()=>{$('simulation-message').textContent='Valor alterado. Use Simular enquadramento para recalcular a hipótese.';});
    $('export-jobs').addEventListener('click',()=>P.csvDownload('estrutura-cargos-ficticia.csv',['Cargo','Familia','Nivel','Faixa minima BRL','Faixa maxima BRL','Posicoes aprovadas','Ocupadas','Tipo'],filteredJobs().map(c=>{const range=d.faixas_salariais.find(f=>f.nivel_id===c.nivel_id),positions=d.posicoes.filter(p=>p.cargo_id===c.id);return[c.nome,c.familia,c.nivel_id,range.minimo,range.maximo,positions.filter(p=>p.aprovada).length,positions.filter(p=>p.ocupante_id).length,'dados ficticios'];})));
    renderJobs();selectPerson();renderSuccession();
  }catch(error){container.setAttribute('aria-busy','false');container.innerHTML=`<div class="error-box" role="alert"><h2>Não foi possível abrir o mapa</h2><p>${E(error.message)}</p><button onclick="location.reload()">Tentar novamente</button></div>`;}
})();
