import mongoose from "mongoose";

const pricingSettingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    currency: { type: String, default: "inr" },
    taxesPercent: { type: Number, default: 5 },
    baseFares: {
      bike: { type: Number, default: 20 },
      auto: { type: Number, default: 30 },
      cab: { type: Number, default: 50 },
      traveller: { type: Number, default: 120 }
    },
    perKmRates: {
      bike: { type: Number, default: 6 },
      auto: { type: Number, default: 10 },
      cab: { type: Number, default: 14 },
      traveller: { type: Number, default: 24 }
    },
    convenienceFees: {
      bike: { type: Number, default: 10 },
      auto: { type: Number, default: 20 },
      cab: { type: Number, default: 30 },
      traveller: { type: Number, default: 50 }
    },
    etaMinutes: {
      bike: { type: Number, default: 5 },
      auto: { type: Number, default: 7 },
      cab: { type: Number, default: 10 },
      traveller: { type: Number, default: 15 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.PricingSetting || mongoose.model("PricingSetting", pricingSettingSchema);
