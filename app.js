const express = require("express");
const app = express();
const path = require("path");
const cookieparser = require("cookie-parser");
app.use(cookieparser());
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
const userModel = require("./models/user");
const complaintModel = require("./models/complaint");
app.get("/",function(req,res){
    res.render("index");
})

app.post("/signup-submit", async function(req,res){
    const {username,email,password} = req.body;
    const newUser = await userModel.create({username,email,password});
    const token = jwt.sign({id:newUser._id},"secret");
    res.cookie("UserToken",token);
    res.redirect("/home");

})

app.get("/home",function(req,res){
    res.render("home");
})



app.get("/login",function(req,res){
    res.render("login");
})

app.post("/login-submit", async function(req,res){
    const {email,password} = req.body;
    const user = await userModel.findOne({email});
    if(user){
        const token = jwt.sign({id:user._id},"secret");
        res.cookie("UserToken",token);
        res.redirect("/home");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/logout",function(req,res){
    res.cookie("UserToken","");
    res.redirect("/login");
})

app.get("/readCookie",function(req,res){
    const token = req.cookies.UserToken;
    res.send("cookie is "+token);
})


app.get("/createComplaint",function(req,res){
    res.render("Complaint");
})

app.post("/createComplaint", async function(req,res){
    
})
app.get("/profile",function(req,res){
    res.render("profile");
})

app.get("/publicComplaints",function(req,res){
    res.render("publicComplaints");
})









app.listen(3000);