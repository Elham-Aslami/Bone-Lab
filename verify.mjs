import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gradeAnswer,sanitizeProgress,normalize} from './dist/core.mjs';
const read=f=>JSON.parse(fs.readFileSync(new URL(f,import.meta.url),'utf8'));
const data=read('./dist/data/structures.json'),maps=read('./dist/data/model-map.json'),coverage=read('./dist/data/coverage.json');
assert.equal(data.length,104);assert.equal(new Set(data.map(s=>s.id)).size,104);assert.equal(data.filter(s=>s.division==='Axial').length,46);assert.equal(data.filter(s=>s.division==='Appendicular').length,58);
const glb=fs.readFileSync(new URL('./dist/assets/skeletal.glb',import.meta.url));assert.equal(glb.toString('utf8',0,4),'glTF');const g=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));const nodes=new Set(g.nodes.map(n=>n.extras?.za_name||n.name));
for(const s of data){assert.ok(s.location&&s.clues.length&&s.function,s.id);assert.ok(s.source.pages.every(p=>Number.isInteger(p)&&p>=1&&p<=61));if(s.parentId)assert.ok(data.some(p=>p.id===s.parentId),s.id);const m=maps[s.id];assert.ok(m);assert.ok(m.nodes.length,s.id+' missing context');assert.ok(m.nodes.every(n=>nodes.has(n)),s.id);if(m.type==='landmark'){assert.ok(m.anchors.length);for(const a of m.anchors){assert.ok(nodes.has(a.node));assert.ok(a.point.length===3&&a.point.every(Number.isFinite));assert.ok(a.direction.length===3&&a.direction.every(Number.isFinite));assert.ok(a.sourceLabel);}}}
for(const k of ['mesh','landmark','reference'])assert.equal(Object.values(maps).filter(m=>m.type===k).length,coverage.counts[k]);
const get=id=>data.find(s=>s.id===id);
assert.ok(gradeAnswer('frontal bone',get('frontal'),data));assert.ok(gradeAnswer('frontall bone',get('frontal'),data));assert.ok(!gradeAnswer('parietal bone',get('frontal'),data));
assert.ok(!gradeAnswer('coronoid process of mandible',get('ulna-coronoid'),data));assert.ok(!gradeAnswer('styloid process of temporal bone',get('ulna-styloid'),data));assert.ok(!gradeAnswer('lateral condyle of femur',get('femur-medial-condyle'),data));assert.ok(!gradeAnswer('',get('humerus'),data));
assert.ok(gradeAnswer('external acoustic meatus',get('external-auditory-meatus'),data));assert.ok(gradeAnswer('centrum',get('vertebral-body'),data));
const restored=sanitizeProgress({app:'biol270-bone-lab',version:1,records:{humerus:{confidence:'Confident',attempts:3,correct:9,missed:-1,bookmark:true},unknown:{attempts:44}}},data.map(s=>s.id));assert.equal(restored.humerus.correct,3);assert.equal(restored.humerus.missed,0);assert.equal(restored.humerus.confidence,'Confident');assert.equal(restored.unknown,undefined);assert.throws(()=>sanitizeProgress({},[]));
// Every document query selector ID used by static handlers is supplied by HTML or a rendered template.
const html=fs.readFileSync(new URL('./dist/index.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('./dist/app.mjs',import.meta.url),'utf8');for(const [,id] of js.matchAll(/\$\('#([a-z-]+)'\)/g))assert.ok((html+js).includes('id="'+id+'"'),id+' lacks a declared element');
console.log(`PASS: ${data.length} terms, ${coverage.counts.mesh} model groups, ${coverage.counts.landmark} landmarks, ${coverage.counts.reference} explicitly limited items. Source pages, mesh links, answer disambiguation, and progress import checked.`);
