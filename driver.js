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

var auth = firebase.auth()

mapboxgl.accessToken = 'pk.eyJ1IjoicmltdXJ1dTEiLCJhIjoiY2xhcHA0ZXRxMDh1MzQxbnNpeTJvZnAybiJ9.EmMsJjz7bwUN7o2lW4zjfw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [121.07956033068146, 14.621975505126729],
    zoom: 17
});

var toggleInput = document.getElementById('dark-mode-toggle');
var toggleSlider = document.querySelector('.toggle-slider');
var qrCodeButton = document.getElementById('qr-code-button');
var qrCodeOverlay = document.getElementById('qr-code-overlay');
var qrCodePopup = document.getElementById('qr-code-popup');
var qrCodeImage = document.getElementById('qr-code-image');

toggleInput.addEventListener('change', function () {
    if (this.checked) {
        map.setStyle('mapbox://styles/mapbox/dark-v10');
        toggleSlider.style.backgroundColor = '#007AFF';
        toggleSlider.style.transform = 'translateX(100%)';
    } else {
        map.setStyle('mapbox://styles/mapbox/streets-v11');
        toggleSlider.style.backgroundColor = '#ccc';
        toggleSlider.style.transform = 'translateX(0)';
    }
});
qrCodeButton.addEventListener('click', function () {
    var currentDate = new Date();
    currentDate.setUTCHours(currentDate.getUTCHours() + 8);
    var dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    var randomString = Math.random().toString(36).substring(2, 8); // generate random string
    var qrCodeText = 'https://api.qrserver.com/v1/create-qr-code/?data=' + dateStr + '.' + randomString;
    var currentImage = qrCodeImage.src;
    if (!currentImage.includes(qrCodeText)) {
        qrCodeImage.src = qrCodeText;
    }
    qrCodeOverlay.style.display = 'block';
    qrCodePopup.style.display = 'block';
});

qrCodeOverlay.addEventListener('click', function () {
    qrCodePopup.style.display = 'none';
    qrCodeOverlay.style.display = 'none';
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




// Array of student coordinates
var studentsRef = firebase.database().ref('students');
// Declare global students variable
var students = [];
var markers = []

function addMarkers(students) {
    // Remove any old markers from the map first
    for (var i = 0; i < markers.length; i++) {
        markers[i].remove();
    }

    // Clear the markers array
    markers = [];

    // Create a marker for each student
    students.forEach(function (student) {
        var el = document.createElement('div');
        el.className = 'marker';
        el.setAttribute('data-image', student.image);
        var circle = document.createElement('div');
        circle.className = 'circle';
        var label = document.createElement('div');
        label.className = 'label';
        label.textContent = student.name;
        circle.appendChild(label);
        el.appendChild(circle);

        // Create a new Marker instance and push it to the markers array
        var marker = new mapboxgl.Marker(el)
            .setLngLat(student.coordinate)
            .addTo(map);
        markers.push(marker);
    });

    // Set background images for circles
    markers = document.querySelectorAll('.marker');
    markers.forEach(function (marker) {
        var circle = marker.querySelector('.circle');
        var image = marker.getAttribute('data-image');
        circle.style.backgroundImage = 'url("' + image + '")';
    });
}



// Create geolocate control
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true,
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

const el = document.createElement('div');
el.className = 'schoolmarker';
el.setAttribute('data-image', 'https://s3-ap-southeast-1.amazonaws.com/kalibrr-company-assets/logos_C657BDZCELN6DBDCEQAV-56418291.jpg');
var circle = document.createElement('div');
circle.className = 'schoolcircle';
var label = document.createElement('div');
label.className = 'schoollabel';
label.textContent = 'OLOPSC';
circle.appendChild(label);
el.appendChild(circle);

// Define the coordinates of the school
var schoolCoord = [121.11221986213832, 14.647945800163422];

var schoolMarker = new mapboxgl.Marker(el)
    .setLngLat(schoolCoord) // set the coordinates of the school
    .addTo(map);

var startPoint;
var driverbusnumber
var emergency = document.getElementById('warning-button')

geolocate.on('geolocate', function (e) {

    startPoint = [e.coords.longitude, e.coords.latitude];
    drawRoute(startPoint)
});


auth.onAuthStateChanged((user) => {
    if (user) {
        var userId = user.uid
        firebase.database().ref('drivers').child(userId).on('value', (snapshot) => {
            const driverdata = snapshot.val()
            driverbusnumber = driverdata.busNumber

            document.getElementById('profileimg').src = driverdata.image
            document.getElementById('profilename').textContent = driverdata.name

            // Retrieve the students data from Firebase Realtime Database
            studentsRef.orderByChild("busnumber").equalTo(driverbusnumber).once('value', function (snapshot) {
                var studentsData = snapshot.val();
                students = Object.values(studentsData);

                // Remove any students with ride property set to false from the local array
                students = students.filter(function (student) {
                    return student.ride && !student.pickedUp;
                });

                addMarkers(students)
                emergency.addEventListener('click', (event) => {
                    // Display a confirmation prompt
                    var confirmed = confirm("By clicking this button, you will require assistance and send a notification to parents of all students in the bus. Are you sure you want to proceed?");

                    // If the user confirms, send the notification
                    if (confirmed) {
                        snapshot.forEach(childsnap => {
                            var parentuid = childsnap.val().parent
                            if (childsnap.val().ride) {
                                firebase.database().ref('parents/' + parentuid).once('value', (snapshot) => {
                                    var notifId = snapshot.val().notifId
                                    sendnotification(notifId, notifforemergency)
                                })
                            }
                        });
                    } else {
                        console.log('cancelled')
                    }
                })
            });

            // Add listener for changes to the students data in Firebase Realtime Database
            studentsRef.orderByChild("busnumber").equalTo(driverbusnumber).on('child_changed', function (snapshot) {
                // Get the updated student object from the snapshot
                var updatedStudent = snapshot.val();
                // Find the index of the updated student in the local array using their name or any other unique identifier
                var index = students.findIndex(function (student) {
                    return student.name === updatedStudent.name;
                });
                // Update the local array with the updated student object
                if (index === -1) {
                    // If the updated student does not exist in the local array, push it to the array
                    students.push(updatedStudent);
                } else {
                    // Otherwise, update the local array with the updated student object
                    students[index] = updatedStudent;
                }
                // Remove any students with ride property set to false from the local array
                students = students.filter(function (student) {
                    return student.ride && !student.pickedUp;
                });

                addMarkers(students)
            });
        })
    } else {
        window.location.href = 'index.html'
    }
})



// Define an array of student coordinates, and add them as stops for the route
var studentCoords = students.map(function (student) {
    return student.coordinate;
});


var schoolReached
// Draw the route on the map
async function drawRoute(startPoint, lastStop = null) {
    // Send the current location to Firebase
    const [lng, lat] = startPoint;

    if (driverbusnumber != null) {
        const busRef = firebase.database().ref('bus/' + driverbusnumber);
        busRef.set({ lng, lat });
    }

    // Sort the student coordinates by their distance from the current location
    students.sort((a, b) => {
        const aDistance = distance(lastStop || startPoint, a.coordinate);
        const bDistance = distance(lastStop || startPoint, b.coordinate);
        return aDistance - bDistance;
    });
    // Check if the current route endpoint is the school's coordinates
    const isAtSchool = distance(startPoint, schoolCoord) < 20;

    if (isAtSchool && students.length === 0) {
        firebase.database().ref('students').orderByChild("busnumber").equalTo(driverbusnumber).once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var parentid = childSnapshot.val().parent
                if (childSnapshot.val().ride) {
                    firebase.database().ref('parents/' + parentid).once('value', (snapshot) => {
                        var parentNotifId = snapshot.val().notifId
                        sendnotification(parentNotifId, notifforparent)
                    })
                }
                var childKey = childSnapshot.key;
                firebase.database().ref('students/' + childKey).update({
                    pickedUp: false
                })
                    .then(function () {
                        if (!schoolReached) {
                            schoolReached = true;
                        }
                    })
            });
        });

    }

    // Filter out the students whose location has already been reached
    const reachedStudents = [];
    var remainingStudents = students.filter((student) => {
        const distanceToStudent = distance(lastStop || startPoint, student.coordinate);
        if (distanceToStudent < 20 && !student.pickedUp) {
            sendnotification(student.notifId, notifmessagetostudent)
            try {
                studentsRef.child(student.uid).update({
                    pickedUp: true
                });
            } catch (error) {
                console.error(error);
            }

            reachedStudents.push(student);
            return false;
        }
        return true;
    });
    // Remove the markers for the reached students from the map
    reachedStudents.forEach((student) => {
        const marker = Array.from(markers).find((m) => m.querySelector('.label').textContent === student.name);
        if (marker) {
            marker.remove();
        }
    });


    // Update the students array with the remaining students
    students = remainingStudents;

    const studentCoords = students.map((student) => student.coordinate);

    // Add the school coordinates to the end of the student coordinates
    studentCoords.push(schoolCoord);

    // Make a directions request using driving profile
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint[0]},${startPoint[1]};${studentCoords.join(';')}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
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
    const nextStop = remainingStudents[0];
    if (nextStop) {
        const nextStopMarker = Array.from(markers).find((m) => m.querySelector('.label').textContent === nextStop.name);
        if (nextStopMarker) {
            nextStopMarker.classList.add('next-stop');
        }
    }
}

function distance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = toRadians(coord1[1]);
    const lat2 = toRadians(coord2[1]);
    const dLat = toRadians(coord2[1] - coord1[1]);
    const dLon = toRadians(coord2[0] - coord1[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

notifmessagetostudent = "Hello! The school bus has arrived at your designated location. Please prepare to either board the bus for pickup or exit the bus for dropoff. Thank you and have a great day!"
notifforemergency = "This is an emergency notification. If you're receiving this message, please send help immediately. Our school bus has encountered a problem and we require assistance urgently. Please let us know if you have any information that could be helpful in resolving the situation."
notifforparent = "Your children have safely arrived at school and are ready to start their day of learning."

function sendnotification(playerId, content) {
    window.plugins.OneSignal.setAppId("dc6c63ec-b4a2-4aca-ab23-eb0a62a4cef8");

    var notificationObj = {
        contents: { en: content },
        include_player_ids: [playerId]
    };

    window.plugins.OneSignal.postNotification(notificationObj);
}
