var express = require('express')
var app = express()
var db = require('../lib/db')
var cto = require('../lib/cto')
const fs = require('fs')
var iconv = require('iconv-lite')
const e = require('express')
const { count } = require('console')

async function generateschedule(start, end, id_room, id_project, res) {
    let data = [];
    let date = new Date(start);
    let enddate = new Date(end);

    while (date <= enddate) {
        if (date.getDay() !== 0 && date.getDay() !== 6) {
            const promises = [];

            for (let i = 0; i < 10; i++) {
                const build = {
                    id_project: id_project,
                    id_test_category: 1,
                    id_room: id_room,
                    slot: i,
                    date: date.toISOString().split('T')[0]
                };

                const roomcheckerPromise = new Promise(resolve => {
                    db.roomchecker(build, (results) => {
                        resolve(results);
                    });
                });

                const pgsPromise = new Promise(resolve => {
                    db.pgs(build, (resultsa) => {
                        resolve(resultsa);
                    });
                });

                promises.push(roomcheckerPromise, pgsPromise);
            }

            const results = await Promise.all(promises);

            for (let i = 0; i < results.length; i += 2) {
                const roomcheckerResults = results[i];
                const pgsResults = results[i + 1];

                if (roomcheckerResults[0] === undefined) {
                    data.push({
                        date: date.toISOString().split('T')[0],
                        slot: i / 2,
                        id_room: id_room,
                        condition: {
                            roomslot: 0,
                            teacherslot: (pgsResults[0] === undefined) ? 0 : pgsResults,
                        },
                        day: date.getDay()
                    });
                } else {
                    data.push({
                        date: date.toISOString().split('T')[0],
                        slot: i / 2,
                        id_room: id_room,
                        condition: {
                            roomslot: roomcheckerResults,
                            teacherslot: 0,
                        },
                        day: date.getDay()
                    });
                }
            }
        }
        date.setDate(date.getDate() + 1);
    }

    return data;
}



const checkslot = (data, slot) => {

}



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
    console.log(req.body)
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
    debug(req.query)
    build = {
        status_code: req.query.status_code,
    }
    db.getreqreport(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.get('/reqproject', (req, res) => {
    build = {
    }
    console.log("wwe11q")
    db.getreqproject(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.get('/reqproject/teacher', (req, res) => {
    build = {
        id_staff: req.query.id_staff,
    }
    db.getteacherreqproject(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})


app.get('/filehistory', (req, res) => {
    build = {
        id_project: req.query.id_project,
    }
    db.getfilehistory(build, (result) => {
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

// app.get('/projectinfomation/staff', (req, res) => {
//     build = {
//         id_project: req.query.id_project,
//     }
//     db.getprojectstaff(build, (result) => {
//         console.log(build)
//         console.log(result)
//         console.log(result[0].staff)
//         result == 422 ? cto.e422(res) : cto.o200(res, result)
//     }
//     )
// }
// )

app.get('/projectinfomation/staff', async (req, res) => {
    const build = {
        id_project: req.query.id_project,
    };

    try {
        const [staffResult, staffosResult] = await Promise.all([db.asyncgetstaff(build), db.asyncgetstaffos(build)]);
        console.log(staffResult, staffosResult);
        // Handle the results or send a response to the client
        cto.o200(res, [{ staff: staffResult, os_staff: staffosResult }]);
    } catch (error) {
        console.error(error);
        // Handle the error and send an appropriate response
        cto.e422(res);
    }
});


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

app.post('/reqreport/provere', (req, res) => { // API สำหรับยื่นสอบใหม่่ในช่วงเวลา

    if (req.body.id_project_status_title == 3 || req.body.id_project_status_title == 4 || req.body.id_project_status_title == 5 || req.body.id_project_status_title == 6) {
        var build = {
            id_project_status_title: 2,
            staus_code: 24,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    } else if (req.body.id_project_status_title == 8 || req.body.id_project_status_title == 9 || req.body.id_project_status_title == 10) {
        var build = {
            id_project_status_title: 7,
            staus_code: 24,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    } else if (req.body.id_project_status_title == 12 || req.body.id_project_status_title == 13 || req.body.id_project_status_title == 14) {
        var build = {
            id_project_status_title: 11,
            staus_code: 24,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    } else if (req.body.id_project_status_title == 28) {
        var build = {
            id_project_status_title: 27,
            staus_code: 24,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    }
    if (req.body.id_project_status_title == 4 || req.body.id_project_status_title == 5 || req.body.id_project_status_title == 6 || req.body.id_project_status_title == 9 || req.body.id_project_status_title == 10 || req.body.id_project_status_title == 13 || req.body.id_project_status_title == 14 || req.body.id_project_status_title == 28) {
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

app.post('/reqreport/prove', (req, res) => { // API สำหรับไม่ผ่าน

    if (req.body.id_project_status_title == 3 || req.body.id_project_status_title == 4 || req.body.id_project_status_title == 5 || req.body.id_project_status_title == 6) {
        var build = {
            id_project_status_title: 2,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    } else if (req.body.id_project_status_title == 8 || req.body.id_project_status_title == 9 || req.body.id_project_status_title == 10) {
        var build = {
            id_project_status_title: 7,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    } else if (req.body.id_project_status_title == 12 || req.body.id_project_status_title == 13 || req.body.id_project_status_title == 14) {
        var build = {
            id_project_status_title: 11,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    } else if (req.body.id_project_status_title == 28) {
        var build = {
            id_project_status_title: 27,
            staus_code: 18,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: req.body.comment
        }
    }
    if (req.body.id_project_status_title == 4 || req.body.id_project_status_title == 5 || req.body.id_project_status_title == 6 || req.body.id_project_status_title == 9 || req.body.id_project_status_title == 10 || req.body.id_project_status_title == 13 || req.body.id_project_status_title == 14 || req.body.id_project_status_title == 28) {
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

app.post('/reqreport/approve', (req, res) => {
    if (req.body.id_project_status_title == 3) {
        var build = {
            id_project_status_title: 4,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอแต่งตั้งกรรมการ'
        }
    } else if (req.body.id_project_status_title == 4) {
        var build = {
            id_project_status_title: 5,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอจัดวันสอบหัวข้อ'
        }
    } else if (req.body.id_project_status_title == 5) {
        var build = {
            id_project_status_title: 6,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอดำเนินการสอบตามตาราง'
        }
    } else if (req.body.id_project_status_title == 6) {
        var build = {
            id_project_status_title: 27,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'อัพโหลดส่ง ทก.01 ฉบับแก้ไข'
        }
        db.delschaa(req.body.id_project, (result) => {
            console.log("Delete Schedule")
        })
    } else if (req.body.id_project_status_title == 28) {
        var build = {
            id_project_status_title: 7,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'สำเร็จ'
        }
        db.delschaa(req.body.id_project, (result) => {
            console.log("Delete Schedule")
        })
    } else if (req.body.id_project_status_title == 8) {
        var build = {
            id_project_status_title: 9,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอจัดวันสอบหกสิบ'
        }
    }
    else if (req.body.id_project_status_title == 9) {
        var build = {
            id_project_status_title: 10,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอดำเนินการสอบตามตาราง'
        }
    }
    else if (req.body.id_project_status_title == 10) {
        var build = {
            id_project_status_title: 11,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'สำเร็จ'
        }
        db.delschaa(req.body.id_project, (result) => {
            console.log("Delete Schedule")
        })
    }
    else if (req.body.id_project_status_title == 12) {
        var build = {
            id_project_status_title: 13,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอจัดวันสอบร้อย'
        }
    }
    else if (req.body.id_project_status_title == 13) {
        var build = {
            id_project_status_title: 14,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'รอดำเนินการสอบตามตาราง'
        }
    }
    else if (req.body.id_project_status_title == 14) {
        var build = {
            id_project_status_title: 15,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'สำเร็จ'
        }
        db.delschaa(req.body.id_project, (result) => {
            console.log("Delete Schedule")
        })
    }
    else if (req.body.id_project_status_title == 15) {
        var build = {
            id_project_status_title: 17,
            staus_code: 25,
            id_project_file_paths: req.body.id_project_file_paths,
            id_project_status: req.body.id_project_status,
            comment: 'สำเร็จ'
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

app.get('/room', (req, res) => {
    db.getroom(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.post('/room/schedule', (req, res) => {
    console.log(req.body)
    if (req.body.id_test_catagory == 5) {
        var build = {
            id_project: req.body.id_project,
            id_test_catagory: 1,
            id_room: req.body.id_room,
            slot: req.body.slot,
            date: req.body.date
        }
    } else if (req.body.id_test_catagory == 9) {
        var build = {
            id_project: req.body.id_project,
            id_test_catagory: 2,
            id_room: req.body.id_room,
            slot: req.body.slot,
            date: req.body.date
        }
    }
    else if (req.body.id_test_catagory == 13) {
        var build = {
            id_project: req.body.id_project,
            id_test_catagory: 3,
            id_room: req.body.id_room,
            slot: req.body.slot,
            date: req.body.date
        }
    }
    console.log(build)
    db.reseveroom(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
})

app.get('/room/handle', (req, res) => {
    let slot = generateschedule(req.query.start, req.query.end, req.query.id_room, req.query.id_project)
    // promise
    slot.then((slot) => {
        res.status(200).send({ status: 'OK', code: 200, data: slot })
    })
})

app.get('/room/schedule', (req, res) => {
    debug(req.query)
    if (req.query.id_project_status_title == 5) {
        build = {
            id_project: req.query.id_project,
            id_test_category: 1
        }
    } else if (req.query.id_project_status_title == 9) {
        build = {
            id_project: req.query.id_project,
            id_test_category: 2
        }
    } else if (req.query.id_project_status_title == 13) {
        build = {
            id_project: req.query.id_project,
            id_test_category: 3
        }
    }
    // NOW FIX 20/02
    db.getroomschedule(build, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
})


app.delete('/room/schedule', (req, res) => {
    console.log(req.query)
    debug(req.query)
    build = {
        id_schedule: req.query.id_schedule,
    }
    db.delsch(build, (result) => {

        result == 422 ? cto.e422(res) : cto.o200(res, result)
    }
    )
})

app.put('/boss', (req, res) => {
    console.log(req.body)
    db.updateboss(req.body, (result) => {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})
app.get('/semester', (req, res) => {
    db.getsemeter((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
}
)

app.get('/aasemester', (req, res) => {
    db.aagetsemeter((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
}
)

app.post('/semester', (req, res) => {
    req.body.semester = parseInt(req.body.semester)
    req.body.year = parseInt(req.body.year)
    if (req.body.semester == 1 || req.body.semester == 2) {
        req.body.semester = req.body.semester + 1
    } else if (req.body.semester == 3) {
        req.body.year = req.body.year + 1
        req.body.semester = 1
    }
    req.body.semester = req.body.semester.toString()
    req.body.year = req.body.year.toString()
    db.postsemester(req.body, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})
module.exports = app;

app.post('/recordexam', (req, res) => {
    build = {
        id_project: req.body.id_project,
        id_test_category: req.body.id_test_category,
        status_exam: req.body.status_exam,
        comment_exam: req.body.comment_exam
    }
    console.log(req.body)
    db.recordexam(req.body, (result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    })
})

app.get('/nametitle', (req, res) => {
    db.getnametitle((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    });
})

app.post('/nametitle/add', (req, res) => {
db.nametitlepost(req.body, (result) => {
    if (typeof result.detail == 'undefined') {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    } else {
        res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
    }
})

})

app.put('/nametitle/edit', (req, res) => {
console.log(req.body)
db.updatenametitle(req.body, (result) => {
    console.log(result)
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
})

app.delete('/nametitle/delete', (req, res) => {
console.log(req.body)
db.delnametitle(req.body, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
}
)


app.get('/subject', (req, res) => {
    db.getsubjecta((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    });
})

app.post('/subject/add', (req, res) => {
db.subjectpost(req.body, (result) => {
    if (typeof result.detail == 'undefined') {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    } else {
        res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
    }
})

})

app.put('/subject/edit', (req, res) => {
console.log(req.body)
db.updatesubject(req.body, (result) => {
    console.log(result)
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
})

app.delete('/subject/delete', (req, res) => {
console.log(req.body)
db.delsubject(req.body, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
}
)


app.get('/course', (req, res) => {
    db.getcoursea((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    });
})

app.post('/course/add', (req, res) => {
db.coursepost(req.body, (result) => {
    if (typeof result.detail == 'undefined') {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    } else {
        res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
    }
})

})

app.put('/course/edit', (req, res) => {
console.log(req.body)
db.updatecourse(req.body, (result) => {
    console.log(result)
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
})

app.delete('/course/delete', (req, res) => {
console.log(req.body)
db.delcourse(req.body, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
}
)

app.get('/major', (req, res) => {
    db.getmajora((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    });
})

app.post('/major/add', (req, res) => {
db.majorpost(req.body, (result) => {
    if (typeof result.detail == 'undefined') {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    } else {
        res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
    }
})

})

app.put('/major/edit', (req, res) => {
console.log(req.body)
db.updatemajor(req.body, (result) => {
    console.log(result)
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
})

app.delete('/major/delete', (req, res) => {
console.log(req.body)
db.delmajor(req.body, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
}
)

app.get('/news', (req, res) => {
    db.getnewsa((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    });
})

app.post('/news/add', (req, res) => {
db.newspost(req.body, (result) => {
    if (typeof result.detail == 'undefined') {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    } else {
        res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
    }
})

})

app.put('/news/edit', (req, res) => {
console.log(req.body)
db.updatenews(req.body, (result) => {
    console.log(result)
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
})

app.delete('/news/delete', (req, res) => {
console.log(req.body)
db.delnews(req.body, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
}
)


app.get('/roomt', (req, res) => {
    db.getrooma((result) => {
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    });
})

app.post('/roomt/add', (req, res) => {
db.roompost(req.body, (result) => {
    if (typeof result.detail == 'undefined') {
        console.log(result)
        result == 422 ? cto.e422(res) : cto.o200(res, result)
    } else {
        res.status(422).send({ status: 'Something Worng', code: 422, action: 401 })
    }
})

})

app.put('/roomt/edit', (req, res) => {
console.log(req.body)
db.updateroom(req.body, (result) => {
    console.log(result)
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
})

app.delete('/roomt/delete', (req, res) => {
console.log(req.body)
db.delroom(req.body, (result) => {
    result == 422 ? cto.e422(res) : cto.o200(res, result)
})
}
)

function debug(x) {
    console.log("\n:::::::::::::::::::::::: {{ DEBUG }} :::::::::::::::::::::::: ")
    console.log(x)
    console.log("::::::::::::::::::::::::: {{ END }} ::::::::::::::::::::::::: \n")
}