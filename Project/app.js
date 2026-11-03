var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//for db file
var db=require('./config/connection')
//for files
var fileUpload = require('express-fileupload');

//hbs
var hbs  = require('express-handlebars');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();
var session = require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//layout setup
app.engine('hbs',hbs.engine({
  extname:'hbs',
  defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/',
  helpers:{
    inc:(n)=>n+1,
    eq:(a,b)=>String(a)===String(b),
    concat:(...args)=>args.slice(0,-1).join(''),
    money:(n)=>'₹'+(Number(n)||0).toFixed(2),
    date:(d)=>d?new Date(d).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'',
    statusClass:(s)=>({placed:'primary',shipped:'info',delivered:'success',cancelled:'secondary'})[s]||'light'
  }
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:process.env.SESSION_SECRET||'dev-only-change-me',
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:24*60*60*1000}
}))
app.use(fileUpload({limits:{fileSize:5*1024*1024}}));
db.connect()
  .then(()=>console.log('database connected'))
  .catch((err)=>console.log('connection error '+err))
app.use('/', userRouter);
app.use('/admin', adminRouter);

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
