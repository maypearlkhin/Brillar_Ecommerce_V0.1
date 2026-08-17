import mongoose, { Document, Schema } from 'mongoose';

export type IntegrationConfigType = 'trigger' | 'admin_widget' | 'customer_widget' | 'supplier_widget';

export interface IIntegrationConfig extends Document {
  type: IntegrationConfigType;
  url: string;
  token: string;
}

const integrationConfigSchema = new Schema<IIntegrationConfig>(
  {
    type: { type: String, enum: ['trigger', 'admin_widget', 'customer_widget', 'supplier_widget'], required: true, unique: true },
    url: { type: String, required: true, trim: true },
    token: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const IntegrationConfig = mongoose.model<IIntegrationConfig>(
  'IntegrationConfig',
  integrationConfigSchema
);
