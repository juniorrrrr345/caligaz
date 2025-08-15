import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: false,
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

// Générer automatiquement le slug avant de sauvegarder
CategorySchema.pre('save', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);