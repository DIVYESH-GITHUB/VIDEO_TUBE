import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// ################################################################

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      requierd: true,
    },
    video: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// ################################################################

CommentSchema.plugin(mongooseAggregatePaginate);

// ################################################################

export const Comment = mongoose.model("Comment", CommentSchema);
