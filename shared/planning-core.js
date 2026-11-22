/* Regras das demonstrações de planejamento. Sem persistência ou dados reais. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Planning = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const money = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(n);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = x => JSON.parse(JSON.stringify(x));
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const lookup = (rows, id) => rows.find(r => r.id === id);
  const payrollDefaults = Object.freeze({cpp:20, rat:2, fap:1, thirdParty:5.8, fgts:8, include13:true, includeVacation:true});
  function validatePayrollPolicy(policy) {
    for (const key of ['cpp','rat','thirdParty','fgts']) {
      if (!Number.isFinite(policy[key]) || policy[key] < 0 || policy[key] > 100) return 'Informe alíquotas entre 0 e 100%.';
    }
    if (!Number.isFinite(policy.fap) || policy.fap < .5 || policy.fap > 2) return 'Informe FAP entre 0,5 e 2.';
    if (typeof policy.include13 !== 'boolean' || typeof policy.includeVacation !== 'boolean') return 'Selecione as provisões que entram no custo.';
    return '';
  }
  function payrollCost(record, policy = payrollDefaults) {
    const error = validatePayrollPolicy(policy);
    if (error) throw new Error(error);
    const b = {salary:record.salario_base, variables:record.medias_remuneratorias ?? 0,
      grossBenefits:record.beneficios_brutos ?? record.beneficios_empresa ?? 0,
      benefitDeduction:record.coparticipacao_beneficios ?? 0, other:record.outras_despesas ?? 0};
    if (Object.values(b).some(v=>!Number.isFinite(v)||v<0) || b.benefitDeduction>b.grossBenefits) throw new Error('Confira os valores: a participação não pode superar o total dos benefícios.');
    b.remuneration = round(b.salary+b.variables);
    const rates = {cpp:policy.cpp/100,rat:policy.rat*policy.fap/100,thirdParty:policy.thirdParty/100,fgts:policy.fgts/100};
    Object.entries(rates).forEach(([key,rate])=>{b[key]=round(b.remuneration*rate);});
    b.employerCharges=round(b.cpp+b.rat+b.thirdParty+b.fgts);
    b.thirteenth=policy.include13?round(b.remuneration/12):0;
    b.vacation=policy.includeVacation?round(b.remuneration/12):0;
    b.vacationThird=policy.includeVacation?round(b.remuneration/36):0;
    // Os 12 salários já remuneram o mês de férias. Mostrar a provisão bruta e
    // compensar a remuneração evita contar um 13º mês de salário como férias.
    b.vacationOffset=b.vacation;
    b.provisions=round(b.thirteenth+b.vacation+b.vacationThird-b.vacationOffset);
    Object.entries(rates).forEach(([key,rate])=>{b['provision'+key[0].toUpperCase()+key.slice(1)]=round(b.provisions*rate);});
    b.provisionCharges=round(b.provisionCpp+b.provisionRat+b.provisionThirdParty+b.provisionFgts);
    b.netBenefits=round(b.grossBenefits-b.benefitDeduction);
    b.total=round(b.remuneration+b.employerCharges+b.provisions+b.provisionCharges+b.netBenefits+b.other);
    return b;
  }
  function validate(data, originals) {
    for (const key of ['pessoas', 'cargos', 'posicoes', 'unidades', 'centros_custo', 'competencias']) {
      const ids = data[key].map(r => r.id);
      if (new Set(ids).size !== ids.length) throw new Error('Identificadores duplicados: ' + key);
    }
    if (originals) {
      if (originals.length !== data.pessoas.length) throw new Error('Catálogo de pessoas divergente.');
      originals.forEach(p => {
        const row = lookup(data.pessoas, p.id);
        if (!row || Object.keys(p).some(k => row[k] !== p[k])) throw new Error('Cadastro GT360° divergente: ' + p.id);
      });
    }
    data.pessoas.forEach(p => {
      if (!lookup(data.cargos, p.cargo_id) || !lookup(data.posicoes, p.posicao_id)) throw new Error('Referência de pessoa inválida.');
    });
    return data;
  }
  async function load() {
    const url = new URL('planning-data.json', document.querySelector('script[src$="planning-core.js"]').src);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Não foi possível carregar a base de pessoas.');
    return validate(await response.json(), window.PortfolioDemo.copyPeople());
  }
  function snapshot(data, events, month, policy = data.encargos_base || payrollDefaults, unit = '') {
    const occupied = new Map();
    data.pessoas.forEach(p => {
      const c = data.custos_pessoas.find(c => c.pessoa_id === p.id);
      occupied.set(p.posicao_id, {pessoa_id:p.id, ...copy(c)});
    });
    events.map((e, i) => ({...e, order:i})).sort((a,b) => a.vigencia.localeCompare(b.vigencia) || a.order-b.order).forEach(e => {
      if (e.vigencia.slice(0,7) > month) return;
      if (e.tipo === 'admissao_planejada') occupied.set(e.posicao_id, {pessoa_id:null, ...copy(e)});
      else {
        const entry = [...occupied.entries()].find(([, c]) => c.pessoa_id === e.pessoa_id);
        if (!entry) return;
        if (e.tipo === 'ajuste_planejado') entry[1].salario_base = e.novo_salario_base;
        if (e.tipo === 'pacote_planejado') Object.assign(entry[1], {beneficios_brutos:e.beneficios_brutos,coparticipacao_beneficios:e.coparticipacao_beneficios,medias_remuneratorias:e.medias_remuneratorias,outras_despesas:e.outras_despesas});
        if (e.tipo === 'desligamento_planejado') occupied.delete(entry[0]);
      }
    });
    const positions = data.posicoes.filter(p => !unit || p.unidade_id === unit);
    const rows = positions.map(p => {
      const current = occupied.get(p.id);
      const breakdown = payrollCost(current || {salario_base:0},policy);
      return {...p, pessoa_planejada_id:current?.pessoa_id, ocupada:!!current,
        salario:current?.salario_base || 0, composicao:breakdown, custo:breakdown.total};
    });
    const approved = rows.filter(p => p.aprovada).length;
    const breakdown = Object.fromEntries(Object.keys(rows[0]?.composicao || payrollCost({salario_base:0},policy)).map(key=>[key,round(rows.reduce((sum,p)=>sum+p.composicao[key],0))]));
    return { rows, approved, breakdown, headcount:rows.filter(p => p.ocupada).length,
      vacancies:rows.filter(p => p.aprovada && !p.ocupada).length,
      proposed:rows.filter(p => !p.aprovada).length, cost:round(rows.reduce((a,p) => a+p.custo,0)),
      budget:round(data.orcamento.filter(b => !unit || lookup(data.centros_custo,b.centro_custo_id).unidade_id === unit).reduce((a,b)=>a+b.custo_orcado,0)) };
  }
  function project(data, events, policy = data.encargos_base || payrollDefaults, unit = '') {
    return Array.from({length:12}, (_,i) => {
      const month = '2027-' + String(i+1).padStart(2,'0');
      return {month, ...snapshot(data,events,month,policy,unit)};
    });
  }
  function validateEvent(data, events, event) {
    if (!/^2027-(0[1-9]|1[0-2])-01$/.test(event.vigencia)) return 'Escolha um mês de 2027.';
    if (event.tipo === 'admissao_planejada') {
      const p = lookup(data.posicoes,event.posicao_id);
      if (!p?.aprovada || p.ocupante_id) return 'Escolha uma posição aprovada e vaga na base.';
      if (events.some(e => e.posicao_id === p.id && e.tipo === event.tipo)) return 'Esta posição já tem uma admissão no cenário.';
      if (!Number.isFinite(event.salario_base) || event.salario_base <= 0) return 'Informe um salário positivo.';
    } else if (['ajuste_planejado','desligamento_planejado','pacote_planejado'].includes(event.tipo)) {
      if (!lookup(data.pessoas,event.pessoa_id)) return 'Escolha uma pessoa da base.';
      const departure = events.find(e => e.pessoa_id === event.pessoa_id && e.tipo === 'desligamento_planejado');
      if (departure && (event.tipo === 'desligamento_planejado' || event.vigencia >= departure.vigencia)) return 'Já existe saída anterior ou no mesmo mês para esta pessoa.';
      if (event.tipo === 'desligamento_planejado' && events.some(e => e.pessoa_id === event.pessoa_id && e.vigencia >= event.vigencia)) return 'Remova os ajustes deste mês e dos meses seguintes antes de planejar a saída.';
      if (event.tipo === 'ajuste_planejado') {
        if (!Number.isFinite(event.novo_salario_base) || event.novo_salario_base <= 0) return 'Informe um salário positivo.';
        if (events.some(e => e.pessoa_id === event.pessoa_id && e.tipo === event.tipo && e.vigencia === event.vigencia)) return 'Já existe um ajuste para esta pessoa neste mês.';
      }
      if (event.tipo === 'pacote_planejado' && events.some(e=>e.pessoa_id===event.pessoa_id&&e.tipo===event.tipo&&e.vigencia===event.vigencia)) return 'Já existe uma revisão de benefícios e verbas neste mês.';
    } else return 'Movimentação inválida.';
    if (['admissao_planejada','pacote_planejado'].includes(event.tipo)) {
      const gross=event.beneficios_brutos ?? event.beneficios_empresa;
      const share=event.coparticipacao_beneficios ?? 0;
      if ([gross,share,event.medias_remuneratorias ?? 0,event.outras_despesas ?? 0].some(v=>!Number.isFinite(v)||v<0)) return 'Informe benefícios, participação e demais valores a partir de zero.';
      if (share>gross) return 'A participação do colaborador não pode superar o total dos benefícios.';
    }
    return '';
  }
  function gaps(data, personId, jobId) {
    return data.requisitos_competencias.filter(r => r.cargo_id === jobId).map(r => {
      const profile = data.perfis_competencias.find(p => p.pessoa_id === personId && p.competencia_id === r.competencia_id);
      const actual = profile?.nivel_demonstrativo ?? null;
      return {id:r.competencia_id, name:lookup(data.competencias,r.competencia_id).nome,
        actual, required:r.nivel_requerido, gap:actual === null ? null : Math.max(0,r.nivel_requerido-actual)};
    });
  }
  function band(data, jobId, salary) {
    const job = lookup(data.cargos,jobId);
    const range = data.faixas_salariais.find(r => r.nivel_id === job.nivel_id);
    return {...range, status:salary < range.minimo ? 'Abaixo da faixa' : salary > range.maximo ? 'Acima da faixa' : 'Dentro da faixa'};
  }
  function csvDownload(name, headers, rows) {
    const cell = v => '"' + String(v ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g,'""') + '"';
    const blob = new Blob(['\ufeff' + [headers,...rows].map(r=>r.map(cell).join(';')).join('\r\n')], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  return {money,esc,copy,round,lookup,payrollDefaults,validatePayrollPolicy,payrollCost,validate,load,snapshot,project,validateEvent,gaps,band,csvDownload};
});
