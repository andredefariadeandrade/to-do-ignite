const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const usuario = users.find(usuario => usuario.username === username);

  if(!usuario){
    return response.status(404).json({ message: "Username not found. "})
  }
  request.usuario = usuario;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(usuario => usuario.username === username)

  if (userExists) {
    return response.status(400).json({ error: "Username already exists. " })
  } 

    const usuario = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.push(usuario);

    return response.status(201).json(usuario);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  return response.status(200).json(usuario.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  const { title, deadline } = request.body;

  const listaToDo = {
    id: uuidv4(),
	  title,
	  done: false, 
	  deadline: new Date(deadline),
	  created_at: new Date()
  }
  usuario.todos.push(listaToDo)

  return response.status(201).json(listaToDo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  const { title, deadline} = request.body;
  const { id } = request.params;

  const todo = usuario.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({ error: "id not found. "})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(202).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  const { id } = request.params;
  const todo = usuario.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "id not found. "})
  }
  todo.done = true;

  return response.json(todo);
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  const { id } = request.params;

  const todoIndex = usuario.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({ error: "id not found. "})
  }

  users.todos.splice(todoIndex, -1);

  return response.status(204).send();
});

app.listen(3333, () => {
  console.log('Servidor On localhost:3333. ');
})
module.exports = app;