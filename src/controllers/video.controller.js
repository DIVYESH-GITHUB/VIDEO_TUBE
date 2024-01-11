import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { unlinkFile } from "../utils/unlinkFile.js";

const unlinkVideoAndThumbnail = async (thumbnailLocalPath, videoLocalPath) => {
  await unlinkFile(thumbnailLocalPath);
  await unlinkFile(videoLocalPath);
};

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
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(400, "Video file not found");
  }

  if (!thumbnailLocalPath) {
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(400, "thumbnail file not found");
  }

  // upload video file on cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(500, "something went wrong uploading video");
  }

  // upload thumbnail file on cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    unlinkVideoAndThumbnail(thumbnailLocalPath, videoLocalPath);
    throw new ApiError(500, "somthing went wrong uploading thumbnail");
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

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Video not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Video not found");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  let thumbnailLocalPath;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  if (req.file?.path) {
    thumbnailLocalPath = req.file?.path;
    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!newThumbnail) {
      throw new ApiError(
        500,
        "Something went wrong when updating the thumbnail"
      );
    }
    video.thumbnail = newThumbnail.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
      },
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

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    video._id,
    {
      $set: {
        isPublished: !video.isPublished,
      },
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

export {
  publishVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
};
