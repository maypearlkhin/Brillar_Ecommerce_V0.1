import mongoose, { Document } from 'mongoose';
export type IntegrationConfigType = 'trigger' | 'admin_widget' | 'customer_widget' | 'supplier_widget';
export interface IIntegrationConfig extends Document {
    type: IntegrationConfigType;
    url: string;
    token: string;
}
export declare const IntegrationConfig: mongoose.Model<IIntegrationConfig, {}, {}, {}, Document<unknown, {}, IIntegrationConfig, {}, mongoose.DefaultSchemaOptions> & IIntegrationConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IIntegrationConfig>;
//# sourceMappingURL=IntegrationConfig.d.ts.map