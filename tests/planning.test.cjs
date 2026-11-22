const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const P = require('../shared/planning-core.js');
const data = require('../shared/planning-data.json');

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
  assert.equal(s.cost,39080);assert.equal(s.budget,53360);
  assert.equal(P.project(data,[]).reduce((a,r)=>a+r.cost,0),468960);
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
test('filtros de unidade conciliam custos e orçamento; premissa zero remove só o fator', () => {
  const all=P.snapshot(data,[],'2027-01');
  const units=data.unidades.map(u=>P.snapshot(data,[],'2027-01',.3,u.id));
  for(const key of ['cost','headcount','approved','budget','vacancies'])assert.equal(units.reduce((a,u)=>a+u[key],0),all[key]);
  assert.equal(P.snapshot(data,[],'2027-01',0).cost,31100);
});
test('movimentos têm vigência mensal e ajuste anterior é encerrado pela saída', () => {
  const events=[{tipo:'desligamento_planejado',pessoa_id:'D003',vigencia:'2027-04-01'},
    {tipo:'ajuste_planejado',pessoa_id:'D003',vigencia:'2027-02-01',novo_salario_base:4200}];
  assert.equal(P.snapshot(data,events,'2027-01').cost,39080);
  assert.equal(P.snapshot(data,events,'2027-02').cost,39470);
  assert.equal(P.snapshot(data,events,'2027-04').cost,33110);
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
