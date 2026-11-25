"use strict";
/* ============ ПЛЕЙСХОЛДЕРЫ: заменить на свои ============ */
const TG_MANAGER = "https://t.me/azura_travel_bot";   // бот/менеджер по заявкам
const TG_SUPPORT = "https://t.me/azura_support_bot";  // бот техподдержки
/* ======================================================= */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/,/g,' ');
const rub = n => fmt(n) + ' ₽';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- SCENE GENERATOR (SVG «фото» направлений) ---------- */
function scene(type, c){
  const id = 'g'+Math.random().toString(36).slice(2,8);
  let accent='';
  if(type==='beach'){
    accent = `<rect x="0" y="196" width="400" height="1.5" fill="#fff" opacity="0.26"/><ellipse cx="200" cy="201" rx="230" ry="26" fill="#fff" opacity="0.09"/>`;
  } else if(type==='city'){
    accent = `<g opacity="0.12" fill="#fff"><rect x="152" y="118" width="116" height="182"/><rect x="66" y="150" width="68" height="150"/><rect x="288" y="138" width="58" height="162"/></g>`;
  } else {
    accent = `<path d="M-20 214 Q130 150 250 198 T420 185 L420 300 L-20 300 Z" fill="#06231f" opacity="0.14"/>`;
  }
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${id}a" x1="0" y1="0" x2="0.85" y2="1">
        <stop offset="0" stop-color="${c.sky}"/><stop offset="0.5" stop-color="${c.c2}"/><stop offset="1" stop-color="${c.c1}"/>
      </linearGradient>
      <radialGradient id="${id}s" cx="76%" cy="20%" r="66%">
        <stop offset="0" stop-color="#fff" stop-opacity="0.5"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id}v" cx="50%" cy="42%" r="80%">
        <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#021713" stop-opacity="0.4"/>
      </radialGradient>
      <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer></filter>
    </defs>
    <rect width="400" height="300" fill="url(#${id}a)"/>${accent}
    <rect width="400" height="300" fill="url(#${id}s)"/>
    <rect width="400" height="300" fill="url(#${id}v)"/>
    <rect width="400" height="300" filter="url(#${id}n)"/>
  </svg>`;
}

/* ---------- AVATAR GENERATOR (нарисованные лица, детерминированно по имени) ---------- */
function avatar(seed){
  let h=2166136261; const s=String(seed);
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  let a=h>>>0;
  const r=()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const pick=arr=>arr[Math.floor(r()*arr.length)];
  const skin=pick(['#F3CDA6','#E9B78C','#D29C72','#B87A4F','#9B6B45','#F5D9BE']);
  const hair=pick(['#2A2320','#43301F','#6B4A2E','#A86B2D','#CDA64B','#9A9A9A','#B5522E','#15110F']);
  const shirt=pick(['#0D5C63','#1FA7B5','#C98A1E','#3A6EA5','#5E7D52','#8257C5','#D96A4A','#2E6D5B']);
  const bg=pick(['#EAF4F2','#FDE7DF','#F7ECD4','#E6EFF7','#E9F3E7','#F0EAFA']);
  const st=Math.floor(r()*5), glasses=r()<0.26, beard=r()<0.22, dark='#3a2a20';
  const longback = st===2 ? `<path d="M20 56 Q16 18 40 14 Q64 18 60 56 L54 56 Q59 24 40 22 Q21 24 26 56 Z" fill="${hair}"/>` : '';
  let top;
  if(st===0) top=`<path d="M24 33 Q24 14 40 14 Q56 14 56 33 Q55 25 40 25 Q25 25 24 33 Z" fill="${hair}"/>`;
  else if(st===1) top=`<path d="M23 34 Q22 14 40 14 Q58 14 57 34 Q57 26 52 24 Q54 30 40 24 Q26 30 23 34 Z" fill="${hair}"/>`;
  else if(st===2) top=`<path d="M24 32 Q24 15 40 15 Q56 15 56 32 Q55 25 40 25 Q25 25 24 32 Z" fill="${hair}"/>`;
  else if(st===3) top=`<circle cx="40" cy="13" r="5" fill="${hair}"/><path d="M25 32 Q25 16 40 16 Q55 16 55 32 Q54 26 40 26 Q26 26 25 32 Z" fill="${hair}"/>`;
  else top=`<path d="M25 31 Q26 19 40 19 Q54 19 55 31 Q51 25 40 25 Q29 25 25 31 Z" fill="${hair}" opacity="0.9"/>`;
  const beardP = beard ? `<path d="M26 37 Q27 50 40 52 Q53 50 54 37 Q50 46 40 47 Q30 46 26 37 Z" fill="${hair}"/>` : '';
  const glassesP = glasses ? `<g fill="none" stroke="${dark}" stroke-width="1.3" opacity="0.85"><circle cx="34" cy="34" r="4"/><circle cx="46" cy="34" r="4"/><path d="M38 34h4M30 33l-3-1M50 33l3-1"/></g>` : '';
  return `<svg viewBox="0 0 80 80" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="${bg}"/>${longback}
    <path d="M14 80 Q15 60 30 55 L50 55 Q65 60 66 80 Z" fill="${shirt}"/>
    <rect x="35" y="44" width="10" height="12" rx="4" fill="${skin}"/>
    <ellipse cx="25" cy="34" rx="3" ry="4" fill="${skin}"/><ellipse cx="55" cy="34" rx="3" ry="4" fill="${skin}"/>
    <ellipse cx="40" cy="33" rx="15" ry="16" fill="${skin}"/>${top}${beardP}
    <ellipse cx="34.5" cy="34" rx="1.7" ry="2" fill="${dark}"/><ellipse cx="45.5" cy="34" rx="1.7" ry="2" fill="${dark}"/>
    <path d="M35.5 40.5 Q40 44 44.5 40.5" fill="none" stroke="${dark}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>${glassesP}
  </svg>`;
}

/* ---------- REAL PHOTO AVATARS (фото людей, с SVG-фолбэком если внешние картинки заблокированы) ---------- */
function photo(seed){
  const s=String(seed); let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; }
  const first=s.split(' ')[0], lc=first.slice(-1).toLowerCase();
  const female=(lc==='а'||lc==='я');
  return `https://randomuser.me/api/portraits/${female?'women':'men'}/${h%100}.jpg`;
}
function faceHTML(seed){ return `<img class="face" src="${photo(seed)}" alt="" loading="lazy" data-seed="${encodeURIComponent(String(seed))}">`; }
function photoURL(id){ return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1100&q=70`; }
function mediaHTML(d){ return `<img class="photo" src="${photoURL(d.img)}" alt="${d.name||''}" loading="lazy" data-sc="${d.scene||'beach'}" data-c='${JSON.stringify(d.c||{})}'>`; }
function mediaHTMLImg(imgId,d){ return `<img class="photo" src="${photoURL(imgId)}" alt="${d.name||''}" loading="lazy" data-sc="${d.scene||'beach'}" data-c='${JSON.stringify(d.c||{})}'>`; }
document.addEventListener('error', e=>{
  const img=e.target;
  if(!img || img.tagName!=='IMG' || img.dataset.fb) return;
  if(img.classList.contains('face')){
    img.dataset.fb='1';
    const span=document.createElement('span'); span.className='face';
    span.innerHTML=avatar(decodeURIComponent(img.dataset.seed||''));
    img.replaceWith(span);
  } else if(img.classList.contains('photo')){
    img.dataset.fb='1';
    let c; try{ c=JSON.parse(img.dataset.c); }catch(_){ c={c1:'#0E6E72',c2:'#3FB5AE',sky:'#CFEBE6'}; }
    const span=document.createElement('span'); span.className='photo-fallback';
    span.innerHTML=scene(img.dataset.sc||'beach', c);
    img.replaceWith(span);
  }
}, true);

/* ---------- DATA ---------- */
const DEST = [
  {id:'mdv', name:'Мальдивы', area:'Атолл Баа · вилла на воде 5★', meal:'Завтраки', vibes:['beach','romance'], price:249000, old:329000, nights:7, rating:4.9, seats:3, scene:'beach', img:'1697898109604-e06e88b15271', c:{c1:'#0E6E72',c2:'#3FB5AE',sky:'#CFEBE6'}},
  {id:'dxb', name:'Дубай', area:'ОАЭ · Marina View 5★', meal:'Завтраки', vibes:['party','family','adventure'], price:96000, old:132000, nights:6, rating:4.8, seats:5, scene:'city', img:'1459787915554-b34915863013', c:{c1:'#7E5A2C',c2:'#C99A52',sky:'#EEDFC2'}},
  {id:'tur', name:'Турция', area:'Анталья · Ultra All 5★', meal:'Всё включено', vibes:['beach','family'], price:72000, old:95000, nights:7, rating:4.7, seats:8, scene:'beach', img:'1582030826675-8b596001240a', c:{c1:'#15567F',c2:'#4E98C0',sky:'#D3E6F0'}},
  {id:'bal', name:'Бали', area:'Индонезия · вилла с бассейном', meal:'Завтраки', vibes:['adventure','romance'], price:157000, old:198000, nights:9, rating:4.9, seats:4, scene:'mountain', img:'1692736933760-8a8a9b8c1b6f', c:{c1:'#1E5E47',c2:'#4E9E79',sky:'#D8EBDD'}},
  {id:'tha', name:'Таиланд', area:'Пхукет · Beachfront 4★', meal:'Завтраки', vibes:['party','beach','adventure'], price:112000, old:149000, nights:10, rating:4.6, seats:6, scene:'beach', img:'1552465011-b4e21bf6e79a', c:{c1:'#0F7D80',c2:'#44B8B0',sky:'#CDE9E5'}},
  {id:'egy', name:'Египет', area:'Шарм-эль-Шейх · риф · 5★', meal:'Всё включено', vibes:['beach','family','adventure'], price:68000, old:89000, nights:7, rating:4.5, seats:9, scene:'beach', img:'1755545414327-36524febb5b6', c:{c1:'#1C6E74',c2:'#54B0A6',sky:'#DCEAE3'}},
  {id:'sey', name:'Сейшелы', area:'Маэ · Luxury Resort 5★', meal:'Завтраки', vibes:['romance','beach'], price:254000, old:319000, nights:8, rating:5.0, seats:2, scene:'beach', img:'1647440559776-20a43c609201', c:{c1:'#13798E',c2:'#48BBCB',sky:'#D2EDF1'}},
  {id:'geo', name:'Грузия', area:'Батуми + горы · тур', meal:'Завтраки', vibes:['adventure','family'], price:54000, old:72000, nights:6, rating:4.7, seats:7, scene:'mountain', img:'1625566360146-918001e76064', c:{c1:'#3C5F5A',c2:'#7FA89C',sky:'#DDE9E2'}},
];
const MOOD_LABEL = {beach:'Пляж',romance:'Романтика',adventure:'Приключения',party:'Тусовка',family:'С детьми'};

/* ---------- RENDER HOT TOUR CARDS ---------- */
const grid = $('#tourGrid');
function cardHTML(d){
  const disc = Math.round((1 - d.price/d.old)*100);
  return `<article class="card" data-vibes="${d.vibes.join(' ')}" data-price="${d.price}">
    <div class="media">${mediaHTML(d)}<span class="disc">−${disc}%</span>
      <span class="fav"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 5a5 5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg></span></div>
    <div class="body">
      <div class="rowtop"><h3>${d.name}</h3><span class="rating"><svg viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .6-5.3 4.6 1.6 6.9L12 17.8 5.7 20.6l1.6-6.9L2 8.9l7-.6z"/></svg>${d.rating.toFixed(1)}</span></div>
      <p class="sub">${d.area}</p>
      <div class="tags"><span class="tg">${d.meal}</span><span class="tg">перелёт включён</span></div>
      <div class="price"><span class="old">${rub(d.old)}</span><span class="new">${rub(d.price)}</span><span class="per">/ ${d.nights} ноч.</span></div>
      <div class="foot">
        <span class="seats"><span class="fl"></span>осталось ${d.seats} мест</span>
        <button class="btn btn-brand btn-sm" data-open-lead data-dest="${d.name}" data-price="${d.price}">Выбрать</button>
      </div>
    </div></article>`;
}
grid.innerHTML = DEST.map(cardHTML).join('');

/* ---------- FILTER (mood + budget) ---------- */
let curMood = 'all', curBudget = 350000;
function applyFilter(){
  let n = 0;
  $$('#tourGrid .card').forEach(c=>{
    const okMood = curMood==='all' || c.dataset.vibes.split(' ').includes(curMood);
    const okBudget = +c.dataset.price <= curBudget;
    const show = okMood && okBudget;
    c.hidden = !show; if(show) n++;
  });
  $('#foundN').textContent = n;
  let e = $('#tourGrid .empty');
  if(n===0 && !e){ grid.insertAdjacentHTML('beforeend','<div class="empty">Под эти параметры ничего не нашлось — попробуйте поднять бюджет или сменить настроение.</div>'); }
  else if(n>0 && e){ e.remove(); }
}
$('#moods').addEventListener('click', e=>{
  const b = e.target.closest('.mood'); if(!b) return;
  $$('#moods .mood').forEach(m=>m.setAttribute('aria-pressed', m===b));
  curMood = b.dataset.mood; applyFilter();
});

/* ---------- HERO COLLAGE + DEAL MEDIA ---------- */
$('#dealMedia').innerHTML = mediaHTML(DEST[0]);
$('#hph1').innerHTML = mediaHTML(DEST[0]);
$('#hph2').innerHTML = mediaHTML(DEST[1]);
$('#hph3').innerHTML = mediaHTML(DEST[3]);
$('#hph4').innerHTML = mediaHTML(DEST[6]);
$('#hph5').innerHTML = mediaHTML(DEST[4]);
$('#hph6').innerHTML = mediaHTML(DEST[5]);
$('#fcAv').innerHTML = faceHTML('Мария');
if(!reduce) setInterval(()=>{ const n=NAMES[Math.random()*NAMES.length|0]; const a=ACTS[Math.random()*ACTS.length|0];
  $('#fcName').textContent=n; const av=$('#fcAv'); if(av) av.innerHTML=faceHTML(n);
  const fem=/[ая]$/.test(n); const fv=$('#fcVerb'); if(fv) fv.textContent = fem?'забронировала':'забронировал';
  const fp=$('#fcPlace'); if(fp) fp.textContent=`${a[0]} · только что`; }, 4200);

/* ---------- COUNT-UP ---------- */
function countUp(el){
  const target = +el.dataset.count; if(!target) return;
  if(reduce){ el.textContent = fmt(target); return; }
  let start = Math.round(target*0.82), t0=null, dur=1100;
  function tick(t){ if(!t0)t0=t; const p=Math.min((t-t0)/dur,1); const e=1-Math.pow(1-p,3);
    el.textContent = fmt(start+(target-start)*e); if(p<1) requestAnimationFrame(tick); else el.textContent=fmt(target); }
  requestAnimationFrame(tick);
}
const io = new IntersectionObserver((ents)=>{ ents.forEach(en=>{ if(en.isIntersecting){ countUp(en.target); io.unobserve(en.target); } }); },{threshold:.4});
$$('[data-count]').forEach(el=>io.observe(el));

/* ---------- LIVE «picking» number ---------- */
const lp = $('#livePicking'); let lpv = 71; lp.textContent = lpv;
function liveTick(){
  const pull = (68 - lpv)/40;                        // мягкое притяжение к центру
  const step = Math.random() < 0.2 ? 2 : 1;          // обычно ±1, редко ±2
  const dir = (Math.random() + pull) < 0.5 ? -1 : 1;
  lpv = Math.max(52, Math.min(84, lpv + dir*step));
  lp.textContent = lpv;
  setTimeout(liveTick, 7000 + Math.random()*6000);   // раз в 7–13 сек
}
if(!reduce) setTimeout(liveTick, 8000);

/* ---------- floating live card (hero) ---------- */
const NAMES=['Мария','Алексей','Ольга','Дмитрий','Екатерина','Иван','Наталья','Сергей','Анна','Павел','Юлия','Артём'];
const ACTS=[['Мальдивы','забронировал','а'],['Дубай','оплатил','а'],['Турция','подобрал','а тур в'],['Бали','улетел','а на'],['Египет','забронировал','а'],['Сейшелы','выбрал','а'],['Таиланд','оплатил','а тур в'],['Грузия','подобрал','а']];
const city=['Москва','Казань','СПб','Сочи','Екатеринбург','Новосибирск'];

/* ---------- DEAL COUNTDOWN ---------- */
let dl = Date.now() + (5*3600+ (Math.random()*40|0)*60)*1000;
function cd(){ let s=Math.max(0,(dl-Date.now())/1000|0); const h=s/3600|0; s%=3600; const m=s/60|0; s%=60;
  const p=x=>String(x).padStart(2,'0');
  const C=$('#dealCountdown'); C.querySelector('[data-cd=h]').textContent=p(h);
  C.querySelector('[data-cd=m]').textContent=p(m); C.querySelector('[data-cd=s]').textContent=p(s);
  if(dl-Date.now()<0) dl=Date.now()+5*3600*1000; }
cd(); setInterval(cd,1000);

/* ---------- CONFIGURATOR ---------- */
const HOTELS = {
  mdv:[{n:'Overwater Villa 5★',pm:1,img:'1697898109604-e06e88b15271'},{n:'Baros Lagoon Resort 5★',pm:1.24,img:'1758717152007-6a2eb7299409'},{n:'Soneva Private Retreat 5★',pm:1.6,img:'1777199663418-3dd126c9fd40'}],
  dxb:[{n:'Marina View 5★',pm:1,img:'1459787915554-b34915863013'},{n:'JBR Beachfront 5★',pm:1.2,img:'1682410601760-6372fd33ad2b'},{n:'Palm Luxury Resort 5★',pm:1.5,img:'1768463852068-cc277b8baf35'}],
  tur:[{n:'Ultra All Inclusive 5★',pm:1,img:'1582030826675-8b596001240a'},{n:'Lara Beach Resort 5★',pm:1.18,img:'1672593657366-8219c888c243'},{n:'Grand Spa Resort 5★',pm:1.4,img:'1730825089770-309218527d59'}],
  bal:[{n:'Ubud Pool Villa',pm:1,img:'1692736933760-8a8a9b8c1b6f'},{n:'Seminyak Beach Resort 5★',pm:1.22,img:'1651108066220-f61c22fc281f'},{n:'Cliff Ocean Villa 5★',pm:1.5,img:'1611441085268-7674a97a0905'}],
  tha:[{n:'Patong Beachfront 4★',pm:1,img:'1552465011-b4e21bf6e79a'},{n:'Kata Palm Resort 4★',pm:1.15,img:'1551418843-01c6b62e864d'},{n:'Kamala Luxury 5★',pm:1.45,img:'1596879857570-7b6b9018bcb6'}],
  egy:[{n:'Reef Resort 5★',pm:1,img:'1755545414327-36524febb5b6'},{n:'Lagoon All Inclusive 5★',pm:1.16,img:'1755545760275-abd2f1b8ed2c'},{n:'Deluxe Bay Resort 5★',pm:1.4,img:'1641966153139-98999b3eb6bb'}],
  sey:[{n:'Mahe Beach Resort 5★',pm:1,img:'1647440559776-20a43c609201'},{n:'Praslin Villa 5★',pm:1.22,img:'1743356174408-a4d2dd23230e'},{n:'Private Island Retreat 5★',pm:1.65,img:'1743356174397-d6da6f014f8f'}],
  geo:[{n:'Batumi City 4★',pm:1,img:'1625566360146-918001e76064'},{n:'Sea View Resort 4★',pm:1.16,img:'1625582175018-8fc4be59ac4f'},{n:'Mountain Lodge 4★',pm:1.3,img:'1658231511661-db43ab01ea89'}],
};
const cfg = {dest:DEST[0], type:'Пляж', adults:2, kids:0, nights:7, budget:220000, hotel:HOTELS['mdv'][0],
  depart:(()=>{const d=new Date();d.setDate(d.getDate()+21);d.setHours(0,0,0,0);return d;})()};
$('#cfgDest').innerHTML = DEST.map((d,i)=>`<button class="opt" data-dest-id="${d.id}" aria-pressed="${i===0}">${d.name}</button>`).join('');
const SEASON = {Пляж:1, Экскурсии:0.9, Актив:1.05, Премиум:1.6};
const MON=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const MONF=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const fmtD = d => `${d.getDate()} ${MON[d.getMonth()]}`;
const retDate = () => { const r=new Date(cfg.depart); r.setDate(r.getDate()+cfg.nights); return r; };
const dateRange = () => `${fmtD(cfg.depart)} — ${fmtD(retDate())}`;

function renderHotels(){
  const hs=HOTELS[cfg.dest.id]||[];
  $('#cfgHotel').innerHTML = hs.map((h,i)=>`<button class="opt" data-hotel="${i}" aria-pressed="${h===cfg.hotel}">${h.n}</button>`).join('');
}
function calc(){
  const base = cfg.dest.price;
  const people = cfg.adults + cfg.kids*0.6;
  const nightFactor = cfg.nights / cfg.dest.nights;
  const hpm = cfg.hotel ? cfg.hotel.pm : 1;
  let total = base * (people/2) * nightFactor * (SEASON[cfg.type]||1) * hpm;
  return Math.round(total/1000)*1000;
}
let resPhotoKey=null;
function renderCfg(){
  const imgId = (cfg.hotel && cfg.hotel.img) ? cfg.hotel.img : cfg.dest.img;
  const pkey = cfg.dest.id+'|'+imgId;
  if(pkey!==resPhotoKey){ $('#resPhoto').innerHTML = mediaHTMLImg(imgId, cfg.dest); resPhotoKey=pkey; }
  $('#resDest').textContent = cfg.dest.name;
  $('#resMeta').textContent = `${cfg.hotel?cfg.hotel.n:cfg.dest.area} · ${cfg.type.toLowerCase()} отдых`;
  $('#dateLabel').textContent = dateRange();
  const total = calc();
  $('#resPrice').textContent = rub(total);
  $('#resNote').textContent = `${dateRange()} · ${cfg.adults} взр${cfg.kids?`+${cfg.kids} дет`:''} · ${cfg.nights} ноч`;
  $('#resPrice').style.color = total<=cfg.budget ? '#fff' : 'var(--accent-deep)';
}
$('#cfgDest').addEventListener('click',e=>{ const b=e.target.closest('[data-dest-id]'); if(!b)return;
  $$('#cfgDest .opt').forEach(o=>o.setAttribute('aria-pressed',o===b));
  cfg.dest = DEST.find(d=>d.id===b.dataset.destId); cfg.nights=cfg.dest.nights; $('#nights').textContent=cfg.nights;
  cfg.hotel = (HOTELS[cfg.dest.id]||[])[0]; renderHotels(); renderCfg(); });
$('#cfgHotel').addEventListener('click',e=>{ const b=e.target.closest('[data-hotel]'); if(!b)return;
  cfg.hotel = HOTELS[cfg.dest.id][+b.dataset.hotel];
  $$('#cfgHotel .opt').forEach(o=>o.setAttribute('aria-pressed',o===b)); renderCfg(); });
$('#cfgType').addEventListener('click',e=>{ const b=e.target.closest('[data-type]'); if(!b)return;
  $$('#cfgType .opt').forEach(o=>o.setAttribute('aria-pressed',o===b)); cfg.type=b.dataset.type; renderCfg(); });
$$('[data-adj]').forEach(btn=>btn.addEventListener('click',()=>{
  const k=btn.dataset.adj, d=+btn.dataset.d; const min={adults:1,kids:0,nights:3}[k], max={adults:8,kids:6,nights:21}[k];
  cfg[k]=Math.max(min,Math.min(max,cfg[k]+d)); $('#'+k).textContent=cfg[k]; renderCfg(); }));
$('#cfgBudget').addEventListener('input',e=>{ cfg.budget=+e.target.value; $('#cfgBudgetVal').textContent=rub(cfg.budget); renderCfg(); });

/* calendar popup */
let calView;
function buildCal(){
  const y=calView.y, m=calView.m;
  const startWd=(new Date(y,m,1).getDay()+6)%7;
  const dim=new Date(y,m+1,0).getDate();
  const today=new Date(); today.setHours(0,0,0,0);
  let cells='';
  for(let d=1;d<=dim;d++){ const date=new Date(y,m,d); const past=date<today;
    const sel=date.getTime()===cfg.depart.getTime();
    const st=d===1?` style="grid-column-start:${startWd+1}"`:'';
    cells+=`<button type="button" class="cal-cell${sel?' sel':''}${past?' past':''}" data-day="${d}"${past?' disabled':''}${st}>${d}</button>`; }
  $('#cal').innerHTML = `<div class="cal-head"><button type="button" class="cal-nav" data-nav="-1" aria-label="Назад">‹</button><span class="cal-title">${MONF[m]} ${y}</span><button type="button" class="cal-nav" data-nav="1" aria-label="Вперёд">›</button></div><div class="cal-wd">${WD.map(w=>`<span>${w}</span>`).join('')}</div><div class="cal-grid">${cells}</div>`;
}
function positionCal(){
  const r=$('#dateBtn').getBoundingClientRect(), cal=$('#cal');
  const cw=Math.min(300, window.innerWidth-24); cal.style.width=cw+'px';
  let left=r.left; if(left+cw>window.innerWidth-12) left=window.innerWidth-12-cw;
  cal.style.left=Math.max(12,left)+'px';
  const ch=cal.offsetHeight||340;
  let top=r.bottom+8; if(top+ch>window.innerHeight-12) top=Math.max(12,r.top-8-ch);
  cal.style.top=top+'px';
}
function openCal(){ calView={y:cfg.depart.getFullYear(),m:cfg.depart.getMonth()}; buildCal(); $('#cal').hidden=false; $('.date-field').classList.add('open'); positionCal(); }
function closeCal(){ $('#cal').hidden=true; $('.date-field').classList.remove('open'); }
$('#dateBtn').addEventListener('click',e=>{ e.stopPropagation(); $('#cal').hidden?openCal():closeCal(); });
$('#cal').addEventListener('click',e=>{ e.stopPropagation();
  const nav=e.target.closest('[data-nav]'); if(nav){ calView.m+=+nav.dataset.nav; if(calView.m<0){calView.m=11;calView.y--;} if(calView.m>11){calView.m=0;calView.y++;} buildCal(); return; }
  const day=e.target.closest('[data-day]'); if(day&&!day.disabled){ cfg.depart=new Date(calView.y,calView.m,+day.dataset.day); cfg.depart.setHours(0,0,0,0); renderCfg(); closeCal(); } });
document.addEventListener('click',e=>{ if(!e.target.closest('.date-field') && !e.target.closest('#cal')) closeCal(); });
window.addEventListener('scroll',()=>{ if(!$('#cal').hidden) positionCal(); }, true);
window.addEventListener('resize',()=>{ if(!$('#cal').hidden) positionCal(); });

renderHotels();
renderCfg();

/* ---------- SPIN WHEEL (модалка конструктора, 10 секторов −1…−10%) ---------- */
const SEGS=[5,1,8,3,10,6,2,9,4,7];
const WC=['#0F4B43','#1E8A80','#BE9247','#0A3730','#2E8E8C','#0F4B43','#1E8A80','#BE9247','#0A3730','#2E8E8C'];
const SEG=360/SEGS.length;
function polar(cx,cy,r,deg){const a=deg*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];}
(function buildWheel(){ const cx=120,cy=120,r=116; let out='';
  SEGS.forEach((v,i)=>{ const a0=-90+i*SEG, a1=a0+SEG; const[x0,y0]=polar(cx,cy,r,a0),[x1,y1]=polar(cx,cy,r,a1);
    out+=`<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z" fill="${WC[i]}" stroke="rgba(255,255,255,.2)" stroke-width="1"/>`;
    const[tx,ty]=polar(cx,cy,r*0.66,a0+SEG/2);
    out+=`<text x="${tx}" y="${ty}" fill="#fff" font-family="Inter" font-weight="800" font-size="13.5" text-anchor="middle" dominant-baseline="middle" transform="rotate(${a0+SEG/2+90} ${tx} ${ty})">−${v}%</text>`;
  });
  $('#wheelSvg').innerHTML = out+`<circle cx="120" cy="120" r="116" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`;
})();
const wheelModal=$('#wheelModal'); let wheelSpun=false, wonDiscount=0, wheelData=null;
function openWheel(){
  wheelData={ dest:cfg.dest.name, hotel:cfg.hotel?cfg.hotel.n:'', dates:dateRange(), price:calc() };
  $('#wheelMedia').innerHTML = mediaHTML(cfg.dest)+'<button class="modal-x" data-close-wheel aria-label="Закрыть">×</button>';
  $('#wheelSum').innerHTML = `<div class="row"><span>Направление</span><b>${cfg.dest.name}</b></div>
    ${cfg.hotel?`<div class="row"><span>Отель</span><b>${cfg.hotel.n}</b></div>`:''}
    <div class="row"><span>Даты</span><b>${dateRange()}</b></div>
    <div class="row"><span>Туристы</span><b>${cfg.adults} взр${cfg.kids?` + ${cfg.kids} дет`:''} · ${cfg.nights} ноч</b></div>
    <div class="row total"><span>Цена тура</span><b>${rub(wheelData.price)}</b></div>`;
  const btn=$('#wheelSpinBtn');
  if(wheelSpun){
    $('#wheelResult').textContent=`Ваша скидка −${wonDiscount}% уже закреплена`;
    btn.textContent='Оставить заявку → Telegram'; btn.disabled=false; btn.style.opacity=1;
    btn.onclick=()=>{ closeWheel(); openLead({dest:wheelData.dest, hotel:wheelData.hotel, dates:wheelData.dates, price:wheelData.price, discount:wonDiscount}); };
  } else {
    $('#wheelResult').textContent='';
    btn.textContent='Крутить барабан'; btn.disabled=false; btn.style.opacity=1;
    btn.onclick=spinWheel;
  }
  wheelModal.hidden=false; document.body.style.overflow='hidden';
}
function closeWheel(){ wheelModal.hidden=true; document.body.style.overflow=''; }
function spinWheel(){
  if(wheelSpun) return;
  const btn=$('#wheelSpinBtn'); btn.disabled=true; btn.style.opacity=.6;
  const i=Math.random()*SEGS.length|0, v=SEGS[i], svg=$('#wheelSvg');
  if(reduce){ svg.style.transition='none'; svg.style.transform=`rotate(${-(i*SEG+SEG/2)}deg)`; }
  else { svg.style.transform=`rotate(${360*6 - (i*SEG+SEG/2)}deg)`; }
  setTimeout(()=>{
    wheelSpun=true; wonDiscount=v;
    $('#wheelResult').textContent=`Ваша скидка −${v}% закреплена за заявкой!`;
    btn.disabled=false; btn.style.opacity=1; btn.textContent='Оставить заявку → Telegram';
    btn.onclick=()=>{ closeWheel(); openLead({dest:wheelData.dest, hotel:wheelData.hotel, dates:wheelData.dates, price:wheelData.price, discount:v}); };
  }, reduce?60:4700);
}

/* ---------- REVIEWS ---------- */
const REVIEWS=[
  {n:'Марина К.',city:'Москва',stars:5,trips:6,txt:'С AZURA летаем всей семьёй с 2019-го. Ни разу не подвели: отели всегда лучше, чем на фото, а менеджер на связи даже в 2 ночи по местному.',pins:['Мальдивы','Турция','ОАЭ']},
  {n:'Денис П.',city:'Казань',stars:5,trips:4,txt:'Брал горящий тур на Бали за сутки до вылета. Всё оформили за пару часов прямо в Telegram. Теперь только через них.',pins:['Бали','Таиланд']},
  {n:'Ольга В.',city:'СПб',stars:5,trips:8,txt:'Отдельное спасибо за подбор отеля с детьми — учли всё: от бассейна с горками до детского меню. Поедем снова.',pins:['Египет','Сейшелы','Грузия']},
  {n:'Артём С.',city:'Екатеринбург',stars:5,trips:3,txt:'Сравнивал цены у разных операторов — здесь вышло дешевле, чем напрямую. Ещё и подсказали, когда выгоднее брать билеты.',pins:['ОАЭ','Турция']},
  {n:'Екатерина Л.',city:'Новосибирск',stars:5,trips:5,txt:'Свадебное путешествие на Сейшелы организовали идеально: трансфер, ужин на берегу, апгрейд номера. Эмоции на всю жизнь.',pins:['Сейшелы','Мальдивы']},
  {n:'Сергей М.',city:'Москва',stars:4,trips:2,txt:'Сначала боялся брать тур онлайн, но поддержка ответила на все вопросы. Рассрочку оформили без процентов, улетели спокойно.',pins:['Египет']},
  {n:'Анна Г.',city:'Краснодар',stars:5,trips:7,txt:'Седьмой сезон подряд. Присылают реально горящие варианты, а не как у всех. Экономлю прилично каждый раз.',pins:['Турция','Египет','Таиланд']},
  {n:'Павел Р.',city:'Самара',stars:5,trips:4,txt:'Поменяли даты за неделю до вылета без штрафов — помогли и с отелем, и с перелётом. Сервис, каких мало.',pins:['Бали','ОАЭ']},
  {n:'Юлия Н.',city:'Ростов-на-Дону',stars:5,trips:6,txt:'Возили родителей в Дубай на годовщину. Спецпитание и помощь с коляской согласовали заранее. Огромное спасибо команде.',pins:['ОАЭ','Турция']},
  {n:'Дмитрий К.',city:'Уфа',stars:5,trips:3,txt:'Таиланд на двоих вышел дешевле, чем планировали. Отель 4★ оказался почти как пятёрка. Точно вернёмся.',pins:['Таиланд']},
  {n:'Наталья Б.',city:'Пермь',stars:5,trips:9,txt:'Девятая поездка! Уже как к друзьям обращаюсь. Подбирают под настроение — то спокойный пляж, то движ с компанией.',pins:['Мальдивы','Бали','Грузия']},
  {n:'Иван Ф.',city:'Челябинск',stars:4,trips:2,txt:'Грузия — огонь по цене. Маршрут, экскурсии, дегустации — всё расписали заранее. Один минус: хотелось остаться дольше.',pins:['Грузия']},
  {n:'Алексей Д.',city:'Нижний Новгород',stars:5,trips:5,txt:'Летали в Египет нырять. Подобрали отель прямо у рифа, как просил. Менеджер сам скинул карту дайв-сайтов.',pins:['Египет']},
  {n:'Елена Ж.',city:'Воронеж',stars:5,trips:4,txt:'Боялась лететь с грудничком, но всё продумали: ранний заезд, кроватка, коляска в аэропорту. Отдохнули реально.',pins:['Турция']},
  {n:'Андрей Т.',city:'Красноярск',stars:5,trips:3,txt:'Сорвался в отпуск спонтанно — за вечер подобрали ОАЭ в бюджет. Оплатил, получил ваучеры на почту, красота.',pins:['ОАЭ']},
  {n:'Татьяна С.',city:'Сочи',stars:5,trips:6,txt:'Беру только у них уже три года. Цены как напрямую у оператора, но ещё и человек, который всё решает за тебя.',pins:['Мальдивы','Таиланд']},
  {n:'Николай В.',city:'Тюмень',stars:4,trips:2,txt:'Всё прошло без вопросов. Хотелось бы побольше вариантов отелей в выдаче, но в итоге подобрали что надо.',pins:['Турция']},
  {n:'Светлана М.',city:'Омск',stars:5,trips:8,txt:'С детьми объездили пол-Азии с AZURA. Всегда честно говорят, какой отель реально семейный, а какой только на картинке.',pins:['Таиланд','Бали','ОАЭ']},
  {n:'Роман К.',city:'Волгоград',stars:5,trips:4,txt:'Горящий Шарм взяли за три дня до вылета, сэкономили почти половину. Поддержка писала даже когда были на месте.',pins:['Египет']},
  {n:'Ирина П.',city:'Саратов',stars:5,trips:5,txt:'Медовый месяц на Бали — вилла с бассейном, цветы в номере, ужин при свечах. Сделали всё, как мечтали.',pins:['Бали','Сейшелы']},
  {n:'Максим Л.',city:'Тольятти',stars:5,trips:3,txt:'Удобно, что всё в Telegram: отправил параметры — через час готовые варианты с ценами. Без звонков и навязывания.',pins:['Турция','Египет']},
  {n:'Алина Г.',city:'Ижевск',stars:5,trips:6,txt:'Люблю их за честность: если отель так себе — скажут прямо. Один раз отговорили от «выгодного» варианта, спасибо.',pins:['ОАЭ','Мальдивы']},
  {n:'Олег Н.',city:'Калининград',stars:4,trips:2,txt:'Первый раз брал тур не в офисе, а онлайн. Сомневался, но документы пришли вовремя, вылет без накладок.',pins:['Турция']},
  {n:'Виктория Б.',city:'Владивосток',stars:5,trips:7,txt:'Седьмой тур. Отдельный респект за поддержку 24/7 — потеряли багаж, вопрос решили за меня, пока я нервничала.',pins:['Таиланд','Бали']},
  {n:'Константин Ж.',city:'Ярославль',stars:5,trips:4,txt:'Возил команду на корпоратив в Дубай. 12 человек, разные пожелания — собрали всё в один тур без головной боли.',pins:['ОАЭ']},
  {n:'Дарья С.',city:'Тула',stars:5,trips:5,txt:'Цена не выросла после брони, никаких «доплат за топливо». Что сказали — то и заплатила. Редкость сейчас.',pins:['Египет','Турция']},
  {n:'Евгений М.',city:'Барнаул',stars:5,trips:3,txt:'Грузия с экскурсиями по горам — восторг. Дали русскоговорящего гида, подсказали, где поесть не для туристов.',pins:['Грузия']},
  {n:'Ксения В.',city:'Иркутск',stars:5,trips:6,txt:'Беру туры родителям-пенсионерам. Всегда подбирают спокойные отели без шумных дискотек. Они довольны, я спокойна.',pins:['Турция','ОАЭ']},
  {n:'Григорий П.',city:'Хабаровск',stars:4,trips:2,txt:'Таиланд взяли в последний момент. Чуть переживали за отель, но по факту всё совпало с описанием. Нормальный сервис.',pins:['Таиланд']},
  {n:'Полина Д.',city:'Оренбург',stars:5,trips:5,txt:'Обожаю, что можно крутить бюджет и сразу видеть, что по карману. Подобрала Мальдивы в рассрочку, улетаю зимой!',pins:['Мальдивы']},
  {n:'Антон К.',city:'Новокузнецк',stars:5,trips:4,txt:'Меняли отель уже после брони — пошли навстречу без штрафа. Чувствуешь, что тобой реально занимаются.',pins:['ОАЭ','Египет']},
  {n:'Маргарита Л.',city:'Кемерово',stars:5,trips:6,txt:'Три года только AZURA. Удобно, честно, по-человечески. Уже пятеро подруг улетели по моему совету.',pins:['Турция','Бали']},
  {n:'Владимир С.',city:'Рязань',stars:5,trips:3,txt:'Бронь, оплата, ваучеры — всё за один вечер, не вставая с дивана. Для занятого человека это идеально.',pins:['Турция']},
  {n:'Вероника Н.',city:'Липецк',stars:5,trips:5,txt:'Летали на Сейшелы — дорого, но оно того стоило. Помогли выбрать остров под нас: тихо, красиво, без толпы.',pins:['Сейшелы','Мальдивы']},
  {n:'Тимур Г.',city:'Пенза',stars:4,trips:2,txt:'Первый опыт — Египет всё включено. Без сюрпризов, перелёт и трансфер чёткие. В следующий раз возьму что-то подальше.',pins:['Египет']},
  {n:'Оксана Б.',city:'Киров',stars:5,trips:7,txt:'Семь поездок, и каждый раз как в первый — всё по полочкам. Детей возят с нами с пелёнок, доверяю полностью.',pins:['Турция','Таиланд','ОАЭ']},
  {n:'Руслан М.',city:'Чебоксары',stars:5,trips:4,txt:'Горящие туры реально горящие, а не маркетинг. Поймал Бали почти по себестоимости, друзья не поверили.',pins:['Бали']},
  {n:'Яна П.',city:'Балашиха',stars:5,trips:5,txt:'Нравится, что отвечает живой человек, а не бот по скрипту. Подобрали тур под аллергию ребёнка на питание. Благодарна.',pins:['Турция','Египет']},
  {n:'Степан К.',city:'Курск',stars:5,trips:3,txt:'Дубай под Новый год — думал, не влезу в бюджет, а подобрали отличный вариант. Шоу фонтанов, шопинг, всё успели.',pins:['ОАЭ']},
  {n:'Людмила В.',city:'Ставрополь',stars:5,trips:8,txt:'Восемь туров за пять лет. AZURA — как личный турагент в кармане. Пишу в Telegram — через час лечу отдыхать.',pins:['Мальдивы','Турция','Сейшелы']},
];
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function plural(n,f){ const d=n%10,h=n%100; if(d===1&&h!==11)return f[0]; if(d>=2&&d<=4&&(h<10||h>=20))return f[1]; return f[2]; }
function renderReviews(){
  $('#revGrid').innerHTML = shuffle(REVIEWS).slice(0,3).map(r=>`<div class="review">
    <div class="head"><div class="av">${faceHTML(r.n)}</div>
      <div class="who">${r.n}<small>${r.city}</small></div></div>
    <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
    <p>«${r.txt}»</p>
    <div class="trip-pins">${r.pins.map(p=>`<span class="pin">${p}</span>`).join('')}</div>
    <span class="loyal">✓ откатал(а) ${r.trips} ${plural(r.trips,['тур','тура','туров'])} с нами</span>
  </div>`).join('');
}
renderReviews();

/* ---------- INSTAGRAM WALL ---------- */
const IG=[[0,1240],[1,980],[2,2130],[3,1760],[6,3012],[7,890],[4,1450],[5,1120],[1,760],[0,2890],[3,1340],[2,1680]];
$('#igGrid').innerHTML = IG.map(([i,likes])=>`<div class="ig">${mediaHTML(DEST[i])}<div class="ov"><span><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 5a5 5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg>${(likes/1000).toFixed(1)}k</span></div></div>`).join('');

/* ---------- LEAD MODAL ---------- */
const leadModal=$('#leadModal'), leadInner=$('#leadInner'), leadMedia=$('#leadMedia');
let lastFocus=null;
function openLead(data){
  lastFocus=document.activeElement;
  const dd = DEST.find(d=>d.name===data.dest) || DEST.find(d=>(data.dest||'').indexOf(d.name)===0) || DEST[0];
  leadMedia.innerHTML = mediaHTML(dd)+'<button class="modal-x" data-close-lead aria-label="Закрыть">×</button>';
  const disc = data.discount || window.__spinDiscount || 0;
  let price = data.price||0;
  let priceLine = price ? rub(disc?Math.round(price*(1-disc/100)):price) : '—';
  leadInner.innerHTML = `
    <h3>Заявка на подбор</h3>
    <p class="ms">Оставьте контакты — менеджер подтвердит детали и цену в Telegram за пару минут.</p>
    <div class="sum">
      <div class="row"><span>Направление</span><b>${data.dest||cfg.dest.name}</b></div>
      ${data.hotel?`<div class="row"><span>Отель</span><b>${data.hotel}</b></div>`:''}
      ${data.dates?`<div class="row"><span>Даты</span><b>${data.dates}</b></div>`:''}
      ${price?`<div class="row"><span>Базовая цена</span><b>${rub(price)}</b></div>`:''}
      ${disc?`<div class="row"><span>Ваша скидка</span><b style="color:var(--good)">−${disc}%</b></div>`:''}
      <div class="row total"><span>Ориентир. к оплате</span><b>${priceLine}</b></div>
    </div>
    <form id="leadForm">
      <div class="field"><label for="lName">Как к вам обращаться</label><input id="lName" required placeholder="Имя" autocomplete="name"></div>
      <div class="field"><label for="lPhone">Телефон или @username</label><input id="lPhone" required placeholder="+7 ___ ___-__-__" autocomplete="tel"></div>
      <label class="consent"><input type="checkbox" id="lConsent" required>Согласен(а) на обработку персональных данных и условия оферты</label>
      <button class="btn btn-tg" type="submit"><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M22 3L2 11l6 2 2 6 3-4 5 4 4-16z"/></svg>Перейти в Telegram к менеджеру</button>
    </form>
    <p style="font-size:.74rem;color:var(--ink-faint);margin-top:12px;text-align:center">Нажимая кнопку, вы откроете чат с нашим менеджером-ботом</p>`;
  leadModal.hidden=false; document.body.style.overflow='hidden';
  setTimeout(()=>$('#lName')?.focus(),50);
  $('#leadForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=encodeURIComponent($('#lName').value.trim());
    const payload = encodeURIComponent(`Заявка: ${data.dest||cfg.dest.name}${data.hotel?`, ${data.hotel}`:''}${data.dates?`, ${data.dates}`:''}${disc?` (−${disc}%)`:''}`);
    leadInner.innerHTML = `<div class="success">
      <div class="ok"><svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg></div>
      <h3>Заявка принята!</h3>
      <p class="ms" style="margin-bottom:18px">Нажмите кнопку ниже — откроется Telegram, где ваш менеджер уже видит заявку и готов ответить.</p>
      <a class="btn btn-tg" href="${TG_MANAGER}?start=${payload}" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M22 3L2 11l6 2 2 6 3-4 5 4 4-16z"/></svg>Открыть чат в Telegram</a>
      <p style="font-size:.76rem;color:var(--ink-faint);margin-top:14px">Если чат не открылся — найдите нас: <b>${TG_MANAGER.replace('https://t.me/','@')}</b></p>
    </div>`;
  });
}
function closeLead(){ leadModal.hidden=true; document.body.style.overflow=''; lastFocus?.focus(); }
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open-lead]');
  if(o){ openLead({dest:o.dataset.dest, price:+o.dataset.price||0, scene:'beach'}); }
  if(e.target.closest('[data-close-lead]')||e.target===leadModal) closeLead();
  if(e.target.closest('[data-open-wheel]')){ openWheel(); }
  if(e.target.closest('[data-close-wheel]')||e.target===wheelModal) closeWheel();
  const oc=e.target.closest('[data-open-config]'); if(oc){ e.preventDefault(); window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}); }
  const gc=e.target.closest('[data-goto-config]'); if(gc){ e.preventDefault(); const el=document.getElementById('config'); const y=el.getBoundingClientRect().top+window.scrollY-80; window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'}); }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(!leadModal.hidden)closeLead(); if(!wheelModal.hidden)closeWheel(); if(!supPanel.hidden)closeSup(); } });

/* ---------- SUPPORT BOT ---------- */
const supPanel=$('#supPanel'), supBody=$('#supBody'), supQuick=$('#supQuick'), supBtn=$('#supBtn');
let supStarted=false;
function supMsg(t,who='bot'){ const d=document.createElement('div'); d.className='msg '+who; d.textContent=t; supBody.appendChild(d); supBody.scrollTop=supBody.scrollHeight; }
function supType(cb){ const t=document.createElement('div'); t.className='typing'; t.innerHTML='<i></i><i></i><i></i>'; supBody.appendChild(t); supBody.scrollTop=supBody.scrollHeight;
  setTimeout(()=>{ t.remove(); cb(); }, reduce?150:900); }
function setQuick(items){ supQuick.innerHTML=''; items.forEach(it=>{ const b=document.createElement('button'); b.textContent=it.t; if(it.tg)b.className='btn btn-tg btn-sm';
  b.onclick=it.fn; supQuick.appendChild(b); }); }
function supOperator(){ supMsg('Соединяю вас с живым оператором 👨‍💼','bot');
  supType(()=>{ supMsg('Оператор AZURA продолжит в Telegram — так удобнее обмениваться документами и фото. Нажмите кнопку ниже.','bot');
    setQuick([{t:'Открыть чат с оператором',tg:true,fn:()=>window.open(TG_SUPPORT,'_blank')},{t:'Остаться здесь',fn:()=>startSup(true)}]); }); }
const SUP_FLOW={
  'Проблема с заявкой':'Проверил — заявки обрабатываются в порядке очереди, обычно в течение 5–10 минут. Если менеджер ещё не написал, подключу оператора.',
  'Вопрос по оплате':'Оплатить можно картой онлайн или оформить рассрочку 0% на 6 месяцев. Чек и ваучеры придут на почту сразу после оплаты.',
  'Изменить / отменить тур':'Изменения и возвраты зависят от условий отеля и тарифа. Давайте уточним по вашей брони — передам оператору.',
};
function startSup(reset){ if(reset){ supBody.innerHTML=''; }
  supMsg('Здравствуйте! Я бот поддержки AZURA 🤖 Подскажите, с чем помочь?','bot');
  setQuick([
    {t:'Проблема с заявкой',fn:()=>supPick('Проблема с заявкой')},
    {t:'Вопрос по оплате',fn:()=>supPick('Вопрос по оплате')},
    {t:'Изменить / отменить тур',fn:()=>supPick('Изменить / отменить тур')},
    {t:'Связаться с оператором',fn:()=>{ supMsg('Связаться с оператором','me'); supOperator(); }},
  ]);
}
function supPick(k){ supMsg(k,'me'); supQuick.innerHTML=''; supType(()=>{ supMsg(SUP_FLOW[k],'bot');
  supType(()=>{ supMsg('Помогло или подключить живого оператора?','bot');
    setQuick([{t:'Всё понятно, спасибо',fn:()=>{ supMsg('Всё понятно, спасибо','me'); supType(()=>{ supMsg('Рад помочь! Хорошего отдыха ✈️','bot'); setQuick([{t:'Задать ещё вопрос',fn:()=>startSup(true)}]); }); }},
      {t:'Нужен оператор',fn:()=>{ supMsg('Нужен оператор','me'); supOperator(); }}]); }); }); }
function openSup(){ supPanel.hidden=false; supBtn.querySelector('.badge').style.display='none';
  if(!supStarted){ supStarted=true; startSup(false); } }
function closeSup(){ supPanel.classList.add('closing'); setTimeout(()=>{ supPanel.hidden=true; supPanel.classList.remove('closing'); }, reduce?0:160); }
supBtn.addEventListener('click',()=> supPanel.hidden?openSup():closeSup());
$('#supClose').addEventListener('click',closeSup);

/* mobile nav */
const navEl=document.querySelector('.nav'), navBurger=$('#navBurger');
if(navBurger){
  navBurger.addEventListener('click',e=>{ e.stopPropagation(); const open=navEl.classList.toggle('open'); navBurger.setAttribute('aria-expanded',open); });
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{ navEl.classList.remove('open'); navBurger.setAttribute('aria-expanded','false'); }));
  document.addEventListener('click',e=>{ if(navEl.classList.contains('open') && !e.target.closest('.nav')){ navEl.classList.remove('open'); navBurger.setAttribute('aria-expanded','false'); } });
}

applyFilter();