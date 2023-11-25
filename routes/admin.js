var express = require('express')
var app = express()
var db = require('../lib/db')
var cto = require('../lib/cto')
const fs = require('fs')
var iconv = require('iconv-lite')
const e = require('express')
const { count } = require('console')



app.post('/upload/csv', (req, res) => {
    if (req.files[0].mimetype != 'text/csv') {
        fs.unlink(req.files[0].path, (err) => {
            if (err) throw err;
            console.log('successfully deleted ' + req.files[0].path);
        }
        )
        model.error422(res)
    }
    else {
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
    console.log(req.body)
    db.updatestaff(req.body, (result) => {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.delete('/staff/delete', (req, res) => {
    console.log(req.body)
    db.delstaff(req.body, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

module.exports = app;