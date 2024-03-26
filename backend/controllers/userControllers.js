const asyncHandler= require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require ("../config/generateToken");
const Chat = require("../models/chatModel");

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;
  
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the fields");
    }
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
  
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });
  
    if (!user) {
      res.status(400);
      throw new Error("Failed to create the User");
    }
  
    // Check if the space named "general" exists
    let generalSpace = await Chat.findOne({ chatName: "university" });
  
    // If the space doesn't exist, create the space
    if (!generalSpace) {
      const adminEmail = "f201005@cfd.nu.edu.pk"; // Admin email for the "general" space
      let adminUser = await User.findOne({ email: adminEmail });
  
      // If the admin user does not exist, set the current user as the admin
      if (!adminUser) {
        adminUser = user;
      }
  
      const newSpace = await Chat.create({
        chatName: "university",
        isGroupChat: true,
        users: [adminUser._id],
        groupAdmin: adminUser._id,
      });
  
      if (!newSpace) {
        res.status(400);
        throw new Error("Failed to create the general space");
      }
  
      // Reassign the generalSpace variable to the newly created space
      generalSpace = newSpace;
    } else {
      // If the space exists, add the user to the users array
      generalSpace.users.push(user._id);
      await generalSpace.save();
    }
  
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  });

// const registerUser=asyncHandler(async(req,res) => {
//     const {name,email,password,pic} = req.body;

//     if(!name || !email || !password) {
//         res.status(400);
//         throw new Error("Please Enter all the fields");
//     }

//     const userExists= await User.findOne({email});

//     if(userExists){
//         res.status(400);
//         throw new Error("user already exists");
//     }

//     const user = await User.create({
//         name,
//         email,
//         password,
//         pic,
//     });

//     if(user) {
//         res.status(201).json({
//             _id:user._id,
//             name : user.name,
//             email : user.email,
//             pic : user.pic,
//             token: generateToken(user._id),
//         });
//     }
//     else{
//         res.status(400);
//         throw new Error("Failed to create the User");
//     }

// });

const authUser = asyncHandler(async(req,res)=>{
    const{email,password}=req.body;
    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic : user.pic,
            token: generateToken(user._id),

        });
    }
    else{
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

const allUsers = asyncHandler(async(req,res) => {
    const keyword = req.query.search
    ?{
        $or:[
            { name : { $regex : req.query.search, $options: "i" }},
            { email : { $regex : req.query.search, $options: "i" }},
        ],
    }
    : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
})



module.exports = {registerUser, authUser, allUsers}