import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  emoji: {
    type: String,
    default: ''
  },
  menu: {
    type: String,
    required: true,
    enum: ['principal', 'barcelone'],
    default: 'principal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);