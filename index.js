require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();

const Person = require('./models/person');
const person = require('./models/person');

app.use(express.static('dist'));
app.use(express.json());
morgan.token('data', (req) => JSON.stringify(req['body']));
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :data'));

const generateId =
    () => {
      return Math.floor(Math.random() * 999999);
    }

const getInfo = () => {
  // return `Phonebook has info for ${persons.length} people<br>${
  //     new Date(Date.now()).toUTCString()}`;
};

app.get(
    '/api/persons', (request, response) => {Person.find({}).then(persons => {
                      response.json(persons);
                    })});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  Person.findById(id).then(p => {
    if (p) {
      response.send(p);
    } else {
      response.status(404).end();
    }
  });
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

  // if (persons.find(p => body.name === p.name)) {
  //   response.status(400).json({error: 'name must be unique'})
  //   return;
  // }

  const person = new Person({name: body.name, number: body.number})
  person.save().then(result => {
    response.json(person);
  });
})

const PORT = process.env.PORT;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)})