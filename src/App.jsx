import './App.css'

import Filter from 'bad-words'

import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import 'firebase/compat/auth'; 

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRef, useState } from 'react';

import { BsSendFill } from 'react-icons/bs'

firebase.initializeApp({
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_REACT_APP_FIREBASE_MEASUREMENT_ID
})
console.log({
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_REACT_APP_FIREBASE_MEASUREMENT_ID
})

const auth = firebase.auth()
const firestore = firebase.firestore()
const App = () => {
  const [user] = useAuthState(auth)
  return (
    <>
    <div className='fixed bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900 via-zinc-950 to-black absolute min-h-full w-full'>
      <header className='fixed w-full flex items-center h-16 border-b-2 border-purple-500 bg-zinc-900 z-10 justify-center'>
      
      <div className="fixed m-auto flex items-center duper">
        <span className="logo-span border h-0 w-20"></span>
        <p className="text-white mx-2">DuperChat</p>
        <span className="logo-span border h-0 w-20"></span>
      </div>
        
        <SignOut />
      </header>
      <section className='overflow-auto'>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
    </>
  );
}


//////////////////////// SIGN IN ////////////////////////
const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return(
    <>
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        <button onClick={signInWithGoogle} className='bg-purple-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out z-10'>Sign in with Google</button>
      </div>
    </>
  )
}

//////////////////////// SIGN OUT ////////////////////////
const SignOut = () => {
  return auth.currentUser && (
    <>
      <button onClick={() => auth.signOut()} className="bg-purple-500 hover:bg-red-900 text-white font-semibold py-2 px-4 ml-auto mr-10 rounded-full transition duration-300 ease-in-out">Sign Out</button>
    </>
  )
}

//////////////////////// CHATROOM ////////////////////////
const ChatRoom = () => {

  const dummy = useRef()

  const messagesRef = firestore.collection('messages')
  //limiting to 50, avoiding too many calls
  const query = messagesRef.orderBy('createdAt').limit(50)
  const [messages] = useCollectionData(query, {idField:'id'})
  const [formValue, setFormValue] = useState('')
  const sendMessage = async(e) => {
    e.preventDefault()
    const {uid, photoURL} = auth.currentUser
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')

    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  return(
    <>
    <div className='mb-20'></div>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>

      </main>
      <div className='mt-20'></div>
      <form className='fixed bottom-0 left-0 right-0 flex inline-block m-3 justify-center' onSubmit={sendMessage}>
        <input value={formValue} placeholder='Say Wassup Chat!' onChange={(e) => setFormValue(e.target.value)} className='border rounded-tl-lg rounded-bl-lg w-1/2  h-9  focus:outline-none pl-2'/>
        <button type='submit' className='px-2 rounded-tr-lg rounded-br-lg bg-purple-900 hover:bg-green-800 transition duration-300 ease-in-out'>
          <BsSendFill className='text-white'/>
        </button>
      </form>
    </>
  )
}

//////////////////////// CHATMESSAGE////////////////////////
const ChatMessage = (props) => {
  const { text, uid, photoURL } = props.message
  const filter = new Filter()
  const cleanedMsg = filter.clean(text)
  const msg = filter.isProfane(text) ? `"${cleanedMsg}" Is an Illegal Phrase. Please be Nice!` :text
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return(
    <>
    <div className={`message ${messageClass} flex items-center space-x-2 bg-gradient-to-r from-transparent to-zinc-950 border border-gray-900 rounded-lg px-3 py-2`}>
      <img
        className="w-8 rounded-full"
        src={photoURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf6ptaCSVsfxW3NjSan7yuxW5Q1yLqJWuKCA&usqp=CAU'}
        alt="User Avatar"
      />
      <p className="min-w-1/2 text-white break-words">{msg}</p>
    </div>
    <span className='text-span'></span>
    </>
  )
}
export default App;