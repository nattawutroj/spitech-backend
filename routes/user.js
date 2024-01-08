var express = require('express');
var app = express();
var db = require('../lib/db')
var jwt = require('../lib/jwt')
var cyp = require('../lib/crypto')
var cto = require('../lib/cto')

app.post('/login', (req, res) => {
    console.log(req.body)
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
                                id_role: "11"
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
    try {
        req.body.new_password = cyp.encode(req.body.new_password)
        if (Object.keys(req.result)[0] == 'id_student') {
            db.changePasswordStd(req, (result) => {
                result == 422 ? cto.e422(res) : cto.o200(res, { password: "Change password success" })
            })
        }
        else if (Object.keys(req.result)[0] == 'id_staff') {
            db.changePasswordSaff(req, (result) => {
                result == 422 ? cto.e422(res) : cto.o200(res, { password: "Change password success" })
            })
        }
    } catch (err) {
        cto.e500(res)
    }
})

app.get('/profile', (req, res) => {
    console.log(req)
    cto.o200(res, req.result)
})

app.put('/profile', (req, res) => {
    console.log(req.body)
    db.updatestudent(req.body, (result) => {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.post('/build', (req, res) => {
    db.selectSemester((result) => {
        db.projectCodeBuild(result[0].id_semester, (rowCount) => {
            debug(rowCount)
            var projectCode = result[0].year[2] + result[0].year[3] + result[0].semester + (rowCount + 1).pad(5)
            var build = {
                id_project: projectCode,
                project_title_th: req.body.project_title_th,
                project_title_en: req.body.project_title_en,
                project_study_title_th: req.body.project_study_title_th,
                project_study_title_en: req.body.project_study_title_en,
                id_semester: result[0].id_semester,
                id_student: req.result.id_student
            }
            debug(build)
            db.projectBuild(build, (result) => {
                debug(result)
                result == 422 ? cto.e422(res) : cto.o200(res)
            })
        })

    })
})

app.post('/join', (req, res) => {
    var build = {
        id_project: req.body.id_project,
        id_student: req.result.id_student
    }
    db.projectJoin(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : result == 400 ? cto.e400(res) : cto.o200(res)
    })
})

app.get('/join', (req, res) => {
    var build = {
        id_project: req.body.id_project,
        id_student: req.result.id_student
    }
    db.projectCheck(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : result == 400 ? cto.e400(res) : cto.o200(res,result.rows)
    })
})
module.exports = app;

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

function debug(x) {
    console.log("\n:::::::::::::::::::::::: {{ DEBUG }} :::::::::::::::::::::::: ")
    console.log(x)
    console.log("::::::::::::::::::::::::: {{ END }} ::::::::::::::::::::::::: \n")
}