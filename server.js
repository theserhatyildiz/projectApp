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
const weightModel = require('./models/weightModel');

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
                    jwt.sign({email:userCred.email, userId: user._id}, "nutritionApp", (err,token)=>{
                        if(!err)
                        {
                            res.send({message:"Login Success", token:token, userid:user._id,name:user.name})
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

app.get("/foods", verifyToken, async (req, res) => {
    try {
        // Fetch all the food items created by the user
        let userFoods = await foodModel.find({ userId: req.userId });

        // Fetch all the food items from the default food database
        let defaultFoods = await foodModel.find({ userId: { $exists: false } });

        // Combine the default food items and user food items into a single array
        let foods = [...defaultFoods, ...userFoods];

        // Remove any duplicate food items based on the NameTr field
        foods = foods.filter((value, index, self) =>
            index === self.findIndex((t) => t.NameTr === value.NameTr)
        );

        res.send(foods);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Some problem while getting nutrition info' });
    }
});


// end point for search food by name

app.get("/foods/:name", verifyToken, async (req, res) => {
    try {
        // Fetch food items created by the current user
        let userFoods = await foodModel.find({ 
            NameTr: { $regex: req.params.name, $options: 'i' },
            userId: req.userId
        });

        // Fetch default food items (those without any userId)
        let defaultFoods = await foodModel.find({ 
            NameTr: { $regex: req.params.name, $options: 'i' },
            userId: { $exists: false }
        });

        // Combine the user's food items and default food items
        let foods = [...userFoods, ...defaultFoods];

        if (foods.length !== 0) {
            res.send(foods);
        } else {
            res.status(404).send({ message: 'Food item not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Some problem in getting the food using search' });
    }
});



// end point to update food

app.put("/track/:id", verifyToken, async (req, res) => {
    const trackData = req.body;
    const trackId = req.params.id;
  
    console.log(`Updating food tracking record with ID: ${trackId}`);
    console.log(`Track data: ${JSON.stringify(trackData)}`);
  
    // Find the food tracking record by ID
    const track = await trackingModel.findById(trackId);
  
    if (!track) {
      console.log(`Food tracking record with ID ${trackId} not found`);
      return res.status(404).send({ message: 'Food tracking record not found' });
    }
  
    // Find the food item by ID
    const food = await foodModel.findById(trackData.details.foodId);
  
    if (!food) {
      console.log(`Food item with ID ${trackData.details.foodId} not found`);
      return res.status(404).send({ message: 'Food item not found' });
    }
  
    // Update the food tracking record
    track.quantity = trackData.quantity;
    track.mealNumber = trackData.mealNumber;
    track.details = trackData.details; // Update the details property
    await track.save();
  
    console.log(`Food tracking record with ID ${trackId} updated successfully`);
    res.status(200).send({ message: 'Food tracking record updated successfully' });
  });

// end point to fetch all foods eaten by a user

app.get("/track/:userid/:date",verifyToken,async(req,res)=>{

    let userid = req.params.userid ; 
    let date = new Date(req.params.date).toLocaleDateString();

    try
    {

        let foods = await trackingModel.find({userId:userid,eatenDate:date}).populate('userId').populate('foodId')
        res.send(foods);

    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:'Some problem in fetching all foods eaten by a user'})
    }
})

// Endpoint to delete a specific food entry

app.delete("/track/:id", verifyToken, async (req, res) => {
    const id = req.params.id; // Using the route parameter 'id' to represent the unique identifier (_id)
    console.log("Deleting food entry with id:", id);
  
    try {
      // Check if the food entry exists
      const foodEntry = await trackingModel.findById(id);
  
      if (!foodEntry) {
        console.log("Food entry not found");
        return res.status(404).send({ message: "Food entry not found" });
      }
  
      console.log("Deleting food entry from database");
      await trackingModel.deleteOne({ _id: id }); // Deleting the food entry based on its _id
      console.log("Food entry deleted");
  
      // Send a success response
      res.send({ message: "Food entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting food entry:", error);
      res.status(500).send({ message: "An error occurred while deleting the food entry" });
    }
});

// end point to create a new food

app.post("/foods", verifyToken, async (req, res) => {
    console.log("POST request received to create a new food item");
    console.log("Request body:", req.body);
  
    const createFood = req.body;
    createFood.userId = req.userId;
  
    try {
      console.log("Creating a new food item with the following data:", createFood);
      const data = await foodModel.create(createFood);
      console.log("Food item created successfully");
      res.status(201).send({ message: "Food created successfully" });
    } catch (err) {
      console.log("Error creating food item:", err);
      res.status(500).send({ message: "Some problem in creating the food" });
    }
  });

  // end point to add a food to a meal

// app.post("/track",verifyToken,async(req,res)=>{

//     let trackData = req.body;
//     console.log("track data:", trackData)
    
//     try
//     {
//         let data = await trackingModel.create(trackData);
//         res.status(201).send({message:'Food added successfully'});
//     }
//     catch(err)
//     {
//         console.log(err);
//         res.status(500).send({message:'Some problem in logging the food'})
//     }
    
// })

app.post("/track", verifyToken, async (req, res) => {
    let trackData = req.body;
    console.log("track data:", trackData);

    let convertedEatenDate;
    try {
        const dateParts = trackData.eatenDate.split("-");  // Split by "-"
        convertedEatenDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;  // Reassemble in mm/dd/yyyy format
        // Reorder the date parts to mm/dd/yyyy format
        convertedEatenDate = convertedEatenDate.split("/").map(part => parseInt(part)).join("/");
        console.log('Converted Eaten Date:', convertedEatenDate);  // Log the converted date
    } catch (error) {
        convertedEatenDate = trackData.eatenDate;  // Use the raw value if parsing fails
    }

    // Update the trackData with the converted eaten date
    trackData.eatenDate = convertedEatenDate;

    try {
        let data = await trackingModel.create(trackData);
        res.status(201).send({ message: 'Food added successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Some problem in logging the food' });
    }
});




app.post("/track", verifyToken, async (req, res) => {
    const { foodId, quantity, mealNumber } = req.body;
    const { loggedUser } = req.user;

    try {
        // Check if tracking data already exists for the user, food, and meal number
        const existingTracking = await trackingModel.findOne({
            userId: loggedUser._id,
            foodId,
            mealNumber,
        });

        if (existingTracking) {
            // If tracking data already exists, create a new tracking document with a new _id value
            const newTracking = {
                userId: loggedUser._id,
                foodId,
                quantity,
                mealNumber,
                createdAt: new Date(),
                _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the new tracking document
            };

            // Save the new tracking document to the database
            await trackingModel.create(newTracking);
            res.status(201).json({ message: "New tracking document created successfully" });
        } else {
            // If tracking data doesn't exist, create a new tracking document in the database
            const newTracking = {
                userId: loggedUser._id,
                foodId,
                quantity,
                mealNumber,
                createdAt: new Date(),
            };

            // Save the new tracking document to the database
            await trackingModel.create(newTracking);
            res.status(201).json({ message: "Tracking document created successfully" });
        }
    } catch (err) {
        console.error("Error logging food:", err);
        res.status(500).json({ message: "Some problem in logging the food" });
    }
});

///////////////////////////////////// MEAL FUNCTIONS /////////////////////////////////////

// end point to fetch the meal foods in the meal function page

app.get('/track/:userId/:mealNumber/:eatenDate', verifyToken, async (req, res) => {
    try {
        // Extract parameters from the request
        const { userId, mealNumber, eatenDate } = req.params;
        console.log('User ID:', userId);
        console.log('Meal number:', mealNumber);
        console.log('Eaten date:', eatenDate);

        let convertedEatenDate;
            try {
                const dateParts = eatenDate.split("-");  // Split by "-"
                convertedEatenDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;  // Reassemble in mm/dd/yyyy format
                // Reorder the date parts to mm/dd/yyyy format
                convertedEatenDate = convertedEatenDate.split("/").map(part => parseInt(part)).join("/");
                console.log('Converted Eaten Date:', convertedEatenDate);  // Log the converted date
            } catch (error) {
                convertedEatenDate = eatenDate;  // Use the raw value if parsing fails
            }

        // Assuming trackingModel is your Mongoose model for tracking
        // Fetch food items based on the user ID, meal number, and converted eaten date
        const foods = await trackingModel.find({ userId, mealNumber, eatenDate: convertedEatenDate });
        console.log('Fetched food items:', foods);

        // Send the fetched food items as a JSON response
        res.status(200).json(foods);
    } catch (error) {
        // If an error occurs, send an error response
        console.error('Error fetching food items:', error);
        res.status(500).json({ message: 'Failed to fetch food items' });
    }
});

// end point to delete the meal foods in the meal function page

app.delete("/deleteFoods", verifyToken, async (req, res) => {
    const { foods } = req.body; // Extracting the list of food IDs from the request body
    console.log("Deleting selected foods:", foods);
  
    try {
      // Deleting multiple food entries from the database based on their IDs
      const deleteResult = await trackingModel.deleteMany({ _id: { $in: foods } });
      console.log("Deleted foods:", deleteResult.deletedCount);
  
      // Send a success response
      res.send({ message: `${deleteResult.deletedCount} food(s) deleted successfully` });
    } catch (error) {
      console.error("Error deleting selected foods:", error);
      res.status(500).send({ message: "An error occurred while deleting the selected foods" });
    }
});


app.post("/track/copy", verifyToken, async (req, res) => {
    const { copiedItems, userId, foodId, eatenDate } = req.body;

    console.log("Received copied items:", copiedItems);
    console.log("Received userId:", userId);
    console.log("Received foodId:", foodId);
    console.log("Received eatenDate:", eatenDate);

    try {
        // Iterate through copiedItems to handle each copied item
        for (const copiedItem of copiedItems) {
            const { details, quantity, mealNumber } = copiedItem;
            let foodId;
            if (copiedItem.details && copiedItem.details.foodId) {
                foodId = copiedItem.details.foodId; // Extract foodId from details if available
            } else if (copiedItem.foodId) {
                foodId = copiedItem.foodId; // Extract foodId directly if available
            } else {
                console.log("No foodId found for copiedItem:", copiedItem);
                continue; // Skip processing this copiedItem if no foodId is available
            }
    
            // Parse and format the eatenDate
            const eatenDate = new Date(copiedItem.eatenDate);
            const formattedEatenDate = eatenDate.toISOString().split('T')[0];

            let convertedEatenDate;
            try {
                const dateParts = formattedEatenDate.split("-");  // Split by "-"
                convertedEatenDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;  // Reassemble in mm/dd/yyyy format
                // Reorder the date parts to mm/dd/yyyy format
                convertedEatenDate = convertedEatenDate.split("/").map(part => parseInt(part)).join("/");
                console.log('Converted Eaten Date:', convertedEatenDate);  // Log the converted date
            } catch (error) {
                convertedEatenDate = formattedEatenDate;  // Use the raw value if parsing fails
            }
    
            const newTracking = {
                userId,
                foodId: foodId,
                details: {
                    Name: details.Name,
                    Calorie: details.Calorie,
                    Protein: details.Protein,
                    Carbohydrate: details.Carbohydrate,
                    Fat: details.Fat,
                    Fiber: details.Fiber,
                },
                quantity,
                mealNumber,
                eatenDate: convertedEatenDate,
                _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the new tracking document
            };
    

            console.log("Creating new tracking document:", newTracking);

            // Save the new tracking document to the database
            await trackingModel.create(newTracking);
            console.log("Tracking document created successfully");
        }

        res.status(201).json({ message: "All tracking documents created successfully" });
    } catch (err) {
        console.error("Error logging food:", err);
        res.status(500).json({ message: "Some problem in logging the food" });
    }
});

///////////////////////////////////// WEIGHT ENTRY /////////////////////////////////////

// Endpoint to add weight entry

app.post("/weights", verifyToken, async (req, res) => {
    const { weight, date, choice } = req.body;
    const userId = req.userId;

    try {
        // Check if a weight entry already exists for the provided date
        const existingEntry = await weightModel.findOne({ userId, date });

        if (existingEntry) {
            // If an entry exists, update it
            existingEntry.weight = weight; // Update the weight value
            existingEntry.choice = choice; // Update the choice value
            await existingEntry.save(); // Save the changes
            res.status(200).json({ message: "Weight entry updated successfully", data: existingEntry });
        } else {
            // If no entry exists, create a new one
            const newWeightEntry = await weightModel.create({ userId, weight, date, choice });
            res.status(201).json({ message: "Weight entry added successfully", data: newWeightEntry });
        }
    } catch (error) {
        console.error("Error adding/updating weight entry:", error);
        res.status(500).json({ message: "Error adding/updating weight entry" });
    }
});




app.get("/weights/:userId/:date", verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const date = new Date(req.params.date);

    try {
        // console.log("Fetching weight data for user:", userId, "on date:", date);

        const userWeight = await weightModel.findOne({
            userId,
            date: { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }, // Filter by date
            choice: req.query.choice // Filter by choice (optional query parameter)
        });

        // console.log("Found weight entry:", userWeight);

        if (!userWeight) {
            // console.log("No weight entry found for user:", userId, "on date:", date);
            return res.status(200).json({});
        }

        res.status(200).json(userWeight);
    } catch (error) {
        // console.error("Error fetching weight data:", error);
        res.status(500).json({ message: "Error fetching weight data" });
    }
});


// Endpoint to fetch weight data for a user within a specific month

app.get("/weights/:userId/:year/:month", verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // Months are zero-indexed in JavaScript Date object

    try {
        console.log("Fetching weight data for user:", userId, "in year:", year, "and month:", month);

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);

        console.log("Start date:", startDate);
        console.log("End date:", endDate);

        const userWeights = await weightModel.find({
            userId,
            date: { $gte: startDate, $lt: endDate },
        });

        console.log("Found weight entries:", userWeights);

        res.status(200).json(userWeights);
    } catch (error) {
        console.error("Error fetching weight data:", error);
        res.status(500).json({ message: "Error fetching weight data" });
    }
});




// Endpoint to delete a weight entry

// Endpoint to delete a specific weight entry
app.delete("/weights/:id", verifyToken, async (req, res) => {
    const id = req.params.id; // Using the route parameter 'id' to represent the unique identifier (_id)
    console.log("Deleting weight entry with id:", id);
  
    try {
      // Check if the weight entry exists
      const weightEntry = await weightModel.findById(id);
  
      if (!weightEntry) {
        console.log("Weight entry not found");
        return res.status(404).send({ message: "Weight entry not found" });
      }
  
      console.log("Deleting weight entry from database");
      await weightModel.deleteOne({ _id: id }); // Deleting the weight entry based on its _id
      console.log("Weight entry deleted");
  
      // Send a success response
      res.send({ message: "Weight entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      res.status(500).send({ message: "An error occurred while deleting the weight entry" });
    }
});

// Endpoint to update the selected start date for a user

app.put("/users/:userId/:startDate", verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const { startDate } = req.body;

    try {
        // Update the user's document in the database to store the selected start date
        await userModel.updateOne({ _id: userId }, { startDate });
        res.status(200).json({ message: "Start date updated successfully" });
    } catch (error) {
        console.error("Error updating start date:", error);
        res.status(500).json({ message: "Error updating start date" });
    }
});

// Endpoint to fetch the selected start date for a user
app.get("/users/:userId/:startDate", verifyToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch the user's document from the database
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const startDate = user.startDate;
        res.status(200).json({ startDate });
    } catch (error) {
        console.error("Error fetching start date:", error);
        res.status(500).json({ message: "Error fetching start date" });
    }
});

// Endpoint to delete the start date for a user
app.delete("/users/:userId/startdate", verifyToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user and set the start date to null or an empty string
        const user = await userModel.findByIdAndUpdate(userId, { startDate: "" }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Start date deleted successfully", user });
    } catch (error) {
        console.error("Error deleting start date:", error);
        res.status(500).json({ message: "Error deleting start date" });
    }
});



app.listen(process.env.PORT || PORT, () => {
    console.log('Server is running !!!')
})

