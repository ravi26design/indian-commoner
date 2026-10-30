/* Indian Commoner — interactive India map (Leaflet). Shared by the home page and Map Exploration.
   Click a state bubble to zoom in and see that state's pins. */
  (function () {
    var el = document.getElementById('commons-map');
    if (!el) return;
    if (!window.L) { el.innerHTML = '<p style="padding:2rem;text-align:center;color:#666">The map could not be loaded. Check your connection and reload.</p>'; return; }

    // NOTE: the per-state counts and the pin positions below are placeholder/illustrative demo data
    // (requested to fill out the map), not real forum activity. The demo pins sit on real towns in
    // each state so they always fall on land inside it. Discussions started through "Chat with us"
    // that saved a real location are drawn as exact pins on top.
    var STATES = [
      { name: 'Andhra Pradesh',   count: 22, lat: 15.9129, lng: 79.7400 },
      { name: 'Jharkhand',        count: 11, lat: 23.6102, lng: 85.2799 },
      { name: 'Karnataka',        count: 11, lat: 15.3173, lng: 75.7139 },
      { name: 'Rajasthan',        count: 7,  lat: 27.0238, lng: 74.2179 },
      { name: 'Maharashtra',      count: 4,  lat: 19.7515, lng: 75.7139 },
      { name: 'Madhya Pradesh',   count: 3,  lat: 22.9734, lng: 78.6569 },
      { name: 'Gujarat',          count: 2,  lat: 22.2587, lng: 71.1924 },
      { name: 'Kerala',           count: 2,  lat: 10.8505, lng: 76.2711 },
      { name: 'Odisha',           count: 2,  lat: 20.9517, lng: 85.0985 },
      { name: 'Punjab',           count: 2,  lat: 31.1471, lng: 75.3412 },
      { name: 'Arunachal Pradesh',count: 1,  lat: 28.2180, lng: 94.7278 },
      { name: 'Assam',            count: 1,  lat: 26.2006, lng: 92.9376 },
      { name: 'Chhattisgarh',     count: 1,  lat: 21.2787, lng: 81.8661 },
      { name: 'Meghalaya',        count: 1,  lat: 25.4670, lng: 91.3662 },
      { name: 'Nagaland',         count: 1,  lat: 26.1584, lng: 94.5624 },
      { name: 'Uttarakhand',      count: 1,  lat: 30.0668, lng: 79.0193 },
      { name: 'Uttar Pradesh',    count: 1,  lat: 26.8467, lng: 80.9462 }
    ];

    // Real towns per state: [name, lat, lng]. The first N are used for a state showing N discussions.
    var TOWNS = {
      'Andhra Pradesh': [['Visakhapatnam',17.6868,83.2185],['Vijayawada',16.5062,80.6480],['Guntur',16.3067,80.4365],['Nellore',14.4426,79.9865],['Kurnool',15.8281,78.0373],['Tirupati',13.6288,79.4192],['Kakinada',16.9891,82.2475],['Rajahmundry',17.0005,81.8040],['Anantapur',14.6819,77.6006],['Kadapa',14.4674,78.8241],['Chittoor',13.2172,79.1003],['Ongole',15.5057,80.0499],['Eluru',16.7107,81.0952],['Machilipatnam',16.1875,81.1389],['Srikakulam',18.2949,83.8938],['Vizianagaram',18.1067,83.3956],['Nandyal',15.4786,78.4836],['Tenali',16.2430,80.6400],['Proddatur',14.7502,78.5481],['Madanapalle',13.5503,78.5030],['Hindupur',13.8280,77.4911],['Adoni',15.6322,77.2750],['Bhimavaram',16.5449,81.5212],['Tadepalligudem',16.8140,81.5280]],
      'Jharkhand': [['Ranchi',23.3441,85.3096],['Jamshedpur',22.8046,86.2029],['Dhanbad',23.7957,86.4304],['Bokaro',23.6693,86.1511],['Hazaribagh',23.9966,85.3691],['Deoghar',24.4850,86.6950],['Giridih',24.1913,86.3000],['Ramgarh',23.6300,85.5600],['Dumka',24.2679,87.2497],['Chaibasa',22.5550,85.8070],['Daltonganj',24.0396,84.0675],['Gumla',23.0442,84.5390],['Lohardaga',23.4361,84.6836],['Pakur',24.6350,87.8490]],
      'Karnataka': [['Bengaluru',12.9716,77.5946],['Mysuru',12.2958,76.6394],['Hubballi',15.3647,75.1240],['Mangaluru',12.9141,74.8560],['Belagavi',15.8497,74.4977],['Kalaburagi',17.3297,76.8343],['Ballari',15.1394,76.9214],['Shivamogga',13.9299,75.5681],['Tumakuru',13.3379,77.1173],['Davanagere',14.4644,75.9218],['Vijayapura',16.8302,75.7100],['Hassan',13.0068,76.1004],['Udupi',13.3409,74.7421],['Chikkamagaluru',13.3161,75.7720],['Madikeri',12.4244,75.7382]],
      'Rajasthan': [['Jaipur',26.9124,75.7873],['Jodhpur',26.2389,73.0243],['Udaipur',24.5854,73.7125],['Bikaner',28.0229,73.3119],['Ajmer',26.4499,74.6399],['Kota',25.2138,75.8648],['Jaisalmer',26.9157,70.9083],['Alwar',27.5530,76.6346],['Bhilwara',25.3407,74.6313],['Barmer',25.7532,71.4181],['Sikar',27.6094,75.1399],['Pali',25.7711,73.3234]],
      'Maharashtra': [['Pune',18.5204,73.8567],['Nagpur',21.1458,79.0882],['Nashik',19.9975,73.7898],['Aurangabad',19.8762,75.3433],['Kolhapur',16.7050,74.2433],['Amravati',20.9374,77.7796],['Solapur',17.6599,75.9064],['Mumbai',19.0760,72.8777]],
      'Madhya Pradesh': [['Bhopal',23.2599,77.4126],['Indore',22.7196,75.8577],['Jabalpur',23.1815,79.9864],['Gwalior',26.2183,78.1828],['Ujjain',23.1765,75.7885],['Sagar',23.8388,78.7378]],
      'Gujarat': [['Ahmedabad',23.0225,72.5714],['Surat',21.1702,72.8311],['Vadodara',22.3072,73.1812],['Rajkot',22.3039,70.8022],['Bhuj',23.2420,69.6669],['Bhavnagar',21.7645,72.1519]],
      'Kerala': [['Thiruvananthapuram',8.5241,76.9366],['Kochi',9.9312,76.2673],['Kozhikode',11.2588,75.7804],['Thrissur',10.5276,76.2144],['Kannur',11.8745,75.3704],['Kollam',8.8932,76.6141]],
      'Odisha': [['Bhubaneswar',20.2961,85.8245],['Cuttack',20.4625,85.8830],['Puri',19.8135,85.8312],['Sambalpur',21.4669,83.9812],['Berhampur',19.3149,84.7941],['Rourkela',22.2604,84.8536]],
      'Punjab': [['Ludhiana',30.9010,75.8573],['Amritsar',31.6340,74.8723],['Jalandhar',31.3260,75.5762],['Patiala',30.3398,76.3869],['Bathinda',30.2110,74.9455]],
      'Arunachal Pradesh': [['Itanagar',27.0844,93.6053]],
      'Assam': [['Guwahati',26.1445,91.7362]],
      'Chhattisgarh': [['Raipur',21.2514,81.6296]],
      'Meghalaya': [['Shillong',25.5788,91.8933]],
      'Nagaland': [['Kohima',25.6751,94.1086]],
      'Uttarakhand': [['Dehradun',30.3165,78.0322]],
      'Uttar Pradesh': [['Lucknow',26.8467,80.9462]]
    };

    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function tier(c) {
      if (c >= 10) return { color: '#01796f', size: 38 };
      if (c >= 3)  return { color: '#a89c50', size: 32 };
      return { color: '#1565C0', size: 26 };
    }

    var INDIA = L.latLngBounds([[8.0, 68.5], [35.0, 97.5]]);
    var map = L.map(el, { zoomControl: true, scrollWheelZoom: false, minZoom: 3, maxZoom: 14, zoomSnap: 0.25, worldCopyJump: false });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
    }).addTo(map);

    var card = document.getElementById('map-card');
    var bubbles = L.layerGroup();
    var demoPins = L.layerGroup().addTo(map);
    var realPins = L.layerGroup().addTo(map);
    var current = null;

    function fitIndia(animate) {
      map.fitBounds(INDIA, { padding: [10, 10], animate: !!animate, duration: .8 });
    }

    // state bubbles: the count, then the state name
    STATES.forEach(function (s) {
      var t = tier(s.count);
      var icon = L.divIcon({
        className: 'ic-bub-wrap', iconSize: [0, 0],
        html: '<span class="ic-bub"><span class="mkpin" style="background:' + t.color + ';width:' + t.size + 'px;height:' + t.size + 'px">' + s.count +
              '</span><span class="pinmap-label">' + esc(s.name) + '</span></span>'
      });
      var m = L.marker([s.lat, s.lng], { icon: icon, title: s.name + ' — ' + s.count + ' discussion' + (s.count === 1 ? '' : 's') + ' (click to zoom in)', keyboard: true, riseOnHover: true });
      m.on('click', function () { zoomToState(s); });
      m.addTo(bubbles);
    });
    bubbles.addTo(map);

    function pinIcon(cls) {
      return L.divIcon({ className: 'ic-pin-wrap', iconSize: [0, 0], html: '<span class="ic-pin ' + (cls || '') + '"></span>' });
    }

    function zoomToState(s) {
      current = s;
      var towns = (TOWNS[s.name] || []).slice(0, s.count);
      demoPins.clearLayers();
      var pts = [];
      towns.forEach(function (t) {
        var ll = [t[1], t[2]]; pts.push(ll);
        L.marker(ll, { icon: pinIcon('demo'), title: 'Illustrative location: ' + t[0] + ', ' + s.name, keyboard: true })
          .bindTooltip(esc(t[0]) + ' <small>(illustrative)</small>', { direction: 'top', offset: [0, -10] })
          .on('click', function () { location.href = 'forum.html?state=' + encodeURIComponent(s.name); })
          .addTo(demoPins);
      });
      map.removeLayer(bubbles);
      if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 9, duration: .9 });
      else if (pts.length === 1) map.flyTo(pts[0], 8, { duration: .9 });
      else map.flyTo([s.lat, s.lng], 7, { duration: .9 });
      document.getElementById('map-card-state').textContent = s.name;
      document.getElementById('map-card-count').textContent = s.count + ' discussion' + (s.count === 1 ? '' : 's');
      document.getElementById('map-card-link').href = 'forum.html?state=' + encodeURIComponent(s.name);
      card.hidden = false;
    }

    function backToIndia() {
      current = null;
      demoPins.clearLayers();
      card.hidden = true;
      if (!map.hasLayer(bubbles)) bubbles.addTo(map);
      fitIndia(true);
    }
    document.getElementById('map-card-back').addEventListener('click', backToIndia);
    map.on('click', function () { /* background click: nothing, so the page can scroll over the map on touch screens */ });

    // Real, exact locations: discussions started in this browser through "Chat with us" that saved a location.
    try {
      JSON.parse(localStorage.getItem('ic_pending_threads') || '[]').forEach(function (t) {
        if (typeof t.lat !== 'number' || typeof t.lng !== 'number') return;
        L.marker([t.lat, t.lng], { icon: pinIcon('real'), title: t.title, keyboard: true })
          .bindTooltip(esc(t.title) + (t.address ? '<br><small>' + esc(t.address.split(',').slice(0, 2).join(',')) + '</small>' : ''), { direction: 'top', offset: [0, -10] })
          .on('click', function () { location.href = 'thread.html?id=' + encodeURIComponent(t.ts); })
          .addTo(realPins);
      });
    } catch (e) {}

    fitIndia(false);
    var rt; window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { map.invalidateSize(); if (!current) fitIndia(false); }, 150);
    });
    // lazy section: make sure tiles lay out correctly once it is on screen
    setTimeout(function () { map.invalidateSize(); if (!current) fitIndia(false); }, 400);
  })();
