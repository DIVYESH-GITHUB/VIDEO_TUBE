import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "content for the tweet not found");
  }
  if (content.trim().length == 0) {
    throw new ApiError(400, "content for the tweet cannot be empty");
  }

  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(500, "tweet can not be created");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({
    owner: req.user._id,
  });

  if (tweets.length == 0) {
    return res.status(200).json(new ApiResponse(200, null, "Tweets not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "content for the tweet not found");
  }
  if (content.trim().length == 0) {
    throw new ApiError(400, "content for the tweet cannot be empty");
  }

  if (!tweetId) {
    throw new ApiError(404, "Tweets Id not found");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(404, "Tweets Id not valid");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(404, "Tweets Id not found");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(404, "Tweets Id not valid");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
