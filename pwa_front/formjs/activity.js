import { MethodType } from '../constants/MethodType'
const api = require('./api')

export const fetchEquipmentTypeForEmissionSrc = (params, facilityId, year) => api.request(1, `/getEquipmentTypesForEmissionSourceData/${facilityId}/${year}`, MethodType.GET, params)

export const fetchActivityFile = (type, id, fileHash, params) => api.request(1, `/getActivityDataFile/${type}/${id}/${fileHash}`, MethodType.GET, params, {}, { responseType: 'blob' })

export const fetchSrcAndCustodian = (emissionTypeId, facilityId, id, subId, params) => api.request(1, `/getActivityDataLatestSourceAndCustodian/${emissionTypeId}/${subId}/${facilityId}/${id}`, MethodType.GET, params, {})

export const fetchDefaultUnit = (id, params) => api.request(1, `/getEmissionFactorByEmissionSource/${id}`, MethodType.GET, params, {})

export const downloadActivityExample = params => api.request(1, '/activityExampleDownload', MethodType.GET, params, {}, { responseType: 'blob' })

export const checkActivityClose = params => api.request(1, '/checkActivityClose', MethodType.GET, params)

// ----- Form Options -----

export const fetchStationaryCombustion = (params, facilityId, equipmentTypeId, year) => api.request(1, `/getStationaryCombustionEquipments/${facilityId}/${equipmentTypeId}/${year}`, MethodType.GET, params)

export const fetchMobileCombustion = (params, facilityId, equipmentTypeId, year) => api.request(1, `/getMobileCombustionEquipments/${facilityId}/${equipmentTypeId}/${year}`, MethodType.GET, params)

export const fetchIndustrialProcessMaterials = (params, facilityId, processId, year) => api.request(1, `/getIndustrialProcessMaterials/${facilityId}/${processId}/${year}`, MethodType.GET, params)

export const fetchFugitiveEmission = (params, facilityId, equipmentTypeId, year) => api.request(1, `/getFugitiveEmissionEquipments/${facilityId}/${equipmentTypeId}/${year}`, MethodType.GET, params)

export const fetchImportedElectricityFactors = (params, facilityId, energyTypeId, year) => api.request(1, `/getImportedElectricityFactors/${facilityId}/${energyTypeId}/${year}`, MethodType.GET, params)

export const fetchImportedEnergyFactors = (params, facilityId, energyTypeId, year) => api.request(1, `/getImportedEnergyFactors/${facilityId}/${energyTypeId}/${year}`, MethodType.GET, params)

export const fetchUpstreamTransportationMethods = (params, facilityId, transportationId, year) => api.request(1, `/getUpstreamTransportationMethods/${facilityId}/${transportationId}/${year}`, MethodType.GET, params)

export const fetchDownstreamTransportationMethods = (params, facilityId, transportationId, year) => api.request(1, `/getDownstreamTransportationMethods/${facilityId}/${transportationId}/${year}`, MethodType.GET, params)

export const fetchBisTripType = (params, facility, bisTripType, year) => api.request(1, `/getBusinessTrips/${facility}/${bisTripType}/${year}`, MethodType.GET, params)

export const fetchFuelAndEnergyFactors = (params, facilityId, energyTypeId, year) => api.request(1, `/getFuelAndEnergyActivityFactors/${facilityId}/${energyTypeId}/${year}`, MethodType.GET, params)

export const fetchWasteEmissionSrc = (params, facilityId, wasteMethodId, year) => api.request(1, `/getWasteEmissionSources/${facilityId}/${wasteMethodId}/${year}`, MethodType.GET, params)

// ----- Stations -----

export const fetchAirports = params => api.request(1, '/airports', MethodType.GET, params)

export const fetchHsrStations = params => api.request(1, '/hsrStations', MethodType.GET, params)

export const fetchTrainStations = params => api.request(1, '/trainStations', MethodType.GET, params)

export const fetchMrtStations = params => api.request(1, '/mrtStations', MethodType.GET, params)

export const fetchPorts = params => api.request(1, '/ports', MethodType.GET, params)

// ----- Stationary -----

export const fetchStationaryActivity = params => api.request(1, '/stationaryCombustionDatas', MethodType.GET, params)

export const addStationaryActivity = params => api.request(1, '/stationaryCombustionDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modStationaryActivity = (id, params) => api.request(1, `/stationaryCombustionDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delStationaryActivity = (id, params) => api.request(1, `/stationaryCombustionDatas/${id}`, MethodType.DELETE, params)

export const uploadStationaryActivity = params => api.request(1, '/createStationaryCombustionDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Mobile -----

export const fetchMobileActivity = params => api.request(1, '/mobileCombustionDatas', MethodType.GET, params)

export const addMobileActivity = params => api.request(1, '/mobileCombustionDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modMobileActivity = (id, params) => api.request(1, `/mobileCombustionDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delMobileActivity = (id, params) => api.request(1, `/mobileCombustionDatas/${id}`, MethodType.DELETE, params)

export const uploadMobileActivity = params => api.request(1, '/createMobileCombustionDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Industrial -----

export const fetchIndustrialActivity = params => api.request(1, '/industrialProcessDatas', MethodType.GET, params)

export const addIndustrialActivity = params => api.request(1, '/industrialProcessDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modIndustrialActivity = (id, params) => api.request(1, `/industrialProcessDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delIndustrialActivity = (id, params) => api.request(1, `/industrialProcessDatas/${id}`, MethodType.DELETE, params)

export const uploadIndustrialActivity = params => api.request(1, '/createIndustrialProcessDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Fugitive -----

export const fetchFugitiveActivity = params => api.request(1, '/fugitiveEmissionDatas', MethodType.GET, params)

export const addFugitiveActivity = params => api.request(1, '/fugitiveEmissionDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modFugitiveActivity = (id, params) => api.request(1, `/fugitiveEmissionDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delFugitiveActivity = (id, params) => api.request(1, `/fugitiveEmissionDatas/${id}`, MethodType.DELETE, params)

export const uploadFugitiveActivity = params => api.request(1, '/createFugitiveEmissionDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Imported Electricity -----

export const fetchImportedElectricityActivity = params => api.request(1, '/importedElectricityDatas', MethodType.GET, params)

export const addImportedElectricityActivity = params => api.request(1, '/importedElectricityDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modImportedElectricityActivity = (id, params) => api.request(1, `/importedElectricityDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delImportedElectricityActivity = (id, params) => api.request(1, `/importedElectricityDatas/${id}`, MethodType.DELETE, params)

export const uploadImportedElectricityActivity = params => api.request(1, '/createImportedElectricityDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Imported Energy -----

export const fetchImportedEnergyActivity = params => api.request(1, '/importedEnergyDatas', MethodType.GET, params)

export const addImportedEnergyActivity = params => api.request(1, '/importedEnergyDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modImportedEnergyActivity = (id, params) => api.request(1, `/importedEnergyDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delImportedEnergyActivity = (id, params) => api.request(1, `/importedEnergyDatas/${id}`, MethodType.DELETE, params)

export const uploadImportedEnergyActivity = params => api.request(1, '/createImportedEnergyDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Upstream Transportation -----

export const fetchUpstreamTransportation = (params, id) => api.request(1, `/upstreamTransportationDatas/${id || ''}`, MethodType.GET, params)

export const addUpstreamTransportation = params => api.request(1, '/upstreamTransportationDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modUpstreamTransportation = (id, params) => api.request(1, `/upstreamTransportationDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delUpstreamTransportation = (id, params) => api.request(1, `/upstreamTransportationDatas/${id}`, MethodType.DELETE, params)

export const uploadUpstreamTransportationActivity = params => api.request(1, '/createUpstreamTransportationDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Downstream Transportation -----

export const fetchDownstreamTransportation = (params, id) => api.request(1, `/downstreamTransportationDatas/${id || ''}`, MethodType.GET, params)

export const addDownstreamTransportation = params => api.request(1, '/downstreamTransportationDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modDownstreamTransportation = (id, params) => api.request(1, `/downstreamTransportationDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delDownstreamTransportation = (id, params) => api.request(1, `/downstreamTransportationDatas/${id}`, MethodType.DELETE, params)

export const uploadDownstreamTransportationActivity = params => api.request(1, '/createDownstreamTransportationDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Purchased Goods and Service -----

export const fetchPurchasedGoodsAndService = (params, id) => api.request(1, `/purchasedGoodsAndServiceDatas/${id || ''}`, MethodType.GET, params)

export const addPurchasedGoodsAndService = params => api.request(1, '/purchasedGoodsAndServiceDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modPurchasedGoodsAndService = (id, params) => api.request(1, `/purchasedGoodsAndServiceDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delPurchasedGoodsAndService = (id, params) => api.request(1, `/purchasedGoodsAndServiceDatas/${id}`, MethodType.DELETE, params)

export const uploadPurchasedGoodsAndServiceActivity = params => api.request(1, '/createPurchasedGoodsAndServiceDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Fuel and Energy -----

export const fetchFuelAndEnergy = (params, id) => api.request(1, `/fuelAndEnergyActivityDatas/${id || ''}`, MethodType.GET, params)

export const addFuelAndEnergy = params => api.request(1, '/fuelAndEnergyActivityDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modFuelAndEnergy = (id, params) => api.request(1, `/fuelAndEnergyActivityDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delFuelAndEnergy = (id, params) => api.request(1, `/fuelAndEnergyActivityDatas/${id}`, MethodType.DELETE, params)

export const uploadFuelAndEnergyActivity = params => api.request(1, '/createFuelAndEnergyActivityDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Waste Disposal Service -----

export const fetchWasteDisposalService = (params, id) => api.request(1, `/wasteDisposalServiceDatas/${id || ''}`, MethodType.GET, params)

export const addWasteDisposalService = params => api.request(1, '/wasteDisposalServiceDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modWasteDisposalService = (id, params) => api.request(1, `/wasteDisposalServiceDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delWasteDisposalService = (id, params) => api.request(1, `/wasteDisposalServiceDatas/${id}`, MethodType.DELETE, params)

export const uploadWasteDisposalServiceActivity = params => api.request(1, '/createWasteDisposalServiceDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Waste Transport -----

export const fetchWasteTransport = (params, id) => api.request(1, `/wasteTransportDatas/${id || ''}`, MethodType.GET, params)

export const addWasteTransport = params => api.request(1, '/wasteTransportDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modWasteTransport = (id, params) => api.request(1, `/wasteTransportDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delWasteTransport = (id, params) => api.request(1, `/wasteTransportDatas/${id}`, MethodType.DELETE, params)

export const uploadWasteTransportServiceActivity = params => api.request(1, '/createWasteTransportDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Business Trip -----

export const fetchBusinessTrip = (params, id) => api.request(1, `/businessTripDatas/${id || ''}`, MethodType.GET, params)

export const addBusinessTrip = params => api.request(1, '/businessTripDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modBusinessTrip = (id, params) => api.request(1, `/businessTripDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delBusinessTrip = (id, params) => api.request(1, `/businessTripDatas/${id}`, MethodType.DELETE, params)

export const uploadBusinessTripActivity = params => api.request(1, '/createBusinessTripDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Emission -----

export const fetchUpstreamEmissions = (params, id) => api.request(1, `/upstreamEmissionsFromPurchasingGoodsDatas/${id || ''}`, MethodType.GET, params)

export const addUpstreamEmissions = params => api.request(1, '/upstreamEmissionsFromPurchasingGoodsDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modUpstreamEmissions = (id, params) => api.request(1, `/upstreamEmissionsFromPurchasingGoodsDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delUpstreamEmissions = (id, params) => api.request(1, `/upstreamEmissionsFromPurchasingGoodsDatas/${id}`, MethodType.DELETE, params)

export const uploadUpstreamEmissionsActivity = params => api.request(1, '/createUpstreamEmissionsFromPurchasingGoodsDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Processing of Products and Services -----

export const fetchProcessingOfProductsAndServices = (params, id) => api.request(1, `/processingOfProductsAndServicesDatas/${id || ''}`, MethodType.GET, params)

export const addProcessingOfProductsAndServices = params => api.request(1, '/processingOfProductsAndServicesDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modProcessingOfProductsAndServices = (id, params) => api.request(1, `/processingOfProductsAndServicesDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delProcessingOfProductsAndServices = (id, params) => api.request(1, `/processingOfProductsAndServicesDatas/${id}`, MethodType.DELETE, params)

export const uploadProcessingOfProductsAndServicesActivity = params => api.request(1, '/createProcessingOfProductsAndServicesDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Use of Products and Services -----

export const fetchUseOfProductsAndServices = (params, id) => api.request(1, `/useOfProductsAndServicesDatas/${id || ''}`, MethodType.GET, params)

export const addUseOfProductsAndServices = params => api.request(1, '/useOfProductsAndServicesDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modUseOfProductsAndServices = (id, params) => api.request(1, `/useOfProductsAndServicesDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delUseOfProductsAndServices = (id, params) => api.request(1, `/useOfProductsAndServicesDatas/${id}`, MethodType.DELETE, params)

export const uploadUseOfProductsAndServicesActivity = params => api.request(1, '/createUseOfProductsAndServicesDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- End Treatment of Products and Services -----

export const fetchEndTreatmentOfProductsAndServices = (params, id) => api.request(1, `/endOfLifeTreatmentOfProductsAndServicesDatas/${id || ''}`, MethodType.GET, params)

export const addEndTreatmentOfProductsAndServices = params => api.request(1, '/endOfLifeTreatmentOfProductsAndServicesDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modEndTreatmentOfProductsAndServices = (id, params) => api.request(1, `/endOfLifeTreatmentOfProductsAndServicesDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delEndTreatmentOfProductsAndServices = (id, params) => api.request(1, `/endOfLifeTreatmentOfProductsAndServicesDatas/${id}`, MethodType.DELETE, params)

export const uploadEndTreatmentOfProductsAndServicesActivity = params => api.request(1, '/createEndOfLifeTreatmentOfProductsAndServicesDatas', MethodType.POST, params, {}, {}, false, [403, 500])

// ----- Employee Commuting -----

export const fetchEmployeeCommuting = (params, id) => api.request(1, `/employeeCommutingDatas/${id || ''}`, MethodType.GET, params)

export const addEmployeeCommuting = params => api.request(1, '/employeeCommutingDatas', MethodType.POST, params, { 'Content-Type': 'multipart/form-data' })

export const modEmployeeCommuting = (id, params) => api.request(1, `/employeeCommutingDatas/${id}`, MethodType.PUT, params, { 'Content-Type': 'multipart/form-data' })

export const delEmployeeCommuting = (id, params) => api.request(1, `/employeeCommutingDatas/${id}`, MethodType.DELETE, params)

export const fetchEmployeeCommutingConf = (params, facilityId, year) => api.request(1, `/getEmployeeCommutingDetailsForActivityData/${facilityId}/${year}`, MethodType.GET, params)

export const uploadEmployeeCommutingActivity = params => api.request(1, '/createEmployeeCommutingDatas', MethodType.POST, params, {}, {}, false, [403, 500])
