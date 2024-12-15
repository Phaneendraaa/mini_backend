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
const upload = require("./config/multerconfig");
const mongoose = require("mongoose");
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
    if(req.cookies.UserToken==""){
        res.redirect("/login");
    }
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
    if(req.cookies.UserToken==""){
        res.redirect("/login");
    }
    res.render("Complaint");
})

app.post("/ComplaintUpload",upload.single("image"), async function(req,res){
    const { complaintType, address, city, description } = req.body;

    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const uploadedFile = req.file.filename;
    const decimalLatitude = mongoose.Types.Decimal128.fromString(latitude.toString());
    const decimalLongitude = mongoose.Types.Decimal128.fromString(longitude.toString());
    const newComplaint = await complaintModel.create({complaintType,address,city,description,image:uploadedFile,latitude:decimalLatitude,longitude:decimalLongitude});
    const user = jwt.verify(req.cookies.UserToken,"secret");
    const user_id = user.id;
    updatedComplaint = await complaintModel.findOneAndUpdate({_id:newComplaint._id},{user:user_id});
    await userModel.findOneAndUpdate({_id:user.id}, {$push: {complaints: newComplaint._id}});

    
    res.redirect("/publicComplaints");
    
})
app.get("/profile", async function(req, res) {
    const token = req.cookies.UserToken;
    
    if (!token) {
        // Redirect if there's no token (user not logged in)
        res.redirect("/login");
    } else {
        try {
            
            const user = jwt.verify(token, "secret");

            
            const userDetails = await userModel.findOne({ _id: user.id }).populate("complaints");

            
            res.render("profile", { userDetails });
        } catch (error) {
            
            console.error(error);
            res.redirect("/login");
        }
    }
});


app.get("/publicComplaints", async function(req,res){


    const allComplaints = await complaintModel.find().populate("user");
    allComplaints.reverse();

    res.render("publicComplaints",{allComplaints:allComplaints});
})

app.post("/filter-posts", async function(req, res) {
    const filters = req.body;
    let query = {};

    // Build the query based on the filters
    if (filters.filterType && filters.filterType !== "all") {
        query.complaintType = filters.filterType;
    }
    if (filters.filterCity && filters.filterCity !== "all") {
        query.city = filters.filterCity;
    }
    if (filters.filterStatus && filters.filterStatus !== "all") {
        query.status = filters.filterStatus;
    }

    try {
        // Find the complaints based on the constructed query
        const filteredComplaints = await complaintModel.find(query).populate("user");
        filteredComplaints.reverse(); // Optional: reverse the order if needed

        // Render the publicComplaints.ejs with the filtered complaints
        res.render("publicComplaints", { allComplaints: filteredComplaints });
    } catch (error) {
        console.error(error);
        res.redirect("/publicComplaints"); // Redirect in case of error
    }
});









app.listen(3000);