const mongoose=require("mongoose");
const marked=require("marked");
const slugify=require("slugify");

const articleSchema=new mongoose.Schema({
    company_name:{
        type:String,
        required:true,
        //capitalise it


    },
    job_role:{
        type:String,
        required:true,
    },

    candidate_name:{
        type:String,
    },
    email:{
        
        type:String,
        required:true,
    },

    strategy:{
        type:String,
        required:true,
    },
    journey:{
        type:String,
        required:true,
    },

    createdAt:{
        type:Date,
        default:Date.now
    }
 
})

// articleSchema.pre("validate",function(next){
//     if(this.company_name){
//         this.slug=slugify(this.company_name,{lower:true,strict:true})
//     }
//     next();
// })




//we will create a new collection   




const Article = mongoose.model("Article", articleSchema);

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:Number,
        required:true,
        
    },
    password:{
        type:String,
        required:true,

        
    },
    confirmpassword:{
        type:String,
        required:true,
        
    }
 


});

const User = mongoose.model("User", userSchema);

module.exports = {
  Article,
  User,
};