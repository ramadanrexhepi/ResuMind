const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Plan Information (Embedded)
  plan: {
    type: {
      type: String,
      enum: ['free', 'pro', 'team'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trial'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    paymentId: {
      type: String,
      default: null
    },
    features: {
      maxUploads: {
        type: Number,
        default: 3  // Free plan limit
      },
      maxGenerations: {
        type: Number,
        default: 1
      },
      hasTemplates: {
        type: Boolean,
        default: false
      },
      hasAdvancedAI: {
        type: Boolean,
        default: false
      },
      hasPrioritySupport: {
        type: Boolean,
        default: false
      }
    }
  },

  // Usage Tracking
  usage: {
    uploadsCount: {
      type: Number,
      default: 0
    },
    generationsCount: {
      type: Number,
      default: 0
    },
    lastUpload: {
      type: Date,
      default: null
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Method to check if user can upload
userSchema.methods.canUpload = function() {
  return this.usage.uploadsCount < this.plan.features.maxUploads;
};

// Method to check if user can generate
userSchema.methods.canGenerate = function() {
  return this.usage.generationsCount < this.plan.features.maxGenerations;
};

// Method to upgrade plan
userSchema.methods.upgradeToPro = function() {
  this.plan.type = 'pro';
  this.plan.status = 'active';
  this.plan.startDate = new Date();
  this.plan.features = {
    maxUploads: 999999,  // Unlimited
    maxGenerations: 999999,
    hasTemplates: true,
    hasAdvancedAI: true,
    hasPrioritySupport: true
  };
};

module.exports = mongoose.model('User', userSchema);