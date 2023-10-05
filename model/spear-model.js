const express = require('express')
const app = express()

var bodyParser = require('body-parser')

var multer = require('multer')

const db = require('./db')

const jwt = require('./jwt')

const port = 3000

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var upload = multer()

app.set('view engine', 'pug')
app.set('views', '.view')
app.use(upload.array())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.json('Hello World!')
})

function handleCrudOperation(req, res, resourceName, dbFunction) {
    dbFunction(resourceName, req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    });
}



function verify(req, res, next) {
    if (req.headers.authorization == null) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(req.headers.authorization, (result) => {
        if (result == 2) {
            return res.status(401).send('Unauthorized');
        }
        req.data = result;
        next();
    })
}

function permission(req, res, next) {
    if (req.data.data.id_role == 1) {
        next();
    } else if (req.data.data.id_role == 2) {
        if (req.method == 'GET') {
            next();
        } else {
            return res.status(401).send('Unauthorized');
        }
    } else {
        return res.status(401).send('Unauthorized');
    }
}

function error422(res) {
    return res.status(422).send('Unprocessable Entity');
}

app.get('/login', (req, res) => {
    db.login(req.body.user, req.body.password, (result) => {
        if (result.length == 1) {
            res.json({
                token : jwt.gen(result[0])
            })
        } else {
            res.status(401).send('login fail')
        }
    })
})

app.use('/role', verify, permission)
app.use('/course', verify, permission)
app.use('/name_title', verify, permission)
app.use('/staff', verify, permission)
app.use('/faculty', verify, permission)

app.get('/role', (req, res) => {
    db.get('Role', (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.post('/role', (req, res) => {
    db.post('Role', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.put('/role', (req, res) => {
    db.update('Role', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.delete('/role', (req, res) => {
    db.del('Role', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.get('/course', (req, res) => {
    db.get('Course', (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.post('/course', (req, res) => {
    db.post('Course', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.put('/course', (req, res) => {
    db.update('Course', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.delete('/course', (req, res) => {
    db.del('Course', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.get('/name_title', (req, res) =>{
    db.get('Name_Title',(result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.post('/name_title', (req, res) => {
    db.post('Name_Title', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.put('/name_title', (req, res) => {
    db.update('Name_Title', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.delete('/name_title', (req, res) => {
    db.del('Name_Title', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.get('/staff', (req, res) => {
    db.get('Staff', (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.post('/staff', (req, res) => {
    db.post('Staff', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.put('/staff', (req, res) => {
    db.update('Staff', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.delete('/staff', (req, res) => {
    db.del('Staff', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.get('/faculty', (req, res) => {
    db.get('Faculty', (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.post('/faculty', (req, res) => {
    db.post('Faculty', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.put('/faculty', (req, res) => {
    db.update('Faculty', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})

app.delete('/faculty', (req, res) => {
    db.del('Faculty', req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    })
})