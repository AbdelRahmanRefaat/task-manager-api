const log = console.log

const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()
const port = process.env.PORT || 3000




// this is used to parse incomming object via request to json file
app.use(express.json())
// set-up router files to start routing them
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    log(`Server is up on port ${port}`)
})


