import React, {useState, useEffect} from 'react';
import './App.css';
import io from "socket.io-client";
import { Button, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

let SOCKET;
const URL = 'localhost:3001/'
function Todo({ todo, index, completeTodo, removeTodo }) {
  return (
    <div
      className="todo"

    >
      <h3>Responsible: {todo.user}</h3>  <span style={{ textDecoration: todo.isDone ? "line-through" : "" }}>{todo.text}</span>
      <div>
        <Button variant="outline-success" onClick={() => completeTodo(index)}>✓</Button>{' '}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>✕</Button>
      </div>
    </div>
  );
}

function FormTodo({ addTodo, users }) {
  const [value, setValue] = useState("");
  const [user, setUser] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!value){
      alert('Todo field is empty!')
      return;
    }
    addTodo(value, user);
    setValue("");
    setUser("");
  };

  return (
    <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label><b>Add Todo</b></Form.Label>
      <Form.Control type="text" className="input" value={value} onChange={e => setValue(e.target.value)} placeholder="Add new todo" />
      <Form.Label><b>Select user: </b></Form.Label>
      <select id = "UsersList" placeholder="Choose user" onChange={(e) => {
            setUser(e.target.value);
          }} >
          {users.map((user) => {
            return (
              <option> {user} </option>
            );
          })}
      </select>
    </Form.Group>
    <Button variant="primary mb-3" type="submit">
      Submit
    </Button>
  </Form>
  );
}

function App() {
  const [authorized, setAuthorized] = useState(false);
  const [room, setRoom] = useState("");
  const [studentID, setStudentID] = useState("");

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);

  const [todos, setTodos] = useState([]);
  // this is a hook to be called every time URL changes (const)
  useEffect(() => {
    SOCKET = io(URL);
    console.log(SOCKET.connected)
  }, [URL]);
  // this is a hook to be called on every page render
  useEffect(() => {
    // socket: on recieved messages add them into chatHistory using setChatHistory
    SOCKET.on('update_users_'+room, onlineUsers=>{
      setRoomUsers(onlineUsers);
    });
    SOCKET.on('update_todos_'+room, update=>{
      setTodos(update);
    });
  });
 // TODO:
const addTodo = (text, user) => {
  const newTodos = [...todos, { text: text , user:user,  isDone: false}];
  setTodos(newTodos);
  SOCKET.emit("update todos",{
          room: room,
          todos: newTodos
  });
};

const completeTodo = index => {
  const newTodos = [...todos];
  newTodos[index].isDone = true;
  setTodos(newTodos);
  SOCKET.emit("update todos",{
          room: room,
          todos: newTodos
  });
};

const removeTodo = index => {
  const newTodos = [...todos];
  newTodos.splice(index, 1);
  setTodos(newTodos);
  SOCKET.emit("update todos",{
          room: room,
          todos: newTodos
  });
};
//
  function isNum(val){
    return !isNaN(val)
  }
  const connectToRoom = () => {
    if (studentID.length === 10 && isNum(studentID)){
      setAuthorized(true);
      //socket: join room here
	  SOCKET.on('chatroom_'+room,msg=>{
		  if(msg.room === room){
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
      
      <div className="UsersList">
      <h3> Online Users :</h3>
      {roomUsers.map((user) => {
        return (
          <div
            className="user-container"
          >
          <div className={user === studentID ? "me" : "other"}>
            <div className="user-box">
              {user}
            </div>
            </div>
          </div>
        );
      })}
      </div>

      <div className="container">
        <h1 className="text-center mb-4">Todo List</h1>
        <FormTodo addTodo={addTodo}  users={roomUsers}/>
        <div>
          {todos.map((todo, index) => (
            <Card>
              <Card.Body>
                <Todo
                key={index}
                index={index}
                todo={todo}
                completeTodo={completeTodo}
                removeTodo={removeTodo}
                />
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      <div className="messages">
        {chatHistory.map((val, key) => {
          return (
            <div
              className="message-container"
            >
            <div className={val.sender === studentID ? "mymessage" : "outsidemessage"}>
              <div className="message-box">
                {val.sender}: {val.message}
              </div>
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
