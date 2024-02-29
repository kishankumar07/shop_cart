let User=require('../models/userModel');
const userOtpVerification=require('../models/otpModel');
let asyncHandler=require('express-async-handler');
let bcrypt=require('bcrypt');
let nodemailer=require('nodemailer');
let path=require('path');
let otpGenerator=require('otp-generator');
const { match } = require('assert');
const { log } = require('console');

//===========error- 500=======================

let errorPage=async(req,res)=>{
    try {
        res.render('Error-500');
    } catch (error) {
        console.log(error.message);
    }
  } 

//==================To make secure password=============

const hashPassword=async(password)=>{
  try {
      const hashedPassword=await bcrypt.hash(password,10);
      return hashedPassword;
  } catch (error) {
      console.log(error.message);
  }
} 

//==============Login route ====================
const loginUser = async(req,res)=>{
    try{
        res.render('login',{message:""});
    } catch(error) {
        console.log("login user error");
    }
}

const verifyUser = asyncHandler(async (req, res) => {
    try {
        const { email, password} = req.body;
        const findUser = await User.findOne({ email });
        let verified=findUser.verified;
        console.log(`Whether user is blocked${findUser.isBlocked}`);
        console.log(`Whether user is verified${findUser.verified}`);
        if(findUser.isBlocked){
            res.render("login",{message:'Your Account has been Blocked'})
        }
        else if (findUser && verified) {
            req.session.user = findUser._id;
            console.log('Successful login');
            res.redirect("/");
        } else {
            //req.flash("error", "Incorrect email or password"); // Flash an error message
            console.log('Error in login user');
            res.render("login",{ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.log("Error happens in userController userLogin function:", error);
    }
});

//===================Register Route==============
const registerUser=async(req,res)=>{
    try{
        res.render('register');
    } catch(error){
        console.log(error.message);
    }
}



//============= Home page  ==================
let loadHome =async(req,res,next)=>{
    try{
        res.render('home');
        
    }catch(err){
        console.log(err.message);
    }
}

//============ OTP page ======

//===============to generate a random OTP=============
function generateotp(){

    var digits='1234567890';
    var otp=""
    for(let i=0;i<4;i++){
        otp+=digits[Math.floor(Math.random()*10)];
    }
    return otp;
}

//To generate Otp and sent email==========================

async function otpGenerationAndEmailSent(OtpUserId,email){
    console.log(email);
    const otp=generateotp();
console.log("-----------------------------------generated otp---", otp);
const transporter=nodemailer.createTransport({
service: "gmail",
 host:'smtp.gmail.com',
 port:587,
 secure:false,
 requireTLS:true,
 auth:{
     user:process.env.AUTH_MAIL,
     pass:process.env.AUTH_PASS
 }


});   //hash the otp
const saltRounds=10;
const hashedOtp=await bcrypt.hash(otp,saltRounds);

const newOtpVerification=new userOtpVerification({
    userId:OtpUserId,
    otp:hashedOtp
})
// console.log('ivdethii pinne');

//save the otp in database first and then only sent mail
await newOtpVerification.save();
// console.log(`Otp was hashed`);
//Now sent email: 

const info=await transporter.sendMail({
 from:process.env.AUTH_MAIL,
 to:email,
 subject:"Verify Your Account",
 text:`your OTP is :${otp}`,
 html:`<b> <h4> Your OTP ${otp}</h4>  <br> <a href="/user/emailOtp/">Click here</a></b>`,
});

return info;
}



//Post request for register route=================

const insertUser=asyncHandler(async(req,res)=>{

    //After the end of this function, req.session.userId=userId;
    // So in session userId is there.
    try {
       
      let email=req.body.email;
      
     console.log("+++++++++++++++++++++++++++++++++++=",req.body);
     const findUser=await User.findOne({email:email});


     if(!findUser){
         //create a new user because it checked in database and found no matches



         const { name, email,mobile, password} = req.body;
        // console.log(`after extracting email from body ${email}`);
         //securing the password
         const securePassword = await hashPassword(password, 10);
         console.log(`Generated seciured password is ${securePassword} `);
  
         const user = new User({
         name:name,
          email: email,
          mobile:mobile,
          password: securePassword,
          verified: false,
          isAdmin:false,
          isBlocked:false
      })
      const newUser = await user.save();//saved at database

// console.log(newUser);
//This id i need to send to the next route
      let OtpUserId=newUser._id;
     // id of the particular person was extracted
     let emailCheck=newUser.email;
    //  console.log(`before sending to emailOTP generation from body ${email}`);
     let info= await otpGenerationAndEmailSent(OtpUserId,email);
        
        if(info){
         
        console.log(`This is OtpUserId : ${OtpUserId}`);
        
 
        res.render("emailOtp",{email:req.body.email,OtpUserId})
         console.log("Message sent: %s",info.messageId);
        } 
        else{
         res.json("email error")
        }   
     }
    
         //if the user registered but then without verifying using otp, he went away and if want to register later. So the saved data wll be there in database.


     
else if(findUser&&findUser.verified===false){


    const { name, email,mobile, password} = req.body;

    //securing the password
    const securePassword = await hashPassword(password, 10);
    console.log(`Generated seciured password is ${securePassword} `);

    const updatedUser = await User.findOneAndUpdate(
        {email:email},
        {   name:name,
               email: email,
               mobile:mobile,
               password: securePassword,
               verified: false,
               isAdmin:false,
              isBlocked:false},
        { new: true } // Returns the updated document
      );

//     const user = new User({
//     name:name,
//      email: email,
//      mobile:mobile,
//      password: securePassword,
//      verified: false,
//      isAdmin:false,
//      isBlocked:false
//  })
 const newUser = await updatedUser.save();//saved at database
// console.log(newUser);
 let OtpUserId=newUser._id;// id of the particular person was extracted
 //This id i need to send to the next route

 let info= await otpGenerationAndEmailSent(OtpUserId,email);
console.log(`this is info ${info}`);
   if(info){
    
   console.log(`This is OtpUserId : ${OtpUserId}`);
   

   res.render("emailOtp",{email:req.body.email,OtpUserId})
    console.log("Message sent: %s",info.messageId);
   } 
   else{
    res.json("email error")
   }   

    
}else{
    errMessage='User already exists';
    res.render('register',{errMessage,message:''});
}
    
 
     }
     catch (error) {
     console.log(error.message);
     
    }
})


// OTP Verification starts here.

let verifyuserOtp = async (req,res)=>{
  try {
      // console.log('ok,reached verifyOtp post route');
      // console.log('userId of otp stored in session:'+JSON.stringify(req.session));
      // const userId=req.session.user;
      // const userId=req.params.id;
      // console.log(`userId:${userId}`);

      const {num1,num2,num3,num4,otpUserId,}=req.body;
      // console.log(num1,num2,num3,num4);
      const otp=`${num1}${num2}${num3}${num4}`

      console.log(`userEntered OTP through body:${otp}`);
    
      //Now the value is reassigned to 'userId' at here
      const userId=otpUserId;

      if(!userId || !otp){
          res.json({otp:'noRecord',message:'Field should not be blank'}) 
      }
      else if(otp.length!==4){
        res.json({otp:'lessNum',message:`Please enter all the 4 digits sent to Email`});
      }
      else{
          const otpRecords=await userOtpVerification.findOne({userId});
          // console.log("otpRecords: ",otpRecords);

          if (!otpRecords){
              // throw new Error("Account has been already verified or record is already exist .please sign up or login");
              res.json({otp:false,message:"OTP Expired, Please try again"});
              
          }else{
              const {expiresAt}=otpRecords;
              const hashedOtp=otpRecords.otp;
              console.log(`To compare hashed otp and otp given below `);
              console.log(`Hashed otp is ${hashedOtp}`);
              console.log(` Otp is ${otp}`);
            //   console.log(`expiresAt this time:${expiresAt} & date.now:${Date.now()}`);
            
              const expiresAtTimestamp = new Date(expiresAt).getTime();
            // console.log(`the actul conversion ${expiresAtTimestamp}`);
              if(expiresAtTimestamp>Date.now()){
                  //if time limit exceeded
                  await userOtpVerification.deleteMany({userId});
                  res.json({otp:'expired',message:'otp code time limit exceeded, please try again'});

              }else{
                  const matchedOtp=  await bcrypt.compare(otp,hashedOtp);
                //   console.log(`matched otp is to check boolean or something :${matchedOtp}`);
                  if(!matchedOtp){
                      // res.render('otp',{message:'please provide a valid code'})
                      res.status(200).json({otp:'invalid',message:'please provide a valid code'});
                  }else{
                      await User.updateOne({_id:userId},{verified:true});
                      await userOtpVerification.deleteMany({userId:userId});

                      //acknowledgement for user loggedin
                      req.session.userId=userId;

                      console.log('successfull otp verification');
                      // res.redirect('/home')
                      res.status(200).json({otp:true})
                  }
              }  
          }
      }

  } catch (error) {
      console.log(error.message);
      res.status(500).render('Error-500');
  }
}
  

//OTP Resend part ends here

//resend the otp
const resendOtp=async (req,res)=>{
  try {
    //   console.log('ok, reached resend otp method');
      const userId=req.query.id;
      console.log("query id is here "+userId);

      const userData=await User.findOne({_id:userId});
      console.log("userData:"+userData);
      let email=userData.email;
      if(userData){
              otpGenerationAndEmailSent(userId,email);
        if(info){
         
          res.render("emailOtp",{email:req.body.email,userId})
         console.log("Message sent: %s",info.messageId);
        } 
      }else{
          res.json({otp:'invalid'})
      }
      
  } catch (error) {
      console.log(error.message);
      res.status(500).render('Error-500');
  }

}



module.exports={
    loadHome,
    loginUser,
    verifyUser,
    registerUser,
    insertUser,
    resendOtp,
    verifyuserOtp,
    errorPage
  
}
