function error422(res) {
    return res.status(422).send({status: 422, message: 'Unprocessable Entity'});
}

e500 = (res) => {
    return res.status(500).send({ status: 500, message: "Internal Server Error" })
}

e400 = (res) => {
    return res.status(401).send({ status: 400, message: "Bad Request" })
}

e401 = (res) => {
    return res.status(401).send({ status: 401, message: "Unauthorized" })
}

e401 = (res, data) => {
    return res.status(401).send({ status: 401, message: "Unauthorized", result: {data: data} })
}

e401login = (res) => {
    res.status(401).send({ status: 401, message: "Invalid username or password" , action: "tryAgain"})
}

status200 = (res) => {
    return res.status(200).send({ status: 200, message: "OK" })
}

status200 = (res, data) => {
    return res.status(200).send({ status: 200, message: "OK", result: data} )
}

const resourceNames = [
    'Role',
    'Course',
    'Name_Title',
    'Staff',
    'Faculty',
    'Department',
    'Major',
    'Semester',
    'Student',
    'Project',
    'Project_Status_Title',
    'Status_Document',
    'Project_Staff_Position',
    'Room',
    'Test_Catagory',
    'Download_Library',
    'Log_Project',
    'News',
    'Project_Document',
    'Project_Member',
    'Project_OS_Staff',
    'Project_Staff',
    'Project_Status',
    'Schedule',
    'Document_Autofill'
];

function handleCrudOperation(req, res, resourceName, dbFunction) {
    dbFunction(resourceName, req.body, (result) => {
        result == 422 ? error422(res) : res.json(result)
    });
}

module.exports = {
    e422: error422,
    e400: e400,
    o200: status200,
    e500: e500,
    e401: e401,
    e401login: e401login,
    handleCrudOperation: handleCrudOperation
}