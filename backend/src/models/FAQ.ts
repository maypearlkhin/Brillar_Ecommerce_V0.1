import mongoose, { Document, Schema } from 'mongoose';

export const FAQ_CATEGORIES = [
  'Orders',
  'Payments',
  'Suppliers',
  'Returns',
  'Account',
  'General',
] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: FAQCategory;
  isActive: boolean;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, required: true, trim: true, enum: FAQ_CATEGORIES },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FAQ = mongoose.model<IFAQ>('FAQ', faqSchema);
