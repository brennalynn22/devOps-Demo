const express = require('express')
const app = express()
const path = require('path')

// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
//new instance of the class
//usually should hide access 
var rollbar = new Rollbar({
  accessToken: 'faaf314bfab54bfc871774be3e1999f7',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
// rollbar.log('Hello world!')

app.use(express.json())
const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.info("Students was requested", students)
    res.status(200).send(students)
})

app.post("/api/students", (req, res) => {
    let { name } = req.body;

    const index = students.findIndex((student) => {
        return student === name;
    });

    try {
        if (index === -1 && name !== "") {
            students.push(name);

            rollbar.info("A new student was created", name)

            res.status(200).send(students);
        } else if (name === "") {
            rollbar.error("A student was posted without a name")

            res.status(400).send("You must enter a name.");
        } else {
            rollbar.critical("A student that already exists was posted", name)

            res.status(400).send("That student already exists.");
        }
    } catch (err) {
        console.log(err);
    }
});

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.use(rollbar.errorHandler())//middleware could be added anywhere


app.listen(port, () => console.log(`Server listening on ${port}`))
