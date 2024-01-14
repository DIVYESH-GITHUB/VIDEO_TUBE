import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(cookieParser());

app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

// user route
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

// video route
import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/videos", videoRouter);

// subscription route
import subscriptionRouter from "./routes/subscription.routes.js";
app.use("/api/v1/subscriptions", subscriptionRouter);

// playlist router
import playlistRouter from "./routes/playlist.routes.js";
app.use("/api/v1/playlists", playlistRouter);

// comment router
import commentRouter from "./routes/comment.routes.js";
app.use("/api/v1/comments", commentRouter);

// Like router
import likeRouter from "./routes/like.routes.js";
app.use("/api/v1/likes", likeRouter);

// tweet router
import tweetRouter from "./routes/tweet.routes.js";
app.use("/api/v1/tweets", tweetRouter);

export { app };
