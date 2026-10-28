// Browser application for Sentia: scroll reveal, the live demo simulation
// and the Sentia Cloud dashboard. Served verbatim at /client.js.
// Written without template literals so it can live inside this string.
export const CLIENT_JS = String.raw`
(function () {
  'use strict';

  // ---------- reveal on scroll ----------
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  function $(id) { return document.getElementById(id); }
  function fmtTime(ts) {
    var d = new Date(ts * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function fmtAgo(ts) {
    var s = Math.max(0, Math.round(Date.now() / 1000 - ts));
    if (s < 90) return s + ' s ago';
    if (s < 5400) return Math.round(s / 60) + ' min ago';
    return Math.round(s / 3600) + ' h ago';
  }
  function pathName(p) { return p === 'findmy' ? 'Find My network' : 'LoRaWAN'; }

  // ---------- dashboard ----------
  var POSTURES = ['Unknown', 'Upright', 'Walking', 'Running', 'Lying'];
  var alertsCache = [];

  function drawChart(canvas, points, pick, color, fill) {
    if (!canvas || !points.length) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var vals = points.map(pick);
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var pad = (max - min) * 0.25 || 1;
    min -= pad; max += pad;
    ctx.strokeStyle = '#DFE7DF'; ctx.lineWidth = 1;
    for (var g = 1; g <= 3; g++) {
      var gy = (h / 4) * g;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
    function X(i) { return (i / (points.length - 1)) * (w - 8) + 4; }
    function Y(v) { return h - 6 - ((v - min) / (max - min)) * (h - 12); }
    if (fill) {
      ctx.beginPath();
      points.forEach(function (p, i) { i === 0 ? ctx.moveTo(X(i), Y(pick(p))) : ctx.lineTo(X(i), Y(pick(p))); });
      ctx.lineTo(X(points.length - 1), h); ctx.lineTo(X(0), h); ctx.closePath();
      ctx.fillStyle = 'rgba(14,124,102,0.05)'; ctx.fill();
    }
    ctx.beginPath();
    points.forEach(function (p, i) { i === 0 ? ctx.moveTo(X(i), Y(pick(p))) : ctx.lineTo(X(i), Y(pick(p))); });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
  }

  function renderAlerts(patchId) {
    var list = $('alertsList');
    list.innerHTML = '';
    var mine = alertsCache.filter(function (a) { return a.patchId === patchId; });
    if (!mine.length) {
      var calm = document.createElement('p');
      calm.className = 'calm';
      calm.textContent = 'No open alerts for this wearer in the last 24 hours.';
      list.appendChild(calm);
      return;
    }
    mine.forEach(function (a) {
      var row = document.createElement('div');
      row.className = 'alert-row';
      var dot = document.createElement('span');
      dot.className = 'alert-dot sev-' + a.severity;
      var body = document.createElement('div');
      var head = document.createElement('p');
      head.className = 'alert-head';
      head.textContent = a.type.replace(/_/g, ' ') + ' · ' + fmtTime(a.timestamp);
      var msg = document.createElement('p');
      msg.className = 'alert-msg';
      msg.textContent = a.message;
      body.appendChild(head); body.appendChild(msg);
      row.appendChild(dot); row.appendChild(body);
      list.appendChild(row);
    });
  }

  var fleetData = [];

  function selectPatch(id) {
    var tabs = document.querySelectorAll('.wearer-tab');
    tabs.forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-id') === id); });
    var rows = document.querySelectorAll('#fleetBody tr');
    rows.forEach(function (r) { r.classList.toggle('on', r.getAttribute('data-id') === id); });
    fetch('/api/patches/' + id).then(function (r) { return r.json(); }).then(function (s) {
      $('tileTemp').textContent = s.current.temperatureC.toFixed(2) + ' °C';
      $('tileHyd').textContent = s.current.hydrationIndex + ' / 100';
      $('tileAct').textContent = s.current.activitySteps + ' steps · ' + POSTURES[s.current.posture].toLowerCase();
      $('tileBatt').textContent = s.batteryPercent + ' % · day ' + s.wearDay + ' of 14';
      $('tileSync').textContent = fmtAgo(s.lastSync.at);
      $('tileVia').textContent = pathName(s.lastSync.path) + ' · ' + s.lastSync.relay;
    });
    fetch('/api/patches/' + id + '/measurements?hours=24').then(function (r) { return r.json(); }).then(function (data) {
      var pts = data.points;
      var rt = drawChart($('chartTemp'), pts, function (p) { return p.temperatureC; }, '#0E7C66', true);
      var rh = drawChart($('chartHyd'), pts, function (p) { return p.hydrationIndex; }, '#12211C', false);
      if (rt) $('tempRange').textContent = rt.min.toFixed(1) + ' to ' + rt.max.toFixed(1) + ' °C · 24 h';
      if (rh) $('hydRange').textContent = rh.min + ' to ' + rh.max + ' · 24 h';
    });
    renderAlerts(id);
  }

  function initDashboard() {
    if (!$('wearerTabs')) return;
    fetch('/api/patches').then(function (r) { return r.json(); }).then(function (data) {
      fleetData = data.patches;
      var tabs = $('wearerTabs');
      var body = $('fleetBody');
      fleetData.forEach(function (p) {
        var b = document.createElement('button');
        b.className = 'wearer-tab';
        b.setAttribute('data-id', p.id);
        b.textContent = p.wearer;
        b.addEventListener('click', function () { selectPatch(p.id); });
        tabs.appendChild(b);
        var tr = document.createElement('tr');
        tr.setAttribute('data-id', p.id);
        [p.wearer, p.id, p.site, p.batteryPercent + ' %', fmtAgo(p.lastSync.at), pathName(p.lastSync.path)].forEach(function (v) {
          var td = document.createElement('td');
          td.textContent = v;
          tr.appendChild(td);
        });
        tr.addEventListener('click', function () { selectPatch(p.id); });
        body.appendChild(tr);
      });
      return fetch('/api/alerts');
    }).then(function (r) { return r.json(); }).then(function (data) {
      alertsCache = data.alerts;
      if (fleetData.length) selectPatch(fleetData[0].id);
    }).catch(function () { /* dashboard stays quiet if the API is unreachable */ });
  }

  // ---------- live demo ----------
  var sim = null, simTimer = null, simPoints = [], simPaused = false;

  function setMode(mode) {
    if (!window.SentiaCodec) return;
    sim = window.SentiaCodec.createSim(mode);
    simPoints = [];
    $('relayName').textContent = mode === 'city' ? 'A passing phone' : 'A hilltop gateway';
    $('relayKind').textContent = mode === 'city' ? 'Find My network relay' : 'LoRaWAN gateway';
    $('demoToggleCity').classList.toggle('on', mode === 'city');
    $('demoToggleRural').classList.toggle('on', mode === 'rural');
    $('feedList').innerHTML = '';
    emit();
  }

  function emit() {
    if (!sim || simPaused) return;
    var C = window.SentiaCodec;
    var reading = C.nextSimReading(sim, Math.random);
    var path = sim.mode === 'city' ? 'findmy' : 'lora';
    var pack = C.payloadFor(reading, path);
    var latency = C.latencyFor(path, Math.random);
    $('payloadMeta').textContent =
      (path === 'findmy' ? 'BLE digest · base64 · ' : 'LoRaWAN frame · hex · ') + pack.sizeBytes + ' bytes';
    $('payloadCard').textContent = pack.payload;
    animatePacket(function () { arrive(reading, pack, path, latency); });
  }

  function animatePacket(done) {
    var dot = $('packetDot');
    var start = null, DUR = 2600;
    dot.style.opacity = '1';
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / DUR);
      var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      dot.style.left = (4 + eased * 92) + '%';
      if (t < 1) requestAnimationFrame(step);
      else { dot.style.opacity = '0'; done(); }
    }
    requestAnimationFrame(step);
  }

  function arrive(reading, pack, path, latency) {
    $('roTemp').textContent = reading.temperatureC.toFixed(2) + ' °C';
    $('roHyd').textContent = reading.hydration + ' / 100';
    $('roAct').textContent = reading.activitySteps + ' steps';
    $('roBatt').textContent = reading.battery + ' %';
    simPoints.push(reading);
    if (simPoints.length > 28) simPoints.shift();
    drawChart($('liveChart'), simPoints, function (p) { return p.temperatureC; }, '#0E7C66', true);
    var li = document.createElement('li');
    li.className = 'feed-row';
    var flagText = reading.flags.impact ? ' · impact' : reading.flags.detached ? ' · detached' : reading.flags.alert ? ' · alert' : '';
    li.textContent =
      fmtTime(reading.timestamp) + '  ·  ' + pathName(path) + '  ·  ' + latency.toFixed(1) + ' s  ·  ' +
      pack.sizeBytes + ' B  ·  ' + reading.temperatureC.toFixed(2) + ' °C  ·  hydration ' + reading.hydration + flagText;
    var feed = $('feedList');
    feed.insertBefore(li, feed.firstChild);
    while (feed.children.length > 7) feed.removeChild(feed.lastChild);
    requestAnimationFrame(function () { li.classList.add('in'); });
  }

  function initDemo() {
    if (!$('demoToggleCity')) return;
    $('demoToggleCity').addEventListener('click', function () { setMode('city'); });
    $('demoToggleRural').addEventListener('click', function () { setMode('rural'); });
    $('demoPause').addEventListener('click', function () {
      simPaused = !simPaused;
      $('demoPause').textContent = simPaused ? 'Resume' : 'Pause';
      if (!simPaused) emit();
    });
    setMode('city');
    simTimer = setInterval(function () { if (!simPaused) emit(); }, 4200);
  }

  initDashboard();
  initDemo();
})();
`;
