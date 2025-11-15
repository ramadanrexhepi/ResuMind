const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Allow anonymous uploads
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  analysisType: {
    type: String,
    enum: ['file', 'linkedin', 'generated'],
    default: 'file'
  },
  results: {
    score: Number,
    overallRating: String,
    strengths: [String],
    improvements: [String],
    atsCompatibility: String,
    atsScore: Number,
    suggestedKeywords: [String],
    sections: {
      present: [String],
      missing: [String]
    }
  },
  optimizedResume: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
