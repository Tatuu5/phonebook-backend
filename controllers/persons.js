const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/info', (request, response, next) => {

    Person.countDocuments({})
      .then(amount => {
        const currentTime = Date()
        response.send(`<div>Phonebook has info for ${amount} people</div>
                      <br>
                      <div>${currentTime}</div>`)
      })
      .catch(error => next(error))
  })
  
  
personsRouter.get('/:id', (request, response, next) => {
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
  
  
  
personsRouter.delete('/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
      .then(() => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })
  
personsRouter.get('/', (request, response, next) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
      .catch(error => next(error))
})
  
  
personsRouter.post('/', (request, response, next) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({
        error: 'name or number missing'
    })
    }
  
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
  
personsRouter.put('/:id', (request, response, next) => {
    const { name, number } = request.body
  
  
  
    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
        console.log(updatedPerson)
      })
      .catch(error => next(error))
})



module.exports = personsRouter