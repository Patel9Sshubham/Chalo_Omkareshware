import PricingSetting from "../models/PricingSetting.js";

const defaultPricing = {
  key: "default",
  currency: "inr",
  taxesPercent: 5,
  baseFares: { bike: 20, auto: 30, cab: 50, traveller: 120 },
  perKmRates: { bike: 6, auto: 10, cab: 14, traveller: 24 },
  convenienceFees: { bike: 10, auto: 20, cab: 30, traveller: 50 },
  etaMinutes: { bike: 5, auto: 7, cab: 10, traveller: 15 }
};

export async function getPricing(req, res) {
  const pricing = await PricingSetting.findOne({ key: "default" }).lean();
  res.json({ pricing: pricing || defaultPricing });
}

export async function updatePricing(req, res) {
  const payload = req.body || {};
  const pricing = await PricingSetting.findOneAndUpdate(
    { key: "default" },
    { key: "default", ...payload },
    { upsert: true, new: true, runValidators: true }
  );
  res.json({ pricing });
}
