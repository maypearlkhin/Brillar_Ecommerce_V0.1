import mongoose, { Document } from 'mongoose';
export declare const FAQ_CATEGORIES: readonly ['Orders', 'Payments', 'Suppliers', 'Returns', 'Account', 'General'];
export type FAQCategory = (typeof FAQ_CATEGORIES)[number];
export declare function isFAQCategory(value: string): value is FAQCategory;
export interface IFAQ extends Document {
    question: string;
    answer: string;
    category: FAQCategory;
    isActive: boolean;
}
export declare const FAQ: mongoose.Model<IFAQ, {}, {}, {}, Document<unknown, {}, IFAQ, {}, mongoose.DefaultSchemaOptions> & IFAQ & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFAQ>;
//# sourceMappingURL=FAQ.d.ts.map