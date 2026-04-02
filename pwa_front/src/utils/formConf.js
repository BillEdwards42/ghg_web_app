import { EMISSION_SOURCE, FUGITIVE_TYPE, TRANSPORTATION_TYPE, WEIGHT_AND_DISTANCE_UNIT } from './EmissionSrc';
import {
  fetchDefaultUnit,
  fetchStationaryCombustion, fetchMobileCombustion, fetchIndustrialProcessMaterials, fetchFugitiveEmission,
  fetchImportedElectricityFactors, fetchImportedEnergyFactors,
  fetchUpstreamTransportationMethods, fetchDownstreamTransportationMethods,
  fetchBisTripType, fetchFuelAndEnergyFactors, fetchWasteEmissionSrc,
  fetchAirports, fetchHsrStations, fetchTrainStations, fetchMrtStations, fetchPorts,
  addStationaryActivity, addMobileActivity, addIndustrialActivity, addFugitiveActivity,
  addImportedElectricityActivity, addImportedEnergyActivity,
  addUpstreamTransportation, addDownstreamTransportation,
  addPurchasedGoodsAndService, addFuelAndEnergy,
  addWasteDisposalService, addWasteTransport,
  addBusinessTrip, addUpstreamEmissions,
  addProcessingOfProductsAndServices, addUseOfProductsAndServices,
  addEndTreatmentOfProductsAndServices, addEmployeeCommuting
} from './api';

const {
  STATIONARY_COMBUSTION, MOBILE_COMBUSTION, INDUSTRIAL_PROCESS, FUGITIVE_EMISSION, FUGITIVE_EMISSION_SEPTIC_TANK,
  IMPORTED_ELECTRICITY, IMPORTED_ENERGY,
  UPSTREAM_TRANSPORTATION, DOWNSTREAM_TRANSPORTATION, EMPLOYEE_COMMUTING,
  PURCHASED_PRODUCT_N_SERVICE, FUEL_N_ENERGY_ACTIVITY, WASTE_DISPOSAL_SERVICE, WASTE_DISPOSAL_TRANSPORTATION, UPSTREAM_EMISSION,
  PROCESSING_PRODUCT_N_SERVICE, USE_PRODUCT_N_SERVICE, END_TREATMENT_PRODUCT_N_SERVICE
} = EMISSION_SOURCE;

const { AIRPLANE, HIGH_SPEED_RAIL, TRAIN, MRT, BUS, LONG_DISTANCE_BUS, TAXI, CAR, MOTORCYCLE, SHIP, LAND_TRANSPORTATION, AIR_TRANSPORTATION } = TRANSPORTATION_TYPE;
const { SEPTIC_TANK, FIRE_EXTINGUISHER, REFRIGERANT } = FUGITIVE_TYPE;

// ---------------------------------------- Helpers ----------------------------------------

const formatRes = (res, id = 'id', name = 'name') => ({
  ...res,
  data: res.data?.map(i => ({
    ...i,
    id: i[id],
    name: i[name]
  }))
});

const defFormatSave = (value) => {
  const { useDate, useYear, file, ...other } = value;
  const date = useYear ? { useYear } : { useDate };
  const removeUnit = Object.entries(other)
    .filter(([key]) => !key.toLowerCase().includes('unit'))
    .reduce((all, [key, val]) => ({ ...all, [key]: val }), {});
  
  const formData = new FormData();
  Object.entries({ ...removeUnit, ...date }).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      formData.append(key, val);
    }
  });
  if (file) {
    formData.append('file', file);
  }
  return formData;
};

const defHandleSelectorChange = async ({ item, formData, setFormData, facilityId, emissionTypeId, subId = 0 }) => {
  if (!item || !item.id) return;

  const updates = {
    unit: item.emissionFactorUnit,
    emissionSourceId: item.emissionSourceId
  };

  setFormData(prev => ({ ...prev, ...updates }));
};
const updateWeightAndDistanceUnit = ({ item, setFormData, weightUnitLabel = 'unit1', distanceUnitLabel = 'unit2', setHideUsage2 }) => {
  const unit = item.emissionFactorUnit;
  const { weight, distance } = WEIGHT_AND_DISTANCE_UNIT[unit?.toLowerCase()] || {};
  if (setHideUsage2) {
    setHideUsage2(!weight || !distance);
  }
  setFormData(prev => ({
    ...prev,
    [weightUnitLabel]: weight || unit,
    [distanceUnitLabel]: distance || unit
  }));
};

const getDefaultUnit = async ({ equipmentTypeId, setFormData, unitName = 'unit' }) => {
  try {
    const res = await fetchDefaultUnit(equipmentTypeId);
    if (res.data) {
      setFormData(prev => ({ ...prev, [unitName]: res.data.emissionFactorUnit, emissionSourceId: res.data.emissionSourceId }));
      return { emissionSourceId: res.data.emissionSourceId, initValues: { [unitName]: res.data.emissionFactorUnit } };
    }
  } catch (err) {
    console.error('Failed to fetch default unit:', err);
  }
  return {};
};

const checkEquipmentDate = ({ item, formData, setErrors }) => {
  if (!item || !formData.useDate) return;
  const { dueDate, purchaseDate } = item;
  const dateStr = formData.useDate; // Format is YYYY-MM-DD
  
  if (dueDate && dateStr > dueDate) {
    setErrors(prev => ({ ...prev, useDate: '設備已逾期' }));
  } else if (purchaseDate && dateStr < purchaseDate) {
    setErrors(prev => ({ ...prev, useDate: '使用日期早於設備購入日' }));
  } else {
    setErrors(prev => ({ ...prev, useDate: null }));
  }
};

// ---------------------------------------- Default Forms ----------------------------------------

const topForm = [{
  _key: 'useDate',
  type: 'date',
  required: true,
  labelName: '日期'
}];

const bottomForm = [
  { _key: 'usage', type: 'inputNumber', required: true, labelName: '耗用量' },
  { _key: 'unit', type: 'input', required: false, disabled: true, labelName: '單位' }
];

// ---------------------------------------- Categories ----------------------------------------

const category1 = {
  [STATIONARY_COMBUSTION]: {
    middleForm: [
      {
        _key: 'equipmentId',
        labelName: '設備名稱',
        type: 'selectWithDesc',
        api: (params) => fetchStationaryCombustion(...params).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
        desc: [
          { key: 'fuelName', label: '燃料名稱' },
          { key: 'location', label: '位置' },
          { key: 'isBiofuel', label: '生質燃料', render: v => v === 1 ? '是' : '否' }
        ],
        handleSelectorChange: (props) => {
          defHandleSelectorChange(props);
          checkEquipmentDate(props);
        },
        checkerFunc: checkEquipmentDate,
        dependency: 'useDate'
      },
      { _key: 'emissionSourceId', type: 'hidden' }
    ],
    apis: { add: addStationaryActivity }
  },
  [MOBILE_COMBUSTION]: {
    middleForm: [
      {
        _key: 'equipmentId',
        labelName: '設備名稱',
        type: 'selectWithDesc',
        api: (params) => fetchMobileCombustion(...params).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
        desc: [
          { key: 'fuelName', label: '燃料名稱' },
          { key: 'location', label: '位置' },
          { key: 'isBiofuel', label: '生質燃料', render: v => v === 1 ? '是' : '否' }
        ],
        handleSelectorChange: (props) => {
          defHandleSelectorChange(props);
          checkEquipmentDate(props);
        },
        checkerFunc: checkEquipmentDate,
        dependency: 'useDate'
      },
      { _key: 'emissionSourceId', type: 'hidden' }
    ],
    useConfFirst: true,
    apis: { add: addMobileActivity }
  },
  [INDUSTRIAL_PROCESS]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: 'process',
        type: 'select',
        api: (params) => fetchIndustrialProcessMaterials(...params).then(res => formatRes(res, 'emissionSourceId', 'materialName')),
        handleSelectorChange: props => {
          defHandleSelectorChange(props);
          updateWeightAndDistanceUnit({ ...props, weightUnitLabel: 'unit' });
        },
        dependency: 'useDate'
      }
    ],
    apis: { add: addIndustrialActivity }
  },
  [FUGITIVE_EMISSION]: {
    middleForm: [
      {
        _key: 'equipmentId',
        labelName: '設備名稱',
        type: 'selectWithDesc',
        api: (params) => fetchFugitiveEmission(...params).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
        descDependency: 'fugitiveTypeId',
        desc: {
          [SEPTIC_TANK]: [{ key: 'isBiofuel', label: '生質燃料', render: v => v === 1 ? '是' : '否' }],
          [FIRE_EXTINGUISHER]: [
            { key: 'emissionFactorName', label: '排放因子' },
            { key: 'location', label: '位置' },
            { key: 'isBiofuel', label: '生質燃料', render: v => v === 1 ? '是' : '否' }
          ],
          [REFRIGERANT]: [
            { key: 'emissionFactorName', label: '排放因子' },
            { key: 'location', label: '位置' },
            { key: 'isBiofuel', label: '生質燃料', render: v => v === 1 ? '是' : '否' },
            { key: 'emissionRate', label: '逸散率', render: v => `${v || 0}%` }
          ]
        },
        handleSelectorChange: (props) => {
          defHandleSelectorChange(props);
          checkEquipmentDate(props);
        },
        checkerFunc: checkEquipmentDate,
        dependency: 'useDate'
      },
      { _key: 'emissionSourceId', type: 'hidden' }
    ],
    apis: { add: addFugitiveActivity }
  },
  [FUGITIVE_EMISSION_SEPTIC_TANK]: {
    middleForm: [
      {
        _key: 'equipmentId',
        labelName: '設備名稱',
        type: 'selectWithDesc',
        api: (params) => fetchFugitiveEmission(...params).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
        handleSelectorChange: (props) => {
          defHandleSelectorChange(props);
          checkEquipmentDate(props);
        },
        checkerFunc: checkEquipmentDate,
        dependency: 'useDate'
      },
      { _key: 'emissionSourceId', type: 'hidden' }
    ],
    useConfFirst: true,
    apis: { add: addFugitiveActivity }
  }
};

const category2 = {
  [IMPORTED_ELECTRICITY]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: '係數名稱',
        type: 'select',
        api: (params) => fetchImportedElectricityFactors(...params).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: defHandleSelectorChange,
        dependency: 'useDate'
      }
    ],
    apis: { add: addImportedElectricityActivity }
  },
  [IMPORTED_ENERGY]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: '係數名稱',
        type: 'select',
        api: (params) => fetchImportedEnergyFactors(...params).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: defHandleSelectorChange,
        dependency: 'useDate'
      }
    ],
    apis: { add: addImportedEnergyActivity }
  }
};

const transportationMidForm = (selectorApi) => [
  {
    _key: 'emissionSourceId',
    labelName: 'shippingMethod',
    type: 'select',
    api: (params) => selectorApi(...params).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
    handleSelectorChange: props => {
      defHandleSelectorChange(props);
      updateWeightAndDistanceUnit(props);
    },
    dependency: 'useDate'
  },
  { _key: 'departure', type: 'input' },
  { _key: 'destination', type: 'input' },
  { _key: 'usage1', type: 'inputNumber', required: true },
  { _key: 'unit1', labelName: 'unit', type: 'input', disabled: true },
  { _key: 'usage2', type: 'inputNumber', required: false, hideKey: 'hideUsage2' },
  { _key: 'unit2', labelName: 'unit', type: 'input', disabled: true, hideKey: 'hideUsage2' },
  { _key: 'transportContent', type: 'input', required: false },
  { _key: 'serviceProvider', type: 'input', required: false }
];

const upstreamNdownstreamConf = (selectorApi, apis, stationApi, stationApiFormat = { idKey: 'id', nameKey: 'name' }) => {
  const midForm = transportationMidForm(selectorApi);
  if (stationApi) {
    const stationField = { 
      type: 'select', 
      api: () => stationApi().then(res => formatRes(res, stationApiFormat.idKey, stationApiFormat.nameKey)) 
    };
    midForm[1] = { ...midForm[1], ...stationField };
    midForm[2] = { ...midForm[2], ...stationField };
  }
  return {
    middleForm: midForm,
    bottomForm: bottomForm.slice(2, 5),
    apis
  };
};

const bisTripConf = (stationApi, stationApiFormat = { idKey: 'id', nameKey: 'name' }, extraFields = []) => {
  const stationField = stationApi ? { type: 'select', api: () => stationApi().then(res => formatRes(res, stationApiFormat.idKey, stationApiFormat.nameKey)) } : { type: 'input' };
  return {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: '種類選擇',
        type: 'select',
        api: (params) => fetchBisTripType(...params).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: props => {
          defHandleSelectorChange(props);
          updateWeightAndDistanceUnit(props);
        },
        dependency: 'useDate'
      },
      { _key: 'departure', labelName: '出發站', ...stationField },
      { _key: 'destination', labelName: '抵達站', ...stationField },
      ...extraFields,
      { _key: 'usage1', labelName: '活動數據 1', type: 'inputNumber' },
      { _key: 'unit1', labelName: '單位', type: 'input', disabled: true },
      { _key: 'usage2', labelName: '活動數據 2', type: 'inputNumber', hideKey: 'hideUsage2' },
      { _key: 'unit2', labelName: '單位', type: 'input', disabled: true, hideKey: 'hideUsage2' }
    ],
    bottomForm: [
      { _key: 'source', type: 'hidden' },
      { _key: 'custodian', type: 'hidden' },
      { _key: 'file', type: 'hidden' }
    ],
    apis: { add: addBusinessTrip }
  };
};

const category3 = {
  [SHIP]: upstreamNdownstreamConf(fetchUpstreamTransportationMethods, { add: addUpstreamTransportation }, fetchPorts),
  [AIR_TRANSPORTATION]: upstreamNdownstreamConf(fetchUpstreamTransportationMethods, { add: addUpstreamTransportation }, fetchAirports, { idKey: 'code', nameKey: 'code' }),
  [LAND_TRANSPORTATION]: upstreamNdownstreamConf(fetchUpstreamTransportationMethods, { add: addUpstreamTransportation }),
  [EMPLOYEE_COMMUTING]: {
    topForm: [{ _key: 'useYear', labelName: '年度', type: 'input', disabled: true, required: true }],
    middleForm: [{ _key: 'employeeCommutingDataDetails', type: 'tableInput', labelName: '數據填寫' }],
    bottomForm: [
      { _key: 'source', type: 'hidden' },
      { _key: 'custodian', type: 'hidden' },
      { _key: 'file', type: 'hidden' }
    ],
    apis: { add: addEmployeeCommuting },
    saveFormatting: (val) => {
      const formData = new FormData();
      if (val.useYear) formData.append('useYear', val.useYear);
      
      // Append legacy implicit fields
      formData.append('source', val.source || '');
      formData.append('custodian', val.custodian || '');
      if (val.file) formData.append('file', val.file);

      if (val.employeeCommutingDataDetails) {
        const cleanedDetails = val.employeeCommutingDataDetails.map(row => ({
          commutingModeId: row.commutingModeId,
          emissionSourceId: row.emissionSourceId,
          numberOfPeople: parseInt(row.numberOfPeople, 10) || 0,
          distance: parseFloat(row.distance) || 0,
          remark: row.remark || ''
        }));
        formData.append('employeeCommutingDataDetails', JSON.stringify(cleanedDetails));
      }
      return formData;
    }
  },
  [AIRPLANE]: bisTripConf(fetchAirports, { idKey: 'code', nameKey: 'code' }, [{ _key: 'airline', type: 'input' }]),
  [HIGH_SPEED_RAIL]: bisTripConf(fetchHsrStations),
  [TRAIN]: bisTripConf(fetchTrainStations),
  [MRT]: bisTripConf(fetchMrtStations),
  [BUS]: bisTripConf(),
  [LONG_DISTANCE_BUS]: bisTripConf(),
  [TAXI]: bisTripConf(),
  [CAR]: bisTripConf(),
  [MOTORCYCLE]: bisTripConf()
};

const category4 = {
  [PURCHASED_PRODUCT_N_SERVICE]: {
    middleForm: [
      { _key: 'usage', labelName: 'quantity', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'serviceProvider', type: 'input' }
    ],
    bottomForm: bottomForm.slice(2, 5),
    initSetup: getDefaultUnit,
    apis: { add: addPurchasedGoodsAndService },
    saveFormatting: (val, equipmentTypeId) => {
      const formData = defFormatSave(val);
      formData.append('emissionSourceId', equipmentTypeId);
      return formData;
    }
  },
  [FUEL_N_ENERGY_ACTIVITY]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: '係數名稱',
        type: 'select',
        api: (params) => fetchFuelAndEnergyFactors(...params).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: props => {
          defHandleSelectorChange(props);
          updateWeightAndDistanceUnit({ ...props, weightUnitLabel: 'unit' });
        },
        dependency: 'useDate'
      },
      { _key: 'usage', labelName: 'energyConsumption', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'serviceProvider', type: 'input' }
    ],
    bottomForm: bottomForm.slice(2, 5),
    apis: { add: addFuelAndEnergy }
  },
  [UPSTREAM_EMISSION]: {
    middleForm: [
      { _key: 'usage', labelName: 'quantity', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'firm', type: 'input' }
    ],
    bottomForm: bottomForm.slice(2, 5),
    initSetup: getDefaultUnit,
    apis: { add: addUpstreamEmissions }
  },
  [WASTE_DISPOSAL_SERVICE]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: 'processingMethod',
        type: 'select',
        api: (params) => fetchWasteEmissionSrc(...params).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: props => {
          defHandleSelectorChange({ ...props, subId: 1 });
          updateWeightAndDistanceUnit({ ...props, weightUnitLabel: 'unit' });
        },
        dependency: 'useDate'
      },
      { _key: 'usage', labelName: 'wasteWeight', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'serviceProvider', type: 'input' }
    ],
    bottomForm: bottomForm.slice(2, 5),
    apis: { add: addWasteDisposalService }
  },
  [WASTE_DISPOSAL_TRANSPORTATION]: {
    middleForm: transportationMidForm(fetchWasteEmissionSrc),
    bottomForm: bottomForm.slice(2, 5),
    apis: { add: addWasteTransport }
  }
};

const category5 = {
  [PROCESSING_PRODUCT_N_SERVICE]: {
    middleForm: [
      { _key: 'usage', labelName: 'processQuantity', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'firm', labelName: 'processor', type: 'input' }
    ],
    initSetup: getDefaultUnit,
    bottomForm: bottomForm.slice(2, 5),
    apis: { add: addProcessingOfProductsAndServices }
  },
  [USE_PRODUCT_N_SERVICE]: {
    middleForm: [
      { _key: 'usage', labelName: 'usageAmount', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'firm', labelName: 'salesBase', type: 'input' }
    ],
    initSetup: getDefaultUnit,
    bottomForm: bottomForm.slice(2, 5),
    apis: { add: addUseOfProductsAndServices }
  },
  [END_TREATMENT_PRODUCT_N_SERVICE]: {
    middleForm: [
      { _key: 'usage', labelName: 'finalProcessingQuantity', type: 'inputNumber', required: true },
      { _key: 'unit', type: 'input', disabled: true },
      { _key: 'firm', labelName: 'finalProcessingManufacturer', type: 'input' }
    ],
    initSetup: getDefaultUnit,
    bottomForm: bottomForm.slice(2, 5),
    apis: { add: addEndTreatmentOfProductsAndServices }
  }
};

export const formConf = {
  default: { topForm, bottomForm, middleForm: [], apis: {}, saveFormatting: defFormatSave },
  ...category1,
  ...category2,
  ...category3,
  ...category4,
  ...category5
};
