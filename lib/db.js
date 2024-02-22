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

function updateboss(data, callback) {
    var command = `UPDATE public."Boss" SET id_staff = ${data.id_staff} WHERE id_boss = 1`
    console.log(command)
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })

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
    var command1 = `INSERT INTO public."Project"(id_project, project_title_th, project_title_en, case_study_title_th, case_study_title_en, id_semester, subject_code) VALUES (${build.id_project}, '${build.project_title_th}', '${build.project_title_en}', '${build.project_study_title_th}', '${build.project_study_title_en}', ${build.id_semester}, '${build.subject_code}');`
    var command2 = `INSERT INTO public."Project_Member"(id_project, id_student) VALUES (${build.id_project}, ${build.id_student}); INSERT INTO public."Project_Status"(id_project, id_project_status_title) VALUES (${build.id_project}, 0); INSERT INTO public."Log_Project"(id_project, detail, id_student) VALUES (${build.id_project}, 'Project Build', ${build.id_student});`
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

function updateproject(build, callback) {
    var command = `UPDATE public."Project" SET project_title_th='${build.project_title_th}', project_title_en='${build.project_title_en}', case_study_title_th='${build.project_study_title_th}', case_study_title_en='${build.project_study_title_en}' , subject_code='${build.subject_code}'  WHERE id_project = '${build.id_project}';`
    console.log(command)
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    }
    )
}

function projectJoin(build, callback) {
    var command1 = `SELECT id_project_member, id_project, id_student FROM public."Project_Member" WHERE id_project = '${build.id_project}' and id_student = ${build.id_student}`
    var command2 = `INSERT INTO public."Project_Member"(id_project, id_student) VALUES (${build.id_project}, ${build.id_student}); INSERT INTO public."Log_Project"(id_project, detail, id_student) VALUES (${build.id_project}, 'Join Project', ${build.id_student});`
    client.query(command1, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            console.log(result)
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

function projectLeave(build, callback) {
    var command1 = `SELECT id_project_member, id_project, id_student FROM public."Project_Member" WHERE id_project = '${build.id_project}' and id_student = ${build.id_student}`
    var command2 = `DELETE FROM public."Project_Member" WHERE id_project = '${build.id_project}' and id_student = ${build.id_student}; INSERT INTO public."Log_Project"(id_project, detail, id_student) VALUES (${build.id_project}, 'Leave Project', ${build.id_student});`
    client.query(command1, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            if (result.rowCount == 0) {
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
        s.last_name_th,
        st.*,
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
    JOIN
        public."Project_Status" st on st.id_project = p.id_project
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

function projectInfo(build, callback) {
    var command = `
    SELECT 
	pm.id_project_member,
	pm.id_project,
	pm.id_student,
	p.*,
	ps.*,
	pst.*,
	s.*
	FROM public."Project_Member" pm
JOIN public."Project" p ON pm.id_project = p.id_project
JOIN public."Project_Status" ps ON pm.id_project = ps.id_project 
JOIN public."Project_Status_Title" pst ON ps.id_project_status_title = pst.id_project_status_title
JOIN public."Semester" s ON p.id_semester = s.id_semester
WHERE pm.id_student = '${build.id_student}'
`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result.rows)
        }
    }
    )
}

function getStaffUser(callback) {
    client.query(`SELECT 
    ss.id_staff,
    ss.initials,
    ss.id_name_title,
    ss.first_name_th,
    ss.last_name_th,
    ss.first_name_en,
    ss.last_name_en,
    ss.phone,
    ss.email,
    ss.id_role,
    nt.*
        FROM public."Staff" ss
        join public."Name_Title" nt on ss.id_name_title = nt.id_name_title;`, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    })
}

function postStaffOS(build, callback) {
    command = `INSERT INTO public."Project_OS_Staff"(
        id_project, id_project_staff_position, id_name_title, first_name_th, last_name_th, first_name_en, last_name_en, phone, email)
        VALUES (${build.id_project}, 4, ${build.id_name_title}, '${build.first_name_th}', '${build.last_name_th}', '${build.first_name_en}', '${build.last_name_en}', '${build.phone}', '${build.email}');`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    }
    )
    console.log(command)
}

async function asyncgetstaff(build) {
    const command = `
        SELECT 
            pi.id_project_staff,
            pi.id_project,
            pi.id_staff,
            pi.id_project_staff_position,
            pd.id_name_title,
            pd.first_name_th,
            pd.last_name_th,
            nt.*,
            ps.*
        FROM public."Project_Staff" pi
        JOIN public."Staff" pd ON pi.id_staff = pd.id_staff
        JOIN public."Name_Title" nt ON pd.id_name_title = nt.id_name_title
        JOIN public."Project_Staff_Position" ps ON pi.id_project_staff_position = ps.id_project_staff_position
        WHERE pi.id_project = $1`;

    try {
        const result = await client.query(command, [build.id_project]);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new Error(422); // You can customize the error handling here
    }
}

async function asyncgetstaffos(build) {
    const command2 = `
        SELECT 
            os.id_project_os_staff,
            os.id_project,
            os.id_project_staff_position,
            os.id_name_title,
            os.first_name_th,
            os.last_name_th,
            os.first_name_en,
            os.last_name_en,
            os.phone,
            os.email,
            ps.*,
            nt.*
        FROM public."Project_OS_Staff" os
        JOIN public."Project_Staff_Position" ps ON os.id_project_staff_position = ps.id_project_staff_position
        JOIN public."Name_Title" nt ON os.id_name_title = nt.id_name_title
        WHERE os.id_project = $1`;

    try {
        const result = await client.query(command2, [build.id_project]);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new Error(422); // You can customize the error handling here
    }
}

function getprojectstaff(build, callback) {
    data = [
        {
            staff: [],
            os_staff: []
        }
    ]
    var command = `SELECT 
	pi.id_project_staff,
	pi.id_project,
	pi.id_staff,
	pi.id_project_staff_position,
	pd.id_name_title,
	pd.first_name_th,
	pd.last_name_th,
	nt.*,
	ps.*
	FROM public."Project_Staff" pi
	JOIN public."Staff" pd on pi.id_staff = pd.id_staff
	JOIN public."Name_Title" nt on pd.id_name_title = nt.id_name_title
	JOIN public."Project_Staff_Position" ps on pi.id_project_staff_position = ps.id_project_staff_position
		WHERE pi.id_project = '${build.id_project}'`

    var command2 = `SELECT 
    os.id_project_os_staff,
    os.id_project,
    os.id_project_staff_position,
    os.id_name_title,
    os.first_name_th,
    os.last_name_th,
    os.first_name_en,
    os.last_name_en,
    os.phone,
    os.email,
    ps.*,
    nt.*
        FROM public."Project_OS_Staff" os
        JOIN public."Project_Staff_Position" ps ON os.id_project_staff_position = ps.id_project_staff_position
        JOIN public."Name_Title" nt on os.id_name_title = nt.id_name_title
        WHERE os.id_project = '${build.id_project}'`

    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            // console.log(result)
            result.rows.forEach((element) => {
                if (element.id_project_staff_position == 1) {
                    data[0].staff.push(element)
                }
                else if (element.id_project_staff_position == 2) {
                    data[0].staff.push(element)
                }
                else if (element.id_project_staff_position == 3) {
                    data[0].staff.push(element)
                }
                else if (element.id_project_staff_position == 4) {
                    data[0].staff.push(element)
                }
            })
            client.query(command2, (err, result) => {
                console.log(err)
                if (typeof result == 'undefined') {
                    callback(422)
                } else {
                    result.rows.forEach((element) => {
                        if (element.id_project_staff_position == 4) {
                            data[0].os_staff.push(element)
                        }
                    })
                    callback(data)
                }
            })
        }
    })
}

function poststaff(build, callback) {
    var command = `INSERT INTO public."Project_Staff"(
        id_project, id_staff, id_project_staff_position)
        VALUES (${build.id_project}, ${build.id_staff}, ${build.id_project_staff_position});`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    }
    )
}

function delstaffos(build, callback) {
    var command = `DELETE FROM public."Project_OS_Staff" WHERE id_project_os_staff = ${build.id_project_os_staff};`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    }
    )
}

function delstaff(build, callback) {
    var command = `DELETE FROM public."Project_Staff" WHERE id_project_staff = ${build.id_project_staff};`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    }
    )
}

function updatestatusproject(build, callback) {
    var command = `UPDATE public."Project_Status"
	SET id_project_status_title=${build.id_project_status_title}
	WHERE id_project_status=${build.id_project_status};`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    }
    )
}

function postfilepath(build, callback) {
    var command = `INSERT INTO public."Project_File_Paths"(id_project, path, staus_code)
    VALUES ('${build.id_project}', '${build.file_path}',21);`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    })
}

function getfilepath(build, callback) {
    var command = `SELECT 
	pf.*,
	sc.*
FROM public."Project_File_Paths" pf
JOIN public."Project_Status_Title" sc ON pf.staus_code = sc.id_project_status_title
WHERE pf.id_project = '${build.id_project}'
ORDER BY id_project_file_path DESC;`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            callback(result.rows)
        }
    })
}

function provefilepath(build, callback) {
    var command = `UPDATE public."Project_File_Paths"
    SET staus_code=${build.staus_code}, comment='${build.comment}'
    WHERE id_project_file_path=${build.id_project_file_paths};UPDATE public."Project_Status"
	SET id_project_status_title=${build.id_project_status_title}
	WHERE id_project_status=${build.id_project_status};`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        } else {
            console.log(result)
            callback(result.rows)
        }
    }
    )
}

function getreqreport(build, callback) {
    console.log(build)
    var command = `SELECT 
    r.*,
    rp.*,
    rst.*,
    h.project_status_name_title as doc_status_name_title
FROM public."Project_File_Paths" r
JOIN public."Project_Status" rp ON r.id_project = rp.id_project
JOIN public."Project_Status_Title" rst ON rp.id_project_status_title = rst.id_project_status_title
JOIN public."Project_Status_Title" as h ON r.staus_code = h.id_project_status_title
WHERE r.staus_code = ${build.status_code};`
    console.log(command)
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(422)
        }
        else {
            callback(result.rows)
        }
    })
}

function projectinfomation(build, callback) {
    console.log(build)
    var command = `SELECT a.*,b.*,c.* FROM Public."Project" a JOIN public."Subject" b on a.subject_code = b.subject_code JOIN public."Semester" c ON a.id_semester = c.id_semester WHERE id_project = '${build.id_project}';`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            if (result.rowCount == 0) {
                callback(400)
            }
            else {
                callback(result.rows)
            }
        }
    })
}


function projectmeberinfomation(build, callback) {
    var command = `SELECT
    pm.id_project_member,
        pm.id_project,
        pm.id_student,
        s.student_code,
        s.first_name_th,
        s.last_name_th,
        s.id_name_title,
		s.course_code,
		s.phone,
		s.address,
        st.*,
        p.*,
        ps.*,
        nt.*,
		cd.*
    FROM
        public."Project_Member" pm
    JOIN
        public."Student" s ON pm.id_student = s.id_student
    JOIN
        public."Project" p ON pm.id_project = p.id_project
    JOIN
        public."Semester" ps on ps.id_semester = p.id_semester
    JOIN
        public."Project_Status" st on st.id_project = p.id_project
    JOIN
        public."Name_Title" nt on s.id_name_title = nt.id_name_title
	JOIN
		public."Course" cd on s.course_code = cd.course_code
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

function getprojectstatustitle(build, callback) {
    var command = `SELECT 
    ps.*,
    pst.*
    FROM Public."Project_Status" ps
    join Public."Project_Status_Title" pst on ps.id_project_status_title = pst.id_project_status_title
    WHERE ps.id_project = '${build.id_project}';`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            if (result.rowCount == 0) {
                callback(400)
            }
            else {
                callback(result.rows)
            }
        }
    }
    )
}

function Projectadminprocess(build, callback) {
    var command = `SELECT DISTINCT ON (pm.id_project)
    pm.id_project_member,
    pm.id_project,
    pm.id_student,
    s.student_code,
    s.first_name_th,
    s.last_name_th,
    st.*,
    p.*,
    ps.*
FROM
    public."Project_Member" pm
JOIN
    public."Student" s ON pm.id_student = s.id_student
JOIN
    public."Project" p ON pm.id_project = p.id_project
JOIN
    public."Semester" ps ON ps.id_semester = p.id_semester
JOIN
    public."Project_Status" st ON st.id_project = p.id_project
WHERE
    st.id_project_status_title = ${build.project_process}
;`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            console.log(result)
            if (result.rowCount == 0) {
                callback(400)
            }
            else {
                callback(result)
            }
        }
    })
}

function projectfilelast(build, callback) {
    var command = `
    SELECT * FROM public."Project_File_Paths"
WHERE id_project = '${build.id_project}'
ORDER BY id_project_file_path DESC limit 1
`;
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    })
}

function getroom(build, callback) {
    command = `SELECT * FROM public."Room"
    ORDER BY id_room ASC `;
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    })
}

function reseveroom(build, callback) {
    command = `INSERT INTO public."Schedule"(
        id_project, id_test_category, id_room, slot, date)
        VALUES (${build.id_project}, ${build.id_test_catagory}, ${build.id_room}, ${build.slot}, '${build.date}');`
    console.log(command)
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    })
}

function roomchecker(build, callback) {
    command = `
    SELECT 
	sc.*,
	stf.*,
	stfd.first_name_th,
	stfd.last_name_th,
	pjn.*
FROM public."Schedule" sc
JOIN public."Project_Staff" stf ON sc.id_project = stf.id_project
JOIN public."Staff" stfd ON stf.id_staff = stfd.id_staff
JOIN public."Project" pjn ON sc.id_project = pjn.id_project
WHERE id_room = ${build.id_room} and slot = ${build.slot} and date = '${build.date}'`
    client.query(command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(result)
        }
        else {
            callback(result.rows)
        }
    })
}

function pgs(build, callback) {
    command = `SELECT 
	sc.*,
	stf.*,
	stfd.first_name_th,
	stfd.last_name_th,
	pjn.*
FROM public."Schedule" sc
JOIN public."Project_Staff" stf ON sc.id_project = stf.id_project
JOIN public."Staff" stfd ON stf.id_staff = stfd.id_staff
JOIN public."Project" pjn ON sc.id_project = pjn.id_project
WHERE stf.id_staff IN (
	SELECT id_staff FROM public."Project_Staff"
	WHERE id_project = '${build.id_project}'
) and slot = ${build.slot} and date = '${build.date}'`;
    client.query
        (command, (err, result) => {
            if (typeof result == 'undefined') {
                callback(err)
            }
            else {
                callback(result.rows)
            }
        })
}

function getroomschedule(build, callback) {
    command = `SELECT aa.*,bb.* FROM public."Schedule" aa JOIN public."Room" bb ON aa.id_room = bb.id_room WHERE id_project = '${build.id_project}' and id_test_category = ${build.id_test_category}`;
    console.log(command)
    client.query
        (command, (err, result) => {
            if (typeof result == 'undefined') {
                callback(err)
            }
            else {
                callback(result.rows)
            }
        })
}

function delsch(build, callback) {
    command = `DELETE FROM public."Schedule" WHERE id_schedule = ${build.id_schedule}`;
    client.query
        (command, (err, result) => {
            if (typeof result == 'undefined') {
                callback(err)
            }
            else {
                callback(result.rows)
            }
        }
        )
}

function recordexam(build, callback) {
    command = `INSERT INTO public."Exam_Record"(
        id_test_category, status_exam, comment_exam, id_project)
        VALUES (${build.id_test_catagory}, '${build.status_exam}', '${build.comment_exam}', '${build.id_project}');`
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    }
    )
}


function delschaa(id_project, callback) {
    command = `DELETE FROM public."Schedule"
	WHERE id_project = '${id_project}'`;
    client.query
        (command, (err, result) => {
            if (typeof result == 'undefined') {
                callback(err)
            }
            else {
                callback(result.rows)
            }
        }
        )
}

function delschcan(id_project, callback) {
    command = `DELETE FROM public."Project_Staff"
	WHERE id_project = '${id_project}' and id_project_staff_position = 2 or id_project_staff_position = 3`;
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    }
    )
}

function getboss(callback) {
    command = `SELECT
	q.*,
	w.*,
	r.*
FROM public."Boss" q
JOIN public."Staff" w ON q.id_staff = w.id_staff
JOIN public."Name_Title" r ON w.id_name_title = r.id_name_title
    ORDER BY id_boss DESC LIMIT 1
    `;
    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    }
    )
}

function getsubject(callback) {
    command = `SELECT * FROM public."Subject"`;
    client.query
        (command, (err, result) => {
            if (typeof result == 'undefined') {
                callback(err)
            }
            else {
                callback(result.rows)
            }
        }
        )
}

function getsemeter(callback) {
    command = `SELECT * FROM public."Semester"
    ORDER BY id_semester DESC limit 1`;
    client.query
        (command, (err, result) => {
            if (typeof result == 'undefined') {
                callback(err)
            }
            else {
                callback(result.rows)
            }
        }
        )
}

function postsemester(build, callback) {
    command = `INSERT INTO public."Semester"(semester, year) VALUES (${build.semester},${build.year})`;
    client.query (command, (err, result) => {
        console.log(err)
        if (typeof result == 'undefined') {
            callback(err)
        }
        else {
            callback(result.rows)
        }
    
    })
}


function getnametitle(callback) {
    client.query(`SELECT * FROM "Name_Title"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function nametitlepost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Name_Title"(`
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


function updatenametitle(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Name_Title" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE id_name_title = '${data.id_name_title}'`

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

function delnametitle(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Name_Title" WHERE id_name_title = '${data.id_name_title}'`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}


function getsubjecta(callback) {
    client.query(`SELECT * FROM "Subject"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function subjectpost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Subject"(`
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


function updatesubject(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Subject" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE subject_code = '${data.subject_code}'`

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

function delsubject(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Subject" WHERE subject_code = '${data.subject_code}'`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}


function getcoursea(callback) {
    client.query(`SELECT * FROM "Course"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function coursepost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Course"(`
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


function updatecourse(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Course" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE course_code = '${data.course_code}'`

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

function delcourse(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Course" WHERE course_code = '${data.course_code}'`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}


function getmajora(callback) {
    client.query(`SELECT * FROM "Major"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function majorpost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Major"(`
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


function updatemajor(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Major" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE major_code = '${data.major_code}'`

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

function delmajor(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Major" WHERE major_code = '${data.major_code}'`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}



function getnewsa(callback) {
    client.query(`SELECT * FROM "News"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function newspost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."News"(`
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


function updatenews(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."News" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE id_news = '${data.id_news}'`

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

function delnews(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."News" WHERE id_news = '${data.id_news}'`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}


function getrooma(callback) {
    client.query(`SELECT * FROM "Room"`, (err, result) => {
        if (err) callback(422)
        callback(result.rows)
    })
}

function roompost(data, callback) {
    for (var key in data) {
        if (data[key] == '' || data[key] == -1) {
            delete data[key]
        }
    }
    var command = `INSERT INTO public."Room"(`
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


function updateroom(data, callback) {
    // ตัดข้อมูลที่เป็น '' ออก
    for (var key in data) {
        if (data[key] == '') {
            delete data[key]
        }
    }
    // ทำการสร้างคำสั่ง update โดยใช้ข้อมูลจาก data ที่ส่งมา
    var command = `UPDATE public."Room" SET `
    for (var key in data) {
        if (data[key] == -1) {
            command += `${key} = NULL,`
        } else {
            command += `${key} = '${data[key]}',`
        }
    }
    command = command.substring(0, command.length - 1)
    command += ` WHERE id_room = '${data.id_room}'`

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

function delroom(data, callback) {
    console.log(data)
    var command = `DELETE FROM public."Room" WHERE id_room = ${data.id_room}`

    client.query(command, (err, result) => {
        if (typeof result == 'undefined') {
            callback(err)
        } else {
            callback(result)
        }
    })
}


module.exports = {
    login: login,
    delroom: delroom,
    updateroom: updateroom,
    roompost: roompost,
    getrooma: getrooma,
    delnews:delnews,
    updatenews:updatenews,
    newspost:newspost,
    getnewsa:getnewsa,
    delmajor: delmajor,
    updatemajor: updatemajor,
    majorpost: majorpost,
    getmajora: getmajora,
    getcoursea:getcoursea,
    coursepost:coursepost,
    updatecourse:updatecourse,
    delcourse:delcourse,
    getsubjecta:getsubjecta,
    subjectpost:subjectpost,
    updatesubject:updatesubject,
    delsubject:delsubject,
    getnametitle:getnametitle,
    nametitlepost:nametitlepost,
    updatenametitle:updatenametitle,
    delnametitle:delnametitle,
    postsemester:postsemester,
    updateboss:updateboss,
    getsemeter:getsemeter,
    getsubject: getsubject,
    asyncgetstaff: asyncgetstaff,
    asyncgetstaffos: asyncgetstaffos,
    getboss: getboss,
    pgs: pgs,
    delsch: delsch,
    delschcan: delschcan,
    recordexam: recordexam,
    delschaa: delschaa,
    getroomschedule: getroomschedule,
    getroom: getroom,
    roomchecker: roomchecker,
    reseveroom: reseveroom,
    projectfilelast: projectfilelast,
    Projectadminprocess: Projectadminprocess,
    getprojectstatustitle: getprojectstatustitle,
    projectmeberinfomation: projectmeberinfomation,
    projectinfomation: projectinfomation,
    getreqreport: getreqreport,
    provefilepath: provefilepath,
    getfilepath: getfilepath,
    postfilepath: postfilepath,
    updateproject: updateproject,
    updatestatusproject: updatestatusproject,
    delstaff, delstaff,
    delstaffos: delstaffos,
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
    projectCheck: projectCheck,
    projectLeave: projectLeave,
    projectInfo: projectInfo,
    getStaffUser: getStaffUser,
    postStaffOS: postStaffOS,
    getprojectstaff: getprojectstaff,
    poststaff: poststaff

}