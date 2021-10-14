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
  const { title, deadline } = request.body;

  const { usuario } = request;

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
  const { title, deadline} = request.body;

  const { usuario } = request;

  usuario.title = title;
  usuario.deadline = deadline;

  return response.status(202).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.listen(3333, () => {
  console.log('Servidor On localhost:3333. ');
})
module.exports = app;