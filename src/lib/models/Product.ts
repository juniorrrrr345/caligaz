import mongoose from 'mongoose';

export interface IProduct {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  prices?: Record<string, number>;
  category: string;
  menu: string; // Menu auquel appartient le produit
  image: string;
  images?: string[];
  video?: string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  prices: { 
    type: Map, 
    of: Number 
  },
  category: { 
    type: String, 
    required: true 
  },
  menu: { 
    type: String, 
    required: true, 
    default: 'caligaz' 
  },
  image: { 
    type: String, 
    required: true 
  },
  images: [{ 
    type: String 
  }],
  video: { 
    type: String 
  },
  stock: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);