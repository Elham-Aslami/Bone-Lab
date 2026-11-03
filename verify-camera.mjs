import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

// Resolve the browser's import-map entry without installing another Three.js.
const threeURL=new URL('./dist/vendor/three.module.js',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){return specifier==='three'?{url:threeURL,shortCircuit:true}:nextResolve(specifier,context);}});
const THREE=await import(threeURL);
const {OrbitControls}=await import('./dist/vendor/OrbitControls.js');
const {AnatomyViewer}=await import('./dist/viewer.mjs');

class Canvas extends EventTarget{
  style={};clientWidth=800;clientHeight=600;root=new EventTarget();
  getRootNode(){return this.root;}
  getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}
  setPointerCapture(){}
  releasePointerCapture(){}
}

function fixture(){
  // Exercise the production camera methods with real Three.js geometry and
  // OrbitControls. A GPU/renderer is deliberately unnecessary for these checks.
  const v=Object.create(AnatomyViewer.prototype),canvas=new Canvas();
  Object.assign(v,{scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(34,4/3,.001,100),groups:new Map(),meshes:[],selected:[],anchors:[],pinMeshes:[],hiddenNames:new Set(),pinRoot:new THREE.Group(),isolated:false,ghost:false,labels:true,quiz:false,skullOpen:false,exploded:false,map:null,viewName:'Anterior',pointers:new Set(),down:null,onCamera:()=>{}});
  v.camera.position.set(0,.85,3.2);v.controls=new OrbitControls(v.camera,canvas);v.controls.target.set(0,.85,0);v.controls.enableDamping=true;v.controls.dampingFactor=.09;v.controls.minDistance=.015;v.controls.maxDistance=6;
  v.controls.addEventListener('change',()=>{if(!v.movingCamera)v.cameraName('Custom');});
  for(const [name,position] of [['Humerus.l',[.3,.5,0]],['Radius.l',[.2,.1,0]],['Frontal bone',[0,1.5,0]],['Hip bone.l',[.15,0,0]],['Sacrum',[0,0,0]]]){
    const group=new THREE.Group();group.position.fromArray(position);group.userData.originalPosition=group.position.clone();
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(.08,.25,.06),new THREE.MeshStandardMaterial());mesh.userData.baseColor=mesh.material.color.clone();group.add(mesh);v.groups.set(name,group);v.meshes.push(mesh);v.scene.add(group);
  }
  v.scene.add(v.pinRoot);v.scene.updateMatrixWorld(true);
  v.moveCamera(new THREE.Vector3(.8,.7,-1.8),new THREE.Vector3(.13,.32,.07),'Custom');
  return {v,canvas};
}
const near=(a,b,message)=>assert.ok(a.distanceTo(b)<1e-9,message);
const state=v=>({position:v.camera.position.clone(),target:v.controls.target.clone(),direction:v.direction()});
function unchanged(v,s,message){near(v.camera.position,s.position,message+' (position)');near(v.controls.target,s.target,message+' (pan)');near(v.direction(),s.direction,message+' (angle)');}
const bone={type:'mesh',nodes:['Humerus.l']};
const landmark={type:'landmark',nodes:['Radius.l'],anchors:[{node:'Radius.l',point:[0,.1,0],direction:[0,0,1],side:'Left'}]};
const {v,canvas}=fixture();

const initial=state(v);
v.select(bone);unchanged(v,initial,'Whole-bone selection must preserve the camera');
v.select(landmark);unchanged(v,initial,'Landmark selection must preserve the camera');
v.select(bone,{side:'Right'});unchanged(v,initial,'Side selection must preserve the camera');
v.select(bone);v.setIsolate(true);v.setGhost(true);v.setLabels(false);v.openSkull(true);
unchanged(v,initial,'Visibility controls must preserve the camera');

v.focus();near(v.direction(),initial.direction,'Focus must keep an arbitrary dragged angle');
near(v.controls.target,v.box(['Humerus.l']).getCenter(new THREE.Vector3()),'Focus must center the chosen structure');
const beforePreset=state(v),distance=v.camera.position.distanceTo(v.controls.target);
v.setView('Posterior');near(v.controls.target,beforePreset.target,'A preset must preserve pan target');
assert.ok(Math.abs(v.camera.position.distanceTo(v.controls.target)-distance)<1e-9,'A preset must preserve zoom');
near(v.direction(),new THREE.Vector3(0,0,-1),'Posterior preset must actually face posteriorly');
v.select(landmark);v.focus();near(v.direction(),new THREE.Vector3(0,0,-1),'Focusing a landmark must not silently use its suggested angle');
v.focus({bestView:true});near(v.direction(),new THREE.Vector3(0,0,1),'Explicit suggested view must use the source landmark direction');

function pointer(type,id,x,y,button=0){const event=new Event(type);Object.assign(event,{pointerId:id,pointerType:'mouse',button,clientX:x,clientY:y,pageX:x,pageY:y});return event;}
canvas.dispatchEvent(pointer('pointerdown',1,100,100));canvas.dispatchEvent(pointer('pointermove',1,180,130));canvas.dispatchEvent(pointer('pointerup',1,180,130));
assert.equal(v.viewName,'Custom','Actual mouse orbit must clear the preset label');
const dragged=state(v);v.select(bone);for(let i=0;i<10;i++)v.controls.update();
unchanged(v,dragged,'Selecting during drag inertia must stop further drift');

v.openSkull(true);v.setExploded(true);v.setIsolate(true);v.setGhost(true);v.setLabels(false);
const saved=v.captureView(),savedState=state(v);v.full();
assert.equal(v.skullOpen,false);assert.equal(v.exploded,false);assert.equal(v.isolated,false);assert.equal(v.ghost,false);
near(v.direction(),new THREE.Vector3(0,0,1),'Reset must return to the full anterior view');
v.restoreView(saved);unchanged(v,savedState,'Returning to Explore must restore the camera');
assert.ok(v.skullOpen&&v.exploded&&v.isolated&&v.ghost&&!v.labels,'Explore visibility settings must be restored');
let resets=0;v.onReset=()=>resets++;v.keyboard({key:'r',preventDefault(){}});assert.equal(resets,1,'Keyboard reset must use the same app handler as the reset button');

let picks=0;v.pick=()=>picks++;
v.pointerDown(pointer('pointerdown',1,100,100));v.pointerMove(pointer('pointermove',1,150,100));v.pointerUp(pointer('pointerup',1,100,100));assert.equal(picks,0,'Dragging back to the start must not select a bone');
v.pointerDown(pointer('pointerdown',1,100,100,2));v.pointerUp(pointer('pointerup',1,100,100,2));assert.equal(picks,0,'Right-click/pan must not select a bone');
v.pointerDown(pointer('pointerdown',1,100,100));v.pointerDown(pointer('pointerdown',2,110,100));v.pointerUp(pointer('pointerup',1,100,100));v.pointerUp(pointer('pointerup',2,110,100));assert.equal(picks,0,'A multi-touch gesture must not select a bone');
v.pointerDown(pointer('pointerdown',1,100,100));v.pointerUp(pointer('pointerup',1,102,100));assert.equal(picks,1,'A normal click must still select a bone');
v.controls.dispose();
console.log('PASS: camera preservation, focus, presets, drag inertia, Explore restoration, reset, and click/drag separation using bundled Three.js and OrbitControls.');
