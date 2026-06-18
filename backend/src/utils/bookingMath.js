import PricingSetting from "../models/PricingSetting.js";

const routeMatrix = {
  "Omkareshwar Temple|Mortakka Railway Station": { distanceKm: 5.8, timeMinutes: 12 },
  "Mortakka Railway Station|Omkareshwar Temple": { distanceKm: 5.8, timeMinutes: 12 },
  "Omkareshwar|Indore": { distanceKm: 80, timeMinutes: 120 },
  "Indore|Omkareshwar": { distanceKm: 80, timeMinutes: 120 },
  "Omkareshwar|Ujjain": { distanceKm: 140, timeMinutes: 190 },
  "Ujjain|Omkareshwar": { distanceKm: 140, timeMinutes: 190 },
  "Omkareshwar|Sanawad": { distanceKm: 25, timeMinutes: 40 },
  "Sanawad|Omkareshwar": { distanceKm: 25, timeMinutes: 40 },
  "Omkareshwar|Barwaha": { distanceKm: 34, timeMinutes: 55 },
  "Barwaha|Omkareshwar": { distanceKm: 34, timeMinutes: 55 }
};

const defaultPricing = {
  baseFares: { bike: 20, auto: 30, cab: 50, traveller: 120 },
  perKmRates: { bike: 6, auto: 10, cab: 14, traveller: 24 },
  convenienceFees: { bike: 10, auto: 20, cab: 30, traveller: 50 },
  etaMinutes: { bike: 5, auto: 7, cab: 10, traveller: 15 },
  taxesPercent: 5,
  currency: "inr"
};

export async function getPricingProfile() {
  const settings = await PricingSetting.findOne({ key: "default" }).lean();
  if (!settings) return defaultPricing;

  return {
    baseFares: { ...defaultPricing.baseFares, ...(settings.baseFares || {}) },
    perKmRates: { ...defaultPricing.perKmRates, ...(settings.perKmRates || {}) },
    convenienceFees: { ...defaultPricing.convenienceFees, ...(settings.convenienceFees || {}) },
    etaMinutes: { ...defaultPricing.etaMinutes, ...(settings.etaMinutes || {}) },
    taxesPercent: settings.taxesPercent ?? defaultPricing.taxesPercent,
    currency: settings.currency || defaultPricing.currency
  };
}

export async function estimateRoute(pickup, destination, vehicleType = "cab") {
  const pricing = await getPricingProfile();
  const lookupKey = `${pickup}|${destination}`;
  const route = routeMatrix[lookupKey] || {
    distanceKm: Math.max(3, Math.round((pickup.length + destination.length) / 4)),
    timeMinutes: Math.max(10, Math.round((pickup.length + destination.length) / 2))
  };
  const baseFare = pricing.baseFares[vehicleType] || pricing.baseFares.cab;
  const perKmRate = pricing.perKmRates[vehicleType] || pricing.perKmRates.cab;
  const convenienceFee = pricing.convenienceFees[vehicleType] || pricing.convenienceFees.cab;
  const etaMinutes = pricing.etaMinutes[vehicleType] || pricing.etaMinutes.cab;
  const distanceFare = Math.round(route.distanceKm * perKmRate);
  const taxes = Math.round((baseFare + distanceFare + convenienceFee) * (pricing.taxesPercent / 100));
  const totalAmount = baseFare + distanceFare + convenienceFee + taxes;

  return {
    ...route,
    routeName: `${pickup} -> ${destination}`,
    baseFare,
    distanceFare,
    convenienceFee,
    taxes,
    totalAmount,
    etaMinutes,
    currency: pricing.currency,
    perKmRate
  };
}

export function buildBookingId(count = 1) {
  const serial = String(count).padStart(6, "0");
  return `CO-${new Date().getFullYear()}-${serial}`;
}
