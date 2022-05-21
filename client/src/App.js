import React, {useState, useEffect} from 'react';
import './App.css';
import io from "socket.io-client";

let SOCKET;
const URL = 'localhost:3001/'

function App() {
  const [authorized, setAuthorized] = useState(false);
  const [room, setRoom] = useState("");
  const [studentID, setStudentID] = useState("");

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  // this is a hook to be called every time URL changes (const)
  useEffect(() => {
    SOCKET = io(URL);
    console.log(SOCKET.connected)
  }, [URL]);
  // this is a hook to be called on every page render
  useEffect(() => {
    // socket: on recieved messages add them into chatHistory using setChatHistory

  });

  function isNum(val){
    return !isNaN(val)
  }
  const connectToRoom = () => {
    if (studentID.length === 10 && isNum(studentID)){
      setAuthorized(true);
      //socket: join room here
	  SOCKET.on('chatroom_'+room,msg=>{
		  if(msg.room == room){
			  if(msg.content){
				  setTimeout(function(){
					  console.log(chatHistory)
					  chatHistory.push(msg.content);
					  setChatHistory(JSON.parse(JSON.stringify(chatHistory)));
				  },500)
			  }
		  }
	  });
	    //User online status
	    SOCKET.emit("chat message",{
              room: room,
              content: {
                sender: studentID,
                message: 'I am online now~'
              },
            })
      //
    } else {
      alert('Please type in a valid student ID')
    }
  }

  const sendMessage = () => {

    let messageObj = {
      room: room,
      content: {
        sender: studentID,
        message: message,
      },
    };
    // socket send message
	SOCKET.emit("chat message",messageObj)
    //
    // clear
    var messageInput = document.getElementById("messageInput");
    messageInput.value = "";
    setMessage("");

  }
  return (
    <div className="App">
      {! authorized ?
      //This is HTML for authorization
      <div className="container">
        <div className="login-form">
            <input
              type="text"
              placeholder="Student ID"
              onChange={(e) => {
                setStudentID(e.target.value);
              }}
            />
            <select id = "RoomList" placeholder="Room" onChange={(e) => {
                setRoom(e.target.value);
              }} >
          <option> w3schools </option>
          <option> Javatpoint </option>
          <option> tutorialspoint </option>
          <option> geeksforgeeks </option>
          </select>

          </div>
          <button onClick={connectToRoom}>Enter Chat</button>


      </div>
      :
      //This is HTML after authorization
      <div className="chat-container">
      <div className="messages">
        {chatHistory.map((val, key) => {
          return (
            <div
              className="message-container"
              id={val.sender == studentID ? "mymessage" : "outsidemessage"}
            >
              <div className="message-box">
                {val.sender}: {val.message}
              </div>
            </div>
          );
        })}
      </div>

      <div className="messageInputs">
        <input
          type="text"
          id="messageInput"
          placeholder="Message"
          onChange={(e) => {
            setMessage(e.target.value);

          }}
        />
        {message.length > 0 ?
          <button onClick={sendMessage}>Send</button>
          :
          <button onClick={sendMessage} disabled={true}>Send</button>
        }

      </div>
    </div>
      }

    </div>
  );
}

export default App;
