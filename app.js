const express= require("express")
const http=require('http')
const { createServer } = require("http2")
const app= express()
require('dotenv').config();
const secret_key=process.env.SECRET_KEY
const bodyParser= require("body-parser")
const jwt= require("jsonwebtoken")
const cookieparser = require("cookie-parser")
app.use(cookieparser());
app.use(bodyParser.urlencoded({extended:true}))
const server = http.createServer(app)
const socketio=require('socket.io');
const io=socketio(server)
const bcrypt= require('bcrypt')
const ejs= require("ejs")
const db = require("./config/config")
const userModel=require("./models/user");
const urlencoded = require("body-parser/lib/types/urlencoded");
const json = require("body-parser/lib/types/json");
app.set("view engine","ejs")
app.use(express.static('public'))

const  auth =(req,res,next)=>
    {
        const tokenFromCookie= req.cookies.token
        try{
            if(tokenFromCookie)
            {
                const verification =jwt.verify(tokenFromCookie,secret_key)
                next()
            }
            else{
                res.redirect("/")
            }
        }catch(err){
            res.redirect("/")
        }
    
    }
    
app.post("/signup",async(req,res)=>
{
 const fname= req.body.fname
 const lname= req.body.lname
 const password= req.body.password
 const email=req.body.email

 
 if(!(fname && lname && email && password))
 {
     res.status(400).send("all field are required")
 }
 const exist = await userModel.findOne({Email:email})
 if(exist){
     res.status(401).send("user already exist")
 }
 else{
    const encpass= await bcrypt.hash(password,10)
    const user = await userModel.create({
        firstname:fname,
        lastname:lname,
        password:encpass,
        email:email
    })
 }

 res.redirect("/")
})


app.post("/login/api",(req,res)=>
{
    const token = req.cookies.token
    if(token)
    {   
        return res.status(200).json({ token });
    }
    else{
        return res.status(200).json({undefined})    
    }
    
})


const checkLoginState = (req, res, next) => {
    const token = req.cookies.token;
    let loggedIn = false;

    if (token) {
        try {
            jwt.verify(token, secret_key); 
            loggedIn = true; 
        } catch (err) {
            res.redirect("/login"); 
        }
    }
    res.locals.loggedIn = loggedIn;

    next();
};

app.post("/login",async(req,res)=>
{
    const email= req.body.email
    const password= req.body.password
    const user = await userModel.findOne({email:email})
    const passverify= await bcrypt.compare(password,user.password)
    if(user)
    {
        if(passverify){
            const token = jwt.sign(
                {id:user._id},
                secret_key,
                {
                 expiresIn:'24h'
                }
            )
            const options={
                expires:new Date(Date.now()+24*60*60*1000),
                httpOnly:true
            };
            res.status(200).cookie("token",token,options)
            res.redirect("/")
        }
        else{
            res.status(400).send("password incorrect")
        }
    }
    else{
        res.status(400).send("user not  Available")
    }
})


app.get("/",checkLoginState,async(req,res)=>
{  
    const token = req.cookies.token
   
    try{
        
         if(token)
         {   
            verification = jwt.verify(token,secret_key)
            if(verification)
            {
                const users = await userModel.find(); 
                res.render("home",{user:users})
            }
         }
         else{
            res.render("home")
         }
         

    }catch(err)
    {
      res.render("home")
    }
    
})


app.get("/login",(req,res)=>
{
    res.render("login")
})


app.get("/signup",(req,res)=>
{
    res.render("signup")
})


io.on("connection",(socket)=>
{
    socket.on("token",(token)=>
    {  

        socket.on('sendMessageToUser', ({ userId, message }) => {
            if (userId && message) {
                io.to(userId).emit('receiveMessage', message);
                console.log(`Message sent to user with ID ${userId}: ${message}`);
            }
        });
        
       try{
        if(token!="undefined")
            {
             
             const isvalid= jwt.verify(token,secret_key)
             
            if(isvalid)
            {
             const id=isvalid.id
             const status="online"
             socket.join(id)
             socket.emit("online",status)
             console.log([...socket.rooms]);
            }
     
            }
       }catch(err)
       { 
         socket.emit("offline","offline")
       }
       
    })
   
    
})


app.get("/logout",(req,res)=>
{
    const token=req.cookies.token
    if(token)
    {
        res.cookie('token', token, { expires: new Date(0), httpOnly: true });
    }
    res.redirect("/")
})


server.listen(3000)

