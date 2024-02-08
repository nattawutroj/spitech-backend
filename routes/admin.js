var express = require('express')
var app = express()
var db = require('../lib/db')
var cto = require('../lib/cto')
const fs = require('fs')
var iconv = require('iconv-lite')
const e = require('express')
const { count } = require('console')



app.post('/upload/csv', (req, res) => {
    console.log(req.files[0])
    if (req.files[0].mimetype == 'text/csv') {
        var oldPath = req.files[0].path;
        console.log(oldPath)
        const csv = require('csv-parser');

        let results = []
        let data = []
        let value = []

        fs.createReadStream(oldPath)
            .pipe(iconv.decodeStream('874'))
            .pipe(csv({
                headers: false
            }))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                fs.unlink(req.files[0].path, (err) => {
                    if (err) throw err;
                    console.log('successfully deleted ' + req.files[0].path);
                })
                console.log(results.length)
                // ลบ '-' ออกจากข้อมูล
                results.forEach(element => {
                    for (var key in element) {
                        var l = 0
                        for (var t in element[key]) {
                            if (element[key][t] == '-') {
                                l = l + 1
                                element[key] = element[key].replace('-', '')
                            }
                        }
                        if (l >= 2) {
                            data.push(element)
                        }
                    }
                });
                console.log(data);
                async function check(elements) {
                    await Promise.all(elements.map(async (element) => {
                        return new Promise(resolve => {
                            db.preaddstudent(element[1], (results) => {
                                if (results[0] == undefined) {
                                    element[8] = false;
                                } else {
                                    element[8] = true;
                                }
                                value.push(element);
                                resolve();
                            });
                        });
                    }));
                }
                check(data).then(() => {
                    console.log(value)
                    res.status(200).send({ status: 'OK', code: 200, data })
                })
            });
    }
    else if (req.files[0].mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        var oldPath = req.files[0].path;
        console.log(oldPath)

        let data = []
        let value = []

        var XLSX = require('xlsx')
        var workbook = XLSX.readFile(oldPath);
        var sheet_name_list = workbook.SheetNames;
        var results = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        results.forEach(element => {
            var drop = false
            var l = 0
            for (var key in element) {
                for (var t in element[key]) {
                    if (element[key][t] == '-') {
                        l = l + 1
                        element[key] = element[key].replace('-', '')
                    }
                    else if (element[key][t] == ':' || element[key][t] == '/') {

                        console.log('found :  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
                        drop = true
                    }
                }
                console.log(l)
                console.log(drop)

            }
            if (l >= 2 && drop == false) {
                data.push({
                    '0': element['__EMPTY'],
                    '1': element['__EMPTY_2'],
                    '2': element['__EMPTY_4'],
                    '3': element['__EMPTY_5'],
                    '4': element['__EMPTY_8'],
                    '5': element['__EMPTY_10'],
                    '6': '',
                    '7': '',
                })
            }
            console.log('-----------------------------------')

        });

        fs.unlink(req.files[0].path, (err) => {
            if (err) throw err;
            console.log('successfully deleted ' + req.files[0].path);
        })
        console.log(data);
        async function check(elements) {
            await Promise.all(elements.map(async (element) => {
                return new Promise(resolve => {
                    db.preaddstudent(element[1], (results) => {
                        console.log(results)
                        if (results[0] == undefined) {
                            element[8] = false;
                        } else {
                            element[8] = true;
                        }
                        value.push(element);
                        resolve();
                    });
                });
            }));
        }
        check(data).then(() => {
            console.log(value)
            res.status(200).send({ status: 'OK', code: 200, data })
        })
    }
    else {
        fs.unlink(req.files[0].path, (err) => {
            if (err) throw err;
            console.log('successfully deleted ' + req.files[0].path);
        }
        )
        cto.e422(res)
    }

})

app.post('/student/grops', async (req, res) => {
    let data = []
    let errStatus = false
    async function check(elements) {
        console.log(elements)
        await Promise.all(elements.map(async (element) => {
            return new Promise(resolve => {
                db.preaddstudent(element.student_code, (results) => {
                    console.log(results)
                    if (results[0] == undefined) {
                        data.push(element)
                    } else {
                        console.log('data add already')
                    }
                    resolve();
                });
            });
        }));
    }

    async function postdata(elements) {
        await Promise.all(elements.map(async (element) => {
            return new Promise(resolve => {
                db.addstudengroup(element, (results) => {
                    if (results == 422) {
                        errStatus = true
                    }
                    resolve();
                })
            })
        }))
    }

    check(req.body).then(() => {
        postdata(data).then(() => {
            if (errStatus) {
                res.status(422).send({ status: 'Something Worng', code: 422, data: '' })
            } else {
                res.status(200).send({ status: 'OK', code: 200, data: '' })
            }
        })
    })
})


app.route('/student')
    .get((req, res) => {
        db.getstudent((result) => {
            result == 422 ? cto.e422(res) : cto.o200(res, result)
        });
    })

app.post('/student/add', (req, res) => {
    console.log(req.body)
    db.preaddstudent(req.body.student_code, (result) => {
        if (result[0] == undefined) {
            db.studenpost(req.body, (result) => {
                if (typeof result.detail == 'undefined') {
                    console.log(result)
                    result == 422 ? cto.e422(res) : cto.o200(res, result)
                } else {
                    res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
                }
            })
        } else {
            cto.e422(res)
        }
    })
})

app.put('/student/edit', (req, res) => {
    console.log(req.body)
    db.updatestudent(req.body, (result) => {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.delete('/student/delete', (req, res) => {
    console.log(req.body)
    db.delstudent(req.body, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
}
)

app.route('/staff')
    .get((req, res) => {
        db.getstaff((result) => {
            result == 422 ? cto.e422(res) : cto.o200(res, result)
        });
    })

app.post('/staff/add', (req, res) => {
    console.log(req.body)
    db.staffpost(req.body, (result) => {
        if (typeof result.detail == 'undefined') {
            console.log(result)
            result == 422 ? cto.e422(res) : cto.o200(res, result)
        } else {
            res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
        }
    })
})

app.put('/staff/edit', (req, res) => {
    db.updatestaff(req.body, (result) => {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.delete('/staff/delete', (req, res) => {
    db.delstaff(req.body, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.get('/reqreport', (req, res) => {
    build = {
        status_code: req.query.status_code,
    }
    db.getreqreport(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.get('/projectinfomation', (req, res) => {
    // to int
    build = {
        id_project: req.query.id_project,
    }
    db.projectinfomation(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
})

app.get('/projectinfomation/staff', (req, res) => {
    // console.log(req.query.id_project)
    // to int
    build = {
        id_project: req.query.id_project,
    }
    db.getprojectstaff(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
}
)

app.get('/projectinfomation/student', (req, res) => {
    build = {
        id_project: req.query.id_project,
    }
    db.projectmeberinfomation(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
})

app.get('/projectinfomation/status', (req, res) => {
    build = {
        id_project: req.query.id_project,
    }
    db.getprojectstatustitle(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
}
)

app.post('/reqreport/prove', (req, res) => {

    if (req.body.id_project_status_title == 3 || req.body.id_project_status_title == 4) {
        var build = {
            id_project_status_title: 2,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    }
    db.provefilepath(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
})

app.post('/reqreport/approve',(req,res) => {
    if (req.body.id_project_status_title == 3) {
        var build = {
            id_project_status_title: 4,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอแต่งตั้งกรรมการ'
        }
    } else     if (req.body.id_project_status_title == 4) {
        var build = {
            id_project_status_title: 5,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอจัดวันสอบหัวข้อแล้ว'
        }
    }
    db.provefilepath(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res)
    })
})

app.get('/projectadminprocess', (req, res) => {
    build = {
        project_process: req.query.project_process,
    }
    db.Projectadminprocess(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
}
)

app.get('/projectfilelast', (req, res) => {
    build = {
        id_project: req.query.id_project,
    }
    db.projectfilelast(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
})

module.exports = app;

function debug(x) {
    console.log("\n:::::::::::::::::::::::: {{ DEBUG }} :::::::::::::::::::::::: ")
    console.log(x)
    console.log("::::::::::::::::::::::::: {{ END }} ::::::::::::::::::::::::: \n")
}