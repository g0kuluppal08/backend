import { DB_NAME } from "../constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// const registerUser=asyncHandler(async (req,res)=>{
//     res.status(200).json({
//         message:"ok"
//     })
// })

const registerUser=asyncHandler(async (req,res)=>{
   
    //get user detials from frontend
    //validation--not empty
    //check if user already exists:username,email
    //check for images,check for avator
    //upload them to cloudinary,avatar check
    //create user object bcox no sql form momgo db le liye
    // create user object->>create entry in db
    //remove password and refresh token feild from response
    //check for user creation
    //return res else error

   
    const {fullName,email,username,password}=req.body
    // console.log("email:: ",email);

    //  if(fullName===""){
    //     throw new ApiError(404,"fullname is req");
    //  }

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }
    
    const existedUser=User.findOne({
        
        $or:[{username},{email}]

    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists");

    }

    // req.body--->express 
    // req.files--->multer 

    const avatarLocalPath=req.files?.avatar[0]?.path; //0th property have url
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath);
   const coverImage=await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
     throw new ApiError(400, "Avatar file is required");
   }

   const user=await User.create({
     
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()

   })

   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
   }

   return res.status(201).json(

    new ApiResponse(200,createdUser,"User registered Successfully")


   )




















})

export {registerUser}