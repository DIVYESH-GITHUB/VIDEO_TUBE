import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { unlinkFile } from "../utils/unlinkFile.js";
import { User } from "../models/user.model.js";

// ################################################################

const unlinkVideoAndThumbnail = async (thumbnailLocalPath, videoLocalPath) => {
  await unlinkFile(thumbnailLocalPath);
  await unlinkFile(videoLocalPath);
};

// ################################################################

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

  let pipeline = [];

  // Get only published videos
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  // filter the videos according to the query
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          {
            title: {
              $regex: query,
              $options: "i",
            },
          },
          {
            description: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  // applying the sort method
  if (sortBy) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType == "desc" ? -1 : 1,
      },
    });
  }

  // skip the pages acording to the current page number
  pipeline.push({
    $skip: (parseInt(page) - 1) * parseInt(limit),
  });

  // set the limit for number of documents to be returned
  pipeline.push({
    $limit: parseInt(limit),
  });

  const videos = await Video.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// ################################################################

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // check if title is provided
  if (!title) {
    throw new ApiError(400, "Title for the video must be provided");
  }

  // check if description is provided
  if (!description) {
    throw new ApiError(400, "Description for the video must be provided");
  }

  // get the local path of video file
  let videoLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoLocalPath = req.files.videoFile[0].path;
  }

  // get local path of thumbnail file
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoLocalPath) {
    await unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(400, "Video file not found");
  }

  if (!thumbnailLocalPath) {
    await unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(400, "thumbnail file not found");
  }

  // upload video file on cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(500, "something went wrong while uploading video");
  }

  // upload thumbnail file on cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(500, "somthing went wrong while uploading thumbnail");
  }

  const savedVideo = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user._id,
  });

  if (!savedVideo) {
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, savedVideo, "Video uploaded successfully"));
});

// ################################################################

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is not valid");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

// ################################################################

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  let thumbnailLocalPath = req.file?.path;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video Id is not valid");
  }

  if (!title && !description && !thumbnailLocalPath) {
    throw new ApiError(
      400,
      "Atleast one field must be provided for updating video"
    );
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  let newThumbnail;
  if (thumbnailLocalPath) {
    newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!newThumbnail) {
      throw new ApiError(
        500,
        "Something went wrong when updating the thumbnail"
      );
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title: title ? title : video.title,
      description: description ? description : video.description,
      thumbnail: thumbnailLocalPath ? newThumbnail.url : video.thumbnail,
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong when updating the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// ################################################################

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video Id is not valid");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    video._id,
    {
      isPublished: !video.isPublished,
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong when updating the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// ################################################################

const watchVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video Id is not valid");
  }

  let video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // check if user has already watched the video
  const videoWatched = await User.findOne({
    _id: req.user?._id,
    watchHistory: videoId,
  });

  if (!videoWatched) {
    // if user has not watched the video then, add the videoId in history and increment the view count
    await User.updateOne(
      { _id: req.user?._id },
      { $push: { watchHistory: { $each: [videoId], $position: 0 } } }
    );

    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  } else {
    // else put the video in first poistion
    await User.updateOne(
      { _id: req.user?._id },
      { $pull: { watchHistory: videoId } }
    );

    await User.updateOne(
      { _id: req.user?._id },
      { $push: { watchHistory: { $each: [videoId], $position: 0 } } }
    );
  }

  video = await Video.findById(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

// ################################################################

export {
  publishVideo,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
  watchVideo,
  getAllVideos,
};
