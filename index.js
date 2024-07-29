require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')
app.use(express.static('dist'))
app.use(express.json())

morgan.token('postData', (req, res) => JSON.stringify(req.body))

app.use(morgan('tiny', {
  skip: (req, res) => req.method === 'POST'
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData',
   {skip: (request, response) => request.method !== 'POST'}))



/*
let people = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  },
]
*/

app.get('/info', (request, response, next) => {
    
    Person.countDocuments({})
      .then(amount => {
        const currentTime = Date()
        response.send(`<div>Phonebook has info for ${amount} people</div>
                    <br>
                    <div>${currentTime}</div>`)
                  })
      .catch(error => next(error))               
})


app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    
    Person.findById(id)
      .then(person => {
      if (person) {
          response.json(person)
      } else {
          response.status(404).end()
      }
      })
      .catch(error => next(error))
})



app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
  })
  

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    /*
    const nameExists = people.some(person => person.name === body.name)
    if (nameExists) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }
    */
    const person = new Person({
    name: body.name,
    number: body.number
    })
    
    person.save().then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      response.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
      console.log(updatedPerson)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)