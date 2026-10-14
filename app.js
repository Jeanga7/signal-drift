const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),overlay=document.querySelector('#overlay'),start=document.querySelector('#start'),scoreEl=document.querySelector('#score'),bestEl=document.querySelector('#best'),mission=document.querySelector('#mission');
const W=canvas.width,H=canvas.height,keys={},player={x:W/2,y:H/2,r:10,v:4.1},packets=[],noise=[];let score=0,running=false,trail=[],best=Number(localStorage.getItem('signal-drift-best')||0),pointer=null;
bestEl.textContent=String(best).padStart(3,'0');
const rand=(min,max)=>Math.random()*(max-min)+min; const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function spawn(){while(packets.length<3)packets.push({x:rand(36,W-36),y:rand(36,H-36),r:7,phase:rand(0,6.2)});while(noise.length<Math.min(3+Math.floor(score/4),8))noise.push({x:rand(40,W-40),y:rand(40,H-40),r:rand(10,18),vx:rand(-1.1,1.1),vy:rand(-1.1,1.1)});}
function reset(){score=0;player.x=W/2;player.y=H/2;trail=[];packets.length=0;noise.length=0;spawn();mission.textContent='Collect 12 packets';scoreEl.textContent='000';}
function end(title,detail){running=false;overlay.classList.remove('is-hidden');overlay.innerHTML=`<p class="eyebrow">TRANSMISSION ${title==='Route completed.'?'COMPLETE':'INTERRUPTED'}</p><h2>${title}</h2><p>${detail}</p><button id="start" type="button">Run it again <span>↗</span></button>`;document.querySelector('#start').onclick=begin;}
function begin(){reset();running=true;overlay.classList.add('is-hidden');}
start.onclick=begin;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener('pointerdown',e=>{pointer=canvas.getBoundingClientRect();canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(pointer&&running){player.x=(e.clientX-pointer.left)/pointer.width*W;player.y=(e.clientY-pointer.top)/pointer.height*H}});canvas.addEventListener('pointerup',()=>pointer=null);
function step(){if(running){let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);if(dx||dy){let n=Math.hypot(dx,dy);player.x+=dx/n*player.v;player.y+=dy/n*player.v}player.x=Math.max(player.r,Math.min(W-player.r,player.x));player.y=Math.max(player.r,Math.min(H-player.r,player.y));trail.push({x:player.x,y:player.y,a:1});if(trail.length>32)trail.shift();trail.forEach(t=>t.a*=.94);noise.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<n.r||n.x>W-n.r)n.vx*=-1;if(n.y<n.r||n.y>H-n.r)n.vy*=-1});packets.forEach((p,i)=>{if(dist(player,p)<player.r+p.r+4){packets.splice(i,1);score++;scoreEl.textContent=String(score).padStart(3,'0');mission.textContent=score>=12?'Route stabilized':'Collect '+(12-score)+' more packet'+(11-score?'s':'')}});for(const n of noise)if(dist(player,n)<player.r+n.r){end('Signal lost.','A noisy node broke the route. Score: '+score+'.');break}if(score>=12){best=Math.max(best,score);localStorage.setItem('signal-drift-best',best);bestEl.textContent=String(best).padStart(3,'0');end('Route completed.','Twelve clean packets delivered. The signal is stable.')}spawn();}draw();requestAnimationFrame(step)}
function dot(x,y,r,c,a=1){ctx.globalAlpha=a;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
function draw(){ctx.clearRect(0,0,W,H);for(let i=0;i<45;i++){let x=(i*137)%W,y=(i*83)%H;dot(x,y,1,'#255466',.55)}trail.forEach((t,i)=>dot(t.x,t.y,Math.max(1,player.r*(i/trail.length)*.7),'#66ead8',t.a*.55));packets.forEach(p=>{let pulse=Math.sin(performance.now()/600+p.phase)*2;ctx.strokeStyle='#66ead8';ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(p.x,p.y,p.r+7+pulse,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;dot(p.x,p.y,p.r,'#66ead8');dot(p.x-2,p.y-2,2,'#eafffb')});noise.forEach(n=>{ctx.strokeStyle='rgba(255,110,118,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(n.x,n.y,n.r+5,0,Math.PI*2);ctx.stroke();dot(n.x,n.y,n.r,'#ff6e76',.24);dot(n.x,n.y,4,'#ff6e76')});ctx.shadowBlur=18;ctx.shadowColor='#39a5ff';dot(player.x,player.y,player.r,'#53b5ff');dot(player.x-3,player.y-3,3,'#ecffff');ctx.shadowBlur=0;}
step();


// Ergonomic controls: AZERTY first, with WASD kept as a fallback.
addEventListener("keydown", (event) => {
  const alias = { q: "a", z: "w" }[event.key.toLowerCase()];
  if (alias) keys[alias] = true;
});
addEventListener("keyup", (event) => {
  const alias = { q: "a", z: "w" }[event.key.toLowerCase()];
  if (alias) keys[alias] = false;
});

const fullscreenButton = document.createElement("button");
fullscreenButton.className = "fullscreen-button";
fullscreenButton.type = "button";
fullscreenButton.textContent = "⛶";
fullscreenButton.setAttribute("aria-label", "Play in fullscreen");
fullscreenButton.title = "Fullscreen";
document.querySelector(".console-top").append(fullscreenButton);

function syncFullscreenButton() {
  const active = Boolean(document.fullscreenElement);
  fullscreenButton.textContent = active ? "×" : "⛶";
  fullscreenButton.setAttribute("aria-label", active ? "Exit fullscreen" : "Play in fullscreen");
  fullscreenButton.title = active ? "Exit fullscreen" : "Fullscreen";
}
fullscreenButton.onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (_) {}
};
document.addEventListener("fullscreenchange", syncFullscreenButton);

const help = overlay.querySelector("p:not(.eyebrow)");
if (help) help.innerHTML = "Use <kbd>Z</kbd><kbd>Q</kbd><kbd>S</kbd><kbd>D</kbd> or arrows. WASD also works. On mobile, drag inside the field.";
const legend = document.querySelector(".console-bottom span:last-child");
if (legend) legend.textContent = "move: ZQSD / WASD / arrows";


/* Mobile arcade mode: landscape, joystick, inertia, dash and waves. */
(() => {
  const mobile = matchMedia("(pointer:coarse)").matches;
  if (!mobile) return;
  canvas.style.pointerEvents = "none";
  const gate = document.createElement("aside");
  gate.className = "mobile-gate";
  gate.innerHTML = "<b>▭</b><small>SIGNAL DRIFT / MOBILE</small><h2>Rotate your device.</h2><p>Landscape gives you the room to steer and dash.</p>";
  document.body.append(gate);
  const style = document.createElement("style");
  style.textContent = `.mobile-gate{display:none}@media (orientation:portrait) and (pointer:coarse){.mobile-gate{position:fixed;z-index:99;inset:0;display:grid;place-content:center;justify-items:center;padding:32px;text-align:center;background:#07131f;color:#eaf5f3}.mobile-gate b{font-size:64px;color:#66ead8;transform:rotate(90deg)}.mobile-gate small{margin-top:22px;color:#66ead8;font:10px DM Mono;letter-spacing:.12em}.mobile-gate h2{margin:12px 0;font:600 42px Space Grotesk;letter-spacing:-.06em}.mobile-gate p{max-width:270px;color:#92a7ae}}@media (orientation:landscape) and (pointer:coarse){.intro,footer,.console-bottom{display:none}.game-shell{width:100%;min-height:100dvh;padding:8px 12px}.topbar{height:30px}.console{height:calc(100dvh - 44px)}.console-top{min-height:44px;padding:7px 12px}.game-frame{height:calc(100% - 44px);min-height:0;aspect-ratio:auto}.boost{background:#39a5ff!important}.boost::after{content:"DASH";font:9px DM Mono;color:#fff}.boost{font-size:0!important}}`;
  document.head.append(style);
  let vx=0,vy=0,lastX=1,lastY=0,dashReady=0,dashUntil=0,grabbed=0,points=0,combo=0,last=0;
  const oldReset=reset; reset=function(){oldReset();vx=vy=0;points=combo=0;last=0;dashReady=0;mission.textContent="WAVE 1 · 0 / 12"};
  function mobileStep(){if(running&&!paused){const n=Math.hypot(touchVector.x,touchVector.y);if(n){lastX=touchVector.x/n;lastY=touchVector.y/n;vx+=lastX*.72;vy+=lastY*.72}const max=performance.now()<dashUntil?16:5.3,m=Math.hypot(vx,vy);if(m>max){vx=vx/m*max;vy=vy/m*max}player.x+=vx;player.y+=vy;vx*=.87;vy*=.87;player.x=Math.max(player.r,Math.min(W-player.r,player.x));player.y=Math.max(player.r,Math.min(H-player.r,player.y));trail.push({x:player.x,y:player.y,a:1});if(trail.length>32)trail.shift();trail.forEach(t=>t.a*=.94);noise.forEach(n=>{n.x+=n.vx*1.18;n.y+=n.vy*1.18;if(n.x<n.r||n.x>W-n.r)n.vx*=-1;if(n.y<n.r||n.y>H-n.r)n.vy*=-1});packets.forEach((p,i)=>{if(dist(player,p)<player.r+p.r+3){packets.splice(i,1);grabbed++;const now=performance.now();combo=now-last<2300?Math.min(combo+1,5):1;last=now;points+=combo;scoreEl.textContent=String(points).padStart(3,"0");mission.textContent=`WAVE ${Math.ceil(grabbed/4)||1} · ${grabbed} / 12 · x${combo}`;buzz(8)}});for(const n of noise)if(dist(player,n)<player.r+n.r){buzz([28,35,60]);end("Signal lost.","A noisy node broke the route. Score: "+points+".");break}if(grabbed>=12){best=Math.max(best,points);localStorage.setItem("signal-drift-best",best);bestEl.textContent=String(best).padStart(3,"0");end("Route completed.","Twelve packets delivered. Final chain: x"+combo+".")}spawn()}draw();requestAnimationFrame(step)}
  step=mobileStep;
  boost.onclick=()=>{if(!running||paused||performance.now()<dashReady)return;dashUntil=performance.now()+220;dashReady=performance.now()+1350;vx=lastX*16;vy=lastY*16;buzz(14)};
  start.onclick=()=>{begin();document.documentElement.requestFullscreen?.().catch(()=>{});screen.orientation?.lock?.("landscape").catch(()=>{})};
})();


/* Full-bleed mobile viewport: preserve the  game’s ratio and remove browser-page chrome. */
(() => {
  if (!matchMedia('(pointer: coarse)').matches) return;
  const viewportStyle = document.createElement('style');
  viewportStyle.textContent =     'html,body{width:100%;min-height:100%;overflow:hidden;overscroll-behavior:none}' +
    '@media (orientation:landscape) and (pointer:coarse){' +
      'body{background:#041522}' +
      '.game-shell{width:100%;height:100dvh;min-height:100svh;padding:0}' +
      '.topbar,.intro,footer,.console-bottom{display:none!important}' +
      '.console{width:100%;height:100%;border:0;border-radius:0;background:#041522;box-shadow:none}' +
      '.console-top{position:absolute;z-index:8;top:max(7px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left));right:max(8px,env(safe-area-inset-right));min-height:0;padding:7px 10px;border:1px solid rgba(167,232,224,.14);border-radius:10px;background:rgba(4,20,31,.72);backdrop-filter:blur(10px)}' +
      '.console-top>div:first-child{margin-right:auto}' +
      '.game-frame{width:100%;height:100%;min-height:0;display:grid;place-items:center;background:#041522}' +
      '#game{position:relative;width:100%;height:auto;max-width:100%;max-height:100%;aspect-ratio:960/520;object-fit:contain}' +
      '.game-frame:before{z-index:1}' +
      '.mobile-controls{z-index:9;left:max(18px,env(safe-area-inset-left));right:max(18px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom))}' +
    '}' +
    '@media (orientation:landscape) and (pointer:coarse) and (min-aspect-ratio:960/520){#game{width:auto;height:100%}}';
  document.head.append(viewportStyle);
})();


/* Bridge for the complete mobile controls. */
(() => {
  if (!matchMedia('(pointer:coarse)').matches) return;
  window.touchVector = {x:0,y:0};
  const joy=document.querySelector('#joystick'),stick=document.querySelector('#stick');
  if (!joy || !stick) return;
  const set=(e)=>{const r=joy.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,l=r.width*.28,n=Math.hypot(x,y)||1,k=Math.min(1,l/n);window.touchVector={x:x*k/l,y:y*k/l};stick.style.transform='translate('+x*k+'px,'+y*k+'px)'};
  const reset=()=>{window.touchVector={x:0,y:0};stick.style.transform='translate(0,0)'};
  joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);set(e)});joy.addEventListener('pointermove',e=>joy.hasPointerCapture(e.pointerId)&&set(e));joy.addEventListener('pointerup',reset);joy.addEventListener('pointercancel',reset);
})();
