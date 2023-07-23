const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); 
const fetchuser = require('../middleware/fetchuser');
const Task = require('../models/Task');
const User = require('../models/User');
const { Schema } = mongoose;
const { body, validationResult, param } = require('express-validator');





// ROUTE 0: Get All Users using GET "api/tasks/fetchallusers" Login required
router.get('/fetchallusers', fetchuser, async (req, res) => {
    try {
      const users = await User.find().select('_id name'); // Retrieve only the _id and name fields of users
      res.json(users);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });





// ROUTE 1 : Get All the Tasks using : GET "api/tasks/getuser"   Login required
router.get('/fetchalltasks', fetchuser, async (req, res) => {
    try {
      const tasks = await Task.find({
        $or: [
          { user: req.user.id }, // Tasks created by the logged-in user
          //{ users: req.user.id } // Tasks assigned to the logged-in user
          { assignedMembers: req.user.id }, // Tasks assigned to the logged-in user
        ]
      })
      .populate('user', 'name')  // Populate the users field with user names
      .populate('assignedMembers', 'name'); // Populate the 'assignedMembers' field with the 'name' property of the assigned users
      res.json(tasks);
    }  
 catch (error)
{
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}

})



// Route 2
router.post('/addtask', fetchuser, [
    body('title', 'Enter a valid Title').isLength({ min: 3 }),
    body('description', 'Description must be of at least 5 characters').isLength({ min: 5 }),
  ], async (req, res) => {
    try {
      const { title, description, tag, duedate, users } = req.body;

  
      // Validate if the users specified in the users array exist in the database
      const validUserIds = [];
      for (const userId of users) {
        console.log(userId);
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
          return res.status(400).json({ error: `User with ID ${userId} does not exist` });
        }
        validUserIds.push(userId);
      }
  
        // If there are errors, return Bad Request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }


      // Create a separate task for each user
      const tasks = [];
      for (const userId of users) {
        const task = new Task({
          user: userId, // Assign the task to the current user
          title,
          description,
          tag,
          duedate,
           
        });
        const savedTask = await task.save();
        tasks.push(savedTask);
      }
  
      res.json(tasks);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  

  



// ROUTE 3 : Update an existing task using : PUT "api/notes/updatetask"   Login required

router.put('/updatetask/:id', fetchuser, async (req,res) => {
        const { title, description, tag, duedate, status} = req.body;
        try {
        //Create a newTask object
        const newTask = {};
        if (title){newTask.title = title};
        if (description){newTask.description = description};
        if (tag){newTask.tag = tag};
        if (status){newTask.status = status};
        if (duedate){newTask.duedate = duedate};

        // Find the task to be updated and update it
        let task = await Task.findById(req.params.id);
        if (!task){ 
            return res.status(404).send("Task not found")
        }

        if (task.user.toString() !== req.user.id){
            return res.status(401).send("NOt Allowed");
        }
      

        task = await Task.findByIdAndUpdate(req.params.id, {$set:newTask}, {new:true})
        res.json({task});
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



// ROUTE 4 : Delete an existing task using : DELETE "api/notes/deletetask"   Login required

router.delete('/deletetask/:id', fetchuser, async (req,res) => {
        const { title, description, tag, duedate} = req.body;

       try {
         
        // Find the task to be deleted and delete it
        let task = await Task.findById(req.params.id);
        if (!task){ 
            return res.status(404).send("Task not found")
        }
        // Allow deletion only if user owns this task
        if (task.user.toString() !== req.user.id){
            return res.status(401).send("NOt Allowed");
        }

        task = await Task.findByIdAndDelete(req.params.id)
        res.json({"Success" : "Task has been Deleted"});
    } 
    catch (error) {
        console.error(error.message);
    res.status(500).send("Internal Server Error");
    }
})

module.exports = router