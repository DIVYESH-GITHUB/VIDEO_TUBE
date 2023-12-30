import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { unlinkFile } from "../utils/unlinkFile.js";

const unlinkVideoAndThumbnail = async () => {
  await unlinkFile(thumbnailLocalPath);
  await unlinkFile(videoLocalPath);
};

const uploadVideo = asyncHandler(async (req, res) => {
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
    unlinkVideoAndThumbnail();
    throw new ApiError(400, "Video file not found");
  }

  if (!thumbnailLocalPath) {
    unlinkVideoAndThumbnail();
    throw new ApiError(400, "thumbnail file not found");
  }

  // upload video file on cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video) {
    unlinkVideoAndThumbnail();
    throw new ApiError(500, "something went wrong uploading video");
  }

  // upload thumbnail file on cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    unlinkVideoAndThumbnail();
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
    unlinkVideoAndThumbnail();
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, savedVideo, "Video uploaded successfully"));
});

export { uploadVideo };
