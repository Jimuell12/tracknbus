function hidenav() {
	var elems = document.querySelectorAll('.sidenav');
	var instances = M.Sidenav.init(elems);
};
hidenav()

// initialize mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicmltdXJ1dTEiLCJhIjoiY2xhcHA0ZXRxMDh1MzQxbnNpeTJvZnAybiJ9.EmMsJjz7bwUN7o2lW4zjfw';
var mapstudent = new mapboxgl.Map({
	container: 'mapstudent',
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [121.0992564483926, 14.633092687555589],
	zoom: 12
});
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [121.0992564483926, 14.633092687555589],
	zoom: 12
});
var marker = new mapboxgl.Marker()
// listen for click events on the map
mapstudent.on('click', function (e) {
	// update the coordinate input field with the clicked coordinates
	var coordinateInput = document.getElementById('coordinate');
	coordinateInput.value = e.lngLat.lng + ', ' + e.lngLat.lat;

	marker.setLngLat(e.lngLat);
	marker.addTo(mapstudent)
});

// create a new geolocation control and add it to the map
var geolocateControl = new mapboxgl.GeolocateControl({
	positionOptions: {
		enableHighAccuracy: true
	},
	trackUserLocation: true
});
mapstudent.addControl(geolocateControl);
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

var database = firebase.database()
var storage = firebase.storage();

function setNavigationActiveLink(target) {
	// Remove the active class from all links in the navigation menu
	var links = document.querySelectorAll("nav a");
	for (var i = 0; i < links.length; i++) {
		links[i].classList.remove("active");
	}
	// Add the active class to the clicked link
	target.classList.add("active");
}
document.getElementById("searchInput").style.display = 'none'
function showDashboard() {
	document.getElementById("searchInput").style.display = 'none'
	var mainContent = document.getElementById("main-content");
	// Show the dashboard section and hide all other sections
	mainContent.querySelector("#dashboard").style.display = "block";
	mainContent.querySelector("#attendance").style.display = "none";
	mainContent.querySelector("#add-student").style.display = "none";
	mainContent.querySelector("#add-driver").style.display = "none";
	mainContent.querySelector("#add-parent").style.display = "none";
	setNavigationActiveLink(event.target);
	hidenav()
}
function showAttendance() {
	var mainContent = document.getElementById("main-content");

	document.getElementById("searchInput").style.display = 'none'
	// Show the attendance section and hide all other sections
	mainContent.querySelector("#dashboard").style.display = "none";
	mainContent.querySelector("#attendance").style.display = "block";
	mainContent.querySelector("#add-student").style.display = "none";
	mainContent.querySelector("#add-driver").style.display = "none";
	mainContent.querySelector("#add-parent").style.display = "none";
	setNavigationActiveLink(event.target);
	hidenav()
}

function showAddStudent() {
	var mainContent = document.getElementById("main-content");
	document.getElementById("searchInput").style.display = 'block'
	// Show the add-student section and hide all other sections
	mainContent.querySelector("#dashboard").style.display = "none";
	mainContent.querySelector("#attendance").style.display = "none";
	mainContent.querySelector("#add-student").style.display = "block";
	mainContent.querySelector("#add-driver").style.display = "none";
	mainContent.querySelector("#add-parent").style.display = "none";
	setNavigationActiveLink(event.target);
	hidenav()
}

function showAddDriver() {
	var mainContent = document.getElementById("main-content");
	document.getElementById("searchInput").style.display = 'block'
	// Show the add-driver section and hide all other sections
	mainContent.querySelector("#dashboard").style.display = "none";
	mainContent.querySelector("#attendance").style.display = "none";
	mainContent.querySelector("#add-student").style.display = "none";
	mainContent.querySelector("#add-driver").style.display = "block";
	mainContent.querySelector("#add-parent").style.display = "none";
	setNavigationActiveLink(event.target);
	hidenav()
}

function showAddParent() {
	var mainContent = document.getElementById("main-content");
	document.getElementById("searchInput").style.display = 'block'
	// Show the add-parent section and hide all other sections
	mainContent.querySelector("#dashboard").style.display = "none";
	mainContent.querySelector("#attendance").style.display = "none";
	mainContent.querySelector("#add-student").style.display = "none";
	mainContent.querySelector("#add-driver").style.display = "none";
	mainContent.querySelector("#add-parent").style.display = "block";
	setNavigationActiveLink(event.target);
	hidenav()
}

var studentsRef = database.ref('students');

studentsRef.on('value', function (snapshot) {
	if (snapshot.exists()) {
		var students = snapshot.val();
		var cardContainer = document.querySelector('.studentcard-container');
		cardContainer.innerHTML = '';
		const st = [];
		for (var key in students) {
			var student = students[key];
			var name = students[key].name;
			const attendance = students[key].attendance;
			if (attendance != null) {
				const numChildren = Object.keys(attendance).length;
				st.push({ name, numChildren });
			} else {
				// handle null or undefined attendance here
			}
			var card = createStudentCard(key, student.name, student.image, student.busnumber, student.ride, student.email, student.password, student.coordinate);
			cardContainer.appendChild(card);
		}
		st.sort((a, b) => b.numChildren - a.numChildren);
		const top5Students = st.slice(0, 5);
		const topStudentsList = document.getElementById("top-students-list");
		topStudentsList.innerHTML = ''
		for (let i = 0; i < top5Students.length; i++) {
			const li = document.createElement("li");

			li.style.fontFamily = 'Courier New, monospace';
			li.style.fontSize = '23px'
			li.textContent = `${i + 1}. ${top5Students[i].name} ${top5Students[i].numChildren.toString().padStart(2, '')}`;

			topStudentsList.appendChild(li);
		}
		var newCard = document.createElement('div');
		newCard.className = 'card';
		newCard.textContent = '+'
		newCard.onclick = createnewstudent;
		newCard.style.justifyContent = 'center'
		newCard.style.fontSize = '150px'
		newCard.style.color = '#FFF'
		cardContainer.appendChild(newCard);
	} else {
		var cardContainer = document.querySelector('.studentcard-container');
		cardContainer.innerHTML = '';
		var newCard = document.createElement('div');
		newCard.className = 'card';
		newCard.onclick = createnewstudent;
		newCard.textContent = '+'
		newCard.style.justifyContent = 'center'
		newCard.style.fontSize = '150px'
		newCard.style.color = '#FFF'
		cardContainer.appendChild(newCard);
	}

});

var isEdit = false
function createStudentCard(key, name, image, busNumber, ride, email, password, coordinate) {
	var card = document.createElement('div');
	card.classList.add('card');
	card.setAttribute("id", key)
	var img = document.createElement('img');
	img.src = image;
	var details = document.createElement('div');
	details.classList.add('details');
	var heading = document.createElement('div');
	var h4 = document.createElement('h4');
	h4.textContent = name;
	var actions = document.createElement('div');
	actions.classList.add('actions');
	var editButton = document.createElement('a');
	editButton.href = '#';
	editButton.textContent = 'Edit';
	editButton.addEventListener('click', function (event) {
		isEdit = true
		// Get the selected student's key from the card's ID attribute
		var key = event.target.parentNode.parentNode.parentNode.id;
		// Call createnewstudent function
		createnewstudent();
		// Populate the form fields with the selected student's details using their key
		document.getElementById('name').value = name;
		document.getElementById('email').value = email;
		document.getElementById('password').value = password;
		document.getElementById('email').setAttribute('disabled', true);
		document.getElementById('password').setAttribute('disabled', true);
		document.getElementById('bus-number').value = busNumber;
		document.getElementById('coordinate').value = coordinate[0] + ', ' + coordinate[1];
		// Add a hidden input field to store the selected student's ID/key
		var idInput = document.createElement('input');
		idInput.type = 'hidden';
		idInput.id = 'id';
		idInput.name = 'id'
		idInput.value = key;
		document.getElementById('coordinate').insertAdjacentElement('afterend', idInput);
	});
	var deleteButton = document.createElement('a');
	deleteButton.href = '#';
	deleteButton.textContent = 'Delete';
	deleteButton.addEventListener('click', function (event) {
		var key = event.target.parentNode.parentNode.parentNode.id;
		var result = confirm("Are you sure you want to delete this student?");

		if (result) {
			// Remove the student from the database
			database.ref('students/' + key).once('value', function (snapshot) {
				var studentdelete = snapshot.val()
				var semail = studentdelete.email
				var spassword = studentdelete.password
				firebase.auth().signInWithEmailAndPassword(semail, spassword)
					.then((userCredential) => {
						// User signed in successfully.
						const user = userCredential.user;

						// Delete the user.
						user.delete()
							.then(() => {
								console.log("User deleted successfully.");
							})
							.catch((error) => {
								console.log("Error deleting user:", error);
							});
					})
			})
			database.ref('students/' + key).remove()
		}
	})
	var info = document.createElement('div');
	info.classList.add('info');
	var busNumberText = document.createElement('p');
	busNumberText.classList.add('bus-number');
	busNumberText.textContent = 'Bus # ' + busNumber;
	var rideText = document.createElement('p');
	rideText.classList.add('ride');
	rideText.textContent = ride ? 'Riding' : 'Not riding';
	if (ride) {
		rideText.style.color = '#50C879';
	} else {
		rideText.style.color = 'red';
	}
	heading.appendChild(h4);
	details.appendChild(heading);
	details.appendChild(info);
	details.appendChild(actions);
	info.appendChild(busNumberText);
	info.appendChild(rideText);
	card.appendChild(img);
	card.appendChild(details);
	actions.appendChild(editButton);
	actions.appendChild(deleteButton);
	return card;
}


var driversRef = database.ref('drivers');

driversRef.on('value', function (snapshot) {
	if (snapshot.exists()) {
		var drivers = snapshot.val();
		var cardContainer = document.querySelector('.drivercard-container');
		cardContainer.innerHTML = '';
		for (var key in drivers) {
			var driver = drivers[key];
			var card = createDriverCard(key, driver.email, driver.password, driver.name, driver.image, driver.licenseNumber, driver.busNumber);
			cardContainer.appendChild(card);
		}
		var newCard = document.createElement('div');
		newCard.className = 'card';
		newCard.textContent = '+'
		newCard.onclick = createnewdriver;
		newCard.style.justifyContent = 'center'
		newCard.style.fontSize = '150px'
		newCard.style.color = '#FFF'
		cardContainer.appendChild(newCard);
	} else {
		var cardContainer = document.querySelector('.drivercard-container');
		cardContainer.innerHTML = '';
		var newCard = document.createElement('div');
		newCard.className = 'card';
		newCard.textContent = '+'
		newCard.onclick = createnewdriver;
		newCard.style.justifyContent = 'center'
		newCard.style.fontSize = '150px'
		newCard.style.color = '#FFF'
		cardContainer.appendChild(newCard);
	}
});


function createDriverCard(key, email, password, name, image, licensenumber, busNumber) {
	var card = document.createElement('div')
	card.classList.add('card');
	card.setAttribute("id", key)
	var img = document.createElement('img');
	img.src = image;
	var details = document.createElement('div');
	details.classList.add('details');
	var heading = document.createElement('div');
	var h4 = document.createElement('h4');
	h4.textContent = name;
	var actions = document.createElement('div');
	actions.classList.add('actions');
	var editButton = document.createElement('a');
	editButton.href = '#';
	editButton.textContent = 'Edit';
	editButton.addEventListener('click', function (event) {
		isEdit = true
		// Get the selected student's key from the card's ID attribute
		var key = event.target.parentNode.parentNode.parentNode.id;
		// Call createnewstudent function
		createnewdriver();
		// Populate the form fields with the selected student's details using their key
		document.getElementById('driver-name').value = name;
		document.getElementById('driver-license').value = licensenumber
		document.getElementById('driver-email').value = email;
		document.getElementById('driver-password').value = password;
		document.getElementById('driver-email').setAttribute('disabled', true);
		document.getElementById('driver-password').setAttribute('disabled', true);
		document.getElementById('driver-bus-number').value = busNumber;
		// Add a hidden input field to store the selected student's ID/key
		var idInput = document.createElement('input');
		idInput.type = 'hidden';
		idInput.id = 'id2';
		idInput.name = 'id2'
		idInput.value = key;
		document.getElementById('driver-bus-number').insertAdjacentElement('afterend', idInput)
	});
	var deleteButton = document.createElement('a');
	deleteButton.href = '#';
	deleteButton.textContent = 'Delete';
	deleteButton.addEventListener('click', function (event) {
		var key = event.target.parentNode.parentNode.parentNode.id;
		var result = confirm("Are you sure you want to delete this driver?");

		if (result) {
			// Remove the student from the database
			database.ref('drivers/' + key).once('value', function (snapshot) {
				var driverdelete = snapshot.val()
				var demail = driverdelete.email
				var dpassword = driverdelete.password
				firebase.auth().signInWithEmailAndPassword(demail, dpassword)
					.then((userCredential) => {
						// User signed in successfully.
						const user = userCredential.user;

						// Delete the user.
						user.delete()
							.then(() => {
								console.log("User deleted successfully.");
							})
							.catch((error) => {
								console.log("Error deleting user:", error);
							});
					})
			})
			database.ref('drivers/' + key).remove()
		}
	})
	var info = document.createElement('div');
	info.classList.add('info');
	var licenseNumberText = document.createElement('p');
	licenseNumberText.classList.add('license-number');
	licenseNumberText.textContent = 'license # ' + licensenumber;
	var busNumberText = document.createElement('p');
	busNumberText.classList.add('driver-bus-number');
	busNumberText.textContent = "Bus " + busNumber

	heading.appendChild(h4);
	details.appendChild(heading);
	details.appendChild(info);
	details.appendChild(actions);
	info.appendChild(licenseNumberText);
	info.appendChild(busNumberText);
	card.appendChild(img);
	card.appendChild(details);
	actions.appendChild(editButton);
	actions.appendChild(deleteButton);
	return card;

}

var parentsRef = database.ref('parents');

parentsRef.on('value', function (snapshot) {
	if (snapshot.exists()) {
		var parents = snapshot.val();
		var cardContainer = document.querySelector('.parentcard-container');
		cardContainer.innerHTML = '';
		for (var key in parents) {
			var parent = parents[key];
			var card = createParentCard(key, parent.name, parent.email, parent.password, parent.child, parent.image);
			cardContainer.appendChild(card);
		}
		var newCard = document.createElement('div');
		newCard.className = 'card';
		newCard.textContent = '+'
		newCard.onclick = createnewparent;
		newCard.style.justifyContent = 'center'
		newCard.style.fontSize = '150px'
		newCard.style.color = '#FFF'
		cardContainer.appendChild(newCard);
	} else {
		var cardContainer = document.querySelector('.parentcard-container');
		cardContainer.innerHTML = '';
		var newCard = document.createElement('div');
		newCard.className = 'card';
		newCard.textContent = '+'
		newCard.onclick = createnewparent;
		newCard.style.justifyContent = 'center'
		newCard.style.fontSize = '150px'
		newCard.style.color = '#FFF'
		cardContainer.appendChild(newCard);
	}
})

function createParentCard(key, name, email, password, child, image) {
	var card = document.createElement('div')
	card.classList.add('card');
	card.setAttribute("id", key)
	var img = document.createElement('img');
	img.src = image;
	var details = document.createElement('div');
	details.classList.add('details');
	var heading = document.createElement('div');
	var h4 = document.createElement('h4');
	h4.textContent = name;
	var actions = document.createElement('div');
	actions.classList.add('actions');
	var editButton = document.createElement('a');
	editButton.href = '#';
	editButton.textContent = 'Edit';
	editButton.addEventListener('click', function (event) {
		isEdit = true
		// Get the selected student's key from the card's ID attribute
		var key = event.target.parentNode.parentNode.parentNode.id;
		// Call createnewstudent function
		createnewparent();
		// Populate the form fields with the selected student's details using their key
		document.getElementById('parent-name').value = name;
		document.getElementById('parent-email').value = email;
		document.getElementById('parent-password').value = password;
		document.getElementById('parent-email').setAttribute('disabled', true);
		document.getElementById('parent-password').setAttribute('disabled', true);
		const childrenDropdown = document.getElementById('child');
		const option = document.createElement('option');
		option.textContent = child.childname;
		option.value = child.child;
		childrenDropdown.appendChild(option);
		document.getElementById('child').setAttribute('disabled', true);
		// Add a hidden input field to store the selected student's ID/key
		var idInput = document.createElement('input');
		idInput.type = 'hidden';
		idInput.id = 'id3';
		idInput.name = 'id3'
		idInput.value = key;
		document.getElementById('child').insertAdjacentElement('afterend', idInput)
	});
	var deleteButton = document.createElement('a');
	deleteButton.href = '#';
	deleteButton.textContent = 'Delete';
	deleteButton.addEventListener('click', function (event) {
		var key = event.target.parentNode.parentNode.parentNode.id;
		var result = confirm("Are you sure you want to delete this parent?");

		if (result) {
			// Remove the student from the database
			database.ref('students/' + child.child + '/parent').remove()
			database.ref('parents/' + key).once('value', function (snapshot) {
				var parentdelete = snapshot.val()
				var pemail = parentdelete.email
				var ppassword = parentdelete.password
				firebase.auth().signInWithEmailAndPassword(pemail, ppassword)
					.then((userCredential) => {
						// User signed in successfully.
						const user = userCredential.user;

						// Delete the user.
						user.delete()
							.then(() => {
								console.log("User deleted successfully.");
							})
							.catch((error) => {
								console.log("Error deleting user:", error);
							});
					})
			})
			database.ref('parents/' + key).remove()
		}
	})
	var info = document.createElement('div');
	info.classList.add('info');
	var children = document.createElement('p');
	children.classList.add('childer');
	children.textContent = 'child: ' + child.childname;

	heading.appendChild(h4);
	details.appendChild(heading);
	details.appendChild(info);
	details.appendChild(actions);
	info.appendChild(children);
	card.appendChild(img);
	card.appendChild(details);
	actions.appendChild(editButton);
	actions.appendChild(deleteButton);
	return card;
}


function createnewstudent() {
	if (isEdit) {
		overlay.style.display = 'flex'
	} else {
		overlay.style.display = 'flex'
		document.getElementById("name").value = '';
		document.getElementById("email").value = '';
		document.getElementById("password").value = '';
		document.getElementById("bus-number").value = '';
		document.getElementById("coordinate").value = '';
		document.getElementById("email").removeAttribute('disabled')
		document.getElementById("password").removeAttribute('disabled')
	}
}
function createnewdriver() {
	if (isEdit) {
		overlay2.style.display = 'flex'
	} else {
		overlay2.style.display = 'flex'
		document.getElementById("driver-name").value = '';
		document.getElementById("driver-license").value = '';
		document.getElementById("driver-email").value = '';
		document.getElementById("driver-password").value = '';
		document.getElementById("driver-bus-number").value = '';
		document.getElementById('driver-email').removeAttribute('disabled')
		document.getElementById('driver-password').removeAttribute('disabled')
	}
}
function createnewparent() {
	if (isEdit) {
		overlay3.style.display = 'flex'
	} else {
		overlay3.style.display = 'flex'
		document.getElementById("parent-name").value = '';
		document.getElementById("parent-email").value = '';
		document.getElementById("parent-password").value = '';
		document.getElementById("child").value = '';
		document.getElementById("child").removeAttribute('disabled')
	}
}

const errormess = document.getElementById('error')
const errormess1 = document.getElementById('error1')
const errormess2 = document.getElementById('error2')

document.getElementById("addstudent").addEventListener("click", function () {
	if (isEdit) {
		updatestudent(event)
	} else {
		addStudent(event)
	}
});
function addStudent(event) {
	event.preventDefault();

	// Get the values from the form inputs
	var name = document.getElementById("name").value;
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var busNumber = document.getElementById("bus-number").value;
	var coordinate = document.getElementById("coordinate").value;
	coordinate = coordinate.split(",")

	firebase.auth().createUserWithEmailAndPassword(email, password)
		.then((userCredential) => {
			// Signed in
			var user = userCredential.user;
			database.ref("students/" + user.uid).set({
				name: name,
				email: email,
				attendance: 0,
				password: password,
				busnumber: busNumber,
				coordinate: coordinate,
				currentcoordinate: coordinate,
				image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
				ride: true,
				pickedUp: false,
				uid: user.uid
			});
			// Close the form overlay
			document.querySelector(".overlay").style.display = "none";
			console.log("User " + user.uid + " created successfully.");
			firebase.auth().signOut()
		})
		.catch((error) => {
			var errorCode = error.code;
			errormess.textContent = errorCode.substring(errorCode.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
		});
}

function updatestudent(event) {
	event.preventDefault();
	var key = document.getElementById('id').value
	var name = document.getElementById("name").value;
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var busNumber = document.getElementById("bus-number").value;
	var coordinate = document.getElementById("coordinate").value;
	coordinate = coordinate.split(",")

	database.ref('students/' + key).update({
		name: name,
		email: email,
		password: password,
		busnumber: busNumber,
		coordinate: coordinate,
	})

	isEdit = false
	document.querySelector(".overlay").style.display = "none";
}


document.getElementById("adddriver").addEventListener("click", function () {
	if (isEdit) {
		updateDriver(event)
	} else {
		addDriver(event)
	}
});
function addDriver(event) {
	event.preventDefault();

	// Get the values from the form inputs
	var name = document.getElementById("driver-name").value;
	var license = document.getElementById("driver-license").value
	var email = document.getElementById("driver-email").value;
	var password = document.getElementById("driver-password").value;
	var busNumber = document.getElementById("driver-bus-number").value;

	firebase.auth().createUserWithEmailAndPassword(email, password)
		.then((userCredential) => {
			var user = userCredential.user;

			database.ref("drivers/" + user.uid).set({
				name: name,
				licenseNumber: license,
				email: email,
				password: password,
				busNumber: busNumber,
				image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
			});
			document.querySelector(".overlay2").style.display = "none";
			console.log("User " + user.uid + " created successfully.");
			firebase.auth().signOut()
		})
		.catch((error) => {
			var errorCode = error.code
			errormess.textContent = errorCode.substring(errorCode.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
		});
}

function updateDriver(event) {
	event.preventDefault();
	var key = document.getElementById('id2').value
	var name = document.getElementById("driver-name").value;
	var license = document.getElementById("driver-license").value
	var email = document.getElementById("driver-email").value;
	var password = document.getElementById("driver-password").value;
	var busNumber = document.getElementById("driver-bus-number").value;

	database.ref('drivers/' + key).update({
		name: name,
		email: email,
		password: password,
		licenseNumber: license,
		busNumber: busNumber,
	})

	isEdit = false
	document.querySelector(".overlay2").style.display = "none";
}

document.getElementById("addparent").addEventListener("click", function () {
	if (isEdit) {
		updateParent(event)
	} else {
		addParent(event)
	}
});
function addParent(event) {
	event.preventDefault();

	// Get the values from the form inputs
	var name = document.getElementById("parent-name").value;
	var email = document.getElementById("parent-email").value;
	var password = document.getElementById("parent-password").value;
	var child = document.getElementById("child").value;
	var childname = document.getElementById("child").textContent;

	firebase.auth().createUserWithEmailAndPassword(email, password)
		.then((userCredential) => {
			var user = userCredential.user;

			database.ref("parents/" + user.uid).set({
				name: name,
				email: email,
				notifId: null,
				password: password,
				child: { childname, child },
				image: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
			});
			database.ref("students/" + child).update({
				parent: user.uid
			})
			document.querySelector(".overlay3").style.display = "none";
			console.log("User " + user.uid + " created successfully.");
			firebase.auth().signOut()

		})
		.catch((error) => {
			var errorCode = error.code
			errormess.textContent = errorCode.substring(errorCode.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
		});
}

function updateParent(event) {
	event.preventDefault();
	var key = document.getElementById('id3').value
	var name = document.getElementById("parent-name").value;
	var email = document.getElementById("parent-email").value;
	var password = document.getElementById("parent-password").value;
	var child = document.getElementById("child").value;

	database.ref('parents/' + key).update({
		name: name,
		email: email,
		password: password,
		child: child,
	})

	isEdit = false
	document.querySelector(".overlay3").style.display = "none";
}




function handleSearch() {
	// Get the search query from the input box
	var searchTerm = document.getElementById('searchInput').value.toLowerCase();

	// Get all the student cards
	var cards = document.querySelectorAll('.card');

	// Loop through each card and check if its name matches the search query
	cards.forEach(function (card) {
		var name = card.querySelector('h4')
		head = name ? name.textContent.toLowerCase() : '';
		if (head.includes(searchTerm)) {
			// If the name matches, show the card
			card.style.display = 'flex';
		} else {
			// Otherwise, hide the card
			card.style.display = 'none';
		}
	});
}

// Listen for changes in the search input box
document.getElementById('searchInput').addEventListener('keyup', handleSearch);


// Get a reference to the attendance data in your Firebase database
var attendanceRef = firebase.database().ref('attendance');
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');

const currentDate = `${year}${month}${day}`;
var totalst
// Retrieve the attendance data and process it for the chart
attendanceRef.once('value').then(function (snapshot) {
	var dates = [];
	var attendanceCounts = [];
	database.ref('students').on('value', (snapshot) => {
		totalst = snapshot.numChildren()
	})

	snapshot.forEach(function (dateSnapshot) {
		// Get the canvas element
		var ctxdonut = document.getElementById('donut-graph').getContext('2d');

		// Set the data

		var date = dateSnapshot.key;
		if (date == currentDate) {
			var totalStudents = totalst;
			var studentsPresent = dateSnapshot.numChildren();
			var studentsAbsent = totalStudents - studentsPresent;
			var cutoutPercentage = 100 - (studentsPresent / totalStudents * 100);
			if (cutoutPercentage < 0) {
				cutoutPercentage = 0;
			}
			var data = {
				labels: ['Present', 'Absent'],
				datasets: [{
					data: [studentsPresent, studentsAbsent],
					backgroundColor: ['#36A2EB', '#FF6384'],
					borderWidth: 0
				}]
			};

			// Set the options
			var options = {
				responsive: true,
				cutoutPercentage: cutoutPercentage,
				legend: {
					display: true
				},
				animation: {
					animateScale: true
				},
			};

			// Create the chart
			var myChart = new Chart(ctxdonut, {
				type: 'doughnut',
				data: data,
				options: options
			});
			console.log(cutoutPercentage)
			document.getElementById('percentage').innerText = cutoutPercentage + '%'
			var today = document.getElementById('attendance-today')

			console.log(currentDate)
			if (date == currentDate) {
				console.log(date, currentDate)
				today.innerText = dateSnapshot.numChildren()
				today.style.color = "rgb(11, 166, 212)"
			} else {
				today.innerText = '0'
				today.style.color = "red"
			}
		}
		var count = Object.keys(dateSnapshot.val()).length;
		dates.push(date);
		attendanceCounts.push(count);
	});

	// Render the chart using Chart.js
	var canvas = document.getElementById('attendance-chart');
	var ctx = canvas.getContext('2d');
	var chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: dates,
			datasets: [{
				label: 'Attendance',
				data: attendanceCounts,
				fill: true,
				backgroundColor: 'rgba(54, 162, 235, 0.2)',
				borderColor: 'rgb(54, 162, 235)',
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				y: {
					ticks: {
						stepSize: 1
					},
					title: {
						display: true,
						text: 'Number of Students'
					}
				}
			}
		}
	});
});

var markers = []
var students = []
var markersbus = []
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
		new mapboxgl.Marker(el)
			.setLngLat(student.currentcoordinate)
			.addTo(map);
	});

	// Set background images for circles
	markers = document.querySelectorAll('.marker');
	markers.forEach(function (marker) {
		var circle = marker.querySelector('.circle');
		var image = marker.getAttribute('data-image');
		circle.style.backgroundImage = 'url("' + image + '")';
	});
}
var studentsRef = firebase.database().ref('students');
var bussesRef = firebase.database().ref('bus')
studentsRef.on('value', function (snapshot) {
	var studentsData = snapshot.val();
	students = Object.values(studentsData);

	addMarkers(students)
	const childrenDropdown = document.getElementById('child');
	childrenDropdown.innerHTML = ''; // Clearing the existing options

	snapshot.forEach((childSnapshot) => {
		const parentExists = childSnapshot.child('parent').exists();
		if (!parentExists) {
			const childName = childSnapshot.child('name').val();
			const option = document.createElement('option');
			option.textContent = childName;
			option.value = childSnapshot.key;
			childrenDropdown.appendChild(option);
		}
	});
});
studentsRef.on('child_changed', function (snapshot) {
	var studentsData = snapshot.val();
	students = Object.values(studentsData);

	addMarkers(students)
});

bussesRef.on('value', function (snapshot) {
	var busdata = snapshot.val();
	busses = Object.values(busdata);

	addMarkersBus(busses)
})
bussesRef.on('child_changed', function (snapshot) {
	var busdata = snapshot.val();
	busses = Object.values(busdata);
	addMarkersBus(busses)
});

function addMarkersBus(busses) {
	// Remove any old markers from the map first
	for (var i = 0; i < markersbus.length; i++) {
		markersbus[i].remove();
	}
	// Clear the markers array
	markersbus = [];

	// Create a marker for each student
	busses.forEach(function (busses, index) {
		var el = document.createElement('div');
		el.className = 'marker driver';
		el.setAttribute('data-image', 'https://www.adamslibrary.org/sites/default/files/2022-07/11.png');
		var circle = document.createElement('div');
		circle.className = 'circle';
		var label = document.createElement('div');
		label.className = 'label';
		label.textContent = 'Bus ' + (index + 1);
		circle.appendChild(label);
		el.appendChild(circle);
		new mapboxgl.Marker(el)
			.setLngLat(busses)
			.addTo(map);
	});

	// Set background images for circles
	markersbus = document.querySelectorAll('.driver');
	markersbus.forEach(function (markersbus) {
		var circle = markersbus.querySelector('.circle');
		var image = markersbus.getAttribute('data-image');
		circle.style.backgroundImage = 'url("' + image + '")';
	});
}

document.addEventListener("backbutton", function (e) {
	e.preventDefault();
}, false);