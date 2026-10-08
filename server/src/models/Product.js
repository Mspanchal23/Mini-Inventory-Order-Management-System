import mongoose from 'mongoose';

export const PRODUCT_STATUS = Object.freeze(['Active', 'Inactive']);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sku: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },
    price: { type: Number, required: true, min: 0 },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      validate: { validator: Number.isInteger, message: 'Stock must be a whole number' },
    },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    status: { type: String, enum: PRODUCT_STATUS, default: 'Active' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    // Soft delete: orders keep referencing the product, history stays intact.
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// SKU must be unique among live products only, so a deleted product's SKU can be reused.
productSchema.index(
  { sku: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
productSchema.index({ category: 1, status: 1 });

export default mongoose.model('Product', productSchema);
