import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userVideos = await Video.find({
    owner: userId,
  });
  if (userVideos.length == 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User has no videos uploaded"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userVideos, "User videos fetched successfully"));
});

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get subscriber count
  const subscribersCount = await Subscription.find({
    channel: userId,
  }).countDocuments();

  // Get videos count
  const videosCount = await Video.find({
    owner: userId,
  }).countDocuments();

  // Get likes count
  const likesCount = await Like.aggregate([
    {
      $match: {
        comment: null,
        tweet: null,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: {
        path: "$video",
      },
    },
    {
      $match: {
        "video.owner": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

  // Get total views count
  const viewsCount = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId("65a299d67016dbaba243e3b1"),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  // Get channel general information
  const channelGeneralInfo = await User.findById(userId).select(
    "-password -refreshToken"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribersCount: subscribersCount,
        videosCount: videosCount,
        likesCount: likesCount.length,
        viewsCount: viewsCount[0].totalViews,
        channelGeneralInfo: channelGeneralInfo,
      },
      "Channel stats fetched successfully"
    )
  );
});

export { getChannelVideos, getChannelStats };
