import mongoose from 'mongoose';

// Atomic sequence generator used for human readable order numbers (ORD-00001).
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
);

const Counter = mongoose.model('Counter', counterSchema);

export const nextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  );
  return counter.seq;
};

export default Counter;
