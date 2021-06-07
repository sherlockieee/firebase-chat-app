import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import React, {useState, useRef} from 'react';
import Picker from 'emoji-picker-react';

import { useAuthState } from 'react-firebase-hooks/auth'; 
import { useCollectionData } from 'react-firebase-hooks/firestore';



//set Firebase Configuration
var firebaseConfig = {
  apiKey: "AIzaSyDv7xz8IIXahwjsZfYLr_c0BXn8iJLQZwY",
  authDomain: "fir-chat-app-f726e.firebaseapp.com",
  projectId: "fir-chat-app-f726e",
  storageBucket: "fir-chat-app-f726e.appspot.com",
  messagingSenderId: "455430522868",
  appId: "1:455430522868:web:406eee1a7fb65028ad1ba1",
  measurementId: "G-P4MBXPVGND"
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
