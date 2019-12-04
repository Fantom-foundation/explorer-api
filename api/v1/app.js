let express = require('express');
let cors = require('cors');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let apiV1 = require('./routes/router');
let errors = require('../../mixins/errors');

require('../../db');

let app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1', apiV1);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next( errors.notFound );
});

// error handler
app.use(function(err, req, res, next) {

  const code = err.status || errors.internalServerError.status;
  const message = err.message || errors.internalServerError.message;
  const additional = err.additional;

  const errorInfo = {
    meta: {
      code,
      success: false,
      message,
    },
    data: {
      additional
    }
  };
  
  res.status(code).send(errorInfo);

});

module.exports = app;