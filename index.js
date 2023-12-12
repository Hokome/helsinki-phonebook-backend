require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();

const Person = require('./models/person');

app.use(express.static('dist'));
app.use(express.json());
morgan.token('data', (req) => JSON.stringify(req['body']));
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :data'));

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
};
const errorHandler = (err, req, res, next) => {
  console.log(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted ID' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};

// const generateId =
//     () => {
//       return Math.floor(Math.random() * 999999);
//     }

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  Person.findById(id)
    .then(p => {
      if (p) {
        res.send(p);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});
app.get('/info', (req, res) => Person.countDocuments({}).then(result => {
  res.send(`Phonebook has info for ${result} people<br>${
    new Date(Date.now()).toUTCString()}`);
}));
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
});
app.put('/api/persons/:id', (req, res) => {
  const body = req.body;
  const id = req.params.id;

  const person = { name: body.name, number: body.number };

  Person.findByIdAndUpdate(id, person,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(err => next(err));
});
app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  const person = new Person({ name: body.name, number: body.number });
  person.save().then(() => {
    res.json(person);
  }).catch(err => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});