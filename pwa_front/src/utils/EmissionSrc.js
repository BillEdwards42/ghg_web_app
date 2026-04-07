export const EMISSION_SOURCE = {
  // ----- Category 1 -----
  STATIONARY_COMBUSTION: 'stationary combustion',
  MOBILE_COMBUSTION: 'mobile combustion',
  INDUSTRIAL_PROCESS: 'industrial process',
  FUGITIVE_EMISSION: 'fugitive emissions',
  FUGITIVE_EMISSION_SEPTIC_TANK: 'septic tank',
  // ----- Category 2 -----
  IMPORTED_ELECTRICITY: 'purchased electricity',
  IMPORTED_ENERGY: 'purchased energy',
  // ----- Category 3 -----
  UPSTREAM_TRANSPORTATION: 'upstream transportation and distribution',
  DOWNSTREAM_TRANSPORTATION: 'downstream transportation and distribution',
  EMPLOYEE_COMMUTING: 'employee commuting',
  BUSINESS_TRIP: 'business travel',
  // ----- Category 4 -----
  PURCHASED_PRODUCT_N_SERVICE: 'products and services purchased',
  FUEL_N_ENERGY_ACTIVITY: 'fuel and energy related activities (not covered in scope 1 & scope 2)',
  UPSTREAM_EMISSION: 'upstream emissions from purchasing capital goods',
  WASTE_DISPOSAL: 'waste disposal during operations',
  WASTE_DISPOSAL_SERVICE: 'waste disposal services',
  WASTE_DISPOSAL_TRANSPORTATION: 'waste transportation',
  // ----- Category 5 -----
  PROCESSING_PRODUCT_N_SERVICE: 'processing of products and services for sale',
  USE_PRODUCT_N_SERVICE: 'use of products and services sold',
  END_TREATMENT_PRODUCT_N_SERVICE: 'end-of-life treatment of sold products and services'
};

export const FUGITIVE_TYPE = {
  SEPTIC_TANK: '1',
  FIRE_EXTINGUISHER: '2',
  REFRIGERANT: '3'
};

export const TRANSPORTATION_TYPE = {
  AIRPLANE: 'airplane',
  HIGH_SPEED_RAIL: 'high speed rail',
  TRAIN: 'train',
  MRT: 'mrt',
  BUS: 'bus',
  LONG_DISTANCE_BUS: 'passenger transport',
  TAXI: 'taxi',
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  SHIP: 'sea transportation',
  LAND_TRANSPORTATION: 'land transportation',
  AIR_TRANSPORTATION: 'air transportation'
};

export const WEIGHT_AND_DISTANCE_UNIT = {
  tkm: { weight: 'Ton', distance: 'Km' },
  pkm: { weight: 'Passenger', distance: 'Km' },
  pmile: { weight: 'Passenger', distance: 'Mile' },
  m2hr: { weight: 'M2', distance: 'Hr' }
};
