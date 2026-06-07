const api = '/plugins/easytier/api.php';

function request(a, m, p) {
  return new Promise(function(r, j) {
    if (m === 'POST') {
      $.post(api, $.extend({action: a}, p || {}), function(data) {
        if (data.success) r(data); else j(new Error(data.error || 'Failed'));
      }, 'json').fail(function(x) { j(new Error('HTTP ' + x.status)); });
    } else {
      $.get(api, {action: a}, function(data) {
        if (data.success) r(data); else j(new Error(data.error || 'Failed'));
      }, 'json').fail(function(x) { j(new Error('HTTP ' + x.status)); });
    }
  });
}

// Overview page
function refresh() {
  var el = document.getElementById('et-node-info');
  if (!el) return;

  request('node_info').then(function(r) {
    var d = r.data || {};
    var h = '';
    var rows = [['Hostname',d.hostname||'-'],['Peer ID',String(d.peer_id||'-')],['Version',d.version||'-'],['Proxy CIDRs',(d.proxy_cidrs||[]).join(', ')||'None']];
    for (var i=0; i<rows.length; i++) {
      h += '<tr class="' + (i%2===0?'normal-row':'alt-row') + '"><td>' + rows[i][0] + '</td><td>' + rows[i][1] + '</td></tr>';
    }
    el.innerHTML = h;
  }).catch(function(){});
  request('peers').then(function(r) {
    var d = r.data || [];
    var el2 = document.getElementById('et-peers-content');
    if (!el2) return;
    if (d.length === 0) { el2.innerHTML = '<tr><td colspan="4">No peers</td></tr>'; return; }
    var h = '';
    for (var i=0; i<d.length; i++) {
      var p = d[i];
      var t = p.tunnel_proto || p.cost || '-';
      var lat = (p.lat_ms && p.lat_ms !== '-') ? p.lat_ms + 'ms' : '-';
      h += '<tr class="' + (i%2===0?'normal-row':'alt-row') + '"><td>' + (p.hostname||p.id||'-') + '</td><td>' + t + '</td><td>' + lat + '</td><td>' + (p.loss_rate||'-') + '</td></tr>';
    }
    el2.innerHTML = h;
  }).catch(function(){});
  request('routes').then(function(r) {
    var d = r.data || [];
    var el3 = document.getElementById('et-routes-content');
    if (!el3) return;
    if (d.length === 0) { el3.innerHTML = '<tr><td colspan="4">No routes</td></tr>'; return; }
    var h = '';
    for (var i=0; i<d.length; i++) {
      var rt = d[i];
      var lat = (rt.next_hop_lat != null) ? rt.next_hop_lat.toFixed(2) + 'ms' : '-';
      h += '<tr class="' + (i%2===0?'normal-row':'alt-row') + '"><td>' + (rt.hostname||'-') + '</td><td>' + (rt.proxy_cidrs||'-') + '</td><td>' + (rt.next_hop_hostname||'-') + '</td><td>' + lat + '</td></tr>';
    }
    el3.innerHTML = h;
  }).catch(function(){});
}

function doAction(a) {
  var s = document.getElementById('et-status');
  if (!s) return;
  s.textContent = a + '...';
  request(a,'POST').then(function(r) {
    var out = (r.data && r.data.output) ? r.data.output : 'OK';
    s.textContent = out.replace(/\n/g, ' ');
    setTimeout(refresh, 2000);
  }).catch(function(e) {
    s.textContent = 'Error: ' + e.message;
  });
}

// Settings page
function saveConfig() {
  var m = document.getElementById('et-cfg-msg');
  if (!m) return;
  request('save_config','POST',{
    network_name: document.getElementById('et-name').value.trim(),
    network_secret: document.getElementById('et-secret').value,
    virtual_ipv4: document.getElementById('et-ipv4').value.trim(),
    hostname: document.getElementById('et-host').value.trim(),
    peer_urls: document.getElementById('et-peers').value.trim(),
    listener_urls: document.getElementById('et-listeners').value.trim(),
    proxy_cidrs: document.getElementById('et-proxy').value.trim()
  }).then(function(){m.textContent='Saved.';m.style.color='#5cb85c';}).catch(function(e){m.textContent=e.message;m.style.color='#d9534f';});
}

// Management page
function addConnector() {
  var u = document.getElementById('et-conn-url');
  var msg = document.getElementById('et-conn-msg');
  if (!u || !msg) return;
  var url = u.value.trim();
  if (!url) { msg.textContent='Enter URL'; return; }
  request('connector_add','POST',{url:url}).then(function(){msg.textContent='Added'; u.value=''; renderConnectors();}).catch(function(e){msg.textContent=e.message;});
}

function removeConnector(url) {
  var msg = document.getElementById('et-conn-msg');
  if (!msg) return;
  request('connector_remove','POST',{url:url}).then(function(){msg.textContent='Removed'; renderConnectors();}).catch(function(e){msg.textContent=e.message;});
}

function renderConnectors() {
  var el = document.getElementById('et-conn-list');
  if (!el) return;
  request('connector_list').then(function(r) {
    var l = Array.isArray(r.data)?r.data:[];
    if (!l.length) { el.innerHTML = '<tr><td>No connectors</td></tr>'; return; }
    var h = '<table class="unraid statusTable" style="margin:0"><thead><tr><th>URL</th><th></th></tr></thead><tbody>';
    for (var i=0; i<l.length; i++) {
      var u = l[i].url || l[i];
      h += '<tr><td>' + u + '</td><td><input type="button" value="Remove" onclick="removeConnector(\'' + String(u).replace(/'/g,"\\'") + '\')"></td></tr>';
    }
    h += '</tbody></table>';
    el.innerHTML = h;
  }).catch(function(){});
}

function setLogLevel() {
  var el = document.getElementById('et-log-level');
  var msg = document.getElementById('et-logger-msg');
  if (!el || !msg) return;
  request('logger_set','POST',{level:el.value}).then(function(){msg.textContent='Set to '+el.value;}).catch(function(e){msg.textContent=e.message;});
}

$(function() {
  if (document.getElementById('et-node-info')) refresh();
  if (document.getElementById('et-save')) {
    document.getElementById('et-save').addEventListener('click', saveConfig);
  }
  if (document.getElementById('et-conn-list')) renderConnectors();
});
