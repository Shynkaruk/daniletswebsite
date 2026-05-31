import mongoose from "mongoose";

const ContactRequestSchema = new mongoose.Schema(
  {
    type: { type: String, default: "contact" }, // щоб відрізняти від quote/booking
    service: { type: String, default: "General" }, // Danilets Detailing / Cleaning / General

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },

    description: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["new", "in_progress", "done"],
      default: "new",
    },

    source: { type: String, default: "website" },
    pagePath: { type: String, default: "" }, // звідки відправили (опціонально)
  },
  { timestamps: true }
);

export default mongoose.model("ContactRequest", ContactRequestSchema);
