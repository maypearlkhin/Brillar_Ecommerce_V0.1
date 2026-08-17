import mongoose, { Document } from 'mongoose';
export interface IFAQ extends Document {
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
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