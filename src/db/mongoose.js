const log = console.log

const mongoose = require('mongoose')

const databaseName = 'task-manager-api'
const connectionURL = process.env.MONGODB_URL
mongoose.connect(connectionURL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true })





