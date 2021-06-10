import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import React, {useState, useRef} from 'react';
// import Picker from 'emoji-picker-react';

import { useAuthState } from 'react-firebase-hooks/auth'; 
import { useCollectionData } from 'react-firebase-hooks/firestore';

const {REACT_APP_FIREBASE_API_KEY, 
REACT_APP_FIREBASE_AUTH_DOMAIN,
REACT_APP_FIREBASE_PROJECT_ID,
REACT_APP_FIREBASE_STORAGE_BUCKET,
REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
REACT_APP_FIREBASE_APP_ID,
REACT_APP_FIREBASE_MEASUREMENT_ID} = process.env;

//set Firebase Configuration
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:  REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID,
  measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  //get authenticated user
  //if user not there, return None
  const [user] = useAuthState(auth);


  return (
    <div className="App">
        <header className = "App-header">
          <h2>Exclusive Chat Room for Smoking Hot People</h2>
          <SignOut/>
        </header>

        <section>
          {user ? <ChatRoom /> : <SignIn/>}
        </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    // authentication with Google on Pop up
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
    <button className = "btn sign-in" onClick = {signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  // button occurs only if there's a user
  return auth.currentUser && (
    <button className = "btn" onClick = {() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  // get messages
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  // const [emojiPickerState, setEmojiPickerState] = useState(false);

  // for scroll effect
  const dummy = useRef();

  const sendMessage = async (e) => {
    
    //prevent reload
    e.preventDefault();
    if (formValue){
      const { uid, photoURL } = auth.currentUser;
      //add messages
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
      //reset form value
      setFormValue('');

      dummy.current.scrollIntoView({behavior: 'smooth'});
    }
    
  }

  

  return (
    <div>

      <main>
        
        {messages && messages.map(msg => 
          <ChatMessage key={msg.id} message = {msg} />)
        }
        
        <div ref={dummy}></div>

      </main>
    {/*       
      {emojiPickerState && 
      <Picker 
          onEmojiClick = {
            (e, emojiObject) => {
          setFormValue(formValue + emojiObject.emoji)
          }
        }
        
        pickerStyle = {{position: 'fixed', bottom: '70px', right: '50px'}}
      />} */}
  
      <form onSubmit = {sendMessage}>

        <input className = 'textInput' type="text" value={formValue} 
        onChange = {(e) => setFormValue(e.target.value)}/>
        
        {/* <button className = "btn" onClick = {() => setEmojiPickerState(!emojiPickerState)}> Emoji </button> */}
        
        <button type = "submit"> Sent </button>

      </form>

      
          

    </div>

    
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  //change style depending on person
  const messageClass = uid === auth.currentUser.uid ? 'sent': 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://www.pikpng.com/pngl/m/57-573816_avatar-steam-cat-wallpaper-cute-cat-png-cartoon.png'} 
      alt = "User Profile"/>
      <p>{text}</p>
    </div>
  )
}

export default App;
