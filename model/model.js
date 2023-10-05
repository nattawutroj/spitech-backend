const jwt = require('./jwt')

function verify(req, res, next) {
    console.log(req.originalUrl, new Date(), req.ip); // log
    if (req.headers.authorization == null) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(req.headers.authorization, (result) => {
        if (result == 2) {
            return res.status(401).send('Unauthorized');
        }
        req.data = result;
        next();
    })
}

function permission(req, res, next) {
    if (req.data.data.id_role == 1) {
        next();
    } else if (req.data.data.id_role == 2) {
        if (req.method == 'GET') {
            next();
        } else {
            return res.status(401).send('Unauthorized');
        }
    } else {
        return res.status(401).send('Unauthorized');
    }
}

function error422(res) {
    return res.status(422).send('Unprocessable Entity');
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
    verify : verify,
    resourceNames : resourceNames,
    error422 : error422,
    handleCrudOperation : handleCrudOperation
}