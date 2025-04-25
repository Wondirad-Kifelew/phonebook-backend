require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

app.use(express.json()) //json parser middleware
morgan.token('body', req => JSON.stringify(req.body)) //create a custom :body token
//morgan middleware to log the request object
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.use(express.static('dist'))

// app.get("/", (request, response) => {
//   response.send("<h1>Hellp</h1>");
// });
app.get('/api/persons', (request, response) => {
  Person.find({}).then((contacts) => {
    response.json(contacts)
    console.log(JSON.stringify(contacts)) //print the result
  })
})
app.get('/api/info', (request, response) => {
  Person.countDocuments({}).then((count) => {
    response.send(
      `Phonebook has info for ${count} people  <br> 
          ${new Date()}`
    )
    console.log('count: ', count)
  })
})
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id) //exist or give null if person with id isnt in the db
    .then((contact) => {
      if (contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((delPerson) => {
      if (!delPerson) {
        response.status(404).end()
      }
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  //might get delated since there is a mongoose validator
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'person name or number missing!',
    })
  }
  Person.find({}).then((persons) => {
    const names = persons.map((p) => p.name.toLocaleLowerCase()) //arr of names
    if (names.includes(body.name.toLocaleLowerCase())) {
      return response.status(400).json({
        error: `${body.name} already exists in the phone book`,
      })
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person
      .save()
      .then((savedPerson) => {
        response.json(savedPerson)
      })
      .catch((error) => next(error))
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((contact) => {
      if (!contact) {
        response.status(404).end()
      }
      contact.name = name
      contact.number = number
      //we dont need validations if we use .save()
      return contact.save().then((updatedNote) => response.json(updatedNote))
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log('Error message: ', error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ errorMsgToFrontEnd: error.message })
  }
  next(error)
}
app.use(errorHandler)

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})
