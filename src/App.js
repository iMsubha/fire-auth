import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config'
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    password: '',
    error: '',
    success: false
  });
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        };
        setUser(signInUser);
      }).catch((error) => {
        console.log(error.message);
      })
  }
  const handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      const signOutUser = {
        isSignedIn: false,
        name: '',
        email: '',
        photo: '',
        password: ''
      };
      setUser(signOutUser);
    }).catch((error) => {
      console.log(error.message);
    });
  }
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch(err => {
          const newUserInfo = { ...user };
          newUserInfo.error = err.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);

        })
        .catch((err) => {
          const newUserInfo = { ...user };
          newUserInfo.error = err.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }
  const handleBlur = (e) => {
    //console.log(e.target.name, e.target.value);
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const hasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = isPasswordValid && hasNumber;
      console.log(isFieldValid)
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const updateUserName = name => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      // Update successful.
      console.log('user name updated successfully');
    }).catch(function (error) {
      // An error happened.
      console.log(error)
    });
  }
  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((res) => {


        // The signed-in user info.
        var user = res.user;
        console.log('fb user after sign in', user)
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        //var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }
  return (
    <div className="App">
      <h1>Firebase Authentication</h1>
      {
        user.isSignedIn ? <button onClick={handleSignOut}> Sign out</button> :
          <button onClick={handleSignIn}> Sign in</button>
      }
      <button onClick={handleFbSignIn}> Sign in using Facebook</button>
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }

      <h1>Our own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" />
      <label htmlFor="newUser">New User Sign Up</label>

      <form onSubmit={handleSubmit}>
        {
          newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Your Name" required />
        }

        <br />
        <input type="text" name="email" onBlur={handleBlur} placeholder="Write your email eddress" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} placeholder="Write your password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>

      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? 'created' : 'Singn in'} successfully</p>
      }
    </div>
  );
}

export default App;
