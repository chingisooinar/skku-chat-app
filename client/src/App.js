import React, {useState} from 'react';
import './App.css';

function App() {
  const [authorized, setAuthorized] = useState(false);
  const [room, setRoom] = useState("");
  const [studentID, setStudentID] = useState("");
  
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  
  const connectToRoom = () => {
    setAuthorized(true);
    //socket 
  }

  const sendMessage = () => {
    let messageObj = {
      room: room,
      content: {
        sender: studentID,
        message: message,
      },
    };
    // socket
    console.log(message);
    setChatHistory([...chatHistory, messageObj.content]);
    setMessage("");
  }
  return (
    <div className="App">
      {! authorized ? 
      <div className="container">
        <div className="login-form">
            <input
              type="text"
              placeholder="Student ID"
              onChange={(e) => {
                setStudentID(e.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Room"
              onChange={(e) => {
                setRoom(e.target.value);
              }}
            />
          </div>
          <button onClick={connectToRoom}>Enter Chat</button>

      
      </div>
      :
      <div className="chat-container">
      <div className="messages">
        {chatHistory.map((val, key) => {
          return (
            <div
              className="message-container"
              id={val.sender == studentID ? "you" : "other"}
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
          placeholder="Message"
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
      }
      
    </div>
  );
}

export default App;
