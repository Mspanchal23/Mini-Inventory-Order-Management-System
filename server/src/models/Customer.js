import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
    address: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

customerSchema.index({ name: 1 });

export default mongoose.model('Customer', customerSchema);
