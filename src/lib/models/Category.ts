import mongoose from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  menu: string; // Menu auquel appartient cette catégorie
  order?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  menu: {
    type: String,
    required: true,
    default: 'caligaz'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index composé pour unicité par menu
categorySchema.index({ slug: 1, menu: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);