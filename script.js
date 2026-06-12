/**
 * STRATOS WEATHER — script.js
 * Cinematic, animated, production-quality weather app
 * OpenWeatherMap API + custom particle/weather effects
 */
'use strict';

/* ============================================================ CONFIG */
const API_KEY = '7616fffc28a9b851d5c4f13e36370934';
const BASE    = 'https://api.openweathermap.org/data/2.5/weather';

/* ============================================================ DOM */
const $ = id => document.getElementById(id);
const BODY         = $('body');
const CANVAS       = $('bgCanvas');
const PARTICLES    = $('particles');
const HEADER_TIME  = $('headerTime');
const HERO_CITY    = $('heroCity');
const SEARCH_BOX   = $('searchBox');
const INPUT        = $('cityInput');
const BTN          = $('searchBtn');
const ERROR_PILL   = $('errorPill');
const ERROR_MSG    = $('errorMsg');
const LOADER       = $('loaderWrap');
const RESULT       = $('result');
const IDLE         = $('idleState');

const R = {
  city:     $('rCity'),
  country:  $('rCountry'),
  datetime: $('rDatetime'),
  cond:     $('rCondition'),
  desc:     $('rDesc'),
  icon:     $('rIcon'),
  temp:     $('rTemp'),
  feels:    $('rFeels'),
  min:      $('rMin'),
  max:      $('rMax'),
  hum:      $('rHumidity'),
  humBar:   $('humBar'),
  wind:     $('rWind'),
  pressure: $('rPressure'),
  vis:      $('rVisibility'),
  sunrise:  $('rSunrise'),
  sunset:   $('rSunset'),
};

/* ============================================================ THEME MAP */
const THEMES = {
  Clear:'t-clear', Clouds:'t-clouds',
  Rain:'t-rain',   Drizzle:'t-rain',
  Thunderstorm:'t-storm', Snow:'t-snow',
  Mist:'t-fog', Haze:'t-fog', Fog:'t-fog',
  Smoke:'t-fog', Dust:'t-fog', Sand:'t-fog',
  Ash:'t-fog',  Squall:'t-storm', Tornado:'t-storm',
};
const ALL_THEMES = [...new Set(Object.values(THEMES))];

/* ============================================================ CANVAS STAR FIELD */
const ctx = CANVAS.getContext('2d');
let stars = [];
let cW, cH;

function resizeCanvas(){
  cW = CANVAS.width  = window.innerWidth;
  cH = CANVAS.height = window.innerHeight;
}

function initStars(){
  stars = [];
  const count = Math.min(180, Math.floor((cW * cH) / 8000));
  for(let i = 0; i < count; i++){
    stars.push({
      x: Math.random() * cW,
      y: Math.random() * cH,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function drawStars(ts){
  ctx.clearRect(0, 0, cW, cH);
  for(const s of stars){
    const alpha = (Math.sin(ts * s.speed + s.phase) + 1) / 2 * s.a;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();
  }
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', () => { resizeCanvas(); initStars(); });
resizeCanvas();
initStars();
requestAnimationFrame(drawStars);

/* ============================================================ PARTICLES */
function buildParticles(){
  PARTICLES.innerHTML = '';
  const count = 18;
  for(let i = 0; i < count; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      left:${Math.random() * 100}%;
      width:${size}px;
      height:${size}px;
      --dur:${Math.random() * 14 + 8}s;
      --delay:${Math.random() * -15}s;
    `;
    PARTICLES.appendChild(p);
  }
}
buildParticles();

/* ============================================================ WEATHER OVERLAYS */
let overlayEl = null;

function clearOverlay(){
  if(overlayEl){ overlayEl.remove(); overlayEl = null; }
}

function addRain(heavy = false){
  clearOverlay();
  const wrap = document.createElement('div');
  wrap.className = 'rain-overlay';
  const count = heavy ? 80 : 45;
  for(let i = 0; i < count; i++){
    const d = document.createElement('div');
    d.className = 'raindrop';
    const len  = Math.random() * 18 + 8;
    const dur  = Math.random() * 0.5 + (heavy ? 0.5 : 0.7);
    d.style.cssText = `
      left:${Math.random() * 110 - 5}%;
      height:${len}px;
      opacity:${Math.random() * 0.5 + 0.2};
      animation-duration:${dur}s;
      animation-delay:${Math.random() * -dur}s;
    `;
    wrap.appendChild(d);
  }
  document.body.appendChild(wrap);
  overlayEl = wrap;
}

function addStorm(){
  addRain(true);
  const flash = document.createElement('div');
  flash.className = 'lightning-flash';
  document.body.appendChild(flash);
  // Attach to same overlayEl container isn't possible cleanly — keep ref
  const origOverlay = overlayEl;
  overlayEl = { remove(){ origOverlay.remove(); flash.remove(); } };
}

function addSnow(){
  clearOverlay();
  const wrap = document.createElement('div');
  wrap.className = 'rain-overlay';
  const flakes = ['❄','❅','❆','✦','·'];
  for(let i = 0; i < 40; i++){
    const s = document.createElement('span');
    s.className = 'snowflake';
    const size = Math.random() * 14 + 8;
    const dur  = Math.random() * 8 + 6;
    s.textContent = flakes[Math.floor(Math.random() * flakes.length)];
    s.style.cssText = `
      left:${Math.random() * 100}%;
      font-size:${size}px;
      animation-duration:${dur}s;
      animation-delay:${Math.random() * -dur}s;
      opacity:${Math.random() * 0.5 + 0.3};
    `;
    wrap.appendChild(s);
  }
  document.body.appendChild(wrap);
  overlayEl = wrap;
}

function applyOverlay(condition){
  clearOverlay();
  switch(condition){
    case 'Rain':         addRain(false); break;
    case 'Drizzle':      addRain(false); break;
    case 'Thunderstorm': addStorm();     break;
    case 'Snow':         addSnow();      break;
  }
}

/* ============================================================ THEME */
function applyTheme(condition){
  ALL_THEMES.forEach(t => BODY.classList.remove(t));
  const t = THEMES[condition];
  if(t) BODY.classList.add(t);
  applyOverlay(condition);
}

/* ============================================================ CLOCK */
function tickClock(){
  const now = new Date();
  HEADER_TIME.textContent = now.toLocaleTimeString('en-US',{
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
  });
}
setInterval(tickClock, 1000);
tickClock();

/* ============================================================ FORMAT UTILS */
function fmtTime(unixUTC, tzOffset){
  const ms = (unixUTC + tzOffset) * 1000;
  const d  = new Date(ms);
  const h  = d.getUTCHours();
  const m  = d.getUTCMinutes().toString().padStart(2,'0');
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ap}`;
}

function fmtDatetime(tzOffset){
  const nowS = Math.floor(Date.now() / 1000);
  const d = new Date((nowS + tzOffset) * 1000);
  const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${fmtTime(nowS, tzOffset)}`;
}

function fmtWind(ms, deg){
  const kmh = (ms * 3.6).toFixed(1);
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  const dir  = deg !== undefined ? ' ' + dirs[Math.round(deg/45) % 8] : '';
  return `${kmh} km/h${dir}`;
}

function fmtVis(m){
  if(!m && m !== 0) return 'N/A';
  return m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${m} m`;
}

const round = v => Math.round(v);

/* ============================================================ API */
async function fetchWeather(city){
  const url = `${BASE}?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`;
  let res;
  try{ res = await fetch(url); }
  catch{ throw new Error('Network error — check your internet connection.'); }

  if(!res.ok){
    if(res.status === 404) throw new Error(`"${city}" not found. Check the spelling.`);
    if(res.status === 401) throw new Error('Invalid API key.');
    if(res.status === 429) throw new Error('Too many requests. Try again shortly.');
    throw new Error(`Server error (${res.status}). Try again later.`);
  }
  return res.json();
}

/* ============================================================ RENDER */
function renderWeather(d){
  const w  = d.weather[0];
  const tz = d.timezone;

  // Location / time
  R.city.textContent    = d.name;
  R.country.textContent = d.sys.country || '';
  R.datetime.textContent = fmtDatetime(tz);
  HERO_CITY.textContent  = d.name;

  // Condition
  R.cond.textContent = w.main;
  R.desc.textContent = w.description;
  R.icon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
  R.icon.alt = w.description;

  // Temp
  R.temp.textContent   = round(d.main.temp).toString();
  R.feels.textContent  = `${round(d.main.feels_like)}°C`;
  R.min.textContent    = `${round(d.main.temp_min)}°C`;
  R.max.textContent    = `${round(d.main.temp_max)}°C`;

  // Stats
  R.hum.textContent      = `${d.main.humidity}%`;
  R.wind.textContent     = fmtWind(d.wind.speed, d.wind.deg);
  R.pressure.textContent = `${d.main.pressure} hPa`;
  R.vis.textContent      = fmtVis(d.visibility);
  R.sunrise.textContent  = fmtTime(d.sys.sunrise, tz);
  R.sunset.textContent   = fmtTime(d.sys.sunset,  tz);

  // Humidity bar (animated)
  R.humBar.style.width = '0%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      R.humBar.style.width = `${d.main.humidity}%`;
    });
  });

  // Theme + overlays
  applyTheme(w.main);

  // Show result
  RESULT.hidden = false;
  // Re-trigger animation
  RESULT.style.animation = 'none';
  requestAnimationFrame(() => {
    RESULT.style.animation = '';
  });
}

/* ============================================================ STATE */
function showError(msg){
  ERROR_MSG.textContent = msg;
  ERROR_PILL.hidden = false;
}
function clearError(){ ERROR_PILL.hidden = true; }

function setLoading(on){
  LOADER.hidden  = !on;
  BTN.disabled   = on;
  INPUT.disabled = on;
  if(on){ clearError(); RESULT.hidden = true; IDLE.hidden = true; }
}

/* ============================================================ SEARCH */
async function doSearch(cityOverride){
  const city = (cityOverride || INPUT.value).trim();
  if(!city){ showError('Enter a city name to search.'); INPUT.focus(); return; }
  if(/^\d+$/.test(city)){ showError('Enter a valid city name.'); INPUT.focus(); return; }

  setLoading(true);
  try{
    const data = await fetchWeather(city);
    clearError();
    renderWeather(data);
    IDLE.hidden = true;
  } catch(e){
    RESULT.hidden = true;
    IDLE.hidden   = false;
    showError(e.message);
  } finally{
    setLoading(false);
  }
}

/* ============================================================ EVENTS */
BTN.addEventListener('click', () => doSearch());

INPUT.addEventListener('keydown', e => {
  if(e.key === 'Enter'){ e.preventDefault(); doSearch(); }
});

INPUT.addEventListener('input', () => {
  if(!ERROR_PILL.hidden) clearError();
});

// Suggestion pills
document.querySelectorAll('.sug-pill').forEach(p => {
  p.addEventListener('click', () => {
    INPUT.value = p.dataset.city;
    doSearch(p.dataset.city);
  });
});

/* ============================================================ INIT */
(function init(){
  IDLE.hidden   = false;
  RESULT.hidden = true;
  LOADER.hidden = true;
  ERROR_PILL.hidden = true;
  INPUT.focus();
})();
