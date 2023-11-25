var express = require('express');
var app = express();
var indexRouter = require('./routes/index');
var publicRouter = require('./routes/public');
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user')
var jwt = require('./lib/jwt')
var cto = require('./lib/cto')


app.use('/', indexRouter);
app.use('/resources/public', publicRouter);

app.use('/user', (req, res, next) => {
    if (req.path == '/login') {
        next()
    } else {
        jwt.verify(req.headers.authorization, (result) => {
            if (result.status == 200) {
                req.result = result.data
                next()
            } else {
                res.status(401).send(result)
            }
        })
    }
}, userRouter)

app.use('/resources/admin', (req, res, next) => {
    jwt.verify(req.headers.authorization, (result) => {
        if (result.status == 200) {
            req.result = result.data
            if (req.result.id_role == 1) {
                next()
            }
            else {
                cto.e401(res, { message: "permission denied" })
            }
        } else {
            res.status(401).send(result)
        }
    })
},adminRouter);



module.exports = app;