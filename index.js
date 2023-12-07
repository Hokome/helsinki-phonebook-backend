const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 3000;

app.use(express.static('dist'));
app.use(express.json());
morgan.token('data', (req) => JSON.stringify(req['body']));
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :data'));

let persons = [
  {'id': 1, 'name': 'Arto Hellas', 'number': '040-123456'},
  {'id': 2, 'name': 'Ada Lovelace', 'number': '39-44-5323523'},
  {'id': 3, 'name': 'Dan Abramov', 'number': '12-43-234345'},
  {'id': 4, 'name': 'Mary Poppendieck', 'number': '39-23-6423122'}
];

const generateId =
    () => {
      return Math.floor(Math.random() * 999999);
    }

const getInfo = () => {
  return `Phonebook has info for ${persons.length} people<br>${
      new Date(Date.now()).toUTCString()}`;
};

app.get('/api/persons', (request, response) => {
  response.json(persons);
});
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
})
app.get('/info', (request, response) => {response.send(getInfo())})
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter(p => p.id !== id);

  response.status(204).end();
})
app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!(body.name && body.number)) {
    response.status(400).json({error: 'name and/or number missing'})
    return;
  }

  if (persons.find(p => body.name === p.name)) {
    response.status(400).json({error: 'name must be unique'})
    return;
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons.push(person);

  response.json(person);
})

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})