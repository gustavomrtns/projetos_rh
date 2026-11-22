const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const P = require('../shared/planning-core.js');
const data = require('../shared/planning-data.json');
const Analytics = require('../shared/planning-dashboards.js');

test('catálogo preserva os campos do GT360 e todos os vínculos de planejamento', () => {
  // O catálogo original é extraído sem executar os manipuladores do navegador.
  const source=fs.readFileSync(require.resolve('../shared/demo-core.js'),'utf8');
  const literal=source.match(/var people\s*=\s*(\[[\s\S]*?\]);/)[1];
  const people=JSON.parse(JSON.stringify(vm.runInNewContext(literal)));
  P.validate(data,people);
  assert.deepEqual(data.pessoas_gt360_originais,people);
  const refs = (rows,key,target) => rows.forEach(row=>assert.ok(target.some(t=>t.id===row[key]),key+': '+row[key]));
  refs(data.pessoas,'unidade_id',data.unidades);refs(data.pessoas,'area_id',data.areas);
  refs(data.posicoes,'cargo_id',data.cargos);refs(data.posicoes,'centro_custo_id',data.centros_custo);
  refs(data.sucessao,'candidato_pessoa_id',data.pessoas);refs(data.sucessao,'posicao_alvo_id',data.posicoes);
  refs(data.planos_desenvolvimento,'pessoa_id',data.pessoas);refs(data.planos_desenvolvimento,'competencia_id',data.competencias);
  refs(data.trilhas_carreira,'cargo_origem_id',data.cargos);refs(data.trilhas_carreira,'cargo_destino_id',data.cargos);
  const occupied=data.posicoes.filter(p=>p.ocupante_id).map(p=>p.ocupante_id);
  assert.equal(new Set(occupied).size,occupied.length);
});
test('base tem 7 posições aprovadas, 5 ocupadas, 2 vagas e uma proposta fora do aprovado', () => {
  const s=P.snapshot(data,[],'2027-01');
  assert.equal(s.approved,7);assert.equal(s.headcount,5);assert.equal(s.vacancies,2);assert.equal(s.proposed,1);
  assert.equal(s.cost,44636.46);assert.equal(s.budget,53360);
  assert.equal(P.round(P.project(data,[]).reduce((a,r)=>a+r.cost,0)),535637.52);
});
test('todos os 36 meses dos cenários reproduzem a base preparada, sem mutação', () => {
  const before=JSON.stringify(data);
  for(const scenario of data.cenarios){
    const actual=P.project(data,scenario.eventos);
    actual.forEach(r=>{
      const expected=data.projecoes.find(p=>p.cenario_id===scenario.id&&p.competencia===r.month);
      assert.equal(r.headcount,expected.headcount_projetado);assert.equal(r.cost,expected.custo_projetado);
    });
  }
  assert.equal(JSON.stringify(data),before);
});
test('filtros de unidade conciliam custos e orçamento; alíquotas e provisões zeradas mantêm remuneração e benefícios', () => {
  const all=P.snapshot(data,[],'2027-01');
  const units=data.unidades.map(u=>P.snapshot(data,[],'2027-01',data.encargos_base,u.id));
  for(const key of ['cost','headcount','approved','budget','vacancies'])assert.equal(P.round(units.reduce((a,u)=>a+u[key],0)),all[key]);
  assert.equal(P.snapshot(data,[],'2027-01',{...data.encargos_base,cpp:0,rat:0,thirdParty:0,fgts:0,include13:false,includeVacation:false}).cost,31100);
});
test('movimentos têm vigência mensal e ajuste anterior é encerrado pela saída', () => {
  const events=[{tipo:'desligamento_planejado',pessoa_id:'D003',vigencia:'2027-04-01'},
    {tipo:'ajuste_planejado',pessoa_id:'D003',vigencia:'2027-02-01',novo_salario_base:4200}];
  assert.equal(P.snapshot(data,events,'2027-01').cost,44636.46);
  assert.equal(P.snapshot(data,events,'2027-02').cost,45089.12);
  assert.equal(P.snapshot(data,events,'2027-04').cost,37851.79);
  assert.equal(P.snapshot(data,events,'2027-04').headcount,4);
  assert.equal(P.snapshot(data,events,'2027-04').vacancies,3);
});
test('impede duplicação de admissão, proposta não aprovada e movimentos incoerentes', () => {
  const event={tipo:'admissao_planejada',posicao_id:'P006',vigencia:'2027-03-01',salario_base:4800,beneficios_empresa:900};
  assert.equal(P.validateEvent(data,[],event),'');
  assert.ok(P.validateEvent(data,[event],event));
  assert.ok(P.validateEvent(data,[],{...event,posicao_id:'P008'}));
  assert.ok(P.validateEvent(data,[],{...event,posicao_id:'P001'}));
  assert.ok(P.validateEvent(data,[],{...event,salario_base:-1}));
  assert.ok(P.validateEvent(data,[],{...event,vigencia:'2027-13-01'}));
  const exit={tipo:'desligamento_planejado',pessoa_id:'D003',vigencia:'2027-03-01'};
  assert.ok(P.validateEvent(data,[exit],{tipo:'ajuste_planejado',pessoa_id:'D003',vigencia:'2027-03-01',novo_salario_base:4200}));
});
test('carreira apresenta intervalos e faixas fictícias, sem alterar enquadramento', () => {
  const before=JSON.stringify(data.pessoas);
  const gaps=P.gaps(data,'D003','J005');
  assert.deepEqual(gaps.filter(g=>g.gap>0).map(g=>g.id),['K003','K004']);
  assert.equal(P.band(data,'J003',3900).status,'Abaixo da faixa');
  assert.equal(P.band(data,'J003',4200).status,'Dentro da faixa');
  assert.equal(P.band(data,'J003',6500).status,'Acima da faixa');
  assert.equal(JSON.stringify(data.pessoas),before);
});
test('escapa textos de hipóteses para uso na interface',()=>{
  assert.equal(P.esc('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('composição CLT concilia encargos, férias sem duplicação e benefícios líquidos',()=>{
  const b=P.payrollCost({salario_base:3000,beneficios_brutos:900,coparticipacao_beneficios:100});
  assert.equal(b.remuneration,3000);
  assert.equal(b.cpp,600);assert.equal(b.rat,60);assert.equal(b.thirdParty,174);assert.equal(b.fgts,240);
  assert.equal(b.thirteenth,250);assert.equal(b.vacation,250);assert.equal(b.vacationThird,83.33);
  assert.equal(b.vacationOffset,250);assert.equal(b.provisions,333.33);
  assert.equal(b.provisionCharges,119.34);assert.equal(b.netBenefits,800);assert.equal(b.total,5326.67);
  const positive=b.salary+b.variables+b.cpp+b.rat+b.thirdParty+b.fgts+b.thirteenth+b.vacation+b.vacationThird+b.provisionCharges+b.grossBenefits+b.other;
  assert.equal(P.round(positive-b.vacationOffset-b.benefitDeduction),b.total);
});
test('participação em benefícios não reduz base de encargos nem provisões',()=>{
  const full=P.payrollCost({salario_base:3000,beneficios_brutos:900});
  const shared=P.payrollCost({salario_base:3000,beneficios_brutos:900,coparticipacao_beneficios:100});
  assert.equal(P.round(full.total-shared.total),100);
  for(const k of ['remuneration','employerCharges','provisions','provisionCharges'])assert.equal(full[k],shared[k]);
});
test('médias remuneratórias, FAP e seleção de provisões têm reflexo no custo',()=>{
  const base=P.payrollCost({salario_base:3000});
  const variable=P.payrollCost({salario_base:3000,medias_remuneratorias:600});
  assert.equal(variable.remuneration,3600);assert.equal(variable.thirteenth,300);assert.equal(variable.vacation,300);assert.equal(variable.vacationThird,100);
  assert.equal(variable.cpp,720);assert.equal(variable.fgts,288);
  const highRat=P.payrollCost({salario_base:3000},{...P.payrollDefaults,fap:2});
  assert.equal(highRat.rat,120);assert.ok(highRat.total>base.total);
  const off=P.payrollCost({salario_base:3000},{...P.payrollDefaults,include13:false,includeVacation:false});
  assert.equal(off.provisions,0);assert.equal(off.provisionCharges,0);assert.equal(off.total,4074);
});
test('valida política e impede coparticipação maior que benefício',()=>{
  assert.ok(P.validatePayrollPolicy({...P.payrollDefaults,fap:3}));
  assert.ok(P.validatePayrollPolicy({...P.payrollDefaults,cpp:-1}));
  assert.throws(()=>P.payrollCost({salario_base:3000,beneficios_brutos:900,coparticipacao_beneficios:901}));
  const event={tipo:'pacote_planejado',pessoa_id:'D003',vigencia:'2027-02-01',beneficios_brutos:900,coparticipacao_beneficios:100,medias_remuneratorias:0,outras_despesas:0};
  assert.equal(P.validateEvent(data,[],event),'');
  assert.ok(P.validateEvent(data,[event],event));
  const base=P.snapshot(data,[],'2027-02'),shared=P.snapshot(data,[event],'2027-02');
  assert.equal(P.round(base.cost-shared.cost),100);
  assert.equal(shared.breakdown.employerCharges,base.breakdown.employerCharges);
  assert.equal(P.snapshot(data,[event],'2027-01').cost,base.cost);
});
test('dashboard identifica pressão de orçamento a partir de abril e impacto anual do cenário',()=>{
  const scenario=data.cenarios.find(s=>s.id==='CEN_EXP');
  const s=Analytics.headcountSummary(data,scenario.eventos,data.encargos_base,'','2027-04');
  assert.equal(s.firstOver,'2027-04');assert.equal(s.last.headcount,7);assert.equal(s.last.vacancies,0);
  assert.equal(s.annualCost,690348.25);assert.equal(s.annualBudget,640320);
  assert.equal(s.annualDelta,154710.73);assert.equal(s.annualBalance,-50028.25);
  assert.equal(s.selected.month,'2027-04');assert.equal(s.occupation,100);
});
test('dashboard mantém o recorte de unidade e distingue cenário constante',()=>{
  const s=Analytics.headcountSummary(data,[],data.encargos_base,'U002');
  assert.equal(s.firstOver,null);assert.equal(s.annualDelta,0);assert.equal(s.last.headcount,1);
  assert.equal(s.units.length,1);assert.equal(s.units[0].id,'U002');
  assert.equal(s.units[0].cost,s.selected.cost);assert.equal(s.occupation,50);
});
test('dashboard de carreira separa enquadramento, indicações e prontidão',()=>{
  const s=Analytics.careerSummary(data);
  assert.deepEqual(s.salaryCounts,{below:1,within:3,above:1});
  assert.equal(s.covered,1);assert.equal(s.coverage,100);
  assert.equal(s.readiness.find(r=>r.id==='pronto_para_discussao').count,0);
  assert.equal(s.readiness.find(r=>r.id==='em_desenvolvimento_12_24_meses').count,1);
  assert.equal(s.proposalDelta,452.66);assert.equal(s.agenda.length,3);
  assert.equal(s.families.reduce((n,f)=>n+f.jobs,0),10);
  assert.equal(s.families.reduce((n,f)=>n+f.people,0),5);
});
test('remover indicação atualiza cobertura sem criar prontidão ou histórico',()=>{
  const before=JSON.stringify(data),s=Analytics.careerSummary(data,[]);
  assert.equal(s.coverage,0);assert.equal(s.covered,0);
  assert.equal(s.readiness.reduce((n,r)=>n+r.count,0),0);
  assert.equal(s.agenda.length,2);assert.equal(JSON.stringify(data),before);
});
