const api = '/plugins/easytier/api.php';

function request(a, m, p) {
  return new Promise(function(r, j) {
    if (m === 'POST') {
      $.post(api, {action: a}, function(data) {
        if (data.success) r(data); else j(new Error(data.error || 'Failed'));
      }, 'json').fail(function(x) { j(new Error('HTTP ' + x.status)); });
    } else {
      $.get(api, {action: a}, function(data) {
        if (data.success) r(data); else j(new Error(data.error || 'Failed'));
      }, 'json').fail(function(x) { j(new Error('HTTP ' + x.status)); });
    }
  });
}

function refresh() {
  request('status').then(function(r) {
    document.getElementById('et-status').textContent = r.data.running === '1' ? 'Running' : 'Stopped';
  }).catch(function(){});
  request('node_info').then(function(r) {
    var d = r.data || {};
    var h = '';
    var rows = [['Hostname',d.hostname||'-'],['Peer ID',String(d.peer_id||'-')],['Version',d.version||'-'],['Proxy CIDRs',(d.proxy_cidrs||[]).join(', ')||'None']];
    for (var i=0; i<rows.length; i++) {
      h += '<tr class="' + (i%2===0?'normal-row':'alt-row') + '"><td>' + rows[i][0] + '</td><td>' + rows[i][1] + '</td></tr>';
    }
    document.getElementById('et-node-info').innerHTML = h;
  }).catch(function(){});
  request('peers').then(function(r) {
    var d = r.data || [];
    if (d.length === 0) { document.getElementById('et-peers-content').innerHTML = '<tr><td colspan="4">No peers</td></tr>'; return; }
    var h = '';
    for (var i=0; i<d.length; i++) {
      var p = d[i];
      var t = p.tunnel_proto || p.cost || '-';
      var lat = (p.lat_ms && p.lat_ms !== '-') ? p.lat_ms + 'ms' : '-';
      h += '<tr class="' + (i%2===0?'normal-row':'alt-row') + '"><td>' + (p.hostname||p.id||'-') + '</td><td>' + t + '</td><td>' + lat + '</td><td>' + (p.loss_rate||'-') + '</td></tr>';
    }
    document.getElementById('et-peers-content').innerHTML = h;
  }).catch(function(){});
  request('routes').then(function(r) {
    var d = r.data || [];
    if (d.length === 0) { document.getElementById('et-routes-content').innerHTML = '<tr><td colspan="4">No routes</td></tr>'; return; }
    var h = '';
    for (var i=0; i<d.length; i++) {
      var rt = d[i];
      var lat = (rt.next_hop_lat != null) ? rt.next_hop_lat.toFixed(2) + 'ms' : '-';
      h += '<tr class="' + (i%2===0?'normal-row':'alt-row') + '"><td>' + (rt.hostname||'-') + '</td><td>' + (rt.proxy_cidrs||'-') + '</td><td>' + (rt.next_hop_hostname||'-') + '</td><td>' + lat + '</td></tr>';
    }
    document.getElementById('et-routes-content').innerHTML = h;
  }).catch(function(){});
}

function doAction(a) {
  var s = document.getElementById('et-status');
  s.textContent = a + '...';
  request(a,'POST').then(function(r) {
    var out = (r.data && r.data.output) ? r.data.output : 'OK';
    s.textContent = out.replace(/\n/g, ' ');
    setTimeout(refresh, 2000);
  }).catch(function(e) {
    s.textContent = 'Error: ' + e.message;
  });
}

refresh();
