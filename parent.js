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
        firebase.database().ref('parents/' + userId).update({
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

}


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

var auth = firebase.auth()
var database = firebase.database()

mapboxgl.accessToken = 'pk.eyJ1IjoicmltdXJ1dTEiLCJhIjoiY2xhcHA0ZXRxMDh1MzQxbnNpeTJvZnAybiJ9.EmMsJjz7bwUN7o2lW4zjfw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [121.0992564483926, 14.633092687555589],
    zoom: 12
});


var toggleInput = document.getElementById('dark-mode-toggle');
var toggleSlider = document.querySelector('.toggle-slider');
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
var menulines = document.querySelectorAll('.menu-line')
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


auth.onAuthStateChanged((user) => {
    if (user) {
        var userId = user.uid
        onDeviceReady(userId)
        database.ref('parents/' + userId).once('value', (snapshot) => {
            var parentdata = snapshot.val()
            document.getElementById('profileimg').src = parentdata.image
            document.getElementById('profilename').textContent = parentdata.name

            var childId = parentdata.child.child
            database.ref('students/' + childId).on('value', (snapshot) => {
                var childdata = snapshot.val()
                addchildmarker(childdata)
                var childbusnumber = childdata.busnumber
                database.ref('bus/' + childbusnumber).on('value', (snapshot) => {
                    var buscoord = snapshot.val()
                    addbusmarker(buscoord)
                })
            })
        })
    } else {
        window.location.href = 'index.html'
    }
})

var childMarker
var childMarkerEl = document.createElement('div');
childMarkerEl.className = 'marker';
var circle = document.createElement('div');
circle.className = 'circle';
var label = document.createElement('div');
label.className = 'label';

function addchildmarker(child) {
    // Define the school parent marker
    childMarkerEl.setAttribute('data-image', child.image)
    label.textContent = child.name;
    circle.appendChild(label)
    childMarkerEl.appendChild(circle);
    childMarker = new mapboxgl.Marker(childMarkerEl);
    childMarker.setLngLat(child.currentcoordinate);
    childMarker.addTo(map)

    childMarker = document.querySelectorAll('.marker')
    childMarker.forEach(function (marker) {
        var circle = marker.querySelector('.circle');
        var image = marker.getAttribute('data-image');
        circle.style.backgroundImage = 'url("' + image + '")';
    });
}

var busMarker
var busMarkerEl = document.createElement('div');
busMarkerEl.className = 'busmarker';
var buscircle = document.createElement('div');
buscircle.className = 'buscircle';
var buslabel = document.createElement('div');
buslabel.className = 'buslabel';

function addbusmarker(buscoord) {
    busMarkerEl.setAttribute('data-image', 'https://www.adamslibrary.org/sites/default/files/2022-07/11.png')
    buslabel.textContent = 'Bus';
    buscircle.appendChild(buslabel)
    busMarkerEl.appendChild(buscircle);
    busMarker = new mapboxgl.Marker(busMarkerEl);
    busMarker.setLngLat(buscoord);
    busMarker.addTo(map)

    busMarker = document.querySelectorAll('.busmarker')
    busMarker.forEach(function (marker) {
        var buscircle = marker.querySelector('.buscircle');
        var image = marker.getAttribute('data-image');
        buscircle.style.backgroundImage = 'url("' + image + '")';
    });
}

document.addEventListener("backbutton", function (e) {
    e.preventDefault();
}, false);