import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/loaders/DRACOLoader.js';

let modelPromise;
export function loadSkeleton(){
  if(!modelPromise){
    const draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/draco/',import.meta.url).href);draco.setWorkerLimit(2);
    const loader=new GLTFLoader();loader.setDRACOLoader(draco);
    modelPromise=loader.loadAsync(new URL('./assets/skeletal.glb',import.meta.url).href).then(g=>{g.scene.updateMatrixWorld(true);return g.scene;});
  }
  return modelPromise;
}
const DIR={Anterior:[0,0,1],Posterior:[0,0,-1],'Left lateral':[1,0,0],'Right lateral':[-1,0,0],Superior:[0,1,.001],Inferior:[0,-1,.001]};
const BONE_COLOR=0xded8c1,SELECT_COLOR=0x569a7c;

export class AnatomyViewer{
  constructor(element,{onPick=()=>{},onCamera=()=>{},onReset=null,label=null,compact=false}={}){
    this.el=element;this.onPick=onPick;this.onCamera=onCamera;this.label=label;this.compact=compact;this.groups=new Map();this.meshes=[];this.selected=[];this.anchors=[];this.pinMeshes=[];this.isolated=false;this.ghost=false;this.labels=true;this.quiz=false;this.hiddenNames=new Set();this.viewName='Anterior';this.focusBox=null;this.side='Both';this.exploded=false;this.map=null;
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(34,1,.001,100);this.camera.position.set(0,.85,3.2);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.18;this.el.append(this.renderer.domElement);
    this.onThemeChange=()=>this.applyTheme();this.applyTheme();window.addEventListener('bonelab:themechange',this.onThemeChange);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.minDistance=.015;this.controls.maxDistance=6;this.controls.target.set(0,.85,0);this.controls.enablePan=true;
    this.onReset=onReset;this.skullOpen=false;this.movingCamera=false;
    this.onControlsChange=()=>{if(!this.movingCamera)this.cameraName('Custom');};
    this.controls.addEventListener('change',this.onControlsChange);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x8b9988,2.15));
    const key=new THREE.DirectionalLight(0xfff9eb,3.4);key.position.set(-2,3,4);this.scene.add(key);
    const fill=new THREE.DirectionalLight(0xc9e2dd,1.2);fill.position.set(2,1,-3);this.scene.add(fill);
    this.modelRoot=new THREE.Group();this.scene.add(this.modelRoot);this.pinRoot=new THREE.Group();this.scene.add(this.pinRoot);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.down=null;
    this.pointers=new Set();this.onPointerDown=e=>this.pointerDown(e);this.onPointerMove=e=>this.pointerMove(e);this.onPointerUp=e=>this.pointerUp(e);this.onPointerCancel=e=>{this.pointers.delete(e.pointerId);this.down=null;};this.onKeyDown=e=>this.keyboard(e);
    for(const [type,handler] of [['pointerdown',this.onPointerDown],['pointermove',this.onPointerMove],['pointerup',this.onPointerUp],['pointercancel',this.onPointerCancel],['keydown',this.onKeyDown]])this.el.addEventListener(type,handler);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.el);this.resize();
    this.animate=()=>{if(this.disposed)return;this.frame=requestAnimationFrame(this.animate);if(this.el.getBoundingClientRect().width<1)return;this.controls.update();this.updatePins();this.renderer.render(this.scene,this.camera);};this.animate();
  }
  async load(){
    const source=await loadSkeleton();
    if(this.disposed)return this;
    const nodes=[];source.traverse(o=>{if(o.userData.za_name)nodes.push(o);});
    for(const node of nodes){
      const name=node.userData.za_name;const group=new THREE.Group();group.name=name;group.userData.za_name=name;group.matrix.copy(node.matrixWorld);group.matrix.decompose(group.position,group.quaternion,group.scale);group.userData.originalPosition=group.position.clone();
      const inv=node.matrixWorld.clone().invert();
      const visit=o=>{if(o!==node&&o.userData.za_name)return;if(o.isMesh){const material=new THREE.MeshStandardMaterial({color:/cartilage/i.test(o.material?.name)?0xbad0c4:BONE_COLOR,roughness:.66,metalness:0,side:THREE.DoubleSide});const mesh=new THREE.Mesh(o.geometry,material);mesh.matrix.copy(inv.clone().multiply(o.matrixWorld));mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.userData.nodeName=name;mesh.userData.baseColor=material.color.clone();group.add(mesh);this.meshes.push(mesh);}for(const child of o.children)visit(child);};visit(node);
      this.groups.set(name,group);this.modelRoot.add(group);
      if(/sinus|cells of ethmoid|thyroid|cricoid|arytenoid|epiglott/i.test(name))this.hiddenNames.add(name);
    }
    this.scene.updateMatrixWorld(true);this.ready=true;this.refresh();this.full();return this;
  }
  resize(){const w=this.el.clientWidth,h=this.el.clientHeight;if(w<1||h<1)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  applyTheme(){this.dark=document.documentElement.dataset.theme==='dark';this.renderer.toneMappingExposure=this.dark ? 0.92 : 1.18;for(const pin of this.pinMeshes)pin.material.color.setHex(this.dark?0x8ad5bd:0x216e5a);}
  nodesFor(map,side='Both'){return (map?.nodes||[]).filter(n=>side==='Both'||!/[.]([lr])$/.test(n)||n.endsWith(side==='Left'?'.l':'.r'));}
  select(map,{side='Both',focus=false,quiz=false,label='',highlight=true,isolate,anchorIndex}={}){
    // Selecting a structure changes only its highlight, pins and information.
    if(!focus)this.moveCamera(this.camera.position,this.controls.target,this.viewName);
    this.map=map;this.side=side;this.quiz=quiz;this.labelText=label;this.highlight=highlight;this.selected=this.nodesFor(map,side);
    this.anchors=(map?.anchors||[]).filter(a=>side==='Both'||!a.side||a.side===side);
    if(Number.isInteger(anchorIndex))this.anchors=this.anchors.slice(anchorIndex,anchorIndex+1);
    if(isolate!==undefined)this.isolated=isolate;
    this.clearPins();
    if(map?.type==='landmark'&&highlight){for(const a of this.anchors){const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:this.dark?0x8ad5bd:0x216e5a,depthTest:false}));sphere.renderOrder=20;sphere.userData.anchor=a;this.pinRoot.add(sphere);this.pinMeshes.push(sphere);}}
    this.refresh();if(focus)this.focus();
  }
  clearPins(){for(const p of this.pinMeshes){this.pinRoot.remove(p);p.geometry.dispose();p.material.dispose();}this.pinMeshes=[];}
  point(a){return this.groups.get(a.node)?.localToWorld(new THREE.Vector3(...a.point));}
  refresh(){
    const selected=new Set(this.selected);
    for(const [name,g] of this.groups){g.visible=!this.hiddenNames.has(name)&&(!this.isolated||selected.has(name));if(selected.has(name))g.visible=true;
      g.traverse(m=>{if(!m.isMesh)return;const hit=selected.has(name)&&this.highlight&&this.map?.type==='mesh';m.material.color.copy(hit?new THREE.Color(SELECT_COLOR):m.userData.baseColor);m.material.transparent=this.ghost&&!selected.has(name);m.material.opacity=m.material.transparent?.13:1;m.material.depthWrite=!m.material.transparent;m.material.needsUpdate=true;});
    }
    if(this.label)this.label.hidden=!this.labels||this.quiz||!this.labelText||!this.selected.length;
  }
  box(names){const box=new THREE.Box3();for(const name of names){const g=this.groups.get(name);if(g)box.union(new THREE.Box3().setFromObject(g));}return box;}
  cameraName(name){if(this.viewName===name)return;this.viewName=name;this.onCamera(name);}
  moveCamera(position,target,name=this.viewName){
    // Flush OrbitControls inertia before setting a view, so a previous drag
    // cannot pull the next focus/preset away from the requested position.
    const p=position.clone(),t=target.clone(),damping=this.controls.enableDamping;
    this.movingCamera=true;this.controls.enableDamping=false;
    try{this.controls.update();this.camera.position.copy(p);this.controls.target.copy(t);this.controls.update();}
    finally{this.controls.enableDamping=damping;this.movingCamera=false;}
    this.cameraName(name);
  }
  direction(){return this.camera.position.clone().sub(this.controls.target).normalize();}
  frameBox(box,direction=this.direction(),name=this.viewName){
    if(box.isEmpty())return;
    this.focusBox=box.clone();const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
    const radius=Math.max(size.x,size.y,size.z,.02)*.5,aspect=Math.min(this.camera.aspect,1);
    const distance=radius/Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))/aspect*1.28;
    const dir=direction.isVector3?direction.clone():new THREE.Vector3(...direction);
    this.moveCamera(center.clone().addScaledVector(dir.normalize(),distance),center,name);
  }
  focus({bestView=false,direction='Anterior'}={}){
    if(!this.selected.length)return;
    let dir=this.direction(),name=this.viewName;
    if(bestView){dir=new THREE.Vector3(...(DIR[direction]||DIR.Anterior));name=direction;
      if(this.map?.type==='landmark'&&this.anchors[0]){const a=this.anchors[0],g=this.groups.get(a.node);if(g){dir=new THREE.Vector3(...a.direction).transformDirection(g.matrixWorld);name='Suggested';}}
    }
    this.frameBox(this.box(this.selected),dir,name);
  }
  full(){this.isolated=false;this.ghost=false;this.setExploded(false);this.openSkull(false);this.refresh();const names=[...this.groups.keys()].filter(n=>this.groups.get(n).visible);this.frameBox(this.box(names),DIR.Anterior,'Anterior');}
  setView(name){if(!DIR[name])return;const target=this.controls.target.clone(),distance=this.camera.position.distanceTo(target);this.moveCamera(target.clone().addScaledVector(new THREE.Vector3(...DIR[name]).normalize(),distance),target,name);}
  captureView(){return {position:this.camera.position.toArray(),target:this.controls.target.toArray(),viewName:this.viewName,isolated:this.isolated,ghost:this.ghost,labels:this.labels,skullOpen:this.skullOpen,exploded:this.exploded};}
  restoreView(saved){if(!saved)return;this.isolated=saved.isolated;this.ghost=saved.ghost;this.labels=saved.labels;this.openSkull(saved.skullOpen);this.setExploded(saved.exploded);this.refresh();this.moveCamera(new THREE.Vector3(...saved.position),new THREE.Vector3(...saved.target),saved.viewName);}
  setLabels(value){this.labels=value;this.refresh();}
  setIsolate(value){this.isolated=value;this.refresh();}
  setGhost(value){this.ghost=value;this.refresh();}
  openSkull(value){this.skullOpen=value;for(const n of ['Frontal bone','Parietal bone.l','Parietal bone.r','Mandible']){if(value)this.hiddenNames.add(n);else this.hiddenNames.delete(n);}this.refresh();}
  setExploded(value){this.exploded=value;for(const name of ['Hip bone.l','Hip bone.r','Sacrum','Coccyx']){const g=this.groups.get(name);if(!g)continue;g.position.copy(g.userData.originalPosition);if(value){if(name.endsWith('.l'))g.position.x+=.09;if(name.endsWith('.r'))g.position.x-=.09;if(name==='Coccyx')g.position.y-=.04;}}this.scene.updateMatrixWorld(true);}
  updatePins(){
    for(const p of this.pinMeshes){const a=p.userData.anchor;const pos=this.point(a);if(pos){p.position.copy(pos);p.scale.setScalar(this.camera.position.distanceTo(pos)*.005);}}
    if(this.label&&!this.label.hidden){let p=this.anchors[0]?this.point(this.anchors[0]):this.box(this.selected.slice(0,1)).getCenter(new THREE.Vector3());if(!p)return;p=p.clone().project(this.camera);const w=this.el.clientWidth,h=this.el.clientHeight;const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;this.label.textContent=this.labelText;this.label.style.left=Math.max(6,Math.min(w-180,x))+'px';this.label.style.top=Math.max(35,Math.min(h-35,y))+'px';this.label.style.opacity=p.z>1?'0':'1';}
  }
  pointerDown(e){this.pointers.add(e.pointerId);if(this.pointers.size!==1||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey){this.down=null;return;}this.down={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};}
  pointerMove(e){if(this.down?.id===e.pointerId&&Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>=6)this.down.moved=true;}
  pointerUp(e){this.pointerMove(e);const down=this.down;this.pointers.delete(e.pointerId);this.down=null;if(down?.id===e.pointerId&&!down.moved&&this.pointers.size===0)this.pick(e);}
  pick(e){const rect=this.el.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const visible=this.meshes.filter(m=>m.parent.visible);const hits=this.raycaster.intersectObjects(visible,false);this.onPick({node:hits[0]?.object.userData.nodeName,point:hits[0]?.point,ray:this.raycaster.ray.clone()});}
  matchLandmarkPick(pick,anchors){
    for(const a of anchors){const pos=this.point(a);if(!pos)continue;const box=this.box([a.node]),diag=box.getSize(new THREE.Vector3()).length();const tolerance=Math.max(.0025,Math.min(.009,diag*.025));
      // Point grading is restricted to a small neighborhood of a source-authored pointer.
      if(pick.point&&pick.node===a.node&&pick.point.distanceTo(pos)<=tolerance)return true;
      if(pick.ray&&pick.ray.distanceToPoint(pos)<=tolerance&&(!pick.point||pick.point.distanceTo(this.camera.position)+tolerance>=pos.distanceTo(this.camera.position)))return true;
    }return false;
  }
  keyboard(e){const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'];if(!keys.includes(e.key))return;e.preventDefault();if(e.key.toLowerCase()==='r')return this.onReset?this.onReset():this.full();const delta=this.camera.position.clone().sub(this.controls.target);if(['+','=','-'].includes(e.key))delta.multiplyScalar(e.key==='-'?1.12:.88);else{const axis=e.key==='ArrowLeft'||e.key==='ArrowRight'?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);delta.applyAxisAngle(axis,['ArrowLeft','ArrowUp'].includes(e.key)?.12:-.12);}this.moveCamera(this.controls.target.clone().add(delta),this.controls.target,'Custom');}
  dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);window.removeEventListener('bonelab:themechange',this.onThemeChange);for(const [type,handler] of [['pointerdown',this.onPointerDown],['pointermove',this.onPointerMove],['pointerup',this.onPointerUp],['pointercancel',this.onPointerCancel],['keydown',this.onKeyDown]])this.el.removeEventListener(type,handler);this.resizeObserver.disconnect();this.controls.removeEventListener('change',this.onControlsChange);this.controls.dispose();this.clearPins();for(const m of this.meshes)m.material.dispose();this.renderer.dispose();this.el.replaceChildren();}
}
