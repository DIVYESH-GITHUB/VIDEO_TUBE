import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(400, "channel not found");
  }

  const existingSubscrption = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscrption) {
    const unSubscribedChannel = await Subscription.findByIdAndDelete(
      existingSubscrption._id
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          unSubscribedChannel,
          "channel unsubscribed successfully"
        )
      );
  } else {
    const newSubscription = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, newSubscription, "channel subscribed successfully")
      );
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber Id");
  }

  const isSubscribedToAnyChannel = await Subscription.findOne({
    subscriber: subscriberId,
  });

  if (!isSubscribedToAnyChannel) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "You are not subscribed to any channel")
      );
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "channel",
        as: "subscribedChannels",
        pipeline: [
          {
            $project: {
              userName: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        subscribedChannels: 1,
      },
    },
  ]);

  console.log(subscribedChannels);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels[0],
        "subcribed channels fetched successfully"
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const doesChannelHaveAnySubcriber = await Subscription.findOne({
    channel: channelId,
  });

  if (!doesChannelHaveAnySubcriber) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Channel has no subscribers"));
  }

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriber",
        as: "channelSubscribers",
        pipeline: [
          {
            $project: {
              userName: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channelSubscribers: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscribers[0],
        "subscriber of channel fetched successfully"
      )
    );
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
