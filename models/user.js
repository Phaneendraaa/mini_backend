const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/postingapp");

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    complaints:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"complaint"
    }]
})
module.exports = mongoose.model("user",userSchema);