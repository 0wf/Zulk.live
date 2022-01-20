import { useState, useRef } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  signInAnonymously,
} from "firebase/auth";
import {
  AiFillCloseCircle,
  AiFillDelete,
  AiOutlineSend,
  AiOutlineLogout,
} from "react-icons/ai";

const provider = new GoogleAuthProvider();

const app = firebase.initializeApp({
  apiKey: APIKEY,
  authDomain: AUTHDOMAIN,
  projectId: PROJECTID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: MESSAGINGSENDERID,
  appId: APPID,
  measurementId: MEASUREMENTID,
});
const auth = getAuth();
const db = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <div className="flex flex-col h-screen justify-center items-center">
        {user ? <ChatRoom /> : <SignIn />}
      </div>
    </div>
  );
}

function SignIn() {
  function GoogleSignIn() {
    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
    });
  }
  function AnonSignIn() {
    signInAnonymously(auth);
  }
  return (
    <body className="h-screen w-screen cool-background-sign-in">
      <div className="h-1/6 w-screen flex flex-col justify-content text-bodycolor items-center p-4">
        <h1 className="google text-7xl ">ZULK</h1>
        <div className="h-0.5 w-48 prussian-bg"></div>
        <p className="google transform scale-100 text-lg font-semi-bold mt-2">
          a chatting app
        </p>
      </div>
      <div className="h-1/2 flex flex-col justify-center items-center gap-6 m-auto">
        <button
          onClick={GoogleSignIn}
          className="button-bg border-richblack border-2 border-opacity-100 text-alice shadow-sm px-6 p-4 m-0 rounded-lg flex justify-center text-xl google"
        >
          Sign in with Google
        </button>
        <button
          onClick={AnonSignIn}
          className="button-bg border-richblack border-2 text-alice shadow-sm p-4 m-0 rounded-lg flex justify-center  text-xl google"
        >
          Sign in Anonymously
        </button>
      </div>
    </body>
  );
}

function ChatRoom() {
  const logOut = async () => {
    await signOut(auth);
  };
  return (
    <body className="h-screen w-screen cool-background flex flex-col justify-content items-center">
      <div className="google fixed cool-background z-20 top-0 left-0 small-title-h w-screen flex flex-col">
        <div className="w-full flex flex-row m-auto">
          <div className="w-1/3"></div>
          <div className="w-1/3 flex justify-center items-center">
            <h1 className="google text-5xl text-bodycolor xs:text-6xl sm:text-7xl">
              ZULK
            </h1>
          </div>
          <div className="w-1/3 flex justify-end items-center px-3">
            <button
              className="text-lightgray px-2 py-px md:px-4 lg:mr-16 md:mr-8 rounded-lg flex justify-center text-sm md:text-md lg:text-lg google"
              onClick={logOut}
            >
              <LogOutButton icon={<AiOutlineLogout size="28" />} />
            </button>
          </div>
        </div>
      </div>
      <Messages />
    </body>
  );
}
const LogOutButton = ({ icon }) => {
  return (
    <div
      className="text-oxford 
                    hover:text-prussian"
    >
      {icon}
    </div>
  );
};

//<div className="h-1 w-screen bg-independence title-bar"></div>
function Messages() {
  const scrollRef = useRef();
  const messagesRef = db.collection("messages");
  const query = messagesRef.orderBy("timeCreated", "asc").limit(50);
  const [messages] = useCollectionData(query, { idField: "id" });
  var [showDelete, setShowDelete] = useState(1);

  function Form() {
    db.collection("messages").onSnapshot((QuerySnapshot) => {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    });

    var placeholder = "enter text";
    const [text, setText] = useState("");
    const sendMessage = async (e) => {
      e.preventDefault();
      const { uid } = auth.currentUser;
      await db.collection("messages").add({
        text: text,
        timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
        author: uid,
      });
      setText("");
    };
    const handleTextChange = (event) => {
      setText(event.target.value);
    };
    return (
      <form
        onSubmit={sendMessage}
        autocomplete="off"
        className="cool-background z-20 w-screen h-full flex justify-center items-center"
      >
        <div className="w-full h-3/4 md-2/3 md:mb-7 flex justify-center items-center m-auto">
          <div className="bg-bodycolor w-5/6 max-w-xl h-10 my-auto rounded-md flex flex-row md:grid md:grid-rows-1">
            <input
              className="bg-bodycolor text-lightgray h-10 my-auto pl-2 text-left z-20 rounded-md shadow-sm focus:bg-bodycolor focus:text-lightgray focus:outline-none focus:border-gray-500"
              type="text"
              name="text"
              placeholder={placeholder}
              onChange={handleTextChange}
              value={text}
            />
            <button
              className="h-6 md:h-10 google shadow-sm my-auto max-w-xss rounded-lg flex justify-end px-2 items-center text-sm md:text-md google"
              type="submit"
            >
              <Send icon={<AiOutlineSend size="24" />} />
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="w-screen flex justify-center">
      <div className="mobile-height bg-bodycolor w-full xl:w-1/2 lg:w-3/4 md:rounded-2xl">
        <div className="h-full w-full flex justify-content items-start overflow-auto">
          <div className="w-full flex flex-col">
            <main className=" w-full flex flex-col items-center">
              {messages &&
                messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    showDelete={showDelete}
                    message={msg}
                  />
                ))}
              <div ref={scrollRef}></div>
            </main>
            <button
              className="fixed delete-pos-mobile"
              onClick={() => setShowDelete(showDelete + 1)}
            >
              <Trash icon={<AiFillDelete size="24" />} />
            </button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 small-title-h large-footer w-full">
        <Form />
      </div>
    </div>
  );
}

const Trash = ({ icon }) => {
  return (
    <div
      className="text-oxford
                    hover:text-prussian"
    >
      {icon}
    </div>
  );
};

function ChatMessage(props) {
  const deleteMessage = async (e) => {
    e.preventDefault();
    await db.collection("messages").doc(props.message.id).delete();
  };
  const { uid } = auth.currentUser;
  const { text } = props.message;
  const showDelete = props.showDelete;
  return (
    <div className="w-full flex m-2 px-4 text-base md:text-lg">
      {uid === props.message.author ? (
        <div className="w-full flex justify-end items-center">
          <p className=" bg-darkdye text-white google max-w-xs md:max-w-md min-h-xs mx-2 px-2 py-1 rounded-lg overflow-ellipsis overflow-hidden">
            {text}
          </p>
          {showDelete % 2 === 0 ? (
            <button className="transform scale-100" onClick={deleteMessage}>
              <DeleteIcon icon={<AiFillCloseCircle size="18" />} />
            </button>
          ) : (
            <span className="w-px"></span>
          )}
        </div>
      ) : (
        <div className="w-full flex justify-start items-start">
          <p className="bg-lightgray px-2 py-1 google rounded-lg max-w-xs md:max-w-md min-h-xs mx-2 overflow-ellipsis overflow-hidden">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
const DeleteIcon = ({ icon }) => {
  return (
    <div
      className="h-18 w-18
                  rounded-full
                  text-sonicsilver
                  hover:text-dye2"
    >
      {icon}
    </div>
  );
};

const Send = ({ icon }) => {
  return (
    <div
      className="text-lightgray
                    hover:text-sonicsilver"
    >
      {icon}
    </div>
  );
};

export default App;
