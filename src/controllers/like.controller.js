import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "Video Id not found");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Video Id is not a valid");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(440, "Video not found");
  }

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    const deletedLike = await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Video unliked successfully"));
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(440, "Video cannot be liked");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(404, "Comment Id not found");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(404, "Comment Id is not a valid");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(440, "Comment not found");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    const deletedLike = await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Comment unliked successfully"));
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(440, "Comment cannot be liked");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(404, "Tweet Id not found");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(404, "Tweet Id is not a valid");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    const deletedLike = await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Tweet unliked successfully"));
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!like) {
    throw new ApiError(440, "Tweet cannot be liked");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideo = await Like.find({
    likedBy: req.user._id,
    comment: null,
    tweet: null,
  });

  if (likedVideo.length == 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No liked video found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "liked video fetched successfully"));
});

export { toggleVideoLike, toggleCommentLike, getLikedVideos, toggleTweetLike };
