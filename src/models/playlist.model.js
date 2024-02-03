import mongoose, { Schema } from "mongoose";

// ################################################################

const PlaylistSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videos: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Vidoe",
    },
  ],
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

// ################################################################

export const Playlist = mongoose.model("Playlist", PlaylistSchema);
