const firebase = require('firebase');


/// Initialize Firebase
const config = {
  apiKey: "AIzaSyAjJAiOHNJ_E8Uo64cV5Uz0_6ixddYkF8c",
  authDomain: "myfirebase-3ad54.firebaseapp.com",
  databaseURL: "https://myfirebase-3ad54.firebaseio.com",
  projectId: "myfirebase-3ad54",
  storageBucket: "myfirebase-3ad54.appspot.com",
  messagingSenderId: "914407924432"
};
firebase.initializeApp(config);


const admin = require("firebase-admin");

const serviceAccount = require("./myfirebase-3ad54-firebase-adminsdk-fwu4n-c14b1b162b");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://myfirebase-3ad54.firebaseio.com"
});

const db = admin.firestore();
const users = db.collection('users');
const favourites = db.collection('favourites');
const reviews = db.collection('reviews')

const express = require('express')
const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs')
app.set('views', './views')
app.use('/public', express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})

app.get('/', (req, res) => {
  res.render('welcomehome');
})

app.get('/admin', (req, res) => {
  res.render('adminlogin')
})


app.get('/login', (req, res) => {
  res.render('login')
})


app.post('/login', (req, res) => {

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User logged in already or has just logged in.
    } else {
      // User not logged in or has just logged out.
    }

    const email = req.body.email;
    const password = req.body.password;

    if (email == 'spenmatsa@uco.edu') {
      // firebase.auth().signInWithEmailAndPassword(email, password)
      // .then(result => {
      res.render('adminhome')
      //})
    }

    else {

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(result => {
        res.render('welcomeuser')
      })

      .catch(error => {
        res.send('Login error:' + error)
      })
    }
  })
})

// app.post('/admin/login', (req, res) => {

//   const email = req.body.email;
//   const password = req.body.password;
//   if (email == 'spenmatsa@uco.edu') {
//     // firebase.auth().signInWithEmailAndPassword(email, password)
//     // .then(result => {
//     res.render('adminhome')
//     //})
//   }
//   else {
//     res.send('Unauthorized access! You are not an Admin');
//   }
// })


app.get('/logout', (req, res) => {
  firebase.auth().signOut()
    .then(result => {
      res.render('welcomehome.ejs')
    })
    .catch(error => {
      res.send('Logout error: ' + error)
    })
})

app.get('/admin/logout', (req, res) => {
  firebase.auth().signOut()
    .then(result => {
      res.render('adminlogin.ejs')
    })
    .catch(error => {
      res.send('Logout error: ' + error)
    })
})

app.get('/createUser', (req, res) => {
  res.render('profile');
})

app.post('/createUser', (req, res) => {
  var email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const mobile = req.body.mobile;
  admin.auth().createUser({
    email: email,
    emailVerified: false,
    phoneNumber: mobile,
    password: password,
    displayName: name,
    disabled: false
  })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      res.render('welcomeuser.ejs');
    })
    .catch(function (error) {
      console.log('Error creating new user:', error);
    });
})


app.get('/viewProfile', (req, res) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      var user = firebase.auth().currentUser;
      var name, email, mobile;

      if (user != null) {
        name = user.displayName;
        email = user.email;
        mobile = user.phoneNumber;
        res.render('viewProfile', { user })
      }
    }

  })
})


app.get('/updateUser', (req, res) => {
  res.render('update')
})
app.post('/updateUser', (req, res) => {
  var uid = firebase.auth().currentUser.uid;
  var email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const mobile = req.body.mobile;
  admin.auth().updateUser(uid, {
    email: email,
    phoneNumber: mobile,
    emailVerified: false,
    password: password,
    displayName: name,
    disabled: false
  })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      res.render('welcomehome')
    })
    .catch(function (error) {
      console.log('Error updating user:', error);
    });

})

app.get('/admin/viewUsers', (req, res) => {
  function listAllUsers(nextPageToken) {
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000, nextPageToken)
      .then(function (listUsersResult) {
        listUsersResult.users.forEach(function (userRecord) {
          // console.log('user', userRecord.toJSON());
          res.render('userslist', { listUsersResult });
        });

        if (listUsersResult.pageToken) {
          // List next batch of users.
          listAllUsers(listUsersResult.pageToken)
        } else {
          res.send('No users in database');
        }
      })
      .catch(function (error) {
        res.send('Error listing users:', error);
      });
  }
  // Start listing users from the beginning, 1000 at a time.
  listAllUsers()

})


app.get('/delete', (req, res) => {
  const uid = firebase.auth().currentUser.uid
  admin.auth().deleteUser(uid)
    .then(function () {
      res.render('welcomehome')
    })
    .catch(function (error) {
      console.log('Error deleting user:', error);
    });
})

app.post('/admin/delete', (req, res) => {
  const uid = req.body.id;

  admin.auth().deleteUser(uid)
    .then(function () {
      res.send('Successfully deleted user');
    })
    .catch(function (error) {
      console.log('Error deleting user:', error);
    });

})


app.get('/sell', (req, res) => {
  minrange=0;
  maxrange=10000;
  const id = req.query.id;
  users.get()
    .then(snapshot => {
      res.render('sellerhome', { snapshot, id })
    })
    .catch(error => {
      res.send('Error in get(); ' + error)
    });
})

app.get('/sellerlist', (req, res) => {
  const userid = firebase.auth().currentUser.uid;
  users.get()
  .then(snapshot => {
    res.render('sellerlist', { snapshot, userid })
  })
  .catch(error => {
    res.send('Error in get(); ' + error)
  });


})

app.get('/favourites', (req, res) => {
  const userid = firebase.auth().currentUser.uid
  favourites.get()
    .then(snapshot => {
      res.render('favourites', { snapshot, userid })
    })
    .catch(error => {
      res.send('Error in get()' + error)
    })
})

app.post('/seller/favourite', (req, res) => {
  const userid = firebase.auth().currentUser.uid;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const price = req.body.price;
  const zipcode = req.body.zipcode;
  const image = req.body.image;
  const image2 = req.body.image2;
  const image3 = req.body.image3;
  const image4 = req.body.image4;


  favourites.doc().set({ userid, city, image, image2, image3, image4, price, state, street, zipcode })
    .then(result => {
      res.redirect('/favourites')
    })
    .catch(error => {
      res.send("Error in insert :" + error)
    })

})

app.get('/slider', (req, res) => {
  const image = req.query.image;
  console.log(image);
  users.get()
    .then(snapshot => {
      res.render('slider', {snapshot,image})
    })
    .catch(error => {
      res.send('Error in get();' + error)
    })
})

app.get('/favouriteslider', (req, res) => {
  const uid=req.body.id;
  favourites.get()
    .then(snapshot => {
      res.render('slider', {snapshot, uid })
    })
    .catch(error => {
      res.send('Error in get();' + error)
    })
})

app.get('/seller/contact', (req, res) => {
  const userid = req.query.userid;
  admin.auth().getUser(userid)
  .then(function(userRecord) {
         name = userRecord.displayName;
         email = userRecord.email;
         mobile = userRecord.phoneNumber;

        res.render('displayContactDetails', { userRecord })
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
  });
})

app.get('/seller/insert', (req, res) => {
  res.render('sellerinsert');
})

app.post('/seller/insert', (req, res) => {
  const userid = firebase.auth().currentUser.uid
  const street = req.body.street;
  const image = req.body.image;
  const image2 = req.body.image2;
  const image3 = req.body.image3;
  const image4 = req.body.image4;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const price = req.body.price;
  users.doc().set({ userid, street, image, image2, image3, image4, city, state, zipcode, price })
    .then(result => {
      res.redirect('/sell')
    })
    .catch(error => {
      res.send("Error in insert :" + error)
    })
})
app.get('/seller/update', (req, res) => {
  const id = req.query.id;
  res.render('sellerupdate', { id });
})
app.post('/seller/update', (req, res) => {
  const id = req.body.id;
  console.log(id);
  const street = req.body.street;
  const image = req.body.image;
  const image2 = req.body.image2;
  const image3 = req.body.image3;
  const image4 = req.body.image4;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const price = req.body.price;
  db.collection('users').doc(id).update({
    street: street,
    image: image,
    image2: image2,
    image3: image3,
    image4: image4,
    city: city,
    state: state,
    zipcode: zipcode,
    price: price
  })
    .then(result => {
      res.redirect('/sell')
    })
    .catch(error => {
      res.send("Error in update :" + error)
    })
})
app.post('/seller/delete', (req, res) => {
  const id = req.body.id;
  console.log(id);
  users.doc(id).delete()
    .then(result => {
      res.redirect('/sell')
    })
    .catch(error => {
      res.send('Delete error :' + error)
    })

})


app.post('/favourites/delete', (req, res) => {
  const id = req.body.id;
  favourites.doc(id).delete()
    .then(result => {
      res.redirect('/favourites')
    })
    .catch(error => {
      res.send('Delete error :' + error)
    })
})

app.get('/favourites/view', (req, res) => {
  const userid = firebase.auth().currentUser.uid;
  favourites.get()
  .then(snapshot => {
    res.render('favourites', { snapshot,userid })
  })
  .catch(error => {
    res.send('Error in get()' + error);
  })
})


app.get('/',(req,res)=>{
  const minrange=0;
  const maxrange=10000;
  users.get()
  .then(snapshot =>{
    res.render('filterhome',{snapshot,minrange,maxrange})
  })
  .catch(error=>{
    res.send('error in get():',error);
  })
})

app.post('/sellerhome',(req,res)=>{
  const minrange=req.body.minrange;
  const maxrange=req.body.maxrange;
  users.get()
        .then(snapshot=>{
          res.render('filterhome',{snapshot,minrange,maxrange})
        })
        .catch(error =>{
          res.send('error in get():',error);
        })
})

app.get('/contact',(req,res)=>{
  const zip=req.query.zip;
  users.get()
     .then(snapshot => { 
       res.render('contact', {snapshot, zip})
     })
     .catch(error =>{
       res.send('Error in get();' +error)
     })
})


app.post('/houses', (req, res) => {
  const zip= req.body.zipcode;
  users.get()
    .then(snapshot => {
        res.render('houses', {snapshot,zip})
      
    })
    .catch( error => {
      res.send('error in get(); ' +error)
    });
  
})


app.post('/admin/delete/listings', (req, res) => {

  const id = req.body.id;
  console.log(id);
  users.doc(id).delete()
    .then(function () {
      res.send('Successfully deleted');
    })
    .catch(function (error) {
      console.log('Error deleting user:', error);
    });

})

app.get('/admin/listings', (req, res) => {

  users.get()
  .then(snapshot => {
      res.render('listings', {snapshot})
    
  })
  .catch( error => {
    res.send('error in get(); ' +error)
  });

})

app.get('/hello',(req,res)=>{
  const image = req.query.image;
  const minrange=0;
  const maxrange=10000;
  users.get()
  .then(snapshot => {
    res.render('filterhome',{snapshot,minrange,maxrange,image})
  })
  .catch(error=>{
    res.send('error in get():',error);
  })
})

app.post('/sellerhome',(req,res)=>{
  const minrange=req.body.minrange;
  const maxrange=req.body.maxrange;
  users.get()
        .then(snapshot=>{
          res.render('filterhome',{snapshot,minrange,maxrange})
        })
        .catch(error =>{
          res.send('error in get():',error);
        })
})


app.get('/review',(req,res)=>{
  
  res.render('review')
})
app.post('/review',(req,res)=>{
const headline=req.body.headline;
const review=req.body.review;
reviews.doc().set({headline,review})
      .then(result =>{
           res.redirect('/reviewhome')})
      .catch(error =>{
          res.send("Error in review :" + error)
      })
})




app.get('/reviewhome',(req,res)=>{
  const image=req.query.image;
  console.log(image);
  reviews.get()
  .then(snapshot => {
    res.render('reviewhome',{snapshot,image})
  })
  .catch(error=>{
    res.send('error in get():',error);
  })
})

