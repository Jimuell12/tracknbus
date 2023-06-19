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
var storage = firebase.storage();

const params = new URLSearchParams(window.location.search);
const role = params.get('role');

auth.onAuthStateChanged((user) => {
    if (user) {
        var userId = user.uid
        getdata(userId)
        const savebut = document.querySelector('.btn-save')
        savebut.addEventListener('click', (event) => {
            updatedata(userId)
        })
        const fileInput = document.getElementById('profile-pic-upload');
        fileInput.addEventListener('change', (event) => {
            uploadimage(event, userId)
        });
    }
})

function getdata(userId) {
    database.ref(role).once('value', (snapshot) => {
        snapshot.forEach(childsnap => {
            var data = childsnap.val()
            var key = childsnap.key
            if (key == userId){
                document.getElementById('profileimage').src = data.image
                document.getElementById('name').value = data.name
                document.getElementById('email').value = data.email
            }
        });
    })
}

function updatedata(userId) {
    var errormessage = document.getElementById('error');
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var oldpass = document.getElementById('oldpassword').value;
    var pass = document.getElementById('password').value;
    var user = auth.currentUser;
  
    // Check if the password field is empty or null
    if (pass && pass.trim() !== '') {
      var credential = firebase.auth.EmailAuthProvider.credential(email, oldpass);
  
      user.reauthenticateWithCredential(credential)
        .then(function () {
          user.updatePassword(pass)
            .then(function () {
              errormessage.textContent = 'Information Updated';
              errormessage.style.color = 'green';
              errormessage.style.display = 'block';
              database.ref(role + '/' + userId).update({
                password: pass,
                name: name
              });
            })
            .catch(function (error) {
              errormessage.textContent = error.code.substring(error.code.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
              errormessage.style.color = 'red';
              errormessage.style.display = 'block';
            });
        })
        .catch(function (error) {
          errormessage.textContent = error.code.substring(error.code.indexOf('/') + 1).replace(/[^a-zA-Z0-9\s]/g, ' ');
          errormessage.style.color = 'red';
          errormessage.style.display = 'block';
        });
    } else {
      // Password field is empty or null
      errormessage.textContent = 'Information Updated';
      errormessage.style.color = 'green';
      errormessage.style.display = 'block';
      database.ref(role + '/' + userId).update({
        name: name
      });
    }
  }
  

async function uploadimage(event, userId) {
    const file = event.target.files[0];
    // Get the reference to the child object where you want to upload the file
    const folderName = role.toString();
    const fileRef = storage.ref().child(`${folderName}/${userId}`);

    console.log(fileRef); // Log the fileRef variable

    // Upload the file to Firebase Storage
    await fileRef.put(file);

    // Get the download URL of the uploaded file
    const downloadURL = await fileRef.getDownloadURL();
    document.getElementById('profileimage').src = downloadURL
    await database.ref(`${role}/${userId}/image`).set(downloadURL);
}
