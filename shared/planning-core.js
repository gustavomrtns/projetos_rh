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
  const cost = (salary, benefits, factor, other = 0) => round(salary * (1 + factor) + benefits + other);
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
    if (!response.ok) throw new Error('Não foi possível carregar a base de demonstração.');
    return validate(await response.json(), window.PortfolioDemo.copyPeople());
  }
  function snapshot(data, events, month, factor = 0.3, unit = '') {
    const occupied = new Map();
    data.pessoas.forEach(p => {
      const c = data.custos_pessoas.find(c => c.pessoa_id === p.id);
      occupied.set(p.posicao_id, { pessoa_id: p.id, salary: c.salario_base, benefits: c.beneficios_empresa, other: c.outras_despesas });
    });
    events.map((e, i) => ({...e, order:i})).sort((a,b) => a.vigencia.localeCompare(b.vigencia) || a.order-b.order).forEach(e => {
      if (e.vigencia.slice(0,7) > month) return;
      if (e.tipo === 'admissao_planejada') occupied.set(e.posicao_id, {pessoa_id:null, salary:e.salario_base, benefits:e.beneficios_empresa, other:0});
      else {
        const entry = [...occupied.entries()].find(([, c]) => c.pessoa_id === e.pessoa_id);
        if (!entry) return;
        if (e.tipo === 'ajuste_planejado') entry[1].salary = e.novo_salario_base;
        if (e.tipo === 'desligamento_planejado') occupied.delete(entry[0]);
      }
    });
    const positions = data.posicoes.filter(p => !unit || p.unidade_id === unit);
    const rows = positions.map(p => {
      const current = occupied.get(p.id);
      return {...p, pessoa_planejada_id:current?.pessoa_id, ocupada:!!current,
        salario:current?.salary || 0, custo:current ? cost(current.salary, current.benefits, factor, current.other) : 0};
    });
    const approved = rows.filter(p => p.aprovada).length;
    return { rows, approved, headcount:rows.filter(p => p.ocupada).length,
      vacancies:rows.filter(p => p.aprovada && !p.ocupada).length,
      proposed:rows.filter(p => !p.aprovada).length, cost:round(rows.reduce((a,p) => a+p.custo,0)),
      budget:round(data.orcamento.filter(b => !unit || lookup(data.centros_custo,b.centro_custo_id).unidade_id === unit).reduce((a,b)=>a+b.custo_orcado,0)) };
  }
  function project(data, events, factor = 0.3, unit = '') {
    return Array.from({length:12}, (_,i) => {
      const month = '2027-' + String(i+1).padStart(2,'0');
      return {month, ...snapshot(data,events,month,factor,unit)};
    });
  }
  function validateEvent(data, events, event) {
    if (!/^2027-(0[1-9]|1[0-2])-01$/.test(event.vigencia)) return 'Escolha um mês de 2027.';
    if (event.tipo === 'admissao_planejada') {
      const p = lookup(data.posicoes,event.posicao_id);
      if (!p?.aprovada || p.ocupante_id) return 'Escolha uma posição aprovada e vaga na base.';
      if (events.some(e => e.posicao_id === p.id && e.tipo === event.tipo)) return 'Esta posição já tem uma admissão no cenário.';
      if (!Number.isFinite(event.salario_base) || event.salario_base <= 0 || !Number.isFinite(event.beneficios_empresa) || event.beneficios_empresa < 0) return 'Informe salário positivo e benefícios a partir de zero.';
    } else if (['ajuste_planejado','desligamento_planejado'].includes(event.tipo)) {
      if (!lookup(data.pessoas,event.pessoa_id)) return 'Escolha uma pessoa da base.';
      const departure = events.find(e => e.pessoa_id === event.pessoa_id && e.tipo === 'desligamento_planejado');
      if (departure && (event.tipo === 'desligamento_planejado' || event.vigencia >= departure.vigencia)) return 'Já existe saída anterior ou no mesmo mês para esta pessoa.';
      if (event.tipo === 'desligamento_planejado' && events.some(e => e.pessoa_id === event.pessoa_id && e.vigencia >= event.vigencia)) return 'Remova os ajustes deste mês e dos meses seguintes antes de planejar a saída.';
      if (event.tipo === 'ajuste_planejado') {
        if (!Number.isFinite(event.novo_salario_base) || event.novo_salario_base <= 0) return 'Informe um salário positivo.';
        if (events.some(e => e.pessoa_id === event.pessoa_id && e.tipo === event.tipo && e.vigencia === event.vigencia)) return 'Já existe um ajuste para esta pessoa neste mês.';
      }
    } else return 'Movimentação inválida.';
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
    return {...range, status:salary < range.minimo ? 'Abaixo da faixa fictícia' : salary > range.maximo ? 'Acima da faixa fictícia' : 'Dentro da faixa fictícia'};
  }
  function csvDownload(name, headers, rows) {
    const cell = v => '"' + String(v ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g,'""') + '"';
    const blob = new Blob(['\ufeff' + [headers,...rows].map(r=>r.map(cell).join(';')).join('\r\n')], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  return {money,esc,copy,round,lookup,cost,validate,load,snapshot,project,validateEvent,gaps,band,csvDownload};
});
