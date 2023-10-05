var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
var multer = require('multer')
const cyp = require('./model/crypto')
const model = require('./model/model')
const db = require('./model/db')
const jwt = require('./model/jwt')
const swaggerUi = require("swagger-ui-express");
const YAML = require('yamljs');
var exp = require('constants')
const swaggerDocument = YAML.load(path.join(__dirname, './model/api-src.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

var upload = multer()

app.use(upload.array())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use('/login', (req, res, next) => {
  db.login(req.body.user, req.body.password, (result) => {
      if(result.length == 1){
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
              if(result.length == 1){
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
                  next()
              }
          })
      }
  })
})

app.post('/login', (req, res, next) =>{
  db.login(req.body.user, cyp.encode(req.body.password), (result) => {
      if(result.length == 1){
          res.json(
              {
                  token: jwt.gen(result[0]),
                  data: result[0]
              }
          )
      } else {
          db.loginstd(req.body.user, cyp.encode(req.body.password), (result) => {
              if(result.length == 1){
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
})

app.put('/login/change', (req, res, next) => {
  jwt.verify(req.headers.authorization, (result) => {
      req.verify = result
      req.body.new_password = cyp.encode(req.body.new_password)
      if(Object.keys(req.verify.data)[0] == 'id_student') {
          db.changePasswordStd(req, (result) => {
              result == 422 ? model.error422(res) : res.json(result)
          })
      }
      else if(Object.keys(req.verify.data)[0] == 'id_staff') {
          db.changePasswordSaff(req, (result) => {
              result == 422 ? model.error422(res) : res.json(result)
          })
      }
  })
})

app.post('/resources/project/init', (req, res) => {
  jwt.verify(req.headers.authorization, (result) => {
      req.verify = result
      db.project_init(req, (result) => {
          result == 422 ? model.error422(res) : res.json(result)
      })
  })
})
app.post('/resources/project/join', (req, res) => {
  jwt.verify(req.headers.authorization, (result) => {
      req.verify = result
      db.project_join(req, (result) => {
          result == 422 ? model.error422(res) : res.json(result)
      })
  })
})
app.get('/resources/project/info', (req, res) => {
  jwt.verify(req.headers.authorization, (result) => {
      req.verify = result
      db.project_info(req, (result) => {
          result == 422 ? model.error422(res) : res.json(result)
      })
  })
})

app.delete('/resources/project/leave', (req, res) => {
  jwt.verify(req.headers.authorization, (result) => {
      req.verify = result
      db.project_leave(req, (result) => {
          result == 422 ? model.error422(res) : res.json(result)
      })
  })
})


model.resourceNames.forEach((resourceName) => {
  app.use(`/${resourceName.toLowerCase()}`, model.verify)

  app.get(`/${resourceName.toLowerCase()}`, (req, res) => {
      console.log(resourceName + ' get')
      db.get(resourceName, (result) => {
          result == 422 ? model.error422(res) : res.json(result)
      });
  });

  app.post(`/${resourceName.toLowerCase()}`, (req, res) => {
      model.handleCrudOperation(req, res, resourceName, db.post);
  });

  app.put(`/${resourceName.toLowerCase()}`, (req, res) => {
      model.handleCrudOperation(req, res, resourceName, db.update);
  });

  app.delete(`/${resourceName.toLowerCase()}`, (req, res) => {
      console.log(resourceName + ' delete' + req.body)
      model.handleCrudOperation(req, res, resourceName, db.del);
  });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
