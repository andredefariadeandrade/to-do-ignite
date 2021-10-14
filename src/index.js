const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if(!username) return response.status(400).json({ error: 'username is required' });

  const usuario = users.find((usuario) => usuario.username === username);
  if (!usuario) return response.status(404).json({ error: 'user not exists' });

  request.usuario = usuario;

  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  const { usuario } = request;

  if (!usuario.pro && usuario.todos.length < 10) {
    return next();
  } else if (usuario.pro) {
    return next();
  } else {
    return response.status(403).json({ error: 'limit reached' });
  }
}

function checksTodoExists(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const usuario = users.find((usuario) => usuario.username === username);
  if (!usuario) return response.status(404).json({ error: 'user not found' });

  const checkUuidIsValid = validate(id);
  if (!checkUuidIsValid) return response.status(400).json({ error: 'Id invalid' });

  const todo = usuario.todos.find(todo => todo.id === id);
  if (!todo) return response.status(404).json({ error: 'todo not found' });
  
  request.todo = todo;
  request.usuario = usuario;

  return next();
}

function findUserById(request, response, next) {
  const { id } = request.params;

  if (!id) return response.status(400).json({ error: 'id is required' });

  const usuario = users.find((usuario) => usuario.id === id);
  if (!user) return response.status(404).json({ error: 'user not found' });

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
  const { usuario, todo } = request;
  const { id } = request.params;
  
  const todoIndex = usuario.todos.indexOf(todo);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  usuario.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

app.listen(3333, () => {
  console.log('Servidor On localhost:3333. ');
});

module.exports = {
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById
};