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
var auth = firebase.auth()

const params = new URLSearchParams(window.location.search);
const role = params.get('role');
document.getElementById('role').innerHTML = role;

document.querySelector('.login').addEventListener('click', login)

function login(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    const errorMessage = document.querySelector('#error-message');
    var studentsRef = database.ref('students');
    var driversRef = database.ref('drivers')
    var parentsRef = database.ref('parents')

    if (role === "student") {
        studentsRef.once("value", function (snapshot) {
            let emeailexists = false;
            snapshot.forEach(function (childSnapshot) {
                const studentEmail = childSnapshot.val().email;
                if (email === studentEmail) {
                    emeailexists = true
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            errorMessage.style.display = 'block';
                            errorMessage.style.color = 'green'
                            errorMessage.innerHTML = 'Login Success'
                            const user = userCredential.user;
                            window.location.href = 'student.html'
                            // ...
                        })
                        .catch((error) => {
                            errorMessage.style.display = 'block';
                            errorMessage.innerHTML = error.code.substring(error.code.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
                        });
                }

            });
            if (!emeailexists) {
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = 'invalid email address'
            }
        });
    } else if (role === "driver") {
        driversRef.once("value", function (snapshot) {
            let emeailexists = false
            snapshot.forEach(function (childSnapshot) {
                const driverEmail = childSnapshot.val().email;
                if (email === driverEmail) {
                    emeailexists = true
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            // Signed in
                            window.location.href = 'driver.html'
                            const user = userCredential.user;
                            errorMessage.style.display = 'block';
                            errorMessage.style.color = 'green'
                            errorMessage.innerHTML = 'Login Success'
                            // ...
                        })
                        .catch((error) => {
                            errorMessage.style.display = 'block';
                            errorMessage.innerHTML = error.code.substring(error.code.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
                        });
                }
            });
            if (!emeailexists) {
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = 'invalid email address'
            }
        });
    } else if (role === "parent") {
        parentsRef.once("value", function (snapshot) {
            let emeailexists = false
            snapshot.forEach(function (childSnapshot) {
                const parentEmail = childSnapshot.val().email;
                if (email === parentEmail) {
                    emeailexists = true
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            // Signed in
                            const user = userCredential.user;
                            errorMessage.style.display = 'block';
                            errorMessage.style.color = 'green'
                            errorMessage.innerHTML = 'Login Success'
                            window.location.href = 'parent.html'
                            // ...
                        })
                        .catch((error) => {
                            errorMessage.style.display = 'block';
                            errorMessage.innerHTML = error.code.substring(error.code.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
                        });
                }
            });
            if (!emeailexists) {
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = 'invalid email address'
            }
        });
    } else if (role === "teacher") {
        firebase.database().ref('admin').on('value', (snapshot)=>{
            var em = snapshot.val().email
            var ps = snapshot.val().pass

            if(email == em && ps == password){
                window.location.href = 'admin.html'
            }else{
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = 'invalid Account'
            }
        })
    }


}
auth.signOut()