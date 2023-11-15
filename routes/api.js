var express = require('express');
var router = express.Router();
var jwt = require('../model/jwt')
var db = require('../model/db')
var cyp = require('../model/crypto')
var model = require('../model/model')
var multer = require('multer')
const fs = require('fs')
const upload = multer({ dest: 'tem_file_upload/' })
router.use(upload.any())

router.post('/login', (req, res) => {
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
                                id_role: "10"
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
                                    res.status(401).send('login failed')
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.put('/login/change', (req, res, next) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        req.body.new_password = cyp.encode(req.body.new_password)
        if (Object.keys(req.verify.data)[0] == 'id_student') {
            db.changePasswordStd(req, (result) => {
                result == 422 ? model.error422(res) : res.status(200).send('OK')
            })
        }
        else if (Object.keys(req.verify.data)[0] == 'id_staff') {
            db.changePasswordSaff(req, (result) => {
                result == 422 ? model.error422(res) : res.status(200).send('OK')
            })
        }
    })
})



router.post('/resources/project/init', (req, res) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        db.project_init(req, (result) => {
            result == 422 ? model.error422(res) : res.status(200).send('OK')
        })
    })
})
router.post('/resources/project/join', (req, res) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        db.project_join(req, (result) => {
            result == 422 ? model.error422(res) : res.status(200).send('OK')
        })
    })
})
router.get('/resources/project/info', (req, res) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        db.project_info(req, (result) => {
            result == 422 ? model.error422(res) : res.status(200).send('OK')
        })
    })
})

router.delete('/resources/project/leave', (req, res) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        db.project_leave(req, (result) => {
            result == 422 ? model.error422(res) : res.status(200).send('OK')
        })
    })
})

router.post('/resources/news/upload', (req, res) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        // only jpg png file
        // only 1 file
        if (req.files[0].mimetype != 'image/jpeg' && req.files[0].mimetype != 'image/png') {
            fs.unlink(req.files[0].path, (err) => {
                if (err) throw err;
                console.log('successfully deleted ' + req.files[0].path);
            }
            )
            model.error422(res)
        }
        else {
            var oldPath = req.files[0].path;
            var newPath = 'public/upload/news/' + req.files[0].filename + req.files[0].originalname;
            console.log(req.files[0].filename)
            fs.rename(oldPath, newPath, function (err) {
                if (err) throw err
                console.log('Successfully renamed - AKA moved!')
            })
            res.status(200).send('upload success')
        }
    })
})

router.get('/checker/expired', (req, res) => {
    jwt.verify(req.headers.authorization, (result) => {
        req.verify = result
        if(req.verify == 2){
            res.status(401).send({status:'token expired',code:401})
        }
        else{
            res.send({status:'token ok',code:200,result})
        }
    })
    // console.log(req)
})


model.resourceNames.forEach((resourceName) => {
    router.use(`/${resourceName.toLowerCase()}`, model.verify)

    router.get(`/${resourceName.toLowerCase()}`, (req, res) => {
        console.log(resourceName + ' get')
        db.get(resourceName, (result) => {
            result == 422 ? model.error422(res) : res.status(200).send('OK')
        });
    });

    router.post(`/${resourceName.toLowerCase()}`, (req, res) => {
        model.handleCrudOperation(req, res, resourceName, db.post);
    });

    router.put(`/${resourceName.toLowerCase()}`, (req, res) => {
        model.handleCrudOperation(req, res, resourceName, db.update);
    });

    router.delete(`/${resourceName.toLowerCase()}`, (req, res) => {
        console.log(resourceName + ' delete' + req.body)
        model.handleCrudOperation(req, res, resourceName, db.del);
    });

});

module.exports = router;