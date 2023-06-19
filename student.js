function onDeviceReady(userId) {
  // Uncomment to set OneSignal device logging to VERBOSE  
  // window.plugins.OneSignal.setLogLevel(6, 0);

  // NOTE: Update the setAppId value below with your OneSignal AppId.
  window.plugins.OneSignal.setAppId("dc6c63ec-b4a2-4aca-ab23-eb0a62a4cef8");
  window.plugins.OneSignal.setNotificationOpenedHandler(function (jsonData) {
    console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
  });

  window.plugins.OneSignal.setExternalUserId(userId)


  //Prompts the user for notification permissions.
  //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
  window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
  });

  // Ionic 5 Capacitor may need to use (window as any).plugins.OneSignal
  window.plugins.OneSignal.addSubscriptionObserver(function (state) {
    var notifId = state.to.userId
    firebase.database().ref('students/' + userId).update({
      notifId: notifId
    })
  });
  var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    fitBoundsOptions: {
      maxZoom: 18
    },
    trackUserLocation: true,
    showUserHeading: true,
    showUserLocation: true,
  });

  map.addControl(geolocate);
  map.on('load', function () {
    // Add geolocate control to the map

    // Trigger geolocate on page load
    geolocate.trigger();
  });

  geolocate.on('geolocate', function (event) {
    var userRef = firebase.database().ref('students/' + userId + '/currentcoordinate');
    userRef.update({
      1: event.coords.latitude,
      0: event.coords.longitude
    });
  })
  // Open the QR code scanner when the button is clicked
  document.getElementById("scanButton").addEventListener("click", function () {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
        if (!result.cancelled) {
          // Store the user ID in Firebase Realtime Databas
          var date = parseInt(result.text)
          console.log(date)
          firebase.database().ref("attendance/" + date + '/' + userId).set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            scannedBy: userId
          });
          firebase.database().ref('students/' + userId + '/attendance/' + date).set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            scannedBy: userId
          })
        }
      },
      function (error) {
        document.getElementById('att').innerText = 'Error: Scanning failed'
        alert("Scanning failed: " + error);
      }
    );
  });
}

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBeWC2C_luSNo1Xdj0Q5Zi1YxFVN-B23Bo",
  authDomain: "tracking-school-service.firebaseapp.com",
  databaseURL: "https://tracking-school-service-default-rtdb.firebaseio.com",
  projectId: "tracking-school-service",
  storageBucket: "tracking-school-service.appspot.com",
  messagingSenderId: "337199478535",
  appId: "1:337199478535:web:04adbee67fac36cdbd37a2",
  measurementId: "G-2QMB6GH92N"
};
firebase.initializeApp(config);
var auth = firebase.auth();



let prevLng = null;
auth.onAuthStateChanged((user) => {
  if (user) {
    var userId = user.uid
    onDeviceReady(userId)

    var studentsRef = firebase.database().ref('students/' + userId);
    studentsRef.on('value', function (snapshot) {
      var studentData = snapshot.val();
      document.getElementById('profileimg').src = studentData.image
      document.getElementById('profilename').textContent = studentData.name

      if (!studentData.ride) {
        document.getElementById('overlay').style.display = 'flex'
      } else {
        document.getElementById('overlay').style.display = 'none'
      }
      var busNumber = studentData.busnumber;
      const busRef = firebase.database().ref('bus/' + busNumber);
      busRef.on('value', (snapshot) => {
        const { lng, lat } = snapshot.val();

        // Update the position of the marker on the map
        busMarker.setLngLat([lng, lat]);
        map.flyTo({ center: [lng, lat], zoom: 17 });
        busMarker.addTo(map)
        drawRoute([lng, lat], userId)
      });
    });
    var overlay = document.getElementById('overlay')
    var ride = document.getElementById('ride-button');
    ride.addEventListener('click', (e) => {
      // Get the current date and time in GMT+8
      var currentDate = new Date();
      var currentHour = currentDate.getUTCHours() + 8;
      console.log(currentDate, currentHour)
    
      // Check if the current hour is between 7 and 19 (7 AM and 7 PM)
      if (currentHour >= 7 && currentHour > 19) {
        // Update the Firebase database with the ride value set to false
        firebase.database().ref('students/' + userId).update({
          ride: false
        });
    
        // Display the overlay
        overlay.style.display = "flex";
      } else {
        // Handle the case when the current time is not between 7 AM and 7 PM
        console.log("Cannot update outside the allowed time range (7 AM - 7 PM GMT+8).");
      }
    });
    
    var ridebutton = document.querySelector('.ride-on-button')
    ridebutton.addEventListener('click', (e) => {
      firebase.database().ref('students/' + userId).update({
        ride: true
      })
      overlay.style.display = 'none'
    })
  } else {
    window.location.href = 'index.html'
  }
})

mapboxgl.accessToken = 'pk.eyJ1IjoicmltdXJ1dTEiLCJhIjoiY2xhcHA0ZXRxMDh1MzQxbnNpeTJvZnAybiJ9.EmMsJjz7bwUN7o2lW4zjfw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [121.07956033068146, 14.621975505126729],
  zoom: 17
});

var toggleInput = document.getElementById('dark-mode-toggle');
var toggleSlider = document.querySelector('.toggle-slider');
var qrCodeOverlay = document.getElementById('qr-code-overlay');
var qrCodePopup = document.getElementById('qr-code-popup');
var qrCodeImage = document.getElementById('qr-code-image');
var menulines = document.querySelectorAll('.menu-line')

toggleInput.addEventListener('change', function () {
  if (this.checked) {
    map.setStyle('mapbox://styles/mapbox/dark-v10');
    toggleSlider.style.backgroundColor = '#007AFF';
    toggleSlider.style.transform = 'translateX(100%)';
    menulines.forEach(function (menuline) {
      menuline.style.backgroundColor = 'white';
    });
  } else {
    map.setStyle('mapbox://styles/mapbox/streets-v11');
    toggleSlider.style.backgroundColor = '#ccc';
    toggleSlider.style.transform = 'translateX(0)';
    menulines.forEach(function (menuline) {
      menuline.style.backgroundColor = 'black';
    });
  }
});

var sidebarMenuButton = document.getElementById('sidebar-menu-button');
var sidebar = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebar-overlay');

sidebarMenuButton.addEventListener('click', function () {
  sidebarMenuButton.classList.toggle('open');
  sidebar.classList.toggle('show');
  sidebarOverlay.style.display = 'block';
});

sidebarOverlay.addEventListener('click', function () {
  sidebarMenuButton.classList.remove('open');
  sidebar.classList.remove('show');
  sidebarOverlay.style.display = 'none';
});



const busMarkerEl = document.createElement('div');
busMarkerEl.className = 'bus-marker';
busMarkerEl.setAttribute('data-image', 'https://www.pngmart.com/files/7/School-Bus-PNG-File.png')
var circle = document.createElement('div');
circle.className = 'circle';
var label = document.createElement('div');
label.className = 'label';
label.textContent = 'Driver';
circle.appendChild(label)
busMarkerEl.appendChild(circle);


const busMarker = new mapboxgl.Marker(busMarkerEl);


async function drawRoute(buscoord, userId) {
  var myloc
  firebase.database().ref('students/' + userId + '/currentcoordinate').on('value', (e) => {
    myloc = e.val()
  })
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${buscoord};${myloc}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };
  // If the route already exists on the map, reset it using setData
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  }
  // Otherwise, add a new layer for the route
  else {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#FFA500',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}


var schoolCoord = [121.11221986213832, 14.647945800163422];

var el = document.createElement('div');
el.className = 'marker';
var circle = document.createElement('div');
circle.className = 'schoolcircle';
var label = document.createElement('div');
label.className = 'label';
label.textContent = 'OLOPSC';
circle.appendChild(label);
el.appendChild(circle);
var marker = new mapboxgl.Marker(el)
  .setLngLat(schoolCoord)
  .addTo(map);

document.addEventListener("backbutton", function (e) {
  e.preventDefault();
}, false);