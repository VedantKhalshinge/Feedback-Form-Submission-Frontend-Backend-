const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [100, 'Name must be 100 characters or fewer.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters.'],
      maxlength: [2000, 'Message must be 2000 characters or fewer.'],
    },
    attachment: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
    },
  },
  {
    timestamps: true, // auto-adds createdAt & updatedAt
  }
);

// Virtual `id` field so JSON output uses `id` instead of `_id`
feedbackSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.timestamp = ret.createdAt; // keep our original API shape
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
