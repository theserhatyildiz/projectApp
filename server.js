const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// importing models
const userModel = require('./models/userModel')
const foodModel =  require('./models/foodModel')
const trackingModel = require('./models/trackingModel')
const verifyToken = require('./verifyToken')


// database connection

mongoose.connect(process.env.MONGO_URI)
.then(() =>{ console.log("MongoDB connected") })
.catch((err)=> {console.log(err.message)})

const app = express()
app.use(cors())
app.use(express.json())

// endpoint for registering a new user
app.post("/register",  (req, res) => {
    
    let user = req.body;

    // encrypting the password
        bcrypt.genSalt(10,(err,salt)=>{
            if(!err)
            {
                bcrypt.hash(user.password,salt,async(err,hpass)=>{
                    if(!err)
                    {
                        user.password=hpass;
                        try 
                        {
                            let doc = await userModel.create(user)
                            res.status(201).send({message: "User Registered!"})
                        }
                        catch(err){
                            console.error('Error registering user:', err);
                            res.status(500).send({ message: 'An error occurred during registration. Please try again later.' });
                        } 
                    }
                })
            }
        })
})

// endpoint for login

app.post('/login', async(req,res) => {

    let userCred = req.body;

    try
    {
        const user = await userModel.findOne({email:userCred.email});
        if (user!==null) 
        {
            bcrypt.compare(userCred.password, user.password,(err,success)=>{
                if(success==true)
                {
                    jwt.sign({email:userCred.email}, "nutritionApp", (err,token)=>{
                        if(!err)
                        {
                            res.send({message:"Login Success", token:token})
                        }
                    })
                }
                else 
                {
                    res.status(403).send({message:"Invalid Password"})
                }
            })
        }
        else
        {
            res.status(404).send({message:"User not found"})
        }
    }
    
    catch(err)
    {
        console.error('Error Finding User', err);
        res.status(500).send("Wrong Credentials")
    }


})

// endpoint to fetch all foods

app.get("/foods",verifyToken,async(req,res)=>{

    try 
    {
        let foods = await foodModel.find();
        res.send(foods);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:'Some problem while getting nutrition info'})
    }
})

// end point for search food by name

app.get("/foods/:name",verifyToken,async(req,res)=>{

    try
    {
        let foods = await foodModel.find({NameTr:{$regex:req.params.name, $options: 'i'}});
        if(foods.length!==0)
        {
            res.send(foods);
        }
        else
        {
            res.status(404).send({message:'Food item not found'})
        }
        
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:'Some problem in getting the food using search'})
    }
    
})

// end point to track a food

app.post("/track",verifyToken,async(req,res)=>{

    let trackData = req.body;
    
    try
    {
        let data = await trackingModel.create(trackData);
        res.status(201).send({message:'Food added successfully'});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:'Some problem in logging the food'})
    }
    

})

app.listen(process.env.PORT || PORT, () => {
    console.log('Server is running !!!')
})

