import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllVideos);

router.route("/publish-video").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
); // publish video

router
  .route("/:videoId")
  .get(getVideoById) // Get the video by video Id
  .delete(deleteVideo) // Delete the video by video Id
  .patch(upload.single("thumbnail"), updateVideo); // Update the video by video Id

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
