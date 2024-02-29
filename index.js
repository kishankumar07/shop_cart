let express=require('express');
let app=express();
let dbConnect=require('./config/dbConnect')
let path=require('path');
let userRoute=require('./routes/userRoute')
let dotenv = require('dotenv').config();

app.use('/static',express.static(path.join(__dirname,'public')));
dbConnect();
app.set('view engine','ejs');
app.set('views','./views/user')
app.use('/',userRoute);

app.listen(8000,()=>console.log('http://localhost:8000'));





