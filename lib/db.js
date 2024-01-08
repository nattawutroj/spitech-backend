require('dotenv').config()
const { Client } = require('pg')

var client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: true
});

client.connect(function (err) {
    if (err) throw err;
    console.log('Connected!?')
})

login = (username, password, callback) => {
    var command = `SELECT id_staff, initials, id_name_title, first_name_th, last_name_th, first_name_en, last_name_en, phone, address, email, id_role FROM "Staff" WHERE username = '${username}' AND password = '${password}'`
    client.query(command, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function loginstd(username, password, callback) {
    var command = `SELECT id_student,student_code, id_name_title, first_name_th, last_name_th, first_name_en, last_name_en, phone, address, email, major_code, course_code FROM "Student" WHERE student_code = '${username}' AND password = '${password}'`
    client.query(command, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function preaddstudent(data, callback) {
    console.log(data)
    console.log("<<")
    var command = `SELECT student_code FROM "Student" WHERE student_code = '${data}'`
    client.query(command, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function addstudengroup(data, callback) {
    var command = `INSERT INTO public."Student"( student_code, first_name_th, last_name_th,course_code,password) VALUES ('${data.student_code}','${data.first_name_th}','${data.last_name_th}','${data.course_code}','${data.password}')`
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
    console.log(command)
}

function getstudent(callback) {
    client.query(`SELECT * FROM "Student"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function studenpost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Student"(`
    for (var key in data) {
        command += `${key},`
    }
    command = command.substring(0, command.length - 1)
    command += `) VALUES (`
    for (var key in data) {
        command += `'${data[key]}',`
    }
    command = command.substring(0, command.length - 1)
    command += `)`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}


function updatestudent(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Student" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE student_code = '${data.student_code}'`

    // ทำการ update ข้อมูล
    console.log(command)
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })

}

function delstudent(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Student" WHERE id_student = '${data.id_student}'`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}

function getname_title(callback) {
    client.query(`SELECT * FROM "Name_Title"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}


function getmajor(callback) {
    client.query(`SELECT * FROM "Major"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function getcourse(callback) {
    client.query(`SELECT * FROM "Course"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function changePasswordStd(data, callback) {
    client.query(`UPDATE public."Student" SET password = '${data.body.new_password}' WHERE id_student = ${data.result.id_student}`, (err, result) => {
        if (err) callback(422)
        else callback(result)
    })
}

function changePasswordSaff(data, callback) {
    client.query(`UPDATE public."Staff" SET password = '${data.body.new_password}' WHERE id_staff = ${data.result.id_staff}`, (err, result) => {
        if (err) callback(422)
        else callback(result)
    })
}

function handleCrudOperation(req, res, resourceName, dbFunction) {
    console.log(dbFunction)
    dbFunction(resourceName, req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    });
}

function getstaff(callback) {
    client.query(`SELECT * FROM "Staff"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function getrole(callback) {
    client.query(`SELECT * FROM "Role"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function staffpost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Staff"(`
    for (var key in data) {
        command += `${key},`
    }
    command = command.substring(0, command.length - 1)
    command += `) VALUES (`
    for (var key in data) {
        command += `'${data[key]}',`
    }
    command = command.substring(0, command.length - 1)
    command += `)`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    }
    )
}

function updatestaff(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Staff" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE id_staff = '${data.id_staff}'`

    // ทำการ update ข้อมูล
    console.log(command)
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })

}

function delstaff(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Staff" WHERE id_staff = '${data.id_staff}'`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}

function projectBuild(build, callback) {
    var command1 = `INSERT INTO public."Project"(id_project, project_title_th, project_title_en, case_study_title_th, case_study_title_en, id_semester) VALUES (${build.id_project}, '${build.project_title_th}', '${build.project_title_en}', '${build.project_study_title_th}', '${build.project_study_title_en}', ${build.id_semester});`
    var command2 = `INSERT INTO public."Project_Member"(id_project, id_student) VALUES (${build.id_project}, ${build.id_student});`
    console.log(command1)
    client.query(command1, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            client.query(command2, (err, result) => {
                console.log(err)
                if (typeof result == 'undefined') {
                    callback(err)
                } else {
                    callback(result)
                }
            })
        }
    })
}

function projectJoin(build, callback) {
    var command1 = `SELECT id_project_member, id_project, id_student FROM public."Project_Member" WHERE id_project = '${build.id_project}' and id_student = ${build.id_student}`
    var command2 = `INSERT INTO public."Project_Member"(id_project, id_student) VALUES (${build.id_project}, ${build.id_student});`
    client.query(command1, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            if (result.rowCount != 0) {
                callback(400)
            }
            else {
                client.query(command2, (err, result) => {
                    console.log(err)
                    if (typeof result == 'undefined') {
                        callback(422)
                    } else {
                        callback(result)
                    }
                })
            }
        }
    })
}

function projectCheck(build, callback) {
    var command = `SELECT
pm.id_project_member,
    pm.id_project,
    pm.id_student,
	s.student_code,
    s.first_name_th,
	s.last_name_en,
    p.*,
	ps.*
FROM
    public."Project_Member" pm
JOIN
    public."Student" s ON pm.id_student = s.id_student
JOIN
    public."Project" p ON pm.id_project = p.id_project
JOIN
	public."Semester" ps on ps.id_semester = p.id_semester
WHERE pm.id_project = '${build.id_project}'
;`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            if (result.rowCount == 0) {
                callback(400)
            }
            else {
                callback(result)
            }
        }
    })
}

function selectSemester(callback) {
    var command = `SELECT id_semester, semester, year FROM public."Semester" ORDER BY id_semester DESC LIMIT 1 `
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result.rows)
        }
    })
}

function projectCodeBuild(semester, callback) {
    var command = `SELECT * FROM public."Project" WHERE id_semester = ${semester} ORDER BY id_project`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result.rowCount)
        }
    })
}

module.exports = {
    login: login,
    loginstd: loginstd,
    changePasswordStd: changePasswordStd,
    changePasswordSaff: changePasswordSaff,
    handleCrudOperation: handleCrudOperation,
    preaddstudent: preaddstudent,
    addstudengroup: addstudengroup,
    studenpost: studenpost,
    getname_title: getname_title,
    getmajor: getmajor,
    getstudent: getstudent,
    getcourse: getcourse,
    updatestudent: updatestudent,
    getstaff: getstaff,
    getrole: getrole,
    staffpost: staffpost,
    updatestaff: updatestaff,
    delstaff: delstaff,
    delstudent: delstudent,
    selectSemester: selectSemester,
    projectCodeBuild: projectCodeBuild,
    projectBuild: projectBuild,
    projectJoin: projectJoin,
    projectCheck: projectCheck
}




// function get(table, callback) {
//     client.query(`SELECT * FROM "${table}"`, (err, result) => {
//         if (err) callback(422)
//         if (result.rows.length != 0) {
//             console.log(Object.keys(result.rows[0]))
//             let string = `SELECT * FROM "${table}" `
//             console.log("1")
//             const tableNames = [
//                 {
//                     "faculty_code": "Faculty",
//                     "department_code": "Department",
//                     "major_code": "Major",
//                     "id_role": "Role",
//                     "course_code": "Course",
//                     "id_name_title": "Name_Title",
//                     "id_semester": "Semester",
//                     "id_staff": "Staff",
//                     "id_student": "Student",
//                     "id_project": "Project",
//                     "id_project_status_title": "Project_Status_Title",
//                     "id_status_document": "Status_Document",
//                     "id_project_staff_position": "Project_Staff_Position",
//                     "id_room": "Room",
//                     "id_test_category": "Test_Category",
//                     "id_download_lib": "Download_Library",
//                     "id_log_project": "Log_Project",
//                     "id_news": "News",
//                     "id_project_document": "Project_Document",
//                     "id_document_autofill": "Document_Autofill",
//                     "id_project_member": "Project_Member",
//                     "id_project_os_staff": "Project_OS_Staff",
//                     "id_project_staff": "Project_Staff",
//                     "id_project_status": "Project_Status",
//                     "id_schedule": "Schedule"
//                 }
//             ];
//             Object.keys(result.rows[0]).forEach((key) => {
//                 if ((key == 'id_staff' || key == 'id_name_title' || key == 'id_role' || key == 'major_code' || key == 'department_code' || key == 'faculty_code') && table != tableNames[0][key]) {
//                     string += `LEFT JOIN "${tableNames[0][key]}" ON "${tableNames[0][key]}".${key} = "${table}".${key} `
//                 }
//             })
//             console.log(string)
//             client.query(string, (err, result) => {
//                 if (err) callback(422)
//                 callback(result.rows)
//             })
//         }
//         else {
//             callback(result.rows)
//         }
//     })
// }

// function post(table, data, callback) {
//     console.log(Object.keys(data).length)
//     if (Object.keys(data).length == 1) {
//         client.query(`INSERT INTO public."${table}"(${(Object.keys(data))[0]}) 
//         VALUES ('${data[Object.keys(data)]}')`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 2) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]}
//         ) 
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 3) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 4) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 5) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 6) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 7) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 8) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 9) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]},
//             ${(Object.keys(data))[8]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}',
//             '${data[(Object.keys(data))[8]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 10) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]},
//             ${(Object.keys(data))[8]},
//             ${(Object.keys(data))[9]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}',
//             '${data[(Object.keys(data))[8]]}',
//             '${data[(Object.keys(data))[9]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 11) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]},
//             ${(Object.keys(data))[8]},
//             ${(Object.keys(data))[9]},
//             ${(Object.keys(data))[10]}
//         )
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}',
//             '${data[(Object.keys(data))[8]]}',
//             '${data[(Object.keys(data))[9]]}',
//             '${data[(Object.keys(data))[10]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 12) {
//         console.log(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]},
//             ${(Object.keys(data))[8]},
//             ${(Object.keys(data))[9]},
//             ${(Object.keys(data))[10]},
//             ${(Object.keys(data))[11]}
//         ) 
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}',
//             '${data[(Object.keys(data))[8]]}',
//             '${data[(Object.keys(data))[9]]}',
//             '${data[(Object.keys(data))[10]]}',
//             '${data[(Object.keys(data))[11]]}'
//         )`)
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]},
//             ${(Object.keys(data))[8]},
//             ${(Object.keys(data))[9]},
//             ${(Object.keys(data))[10]},
//             ${(Object.keys(data))[11]}
//         ) 
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}',
//             '${data[(Object.keys(data))[8]]}',
//             '${data[(Object.keys(data))[9]]}',
//             '${data[(Object.keys(data))[10]]}',
//             '${data[(Object.keys(data))[11]]}'
//         )`, (err, result) => {
//             if (err) console.log(err)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 13) {
//         client.query(`INSERT INTO public."${table}"(
//             ${(Object.keys(data))[0]},
//             ${(Object.keys(data))[1]},
//             ${(Object.keys(data))[2]},
//             ${(Object.keys(data))[3]},
//             ${(Object.keys(data))[4]},
//             ${(Object.keys(data))[5]},
//             ${(Object.keys(data))[6]},
//             ${(Object.keys(data))[7]},
//             ${(Object.keys(data))[8]},
//             ${(Object.keys(data))[9]},
//             ${(Object.keys(data))[10]},
//             ${(Object.keys(data))[11]},
//             ${(Object.keys(data))[12]}
//         ) 
//         VALUES (
//             '${data[(Object.keys(data))[0]]}',
//             '${data[(Object.keys(data))[1]]}',
//             '${data[(Object.keys(data))[2]]}',
//             '${data[(Object.keys(data))[3]]}',
//             '${data[(Object.keys(data))[4]]}',
//             '${data[(Object.keys(data))[5]]}',
//             '${data[(Object.keys(data))[6]]}',
//             '${data[(Object.keys(data))[7]]}',
//             '${data[(Object.keys(data))[8]]}',
//             '${data[(Object.keys(data))[9]]}',
//             '${data[(Object.keys(data))[10]]}',
//             '${data[(Object.keys(data))[11]]}',
//             '${data[(Object.keys(data))[12]]}'
//         )`, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     }
// }

// function del(table, data, callback) {
//     client.query(`DELETE FROM public."${table}" WHERE ${(Object.keys(data))[0]} = ${data[Object.keys(data)]}`, (err, result) => {
//         if (err) callback(422)
//         else get(table, (result) => {
//             callback(result)
//         })
//     })
// }

// function update(table, data, callback) {
//     if (Object.keys(data).length == 2) {
//         client.query(`UPDATE public."${table}" SET ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}' WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}`, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 3) {
//         console.log(`UPDATE public."${table}" SET 
//         ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//         ${(Object.keys(data))[2]} = ${data[(Object.keys(data))[2]]}
//     WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//     `)
//         client.query(`UPDATE public."${table}" SET 
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 4) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 5) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 6) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 7) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 8) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 9) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
//             ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 10) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
//             ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
//             ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 11) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
//             ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
//             ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
//             ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 12) {
//         client.query(`UPDATE public."${table}" SET
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
//             ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
//             ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
//             ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}',
//             ${(Object.keys(data))[11]} = '${data[(Object.keys(data))[11]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else {
//                 get(table, (result) => {
//                     callback(result)
//                 })
//             }
//         })
//     } else if (Object.keys(data).length == 13) {
//         client.query(`UPDATE public."${table}" SET 
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
//             ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
//             ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
//             ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}',
//             ${(Object.keys(data))[11]} = '${data[(Object.keys(data))[11]]}',
//             ${(Object.keys(data))[12]} = '${data[(Object.keys(data))[12]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     } else if (Object.keys(data).length == 14) {
//         client.query(`UPDATE public."${table}" SET 
//             ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
//             ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
//             ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
//             ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
//             ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
//             ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
//             ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
//             ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
//             ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
//             ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}',
//             ${(Object.keys(data))[11]} = '${data[(Object.keys(data))[11]]}',
//             ${(Object.keys(data))[12]} = '${data[(Object.keys(data))[12]]}',
//             ${(Object.keys(data))[13]} = '${data[(Object.keys(data))[13]]}'
//         WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
//         `, (err, result) => {
//             if (err) callback(422)
//             else get(table, (result) => {
//                 callback(result)
//             })
//         })
//     }
// }