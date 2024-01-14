import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/subscribe/:channelId").get(toggleSubscription);

router.route("/get-subscribed-channel/:subscriberId").get(getSubscribedChannels);

router.route("/get-subscribers/:channelId").get(getUserChannelSubscribers);

export default router;
