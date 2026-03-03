const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resetToken: { type: String, required: true },
  },
  { timestamps: true }
);

resetPasswordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("ResetPassword", resetPasswordSchema);