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
      <div class="row">
      <div class="col">
      <p><b>Responsible: </b>{todo.user}</p> 
      <span class="text-break" style={{ textDecoration: todo.isDone ? "line-through" : "" }}>
        {todo.text}
      </span>
      </div>
      <div class="col my-auto ms-5">
        <Button variant="outline-success me-2" onClick={() => completeTodo(index)}>✓</Button>{' '}
        <Button variant="outline-danger" onClick={() => removeTodo(index)}>✕</Button>
      </div>
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
      <Form.Control variant="mt-2" type="text" className="input" value={value} onChange={e => setValue(e.target.value)} placeholder="Add new todo" />
      <div class="d-grid gap-2 d-md-flex justify-content-md-end">
      <Form.Label><b>Select user: </b></Form.Label>
      <select class="dropdown btn-secondary rounded" id = "UsersList" placeholder="Choose user" onChange={(e) => {
            setUser(e.target.value);
          }} >
          {users.map((user) => {
            return (
              <option> {user} </option>
            );
          })}
      </select>
      </div>
    </Form.Group>
    <hr/>
    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
    <Button variant="secondary me-3" type="submit" data-bs-dismiss="modal">
      Submit
    </Button>
    </div>
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
        <div>
          <img src="chatAppIcon.png" class = "rounded" alt="This is an icon of this chatting app." width="650"/> 
        </div>
        <div className="login-form">
            <h1 class="h4 mb-3 fw-normal">Sign in    
            <select class = "ms-2 dropdown btn-secondary mb-3 rounded" id = "RoomList" placeholder="Room" onChange={(e) => {
                {
                  setRoom(e.target.value);
                }
                
              }}>
              
              <option> _______________ </option>
              <option> w3schools </option>
              <option> Javatpoint </option>
              <option> tutorialspoint </option>
              <option> geeksforgeeks </option>
          
            </select>
           </h1> 
          <div class="form-floating w-75 m-auto">
            <input
              id="idInput"
              class="form-control mb-3"
              type="text"
              placeholder="Student ID"
              onChange={(e) => {
                setStudentID(e.target.value);
              }}
            />
            <label for="idInput">StudentID</label>
          </div>
            
            
        </div>
            <button type="button" class="btn btn-secondary w-75 m-auto mb-4" onClick={connectToRoom}><h4>Enter Chat</h4></button>
      </div>
      :
      //This is HTML after authorization
      <div className="chat-container">
        <div class="chat-room-info font-monospace">
          <div class="text-start text-white">
            room for 
            <h1>{room}</h1>
          </div>
        </div>

        <ul class="nav nav-tabs mb-1">
          <li class="nav-item">
            <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-whatever="@mdo">
              Add Todo List
            </button>
          </li>
          <li class="nav-item">
            <button class="btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample2" aria-expanded="false" aria-controls="collapseExample">
              Todo List
            </button>
          </li>
          <li class="nav-item">
            <button class="btn position-relative" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample1" aria-expanded="false" aria-controls="collapseExample">
              Online users
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {roomUsers.length}
              </span>
            </button>
          </li>
        </ul>
      <div className="UsersList">
      <div class="collapse" id="collapseExample1">
        <div class="card card-body">
        <p class="fw-bold">UsersList</p>
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
      </div>
      </div>

      <div className="container">

        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Add Todo List</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <FormTodo addTodo={addTodo}  users={roomUsers}/>
              </div>
            </div>
          </div>
        </div>

        <div class="collapse" id="collapseExample2">
          <div class="card card-body">
           <div>
              <p class="fw-bold">TodoList</p>
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
        </div>
      </div>

      <div className="messages">
        <p class="chatbox mb-2 border">  

        {chatHistory.map((val, key) => {
          return (
            <div
              className="message-container"
              id={val.sender == studentID ? "mymessage" : "outsidemessage"}
            > 
              <div className="message-box">
              {
              val.sender == studentID ?
                <div class="my_msg">
                  <div class="card border-warning w-75 float-end me-2 mb-1 mt-1">
                    <div class="card-header text-end font-monospace">
                      {val.sender} 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
                        <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                      </svg>
                    </div>
                    <div class="card-body">
                      <blockquote class="blockquote mb-0 text-start font-monospace fs-6">
                        {val.message}
                      </blockquote>
                    </div>
                  </div>

                </div>
                : 
                <div class="other_msg">
                  <div class="card border-secondary w-75 float-start ms-2 mb-1 mt-1">
                    <div class="card-header text-start font-monospace">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                      <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                    </svg> 
                    {val.sender}
                    </div>
                    <div class="card-body">
                      <blockquote class="blockquote mb-0 text-start font-monospace fs-6">
                        {val.message}
                      </blockquote>
                    </div>
                  </div>
                </div>
              }
              </div>
            </div>
          );
        })}
        </p>
      </div>

      <div className="messageInputs" class="inputbox">
        <div class="input-group mb-3">
          <textarea
            class="form-control border rounded border-secondary "
            type="text"
            id="messageInput"
            placeholder="Message"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          {message.length > 0 ?
            <button class="btn btn-secondary font-monospace fs-5 border rounded border-dark " onClick={sendMessage}>Send</button>
            :
            <button class="btn btn-secondary font-monospace fs-5 border rounded border-dark " onClick={sendMessage} disabled={true}>Send</button>
          }
        </div>
      </div>
    </div>
    }
    </div>
  );
}

export default App;
