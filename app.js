const config = require('./utils/config')
const express = require('express')
const app = express()
const morgan = require('morgan')
const personsRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })


app.use(express.static('dist'))
app.use(express.json())

morgan.token('postData', (request, response) => JSON.stringify(request.body))

app.use(morgan('tiny', {
    skip: (request, response) => request.method === 'POST'
}))
  
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData',
    { skip: (request, response) => request.method !== 'POST' }))


app.use('/api/persons', personsRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app