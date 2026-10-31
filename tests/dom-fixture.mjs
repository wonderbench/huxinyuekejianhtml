// Minimal deterministic DOM/event fixture for behavior checks, not a browser renderer.
import vm from 'node:vm';
import fs from 'node:fs';
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[x]));
const kebab=s=>s.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
class Events{
  constructor(){this.events={};}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  removeEventListener(type,fn){this.events[type]=(this.events[type]||[]).filter(f=>f!==fn);}
  dispatch(type,extra={}){const e={type,target:this,defaultPrevented:false,bubbles:true,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},...extra};let n=this;while(n){e.currentTarget=n;for(const fn of [...(n.events?.[type]||[])])fn(e);if(e.stopped||!e.bubbles)break;n=n.parentElement;}return e;}
}
class TextNode{constructor(text){this.nodeType=3;this.raw=text;this.parentElement=null;}get textContent(){return decode(this.raw);}get outerHTML(){return this.raw;}}
function matchesSimple(el,selector){
  if(!(el instanceof Element))return false;
  const attrs=[...selector.matchAll(/\[([^\]\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*)))?\]/g)];
  const base=selector.replace(/\[[^\]]*\]/g,'');
  const tag=base.match(/^[\w-]+/);if(tag&&el.tagName!==tag[0].toLowerCase())return false;
  const id=base.match(/#([\w-]+)/);if(id&&el.getAttribute('id')!==id[1])return false;
  for(const m of base.matchAll(/\.([\w-]+)/g))if(!el.classList.contains(m[1]))return false;
  for(const [,key,dq,sq,raw]of attrs){if(!el.hasAttribute(key))return false;const val=dq??sq??raw;if(val!==undefined&&el.getAttribute(key)!==val)return false;}
  return true;
}
function matches(el,selector){return selector.split(',').some(part=>{const bits=part.trim().match(/(?:\[[^\]]*\]|[^\s])+/g)||[];let cursor=el;if(!matchesSimple(cursor,bits.pop()||'*'))return false;while(bits.length){const b=bits.pop();cursor=cursor.parentElement;while(cursor&&!matchesSimple(cursor,b))cursor=cursor.parentElement;if(!cursor)return false;}return true;});}
export class Element extends Events{
  constructor(tag='div',attrs={}){super();this.nodeType=1;this.tagName=tag.toLowerCase();this.attrs={...attrs};this.nodes=[];this.parentElement=null;this.style={};this.captured=new Set();this.dataset=new Proxy({}, {get:(_,key)=>this.attrs['data-'+kebab(key)],set:(_,key,val)=>{this.setAttribute('data-'+kebab(key),val);return true;}});const self=this;this.classList={contains(x){return (self.attrs.class||'').split(/\s+/).includes(x);},add(...xs){self.attrs.class=[...new Set([...(self.attrs.class||'').split(/\s+/).filter(Boolean),...xs])].join(' ');},remove(...xs){self.attrs.class=(self.attrs.class||'').split(/\s+/).filter(x=>x&&!xs.includes(x)).join(' ');},toggle(x,force){const on=force===undefined?!this.contains(x):force;if(on)this.add(x);else this.remove(x);return on;}};}
  get children(){return this.nodes.filter(x=>x instanceof Element);}
  get childNodes(){return this.nodes;}
  get firstElementChild(){return this.children[0]||null;}
  get className(){return this.attrs.class||'';}set className(v){this.attrs.class=v;}
  get textContent(){return this.nodes.map(x=>x.textContent).join('');}set textContent(v){this.nodes=[new TextNode(String(v))];this.nodes[0].parentElement=this;}
  get innerHTML(){return this.nodes.map(x=>x.outerHTML).join('');}set innerHTML(s){this.nodes=[];parse(String(s),this);}
  get outerHTML(){return '<'+this.tagName+Object.entries(this.attrs).map(([k,v])=>' '+k+'="'+String(v).replace(/"/g,'&quot;')+'"').join('')+'>'+this.innerHTML+'</'+this.tagName+'>';}
  get hidden(){return this.hasAttribute('hidden');}set hidden(v){if(v)this.setAttribute('hidden','');else this.removeAttribute('hidden');}
  get disabled(){return this.hasAttribute('disabled');}set disabled(v){if(v)this.setAttribute('disabled','');else this.removeAttribute('disabled');}
  get checked(){return this.hasAttribute('checked');}set checked(v){if(v)this.setAttribute('checked','');else this.removeAttribute('checked');}
  get value(){return this._value??this.attrs.value??'';}set value(v){this._value=String(v);}
  getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=String(v);}removeAttribute(k){delete this.attrs[k];}hasAttribute(k){return Object.hasOwn(this.attrs,k);}
  appendChild(x){x.parentElement=this;this.nodes.push(x);return x;}
  contains(x){for(let n=x;n;n=n.parentElement)if(n===this)return true;return false;}
  querySelectorAll(selector){const out=[];function visit(n){for(const c of n.children){if(matches(c,selector))out.push(c);visit(c);}}visit(this);return out;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  closest(selector){for(let n=this;n;n=n.parentElement)if(matches(n,selector))return n;return null;}
  matches(selector){return matches(this,selector);}
  click(){if(!this.disabled)this.dispatch('click');}
  focus(){this.focused=true;}
  setPointerCapture(id){this.captured.add(id);}releasePointerCapture(id){this.captured.delete(id);}hasPointerCapture(id){return this.captured.has(id);}
  createSVGPoint(){return{x:0,y:0,matrixTransform(){return{x:this.x,y:this.y};}};}
  getScreenCTM(){return{inverse(){return{};}};}
}
function parse(html,root){
  const stack=[root];const re=/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][^>]*>|[^<]+/g;let m;
  while((m=re.exec(html))){const token=m[0],parent=stack.at(-1);if(token.startsWith('<!'))continue;if(token.startsWith('</')){const tag=token.match(/^<\/([\w-]+)/)[1].toLowerCase();for(let i=stack.length-1;i>0;i--)if(stack[i].tagName===tag){stack.length=i;break;}continue;}if(token.startsWith('<')){const tag=token.match(/^<([\w-]+)/)[1],attrs={};const a=token.slice(tag.length+1).replace(/\/?\s*>$/,'');for(const x of a.matchAll(/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g))attrs[x[1]]=decode(x[2]??x[3]??x[4]??'');const el=new Element(tag,attrs);parent.appendChild(el);if(!/\/$/.test(token.slice(0,-1).trim())&&!['input','br','hr','meta','link','img','source','wbr'].includes(tag.toLowerCase())){if(['style','script'].includes(tag.toLowerCase())){const end=html.indexOf('</'+tag+'>',re.lastIndex);if(end>=0){el.appendChild(new TextNode(html.slice(re.lastIndex,end)));re.lastIndex=end+tag.length+3;}else stack.push(el);}else stack.push(el);}}else parent.appendChild(new TextNode(token));}
}
export function createApp(repo,ids=['life','translation','rotation','overlap','clock']){
  const document=new Element('document');document.innerHTML=fs.readFileSync(repo+'/src/shell.html','utf8');document.getElementById=id=>document.querySelector('#'+id);document.documentElement=document.querySelector('html');
  const window=new Events();const frames=new Map();let nextFrame=1,now=1;const storage=new Map();
  Object.assign(window,{matchMedia(){return{matches:false};}});
  const location={hash:''};const context={console,document,window,location,history:{replaceState(_a,_b,hash){location.hash=hash;}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(fn){const id=nextFrame++;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);}};
  const sandbox=vm.createContext(context);
  new vm.Script(fs.readFileSync(repo+'/src/core.js','utf8')).runInContext(sandbox);sandbox.Courseware=window.Courseware;
  for(const id of ids)new vm.Script(fs.readFileSync(repo+'/src/modules/'+id+'.js','utf8'),{filename:id+'.js'}).runInContext(sandbox);
  window.Courseware.boot();
  function advance(ms=20000){for(let i=0;i<Math.ceil(ms/16);i++){now+=16;const current=[...frames];frames.clear();for(const[,fn]of current)fn(now);}}
  const $=s=>{const el=document.querySelector(s);if(!el)throw new Error('Missing selector: '+s);return el;};
  return{document,window,context:sandbox,frames,$,advance,click(s){$(s).click();},change(s,checked){const el=$(s);el.checked=checked;el.dispatch('change');},input(s,value){const el=$(s);el.value=value;el.dispatch('input');},select(id){const el=document.querySelector('[data-module="'+id+'"]');if(el)el.click();else throw new Error('No module '+id);},storage};
}
