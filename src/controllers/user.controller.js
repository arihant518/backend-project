import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  // get user details from front end
  // validation - not empty
  //check if user already exist: username , email
  //check for images , check for avatar
  //upload them to cloudinary, avatar
  //create user object  - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response

  // get user details from front end

  const { fullName, email, password, username } = req.body;
  console.log(fullName, email, username);

  // validation - not empty

  if (
    [fullName, email, password, username].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check if user already exist: username , email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email and username already exist");
  }

  //check for images , check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  //upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image is required");
  }

  //create user object  - create entry in db

  const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "something went wrong")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered successfully")
  )

});
