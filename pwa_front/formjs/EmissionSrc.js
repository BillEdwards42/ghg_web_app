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
  BUSSINESS_TRIP: 'business travel',
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
}

const {
  STATIONARY_COMBUSTION, MOBILE_COMBUSTION, INDUSTRIAL_PROCESS, FUGITIVE_EMISSION,
  IMPORTED_ELECTRICITY, IMPORTED_ENERGY,
  UPSTREAM_TRANSPORTATION, DOWNSTREAM_TRANSPORTATION, EMPLOYEE_COMMUTING, BUSSINESS_TRIP,
  PURCHASED_PRODUCT_N_SERVICE, FUEL_N_ENERGY_ACTIVITY, UPSTREAM_EMISSION, WASTE_DISPOSAL_SERVICE, WASTE_DISPOSAL_TRANSPORTATION,
  PROCESSING_PRODUCT_N_SERVICE, USE_PRODUCT_N_SERVICE, END_TREATMENT_PRODUCT_N_SERVICE
} = EMISSION_SOURCE

export const FUGITIVE_TYPE = {
  SEPTIC_TANK: '1',
  FIRE_EXTINGUISHER: '2',
  REFRIGERANT: '3'
}

export const TRANSPORTATION_TYPE = {
  AIRPLANE: 'airplane',
  HIGH_SPEED_RAIL: 'high speed rail',
  TRAIN: 'train',
  MRT: 'mrt',
  BUS: 'the bus',
  LONG_DISTANCE_BUS: 'passenger transport',
  TAXI: 'taxi',
  CAR: 'car',
  MOTORCYCLE: 'locomotive',
  SHIP: 'sea transportation',
  LAND_TRANSPORTATION: 'land transportation',
  AIR_TRANSPORTATION: 'air transportation'
}

export const EMISSION_TYPES = {
  [STATIONARY_COMBUSTION]: 'stationaryCombustionData',
  [MOBILE_COMBUSTION]: 'mobileCombustionData',
  [INDUSTRIAL_PROCESS]: 'industrialProcessData',
  [FUGITIVE_EMISSION]: 'fugitiveEmissionData',
  [IMPORTED_ELECTRICITY]: 'importedElectricityData',
  [IMPORTED_ENERGY]: 'importedEnergyData',
  [UPSTREAM_TRANSPORTATION]: 'upstreamTransportationData',
  [DOWNSTREAM_TRANSPORTATION]: 'downstreamTransportationData',
  [PURCHASED_PRODUCT_N_SERVICE]: 'purchasedGoodsAndServiceData',
  [EMPLOYEE_COMMUTING]: 'employeeCommutingData',
  [BUSSINESS_TRIP]: 'businessTripData',
  [FUEL_N_ENERGY_ACTIVITY]: 'fuelAndEnergyActivityData',
  [UPSTREAM_EMISSION]: 'upstreamEmissionsFromPurchasingGoodsData',
  [WASTE_DISPOSAL_SERVICE]: 'wasteDisposalServiceData',
  [WASTE_DISPOSAL_TRANSPORTATION]: 'wasteTransportData',
  [PROCESSING_PRODUCT_N_SERVICE]: 'processingOfProductsAndServicesData',
  [USE_PRODUCT_N_SERVICE]: 'useOfProductsAndServicesData',
  [END_TREATMENT_PRODUCT_N_SERVICE]: 'endOfLifeTreatmentOfProductsAndServicesData'
}

export const WEIGHT_AND_DISTANCE_UNIT = {
  tkm: { weight: 'Ton', distance: 'Km' },
  pkm: { weight: 'Passenger', distance: 'Km' },
  pmile: { weight: 'Passenger', distance: 'Mile' },
  m2hr: { weight: 'M2', distance: 'Hr' }
}
