const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },verified:{
        type:Boolean,
        default:false
    }
});

//Export the model
module.exports = mongoose.model('User', userSchema);



// let mongoose=require('mongoose');

// //Define the user Schema

// let userSchema = new mongoose.Schema({
//     username:{
//         type:String,
//         required:true
//     },
//     email:{
//         type:String,
//         required:true
//     },
//     mobile:{
//         type:Number,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     is_verified:{
//         type:Boolean,
//         default:false
//     },
//     is_admin:{
//         type:Number
//     },
//     blocked:{
//         type:Boolean,
//         default:false
//     }

// });
// //Create the User model
// let User = mongoose.model('User',userSchema);

// module.exports=User;