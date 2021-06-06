import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import React, {useState, useRef} from 'react';

import { useAuthState } from 'react-firebase-hooks/auth'; 
import { useCollectionData } from 'react-firebase-hooks/firestore';

//set Firebase Configuration
var firebaseConfig = {
  
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
          <h1>Exclusive Chat Room for Smoking Hot People</h1>
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
    <button onClick = {signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  // button occurs only if there's a user
  return auth.currentUser && (
    <button onClick = {() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  // get messages
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  // for scroll effect
  const dummy = useRef();

  const sendMessage = async (e) => {
    console.log(formValue);
    console.log(messages)
    //prevent reload
    e.preventDefault();

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

  return (
    <div>

      <main>
        
        {messages && messages.map(msg => 
          <ChatMessage key={msg.id} message = {msg} />)
        }

        <div ref={dummy}></div>

      </main>

      <form onSubmit = {sendMessage}>

        <input value={formValue} 
          onChange = {(e) => setFormValue(e.target.value)}/>
        
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
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} 
      alt = "User Profile"/>
      <p>{text}</p>
    </div>
  )
}

export default App;
