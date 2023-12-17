import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, userName } = req.body;

  // Full name validation
  if (!fullName) {
    throw new ApiError(400, "fullName is not specified");
  }
  if (!fullName.match("^(?![. ])[a-zA-Z. ]+(?<! )$")) {
    throw new ApiError(400, "fullName is not a valid");
  }

  // email validation
  if (!email) {
    throw new ApiError(400, "email is not specified");
  }
  if (
    !email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )
  ) {
    throw new ApiError(400, "email is not a valid");
  }

  // password validation
  if (!password) {
    throw new ApiError(400, "Password is not specified");
  }
  if (password.length < 6) {
    throw new ApiError(
      400,
      "Password length should be greater than or equal to 6"
    );
  }

  // user name validation
  if (!userName) {
    throw new ApiError(400, "username is not specified");
  }
  if (!userName.match("^[a-z0-9_-]{3,16}$")) {
    throw new ApiError(400, "username is not a valid");
  }

  // check is user already exist
  const existedUser = await User.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (existedUser) {
    throw new ApiError(403, "User with email or username already exists");
  }

  // get the path of avatar and cover image
  let avatarLocalPath;
  let coverImageLocalPath;

  if (req.files) {
    if (Array.isArray(req.files.avatar)) {
      avatarLocalPath = req.files.avatar[0].path;
    }
    if (Array.isArray(req.files.coverImage)) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload the avatar and cover image on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Something went wrong when registering the user");
  }

  // create a new user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // check is user is saved or not. If saved, get the info by removing password and refresh token.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong when registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  console.log(email, userName, password);

  if (email == undefined && userName == undefined) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email: email }, { userName: userName }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  console.log("token generated");

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
