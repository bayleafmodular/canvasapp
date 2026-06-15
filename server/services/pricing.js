const supabase = require('../lib/supabase');

const PRICING_TABLE = 'pricing_settings';
const DEFAULT_PRICING_ID = 'default';

const DEFAULT_PRICING = {
  currency: 'INR',
  rates: {
    linePerMeter: 0,
    polylinePerMeter: 0,
    freeDrawPerMeter: 0,
    wallPerMeter: 1.2,
    beamPerMeter: 1.5,
    lintelPerMeter: 0.8,
    arcPerMeter: 0,
    rectanglePerSqMeter: 0,
    circlePerSqMeter: 0,
  },
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizePricing = (pricing = {}) => {
  const rates = pricing.rates || {};

  return {
    currency: String(pricing.currency || DEFAULT_PRICING.currency).trim().slice(0, 8) || DEFAULT_PRICING.currency,
    rates: Object.keys(DEFAULT_PRICING.rates).reduce((acc, key) => {
      acc[key] = toNumber(rates[key], DEFAULT_PRICING.rates[key]);
      return acc;
    }, {}),
  };
};

const isMissingPricingTableError = (error) =>
  error?.code === '42P01' ||
  error?.code === 'PGRST205' ||
  /pricing_settings/i.test(error?.message || '');

const getPricingSettings = async () => {
  const { data, error } = await supabase
    .from(PRICING_TABLE)
    .select('data')
    .eq('id', DEFAULT_PRICING_ID)
    .maybeSingle();

  if (error) {
    if (isMissingPricingTableError(error)) {
      console.warn('pricing_settings table is missing; using default pricing settings');
      return normalizePricing(DEFAULT_PRICING);
    }
    throw error;
  }

  return normalizePricing(data?.data || DEFAULT_PRICING);
};

const updatePricingSettings = async (pricing) => {
  const normalized = normalizePricing(pricing);

  const { data, error } = await supabase
    .from(PRICING_TABLE)
    .upsert({
      id: DEFAULT_PRICING_ID,
      data: normalized,
      updated_at: new Date().toISOString(),
    })
    .select('data')
    .single();

  if (error) {
    if (isMissingPricingTableError(error)) {
      const setupError = new Error('Pricing table is missing. Run server/sql/pricing_settings.sql in Supabase.');
      setupError.statusCode = 503;
      throw setupError;
    }
    throw error;
  }

  return normalizePricing(data.data);
};

module.exports = {
  DEFAULT_PRICING,
  getPricingSettings,
  updatePricingSettings,
};
