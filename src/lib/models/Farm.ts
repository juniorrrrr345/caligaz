import mongoose from 'mongoose';

export interface IFarm {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  menu: string; // Menu auquel appartient cette farm
  order?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const farmSchema = new mongoose.Schema({
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
farmSchema.index({ slug: 1, menu: 1 }, { unique: true });

export const Farm = mongoose.models.Farm || mongoose.model<IFarm>('Farm', farmSchema);