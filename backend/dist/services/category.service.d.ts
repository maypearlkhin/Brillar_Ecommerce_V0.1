import { Types } from 'mongoose';
export declare function normalizeCategoryNamesInput(categories: unknown): string[];
export declare function findOrCreateCategory(name: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Category").ICategory, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Category").ICategory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function linkCategoryNames(categoryNames?: string[]): Promise<Types.ObjectId[]>;
//# sourceMappingURL=category.service.d.ts.map