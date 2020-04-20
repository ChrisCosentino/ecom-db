const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const admin = require('firebase-admin');

admin.initializeApp();


var firebaseConfig = {
    apiKey: "AIzaSyC1wQOu2oxLz0-lTHTOwoiz0MSNFNHynsQ",
    authDomain: "cosentino-ecom-proj.firebaseapp.com",
    databaseURL: "https://cosentino-ecom-proj.firebaseio.com",
    projectId: "cosentino-ecom-proj",
    storageBucket: "cosentino-ecom-proj.appspot.com",
    messagingSenderId: "288483802707",
    appId: "1:288483802707:web:71889481a958ab08afd0a6",
    measurementId: "G-22HLCX1HQP"
  };

const express = require('express');
const app = express();

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();




// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

//https://baseurl.com/api/products/
app.get('/products', (req, res) => {
    db
    .collection('products')
    .get()
    .then((data) => {
        let products = [];
        data.forEach((doc) => {
            products.push(doc.data());
        });
        return res.json(products);
    })
    .catch((err) => console.error(err));
});


//https://baseurl.com/api/products/:product id
//This returns the exact product that was searched
app.get('/products/:id', (req, res) => {
    db
        .collection('products')
        .where('productId', '==', req.params.id)
        .get()
        .then((data) => {
            let products = [];
            data.forEach((doc) => {
                products.push(doc.data());
            });
            return res.json(products);
        })
        .catch((err) => console.error(err));
});

//get reviews 
app.get('/products/reviews/:id', (req, res) => {
    db
        .collection('products')
        .doc(req.params.id)
        .collection('reviews')
        .get()
        .then((data) => {
            let reviews = [];
            data.forEach((doc) => {
                reviews.push(doc.data());
            });
            return res.json(reviews);
        })
        .catch((err) => console.log(err));
});

//add review
app.post('/products/reviews/:id', (req, res) => {
    const review = {
        title: req.body.title,
        message: req.body.message,
        user: req.body.user
    };

    db
        .collection('products')
        .doc(req.params.id)
        .collection('reviews')
        .add(review)
        .then(document => {
            res.json({message: 'document created successfully'});
        })
});


app.get('/products/:title', (req, res) => {
    admin
        .firestore()
        .collection('products')
        .where('title', '>', req.params.title)
        .orderBy("title", "asc")
        .get()
        .then((data) => {
            let products = [];
            data.forEach((doc) => {
                products.push(doc.data());
            });
            return res.json(products);
        })
        .catch((err) => console.error(err));
});

//search by category
app.get('/products/category/:category', (req, res) => {
    admin
        .firestore()
        .collection('products')
        .where('category', '==', req.params.category)
        .get()
        .then((data) => {
            let products = [];
            data.forEach((doc) => {
                products.push(doc.data());
            });
            return res.json(products);
        })
        .catch((err) => console.error(err));
});

//search by author
app.get('/products/author/:author', (req, res) => {
    admin
        .firestore()
        .collection('products')
        .where('author', '==', req.params.author)
        .get()
        .then((data) => {
            let products = [];
            data.forEach((doc) => {
                products.push(doc.data());
            });
            return res.json(products);
        })
        .catch((err) => console.error(err));
});

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    };

    let errors = {};
    // if(isEmpty(newUser.email)){
    //     errors.email = 'Email must not be empty';
    // }

    // if(isEmpty(newUser.password)){
    //     errors.password = 'Password must not be empty';
    // }
    
    // if(newUser.password !== newUser.confirmPassword) {
    //     errors.confirmPassword = 'Passwords must match';
    // }

    // if(isEmpty(newUser.handle)){
    //     errors.handle = 'Must not be empty';
    // }

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    const newUserDb = {
        email: req.body.email,
        username: req.body.username
    };

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            db.collection('users')
                .doc(data.user.uid)
                .set(newUserDb)
                .then(document => {
                    res.json({message: 'document created successfully'});
                })
                .catch(err => {
                    res.status(500).json({error: `error adding to db: ${err}`});
                })
        })
        .catch(err => {
            res.status(500).json({error: `error creating user: ${err.code}`});
        })
})

//https://baseurl.com/api/login/
app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};
    
    if(isEmpty(user.email)) errors.email = "Must not be empty";
    if(isEmpty(user.password)) errors.password = "Must not be empty";

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.log(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({general: 'Wrong credentials, please try again'});
            }else{
                return res.status(500).json({error: err.code});
            }
        })
})

app.post('/logout', (req, res) => {
    firebase
        .auth()
        .signOut()
    .then(() => {
        return res.json({message: "successfully logged out"})
    })
    .catch(err => {
        return res.status(500).json({error: err.code})
    })

})

//https://baseurl.com/api/
exports.api = functions.https.onRequest(app); 