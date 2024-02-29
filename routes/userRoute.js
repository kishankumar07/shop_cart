let express=require('express');
let path=require('path');
let userController=require('../controller/userController');
let session=require('express-session');
let auth=require('../middlewares/userAuth')
let router=express.Router();

router.use(
    session({
        secret:'secretKey',
        resave:false,
        saveUninitialized:true
    })
)

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//=======error route============
router.use('/error',userController.errorPage);

//-============== home page====================
router.get('/',userController.loadHome);
// router.get('/home',userController.loadHome);

//==============Login and register======================================
router.get('/login',userController.loginUser);
router.post('/login',userController.verifyUser);
router.get('/register',userController.registerUser);
router.post('/register',userController.insertUser);
router.post('/verifyOtp',userController.verifyuserOtp);
router.get('/resendOtp',userController.resendOtp);

module.exports=router;






