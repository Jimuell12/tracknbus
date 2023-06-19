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
  var database = firebase.database()

// Disable the back button on Android devices
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	document.addEventListener("backbutton", function (e) {
		e.preventDefault();
	}, false);
}

function goToLogin(role) {
	window.location.href = "login.html?role=" + role;
}

auth.onAuthStateChanged((user) => {
	if (user) {
		var userId = user.uid;
		var driverref = database.ref('drivers');
		var studentref = database.ref('students');
		var parentref = database.ref('parents');

		driverref.child(userId).once('value', function(driverSnapshot) {
			if (driverSnapshot.exists()) {
				window.location.href = "driver.html";
				return;
			}

			studentref.child(userId).once('value', function(studentSnapshot) {
				if (studentSnapshot.exists()) {
					window.location.href = "student.html";
					return;
				}

				parentref.child(userId).once('value', function(parentSnapshot) {
					if (parentSnapshot.exists()) {
						window.location.href = "parent.html";
						return;
					}
				});
			});
		});
	}
});
