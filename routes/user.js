var express = require('express');
var app = express();
var db = require('../lib/db')
var jwt = require('../lib/jwt')
var cyp = require('../lib/crypto')
var cto = require('../lib/cto')
const fs = require('fs')

app.post('/upload/pdf', (req, res) => {
    debug(req.body)
    console.log(req.files[0]);
    var oldPath = req.files[0].path;
    let results = [];
    let data = [];
    let value = [];
    // cut type in mimetype and then add to path


    var newPath = 'file/pdf/' + req.files[0].filename + '.pdf';

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            console.error('Error moving file:', err);
            // ไม่ควรใช้ throw เพราะจะทำให้แอปหยุดทำงาน
        } else {
            console.log('Successfully moved to ' + newPath);
            var build = {
                id_project: req.body.id_project,
                file_path: newPath
            }
            db.postfilepath(build, (result) => {

                if (req.body.id_project_status_title == 2 && req.body.testcat == 1) {
                    var builda = {
                        id_project_status_title: 3,
                        id_project_status: req.body.id_project_status
                    }
                    db.updatestatusproject(builda, (result) => {
                        debug(result)
                        result == 422 ? cto.e422(res) : cto.o200(res)
                    })
                } else if (req.body.id_project_status_title == 7 && req.body.testcat == 2) {
                    var builda = {
                        id_project_status_title: 8,
                        id_project_status: req.body.id_project_status
                    }
                    db.updatestatusproject(builda, (result) => {
                        debug(result)
                        result == 422 ? cto.e422(res) : cto.o200(res)
                    })
                } else if ((req.body.id_project_status_title == 7 && req.body.testcat == 3) || req.body.id_project_status_title == 11) {
                    var builda = {
                        id_project_status_title: 12,
                        id_project_status: req.body.id_project_status
                    }
                    db.updatestatusproject(builda, (result) => {
                        debug(result)
                        result == 422 ? cto.e422(res) : cto.o200(res)
                    })
                }
            })
        }
    });
});

app.post('/prove', (req, res) => {
    if (req.body.id_project_status_title == 3) {
        var build = {
            id_project_status_title: 2,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'ยกเลิกคำร้องโดยนักศึกษา'
        }
    } else if (req.body.id_project_status_title == 8) {
        var build = {
            id_project_status_title: 7,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'ยกเลิกคำร้องโดยนักศึกษา'
        }
    } else if (req.body.id_project_status_title == 12) {
        var build = {
            id_project_status_title: 11,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'ยกเลิกคำร้องโดยนักศึกษา'
        }
    }
    if (req.body.id_project_status_title == 4 || req.body.id_project_status_title == 5 || req.body.id_project_status_title == 6 || req.body.id_project_status_title == 9 || req.body.id_project_status_title == 10 || req.body.id_project_status_title == 13 || req.body.id_project_status_title == 14) {
        db.delschaa(req.body.id_project, (result) => {
            console.log("Delete Schedule")
        })
    }
    if (req.body.id_project_status_title == 4 || req.body.id_project_status_title == 5 || req.body.id_project_status_title == 6) {
        db.delschcan(req.body.id_project, (result) => {
            console.log("Delete Staff")
            console.log(result)
        })
    }
    db.provefilepath(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
})

app.get('/projectfilelist', (req, res) => {
    console.log(req.query)
    var build = {
        id_project: req.query.id_project,
    }
    db.getfilepath(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

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

app.get('/projectinfo', (req, res) => {
    var build = {
        id_student: req.result.id_student
    }
    db.projectInfo(build, (result) => {
        debug(result)
        cto.o200(res, result)
    })
})

app.post('/build', (req, res) => {
    db.selectSemester((result) => {
        db.projectCodeBuild(result[0].id_semester, (rowCount) => {
            debug(rowCount)
            var projectCode = result[0].year[2] + result[0].year[3] + result[0].semester + (rowCount + 1).pad(3)
            var build = {
                id_project: projectCode,
                project_title_th: req.body.project_title_th,
                project_title_en: req.body.project_title_en,
                project_study_title_th: req.body.project_study_title_th,
                project_study_title_en: req.body.project_study_title_en,
                id_semester: result[0].id_semester,
                id_student: req.result.id_student,
                subject_code: req.body.subject_code,
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

app.post('/checkjoin', (req, res) => {
    var build = {
        id_project: req.body.id_project,
        id_student: req.result.id_student
    }
    db.projectCheck(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : result == 400 ? cto.e400(res) : cto.o200(res, result.rows)
    })
})

app.delete('/join', (req, res) => {
    var build = {
        id_project: req.body.params.id_project,
        id_student: req.result.id_student
    }
    db.projectLeave(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : result == 400 ? cto.e400(res) : cto.o200(res)
    })
})

app.get('/stafflist', (req, res) => {
    console.log(req.body)
    db.getStaffUser((result) => {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.post('/staffos', (req, res) => {
    var build = {
        id_project: req.body.id_project,
        id_project_staff_position: req.body.id_project_staff_position,
        id_name_title: req.body.id_name_title,
        first_name_th: req.body.first_name_th,
        last_name_th: req.body.last_name_th,
        first_name_en: req.body.first_name_en,
        last_name_en: req.body.last_name_en,
        phone: req.body.phone,
        email: req.body.email
    }
    db.postStaffOS(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
})

app.post('/projectstafflist', (req, res) => {
    console.log(req.body)
    var build = {
        id_project: req.body.id_project,
    }
    db.getprojectstaff(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.post('/projectstaff', (req, res) => {
    var build = {
        id_project: req.body.id_project,
        id_project_staff_position: req.body.id_project_staff_position,
        id_staff: req.body.id_staff
    }
    db.poststaff(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
}
)

app.delete('/staffos', (req, res) => {
    var build = {
        id_project_os_staff: req.body.id_project_os_staff
    }
    db.delstaffos(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
}
)

app.delete('/projectstaff', (req, res) => {
    var build = {
        id_project_staff: req.body.id_project_staff
    }
    db.delstaff(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
}
)

app.post('/dummy', (req, res) => {
    debug(req)
    cto.o200(res)
})
app.delete('/dummy', (req, res) => {
    debug(req.body.params.id_project)
    cto.o200(res)
})

app.put('/initalcomfirm', (req, res) => {
    var build = {
        id_project_status_title: 2,
        id_project_status: req.body.id_project_status
    }
    db.updatestatusproject(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
})

app.put('/build', (req, res) => {
    debug(req.body)
    var build = {
        id_project: req.body.id_project,
        project_title_th: req.body.project_title_th,
        project_title_en: req.body.project_title_en,
        project_study_title_th: req.body.case_study_title_th,
        project_study_title_en: req.body.case_study_title_en,
        subject_code: req.body.subject_code,
    }
    db.updateproject(build, (result) => {
        debug(result)
        result == 422 ? cto.e422(res) : cto.o200(res)
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