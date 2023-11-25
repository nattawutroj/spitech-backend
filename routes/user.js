var express = require('express');
var app = express();
var db = require('../lib/db')
var jwt = require('../lib/jwt')
var cyp = require('../lib/crypto')
var cto = require('../lib/cto')

app.post('/login', (req, res) => {
    db.login(req.body.user, req.body.password, (result) => {
        if (result.length == 1) {
            res.json(
                {
                    token: jwt.gen(result[0]),
                    data: {
                        name: result[0].first_name_th,
                        surname: result[0].last_name_th,
                        id_role: "10"
                    }
                }
            )
        } else {
            db.loginstd(req.body.user, req.body.password, (result) => {
                if (result.length == 1) {
                    res.json(
                        {
                            token: jwt.gen(result[0]),
                            data: {
                                name: result[0].first_name_th,
                                surname: result[0].last_name_th,
                                id_role: "10"
                            }
                        }
                    )
                } else {
                    db.login(req.body.user, cyp.encode(req.body.password), (result) => {
                        if (result.length == 1) {
                            res.json(
                                {
                                    token: jwt.gen(result[0]),
                                    data: result[0]
                                }
                            )
                        } else {
                            db.loginstd(req.body.user, cyp.encode(req.body.password), (result) => {
                                if (result.length == 1) {
                                    res.json(
                                        {
                                            token: jwt.gen(result[0]),
                                            data: result[0]
                                        }
                                    )
                                } else {
                                    cto.e401login(res)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

app.put('/change', (req, res) => {
    try{
    req.body.new_password = cyp.encode(req.body.new_password)
        if (Object.keys(req.result)[0] == 'id_student') {
            db.changePasswordStd(req, (result) => {
                result == 422 ? cto.e422(res) : cto.o200(res, {password: "Change password success"})
            })
        }
        else if (Object.keys(req.result)[0] == 'id_staff') {
            db.changePasswordSaff(req, (result) => {
                result == 422 ? cto.e422(res) : cto.o200(res, {password: "Change password success"})
            })
        }
    } catch(err) {
        cto.e500(res)
    }
})

app.get('/profile', (req, res) => {
    console.log(req)
    cto.o200(res, req.result)
})
module.exports = app;