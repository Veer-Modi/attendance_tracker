const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => Date.now().toString(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
