import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
  loginUser,
  loginUserMobile,
  logoutUser,
  refereshAccessToken,
  registerUser,
  registerUserMobile,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// non- secure routes
router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/register-mobile").post(registerUserMobile);

router.route("/login").post(loginUser);

router.route("/login-mobile").post(loginUserMobile);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refereshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/get-current-user").get(verifyJWT, getCurrentUser);

router.route("/update-details").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getUserWatchHistory);

export default router;
