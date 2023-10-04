const { verify } = require('jsonwebtoken');
require('dotenv').config()
const { Client } = require('pg')
// const client = new Client({
//     user: 'nattawutroj',
//     host: '49.228.122.246',
//     database: 'SPITech',
//     password: 'Namespace@1',
//     port: 5432
// })

var client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true'
});

client.connect(function (err) {
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USERNAME:', process.env.DB_USERNAME);
    if (err) throw err;
    console.log('Connected!?')
})

function login(username, password, callback) {
    client.query(`SELECT id_staff, initials, id_name_title, first_name_th, last_name_th, first_name_en, last_name_en, phone, address, email, id_role
	FROM "Staff" WHERE username = '${username}' AND password = '${password}'`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function loginstd(username, password, callback) {
    client.query(`SELECT id_student,student_code, id_name_title, first_name_th, last_name_th, first_name_en, last_name_en, phone, address, email, major_code, course_code
    FROM "Student" WHERE student_code = '${username}' AND password = '${password}'`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}


function handleCrudOperation(req, res, resourceName, dbFunction) {
    console.log(dbFunction)
    dbFunction(resourceName, req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    });
}

function get(table, callback) {
    client.query(`SELECT * FROM "${table}"`, (err, result) => {
        if (err) callback(422)
        if (result.rows.length != 0) {
            console.log(Object.keys(result.rows[0]))
            let string = `SELECT * FROM "${table}" `
            console.log("1")
            const tableNames = [
                {
                    "faculty_code": "Faculty",
                    "department_code": "Department",
                    "major_code": "Major",
                    "id_role": "Role",
                    "course_code": "Course",
                    "id_name_title": "Name_Title",
                    "id_semester": "Semester",
                    "id_staff": "Staff",
                    "id_student": "Student",
                    "id_project": "Project",
                    "id_project_status_title": "Project_Status_Title",
                    "id_status_document": "Status_Document",
                    "id_project_staff_position": "Project_Staff_Position",
                    "id_room": "Room",
                    "id_test_category": "Test_Category",
                    "id_download_lib": "Download_Library",
                    "id_log_project": "Log_Project",
                    "id_news": "News",
                    "id_project_document": "Project_Document",
                    "id_document_autofill": "Document_Autofill",
                    "id_project_member": "Project_Member",
                    "id_project_os_staff": "Project_OS_Staff",
                    "id_project_staff": "Project_Staff",
                    "id_project_status": "Project_Status",
                    "id_schedule": "Schedule"
                }
            ];
            Object.keys(result.rows[0]).forEach((key) => {
                if ((key == 'id_staff' || key == 'id_name_title' || key == 'id_role' || key == 'major_code' || key == 'department_code' || key == 'faculty_code') && table != tableNames[0][key]) {
                    string += `LEFT JOIN "${tableNames[0][key]}" ON "${tableNames[0][key]}".${key} = "${table}".${key} `
                }
            })
            console.log(string)
            client.query(string, (err, result) => {
                if (err) callback(422)
                callback(result.rows)
            })
        }
        else {
            callback(result.rows)
        }
    })
}

function post(table, data, callback) {
    console.log(Object.keys(data).length)
    if (Object.keys(data).length == 1) {
        client.query(`INSERT INTO public."${table}"(${(Object.keys(data))[0]}) 
        VALUES ('${data[Object.keys(data)]}')`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 2) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]}
        ) 
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 3) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 4) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 5) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 6) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 7) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 8) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 9) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]},
            ${(Object.keys(data))[8]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}',
            '${data[(Object.keys(data))[8]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 10) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]},
            ${(Object.keys(data))[8]},
            ${(Object.keys(data))[9]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}',
            '${data[(Object.keys(data))[8]]}',
            '${data[(Object.keys(data))[9]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 11) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]},
            ${(Object.keys(data))[8]},
            ${(Object.keys(data))[9]},
            ${(Object.keys(data))[10]}
        )
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}',
            '${data[(Object.keys(data))[8]]}',
            '${data[(Object.keys(data))[9]]}',
            '${data[(Object.keys(data))[10]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 12) {
        console.log(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]},
            ${(Object.keys(data))[8]},
            ${(Object.keys(data))[9]},
            ${(Object.keys(data))[10]},
            ${(Object.keys(data))[11]}
        ) 
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}',
            '${data[(Object.keys(data))[8]]}',
            '${data[(Object.keys(data))[9]]}',
            '${data[(Object.keys(data))[10]]}',
            '${data[(Object.keys(data))[11]]}'
        )`)
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]},
            ${(Object.keys(data))[8]},
            ${(Object.keys(data))[9]},
            ${(Object.keys(data))[10]},
            ${(Object.keys(data))[11]}
        ) 
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}',
            '${data[(Object.keys(data))[8]]}',
            '${data[(Object.keys(data))[9]]}',
            '${data[(Object.keys(data))[10]]}',
            '${data[(Object.keys(data))[11]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 13) {
        client.query(`INSERT INTO public."${table}"(
            ${(Object.keys(data))[0]},
            ${(Object.keys(data))[1]},
            ${(Object.keys(data))[2]},
            ${(Object.keys(data))[3]},
            ${(Object.keys(data))[4]},
            ${(Object.keys(data))[5]},
            ${(Object.keys(data))[6]},
            ${(Object.keys(data))[7]},
            ${(Object.keys(data))[8]},
            ${(Object.keys(data))[9]},
            ${(Object.keys(data))[10]},
            ${(Object.keys(data))[11]},
            ${(Object.keys(data))[12]}
        ) 
        VALUES (
            '${data[(Object.keys(data))[0]]}',
            '${data[(Object.keys(data))[1]]}',
            '${data[(Object.keys(data))[2]]}',
            '${data[(Object.keys(data))[3]]}',
            '${data[(Object.keys(data))[4]]}',
            '${data[(Object.keys(data))[5]]}',
            '${data[(Object.keys(data))[6]]}',
            '${data[(Object.keys(data))[7]]}',
            '${data[(Object.keys(data))[8]]}',
            '${data[(Object.keys(data))[9]]}',
            '${data[(Object.keys(data))[10]]}',
            '${data[(Object.keys(data))[11]]}',
            '${data[(Object.keys(data))[12]]}'
        )`, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    }
}

function del(table, data, callback) {
    client.query(`DELETE FROM public."${table}" WHERE ${(Object.keys(data))[0]} = ${data[Object.keys(data)]}`, (err, result) => {
        if (err) callback(422)
        else get(table, (result) => {
            callback(result)
        })
    })
}

function update(table, data, callback) {
    if (Object.keys(data).length == 2) {
        client.query(`UPDATE public."${table}" SET ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}' WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}`, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 3) {
        console.log(`UPDATE public."${table}" SET 
        ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
        ${(Object.keys(data))[2]} = ${data[(Object.keys(data))[2]]}
    WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
    `)
        client.query(`UPDATE public."${table}" SET 
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 4) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 5) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 6) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 7) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 8) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 9) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
            ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 10) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
            ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
            ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 11) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
            ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
            ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
            ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 12) {
        client.query(`UPDATE public."${table}" SET
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
            ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
            ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
            ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}',
            ${(Object.keys(data))[11]} = '${data[(Object.keys(data))[11]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else {
                get(table, (result) => {
                    callback(result)
                })
            }
        })
    } else if (Object.keys(data).length == 13) {
        client.query(`UPDATE public."${table}" SET 
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
            ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
            ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
            ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}',
            ${(Object.keys(data))[11]} = '${data[(Object.keys(data))[11]]}',
            ${(Object.keys(data))[12]} = '${data[(Object.keys(data))[12]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    } else if (Object.keys(data).length == 14) {
        client.query(`UPDATE public."${table}" SET 
            ${(Object.keys(data))[1]} = '${data[(Object.keys(data))[1]]}',
            ${(Object.keys(data))[2]} = '${data[(Object.keys(data))[2]]}',
            ${(Object.keys(data))[3]} = '${data[(Object.keys(data))[3]]}',
            ${(Object.keys(data))[4]} = '${data[(Object.keys(data))[4]]}',
            ${(Object.keys(data))[5]} = '${data[(Object.keys(data))[5]]}',
            ${(Object.keys(data))[6]} = '${data[(Object.keys(data))[6]]}',
            ${(Object.keys(data))[7]} = '${data[(Object.keys(data))[7]]}',
            ${(Object.keys(data))[8]} = '${data[(Object.keys(data))[8]]}',
            ${(Object.keys(data))[9]} = '${data[(Object.keys(data))[9]]}',
            ${(Object.keys(data))[10]} = '${data[(Object.keys(data))[10]]}',
            ${(Object.keys(data))[11]} = '${data[(Object.keys(data))[11]]}',
            ${(Object.keys(data))[12]} = '${data[(Object.keys(data))[12]]}',
            ${(Object.keys(data))[13]} = '${data[(Object.keys(data))[13]]}'
        WHERE ${(Object.keys(data))[0]} = ${data[(Object.keys(data))[0]]}
        `, (err, result) => {
            if (err) callback(422)
            else get(table, (result) => {
                callback(result)
            })
        })
    }
}

function project_init(data, callback) {
    var id_project_gen = ''
    client.query(`SELECT * FROM public."Semester" ORDER BY id_semester DESC LIMIT 1`, (err, result) => {
        if (err) callback(422)
        console.log(result.rows)
        var year = result.rows[0].year.toString().substr(2, 2)
        id_project_gen += year
        var semester = result.rows[0].semester
        id_project_gen += semester
        data.semester = result.rows[0]
        client.query(`SELECT COUNT(*) FROM public."Project" WHERE CAST(id_project AS TEXT) LIKE '66%'`, (err, result) => {
            if (err) callback(422)
            var count = parseInt(result.rows[0].count) + 1
            var count_str = count.toString().padStart(6, '0')
            id_project_gen += count_str
            client.query(`INSERT INTO public."Project" (
                id_project,
                project_title_th,
                project_title_en,
                case_study_title_th,
                case_study_title_en,
                id_semester
                )
                VALUES (
                    '${id_project_gen}',
                    '${data.body.project_title_th}',
                    '${data.body.project_title_en}',
                    '${data.body.case_study_title_th}',
                    '${data.body.case_study_title_en}',
                    '${data.semester.id_semester}'
                )`, (err, result) => {
                if (err) callback(422)
            }
            )
            client.query(`INSERT INTO public."Project_Member" (
                id_project,
                id_student
                )
                VALUES (
                    '${id_project_gen}',
                    '${data.verify.data.id_student}'
                )`, (err, result) => {
                if (err) callback(422)
            }
            )
            client.query(`SELECT * FROM public."Project" WHERE id_project = '${id_project_gen}'`, (err, result) => {
                if (err) callback(422)
                callback(result.rows[0])
            })
        })
    })
}

function project_join(data, callback) {
    client.query(`INSERT INTO public."Project_Member" (
        id_project,
        id_student
        )
        VALUES (
            '${data.body.id_project}',
            '${data.verify.data.id_student}'
        )`, (err, result) => {
        if (err) callback(422)
    }
    )
    client.query(`SELECT * FROM public."Project" WHERE id_project = '${data.body.id_project}'`, (err, result) => {
        if (err) callback(422)
        callback(result.rows[0])
    })
}

function project_info(data, callback) {
    data.info = [];

    // ดึงข้อมูลนักเรียนที่เข้าร่วมโครงการ
    client.query(
        `SELECT id_student, "Project_Member".id_project
       FROM public."Project_Member"
       INNER JOIN "Project" ON "Project".id_project = "Project_Member".id_project
       WHERE "Project_Member".id_student = ${data.verify.data.id_student}`,
        (err, result) => {
            if (err) {
                callback(422);
            } else {
                const projects = result.rows;
                let count = 0;
                if (projects.length === 0) {
                    callback(data.info);
                }

                // ดึงข้อมูลโครงการสำหรับแต่ละโครงการ
                projects.forEach((project) => {
                    client.query(
                        `SELECT *
               FROM public."Project_Member"
               INNER JOIN "Project" ON "Project".id_project = "Project_Member".id_project
			   INNER JOIN "Student" ON "Project_Member".id_student = "Student".id_student
               WHERE CAST("Project_Member".id_project AS TEXT) LIKE '${project.id_project}'`,
                        (err, result) => {
                            if (err) {
                                callback(422);
                            } else {
                                data.info.push(result.rows);
                                count++;
                                // เมื่อดึงข้อมูลทุกโครงการเสร็จสิ้น
                                if (count === projects.length) {
                                    callback(data.info);
                                }
                            }
                        }
                    );
                });
            }
        }
    );
}

function project_leave(data, callback) {
    client.query(`DELETE FROM public."Project_Member" WHERE id_project_member = '${data.body.id_project_member}'`, (err, result) => {
        if (err) callback(422)
        else project_info(data, (result) => {
            callback(result)
        })
    })
}

function changePasswordStd(data, callback) {
    console.log(data)
    client.query(`UPDATE public."Student" SET password = '${data.body.new_password}' WHERE id_student = ${data.verify.data.id_student}`, (err, result) => {
        if (err) callback(422)
        else callback(result)
    })
}

function changePasswordSaff(data, callback) {
    console.log(data)
    client.query(`UPDATE public."Staff" SET password = '${data.body.new_password}' WHERE id_staff = ${data.verify.data.id_staff}`, (err, result) => {
        if (err) callback(422)
        else callback(result)
    })
}

module.exports = {
    login: login,
    loginstd: loginstd,
    get: get,
    post: post,
    del: del,
    update: update,
    handleCrudOperation: handleCrudOperation,
    project_init: project_init,
    project_join: project_join,
    project_info: project_info,
    project_leave: project_leave,
    changePasswordStd: changePasswordStd,
    changePasswordSaff: changePasswordSaff
}