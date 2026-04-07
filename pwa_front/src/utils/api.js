import axios from 'axios';

export const API_BASE_URL = 'https://dev-carbon64.lndata.com/frontend_api';
export const SYSTEM_ID = 1;

// Helper to encode password to Base64 as required by the backend
export const encodePassword = (password) => {
  try {
    return window.btoa(password);
  } catch (e) {
    console.error('Failed to encode password', e);
    return password;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-esg-system': SYSTEM_ID
  }
});

// Add a response interceptor to handle unauthorized access globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogoutRequest = error.config?.url?.includes('/session') && error.config?.method === 'delete';
    if (error.response?.status === 401 && !isLogoutRequest) {
      // Dispatch a custom event so the App component can react
      window.dispatchEvent(new CustomEvent('unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Helper to set the auth token for all future requests automatically
export const setAuthHeaders = (token) => {
  if (token) {
    apiClient.defaults.headers.common['X-Auth-Token'] = token;
  } else {
    delete apiClient.defaults.headers.common['X-Auth-Token'];
  }
};

// ----- CORE DISCOVERY & CONTEXT APIs -----

export const fetchDefaultUnit = (id) =>
  apiClient.get(`/getEmissionFactorByEmissionSource/${id}`);

export const checkActivityClose = (date, facilityId) =>
  apiClient.get('/checkActivityClose', { params: { date, facilityId } });

// ----- FORM DROPDOWN / OPTION APIs (PATH A) -----

export const fetchStationaryCombustion = (facilityId, equipmentTypeId, year, useDate) =>
  apiClient.get(`/getStationaryCombustionEquipments/${facilityId}/${equipmentTypeId}/${year}`, { params: { useDate } });

export const fetchMobileCombustion = (facilityId, equipmentTypeId, year, useDate) =>
  apiClient.get(`/getMobileCombustionEquipments/${facilityId}/${equipmentTypeId}/${year}`, { params: { useDate } });

export const fetchIndustrialProcessMaterials = (facilityId, processId, year, useDate) =>
  apiClient.get(`/getIndustrialProcessMaterials/${facilityId}/${processId}/${year}`, { params: { useDate } });

export const fetchFugitiveEmission = (facilityId, equipmentTypeId, year, useDate) =>
  apiClient.get(`/getFugitiveEmissionEquipments/${facilityId}/${equipmentTypeId}/${year}`, { params: { useDate } });

export const fetchImportedElectricityFactors = (facilityId, energyTypeId, year, useDate) =>
  apiClient.get(`/getImportedElectricityFactors/${facilityId}/${energyTypeId}/${year}`, { params: { useDate } });

export const fetchImportedEnergyFactors = (facilityId, energyTypeId, year, useDate) =>
  apiClient.get(`/getImportedEnergyFactors/${facilityId}/${energyTypeId}/${year}`, { params: { useDate } });

export const fetchUpstreamTransportationMethods = (facilityId, transportationId, year, useDate) =>
  apiClient.get(`/getUpstreamTransportationMethods/${facilityId}/${transportationId}/${year}`, { params: { useDate } });

export const fetchDownstreamTransportationMethods = (facilityId, transportationId, year, useDate) =>
  apiClient.get(`/getDownstreamTransportationMethods/${facilityId}/${transportationId}/${year}`, { params: { useDate } });

export const fetchBisTripType = (facilityId, bisTripType, year, useDate) =>
  apiClient.get(`/getBusinessTrips/${facilityId}/${bisTripType}/${year}`, { params: { useDate } });

export const fetchFuelAndEnergyFactors = (facilityId, energyTypeId, year, useDate) =>
  apiClient.get(`/getFuelAndEnergyActivityFactors/${facilityId}/${energyTypeId}/${year}`, { params: { useDate } });

export const fetchWasteEmissionSrc = (facilityId, wasteMethodId, year, useDate) =>
  apiClient.get(`/getWasteEmissionSources/${facilityId}/${wasteMethodId}/${year}`, { params: { useDate } });

// ----- SPECIALIZED STATION APIs -----

export const fetchAirports = () => apiClient.get('/airports', { params: { maxResults: 10000 } });
export const fetchHsrStations = () => apiClient.get('/hsrStations', { params: { maxResults: 1000 } });
export const fetchTrainStations = () => apiClient.get('/trainStations', { params: { maxResults: 1000 } });
export const fetchMrtStations = () => apiClient.get('/mrtStations', { params: { maxResults: 1000 } });
export const fetchPorts = () => apiClient.get('/ports', { params: { maxResults: 1000 } });

export const fetchEmployeeCommutingConf = (params, facilityId, year) =>
  apiClient.get(`/getEmployeeCommutingDetailsForActivityData/${facilityId}/${year}`, { params: { maxResults: 1000, startIndex: 0, sort: '-updatedAt', ...params } });

// ----- DATA SUBMISSION (POST) APIs -----

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

export const addStationaryActivity = (data) => apiClient.post('/stationaryCombustionDatas', data, multipartConfig);
export const addMobileActivity = (data) => apiClient.post('/mobileCombustionDatas', data, multipartConfig);
export const addIndustrialActivity = (data) => apiClient.post('/industrialProcessDatas', data, multipartConfig);
export const addFugitiveActivity = (data) => apiClient.post('/fugitiveEmissionDatas', data, multipartConfig);
export const addImportedElectricityActivity = (data) => apiClient.post('/importedElectricityDatas', data, multipartConfig);
export const addImportedEnergyActivity = (data) => apiClient.post('/importedEnergyDatas', data, multipartConfig);
export const addUpstreamTransportation = (data) => apiClient.post('/upstreamTransportationDatas', data, multipartConfig);
export const addDownstreamTransportation = (data) => apiClient.post('/downstreamTransportationDatas', data, multipartConfig);
export const addPurchasedGoodsAndService = (data) => apiClient.post('/purchasedGoodsAndServiceDatas', data, multipartConfig);
export const addFuelAndEnergy = (data) => apiClient.post('/fuelAndEnergyActivityDatas', data, multipartConfig);
export const addWasteDisposalService = (data) => apiClient.post('/wasteDisposalServiceDatas', data, multipartConfig);
export const addWasteTransport = (data) => apiClient.post('/wasteTransportDatas', data, multipartConfig);
export const addBusinessTrip = (data) => apiClient.post('/businessTripDatas', data, multipartConfig);
export const addUpstreamEmissions = (data) => apiClient.post('/upstreamEmissionsFromPurchasingGoodsDatas', data, multipartConfig);
export const addProcessingOfProductsAndServices = (data) => apiClient.post('/processingOfProductsAndServicesDatas', data, multipartConfig);
export const addUseOfProductsAndServices = (data) => apiClient.post('/useOfProductsAndServicesDatas', data, multipartConfig);
export const addEndTreatmentOfProductsAndServices = (data) => apiClient.post('/endOfLifeTreatmentOfProductsAndServicesDatas', data, multipartConfig);
export const addEmployeeCommuting = (data) => apiClient.post('/employeeCommutingDatas', data, multipartConfig);
