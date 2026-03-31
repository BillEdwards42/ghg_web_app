import React from 'react'
import { EMISSION_SOURCE, FUGITIVE_TYPE, TRANSPORTATION_TYPE, WEIGHT_AND_DISTANCE_UNIT } from '../../../constants/EmissionSrc'
import dayjs from 'dayjs'
import {
  addFugitiveActivity, addImportedElectricityActivity, addImportedEnergyActivity, addIndustrialActivity, addMobileActivity, addStationaryActivity,
  delFugitiveActivity, delImportedElectricityActivity, delImportedEnergyActivity, delIndustrialActivity, delMobileActivity, delStationaryActivity,
  fetchFugitiveActivity, fetchFugitiveEmission, fetchImportedElectricityActivity, fetchImportedElectricityFactors, fetchImportedEnergyActivity, fetchImportedEnergyFactors,
  fetchIndustrialActivity, fetchIndustrialProcessMaterials, fetchMobileActivity, fetchMobileCombustion, fetchSrcAndCustodian, fetchStationaryActivity, fetchStationaryCombustion,
  modFugitiveActivity, modImportedElectricityActivity, modImportedEnergyActivity, modIndustrialActivity, modMobileActivity, modStationaryActivity,
  fetchDownstreamTransportationMethods, fetchUpstreamTransportation, addUpstreamTransportation, modUpstreamTransportation, delUpstreamTransportation,
  fetchUpstreamTransportationMethods, fetchDownstreamTransportation, addDownstreamTransportation, modDownstreamTransportation, delDownstreamTransportation,
  fetchPurchasedGoodsAndService, addPurchasedGoodsAndService, modPurchasedGoodsAndService, delPurchasedGoodsAndService,
  fetchFuelAndEnergy, addFuelAndEnergy, modFuelAndEnergy, delFuelAndEnergy, fetchFuelAndEnergyFactors, fetchWasteEmissionSrc, fetchWasteDisposalService, addWasteDisposalService, modWasteDisposalService, delWasteDisposalService, fetchWasteTransport, addWasteTransport, modWasteTransport, delWasteTransport,
  fetchBusinessTrip, addBusinessTrip, modBusinessTrip, delBusinessTrip, fetchAirports, fetchHsrStations, fetchTrainStations, fetchMrtStations, fetchBisTripType, fetchPorts, fetchDefaultUnit, fetchUpstreamEmissions, addUpstreamEmissions, modUpstreamEmissions, delUpstreamEmissions, fetchProcessingOfProductsAndServices, addProcessingOfProductsAndServices, modProcessingOfProductsAndServices, delProcessingOfProductsAndServices, fetchUseOfProductsAndServices, addUseOfProductsAndServices, modUseOfProductsAndServices, delUseOfProductsAndServices, fetchEndTreatmentOfProductsAndServices, addEndTreatmentOfProductsAndServices, modEndTreatmentOfProductsAndServices, delEndTreatmentOfProductsAndServices, fetchEmployeeCommuting, addEmployeeCommuting, modEmployeeCommuting, delEmployeeCommuting, fetchEmployeeCommutingConf
} from '../../../apis/activity'
import { TableInput } from '../components/FormComponent'
import { message } from 'antd'

const {
  STATIONARY_COMBUSTION, MOBILE_COMBUSTION, INDUSTRIAL_PROCESS, FUGITIVE_EMISSION, FUGITIVE_EMISSION_SEPTIC_TANK,
  IMPORTED_ELECTRICITY, IMPORTED_ENERGY,
  UPSTREAM_TRANSPORTATION, DOWNSTREAM_TRANSPORTATION, EMPLOYEE_COMMUTING,
  PURCHASED_PRODUCT_N_SERVICE, FUEL_N_ENERGY_ACTIVITY, WASTE_DISPOSAL_SERVICE, WASTE_DISPOSAL_TRANSPORTATION, UPSTREAM_EMISSION,
  PROCESSING_PRODUCT_N_SERVICE, USE_PRODUCT_N_SERVICE, END_TREATMENT_PRODUCT_N_SERVICE
} = EMISSION_SOURCE

const { AIRPLANE, HIGH_SPEED_RAIL, TRAIN, MRT, BUS, LONG_DISTANCE_BUS, TAXI, CAR, MOTORCYCLE, SHIP, LAND_TRANSPORTATION, AIR_TRANSPORTATION } = TRANSPORTATION_TYPE

// ---------------------------------------- Default Settings ----------------------------------------
const { SEPTIC_TANK, FIRE_EXTINGUISHER, REFRIGERANT } = FUGITIVE_TYPE

const handleChangeDate = async (date, checkCloseData, form, key) => {
  const res = await checkCloseData(dayjs(date).format('YYYY-MM-DD'))
  if (!res) form.setFieldValue(key, undefined)
}
const topForm = year => [{
  _key: 'useDate',
  type: 'date',
  disabledDate: (current, year) => current > dayjs() || dayjs(current).year() !== Number(year),
  tooltip: { title: 'useDateInfo' },
  onChange: (...args) => handleChangeDate(...args, 'useDate'),
  defaultPickerValue: Number(year) !== dayjs().year() && dayjs(`${year}-01-01`)
}]
const valueGreaterThanZeroRule = [{
  validator: (_, value) => {
    if (value === 0) return Promise.reject(new Error(''))
    return Promise.resolve()
  }
}]
const bottomForm = [
  { _key: 'usage', type: 'inputNumber', precision: 'unlimited', half: true, left: true, extraRules: valueGreaterThanZeroRule },
  { _key: 'unit', type: 'input', required: false, half: true, disabled: true },
  { _key: 'source', type: 'input', required: false, half: true, left: true },
  { _key: 'custodian', type: 'input', required: false, half: true },
  { _key: 'file', type: 'upload', required: false, labelName: 'uploadWithMaxSize', uploadProps: { accept: 'image/png, image/jpeg, image/jpg, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' }, maxSize: 5 }
]

const formatRes = (res, id = 'id', name = 'name', eName = 'eName', idToStr) => (
  { ...res, data: res?.data?.map(i => ({ ...i, id: idToStr ? `${i[id]}` : i[id], name: i[name], eName: i[eName] })) })

const defFormatSave = (value) => {
  const { useDate, useYear, file, ...other } = value
  const date = useYear ? { useYear: dayjs(useYear).format('YYYY') } : { useDate: dayjs(useDate).format('YYYY-MM-DD') }
  const removeUnit = Object.entries(other)?.filter(([key, val]) => !key?.toLowerCase()?.includes('unit'))?.reduce((all, i) => ({ ...all, [i[0]]: i[1] }), {})
  return { ...removeUnit, ...date, file: file && file.size ? file : undefined }
}
const defFormatLoad = (value, setHideUsage2) => {
  const { useDate, useYear, fileName, fileHash, usage2, unit2, ...other } = value
  let extras = { usage2, unit2 }
  if (usage2 === '-' || unit2 === '-') {
    setHideUsage2(true)
    extras = { ...extras, usage2: undefined, unit2: undefined }
  }
  return { ...other, ...extras, useDate: dayjs(useDate), useYear: dayjs(useYear), file: !fileHash && !fileName ? undefined : { uid: fileHash, name: fileName } }
}
const defHandleSelectorChange = async ({ item, form, facilityId, catInfo, subId = 0 }) => {
  if (!item || !item.id) return
  const updateForm = { unit: item?.emissionFactorUnit, emissionSourceId: item?.emissionSourceId }
  const emissionType = catInfo?.selected?.emissionTypeId
  const res = await fetchSrcAndCustodian(emissionType, facilityId, item?.id, subId)
  if (res?.status === 200) {
    if (res?.data?.source) updateForm.source = res?.data?.source
    if (res?.data?.custodian) updateForm.custodian = res?.data?.custodian
  }
  form.setFieldsValue(updateForm)
}
const updateWeightAndDistanceUnit = ({ item, form, weightUnitLabel = 'unit1', distanceUnitLabel = 'unit2', unitDict = WEIGHT_AND_DISTANCE_UNIT, check, setHideUsage2 }) => {
  const unit = item?.emissionFactorUnit
  const { weight, distance } = unitDict[unit.toLowerCase()] || {}
  if (check)setHideUsage2((!weight || !distance))
  form.setFieldsValue({ [weightUnitLabel]: weight || unit, [distanceUnitLabel]: distance || unit })
}

const getDefaultUnit = async ({ category, form, unitName = 'unit' }) => {
  const res = await fetchDefaultUnit(category?.selected?.equipmentTypeId)
  if (res?.status === 200) {
    form.setFieldValue(unitName, res?.data?.emissionFactorUnit)
    return { emissionSourceId: res?.data?.emissionSourceId, initFormVal: { [unitName]: res?.data?.emissionFactorUnit } }
  }
  return {}
}

// ---------------------------------------- Category 1 ----------------------------------------
const checkEquipmentDate = async ({ item, form, setBlockSave, ln_t, key }) => {
  const { dueDate, purchaseDate } = item || {}
  const date = form.getFieldValue('useDate')
  const beforeDueDate =
    !dueDate || !date || dayjs(dueDate).hour(23) >= dayjs(date).hour(0)
  const afterPurchaseDate =
    !purchaseDate ||
    !date ||
    dayjs(purchaseDate).hour(0) <= dayjs(date).hour(23)
  if (beforeDueDate && afterPurchaseDate) return setBlockSave({ block: false })
  const msg = !beforeDueDate
    ? ln_t('message.error.expiredEquipmentInActivity')
    : ln_t('message.error.activityBeforeEquipmentIsPurchased')
  message.error(msg)
  setBlockSave({ block: true, msg })
}

const formatDateParams = params => ({ ...params, useDate: dayjs(params?.useDate).format('YYYY-MM-DD') })

const category1 = {
  [STATIONARY_COMBUSTION]: {
    middleForm: [{
      _key: 'equipmentId',
      type: 'selectWithDesc',
      api: (params, ...args) => fetchStationaryCombustion(formatDateParams(params), ...args).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
      desc: [{ key: 'fuelName' }, { key: 'location' }, { key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }],
      handleSelectorChange: props => {
        defHandleSelectorChange(props)
        checkEquipmentDate(props)
      },
      checkerDependency: 'useDate',
      checkerFunc: checkEquipmentDate,
      dependency: 'useDate'
    },
    { _key: 'emissionSourceId', type: 'empty', formConf: { noStyle: true, label: '' } }],
    apis: { fetch: fetchStationaryActivity, add: addStationaryActivity, mod: modStationaryActivity, del: delStationaryActivity }
  },
  [MOBILE_COMBUSTION]: {
    middleForm: [{
      _key: 'equipmentId',
      type: 'selectWithDesc',
      api: (params, ...args) => fetchMobileCombustion(formatDateParams(params), ...args).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
      desc: [{ key: 'fuelName' }, { key: 'location' }, { key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }],
      handleSelectorChange: props => {
        defHandleSelectorChange(props)
        checkEquipmentDate(props)
      },
      checkerDependency: 'useDate',
      checkerFunc: checkEquipmentDate,
      dependency: 'useDate'
    },
    { _key: 'emissionSourceId', type: 'empty', formConf: { noStyle: true, label: '' } }],
    useConfFirst: true,
    apis: { fetch: fetchMobileActivity, add: addMobileActivity, mod: modMobileActivity, del: delMobileActivity }
  },
  [INDUSTRIAL_PROCESS]: {
    middleForm: [{
      _key: 'emissionSourceId',
      labelName: 'process',
      type: 'select',
      api: (params, ...args) => fetchIndustrialProcessMaterials(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'materialName')),
      handleSelectorChange: props => {
        defHandleSelectorChange({ ...props })
        updateWeightAndDistanceUnit({ ...props, weightUnitLabel: 'unit' })
      },
      dependency: 'useDate'
    }],
    apis: { fetch: fetchIndustrialActivity, add: addIndustrialActivity, mod: modIndustrialActivity, del: delIndustrialActivity },
    fetchKey: 'processId'
  },
  [FUGITIVE_EMISSION]: {
    middleForm: [{
      _key: 'equipmentId',
      type: 'selectWithDesc',
      api: (params, ...args) => fetchFugitiveEmission(formatDateParams(params), ...args).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
      descDependency: 'fugitiveTypeId',
      desc: {
        [SEPTIC_TANK]: [{ key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }],
        [FIRE_EXTINGUISHER]: [{ key: 'emissionFactorName' }, { key: 'location' }, { key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }],
        [REFRIGERANT]: [{ key: 'emissionFactorName' }, { key: 'location' }, { key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }, { key: 'emissionRate', render: e => `${e || 0}%` }]
      },
      handleSelectorChange: props => {
        defHandleSelectorChange(props)
        checkEquipmentDate(props)
      },
      checkerDependency: 'useDate',
      checkerFunc: checkEquipmentDate,
      dependency: 'useDate'
    },
    { _key: 'emissionSourceId', type: 'empty', formConf: { noStyle: true, label: '' } }],
    bottomForm: bottomForm.map(i => ({ ...i, labelName: i.key === 'usage' ? 'fillingAmount' : i.key === 'file' ? 'uploadWithMaxSize' : undefined })),
    apis: { fetch: fetchFugitiveActivity, add: addFugitiveActivity, mod: modFugitiveActivity, del: delFugitiveActivity }
  },
  [FUGITIVE_EMISSION_SEPTIC_TANK]: {
    middleForm: [{
      _key: 'equipmentId',
      type: 'selectWithDesc',
      api: (params, ...args) => fetchFugitiveEmission(formatDateParams(params), ...args).then(res => formatRes(res, 'equipmentId', 'equipmentName')),
      descDependency: 'fugitiveTypeId',
      desc: {
        [SEPTIC_TANK]: [{ key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }],
        [FIRE_EXTINGUISHER]: [{ key: 'emissionFactorName' }, { key: 'location' }, { key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }],
        [REFRIGERANT]: [{ key: 'emissionFactorName' }, { key: 'location' }, { key: 'isBiofuel', render: (e, ln_t) => ln_t(`util.${e === 1 ? 'yes' : 'no'}`) }]
      },
      handleSelectorChange: props => {
        defHandleSelectorChange(props)
        checkEquipmentDate(props)
      },
      checkerDependency: 'useDate',
      checkerFunc: checkEquipmentDate,
      dependency: 'useDate'
    },
    { _key: 'emissionSourceId', type: 'empty', formConf: { noStyle: true, label: '' } }],
    bottomForm: bottomForm.map(i => ({ ...i, ...i.key === 'usage' ? { labelName: 'employeeWorkingHours', tooltip: { title: 'employeeWorkingHoursInfo' } } : {} })),
    apis: { fetch: fetchFugitiveActivity, add: addFugitiveActivity, mod: modFugitiveActivity, del: delFugitiveActivity },
    useConfFirst: true
  }
}

// ---------------------------------------- Category 2 ----------------------------------------
const category2 = {
  [IMPORTED_ELECTRICITY]: {
    middleForm: [{
      _key: 'emissionSourceId',
      type: 'select',
      api: (params, ...args) => fetchImportedElectricityFactors(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
      handleSelectorChange: defHandleSelectorChange,
      dependency: 'useDate'
    }],
    apis: { fetch: fetchImportedElectricityActivity, add: addImportedElectricityActivity, mod: modImportedElectricityActivity, del: delImportedElectricityActivity },
    fetchKey: 'energyTypeId'
  },
  [IMPORTED_ENERGY]: {
    middleForm: [{
      _key: 'emissionSourceId',
      type: 'select',
      api: (params, ...args) => fetchImportedEnergyFactors(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
      handleSelectorChange: defHandleSelectorChange,
      dependency: 'useDate'
    }],
    apis: { fetch: fetchImportedEnergyActivity, add: addImportedEnergyActivity, mod: modImportedEnergyActivity, del: delImportedEnergyActivity },
    fetchKey: 'energyTypeId'
  }
}

// ---------------------------------------- Category 3 ----------------------------------------
const transportationMidForm = ({ selectorApi, selectorConf, departure, destination }) => [
  {
    _key: 'emissionSourceId',
    labelName: 'shippingMethod',
    type: 'select',
    api: (params, ...args) => selectorApi(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
    handleSelectorChange: props => {
      defHandleSelectorChange(props)
      updateWeightAndDistanceUnit({ ...props, check: true })
    },
    dependency: 'useDate',
    ...selectorConf
  },
  { _key: 'departure', type: 'input', half: true, left: true, ...departure },
  { _key: 'destination', type: 'input', half: true, ...destination },
  { _key: 'usage1', type: 'inputNumber', precision: 'unlimited', half: true, left: true },
  { _key: 'unit1', labelName: 'unit', required: false, type: 'input', half: true, disabled: true },
  { _key: 'usage2', type: 'inputNumber', precision: 'unlimited', half: true, left: true },
  { _key: 'unit2', labelName: 'unit', required: false, type: 'input', half: true, disabled: true },
  { _key: 'transportContent', type: 'input', required: false },
  { _key: 'serviceProvider', type: 'input', required: false }
]
const upstreamNdownstreamConf = props => {
  const { stationApi, stationApiFormat = {}, selectorApi, apis } = props || {}
  const { idKey, nameKey } = stationApiFormat
  const stationConf = stationApi ? { type: 'select', api: () => stationApi({ maxResults: 1000 }).then(res => formatRes(res, idKey, nameKey, 'eName', true)) } : {}
  return {
    editModeFetchFirst: true,
    middleForm: transportationMidForm({ selectorApi, departure: stationConf, destination: stationConf }),
    bottomForm: bottomForm.slice(2, 5),
    apis
  }
}

const bisTripConf = props => {
  const { labelName = {}, stationApi, extraMidForm = [], stationApiFormat, stationProps = {}, initSetup } = props || {}
  const { idKey, nameKey } = stationApiFormat || {}
  const getLabelName = key => labelName[key] ? { labelName: labelName[key] } : {}
  const stationConf = stationApi ? { type: 'select', api: (params, ...args) => stationApi({ maxResults: 1000, ...params }, ...args).then(res => formatRes(res, idKey, nameKey, 'eName', true)) } : {}
  return {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: 'type',
        type: 'select',
        api: (params, ...args) => fetchBisTripType(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: props => {
          defHandleSelectorChange(props)
          updateWeightAndDistanceUnit({ ...props, check: true })
        },
        dependency: 'useDate'
      },
      { _key: 'departure', labelName: 'departureStation', type: 'input', ...stationConf, ...getLabelName('departure'), ...stationProps },
      { _key: 'destination', labelName: 'arrivalStation', type: 'input', ...stationConf, ...getLabelName('arrival'), ...stationProps },
      ...extraMidForm,
      { _key: 'usage1', type: 'inputNumber', half: true, left: true },
      { _key: 'unit1', labelName: 'unit', required: false, type: 'input', half: true, disabled: true },
      { _key: 'usage2', type: 'inputNumber', precision: 'unlimited', half: true, left: true, ...getLabelName('distance') },
      { _key: 'unit2', labelName: 'unit', required: false, type: 'input', half: true, disabled: true }
    ],
    bottomForm: bottomForm.slice(2, 5),
    fetchKey: 'businessTripModeId',
    apis: { fetch: fetchBusinessTrip, add: addBusinessTrip, mod: modBusinessTrip, del: delBusinessTrip },
    initSetup
  }
}

const generalConf = {
  [UPSTREAM_TRANSPORTATION]: {
    selectorApi: fetchUpstreamTransportationMethods,
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchUpstreamTransportation({ ...params, transportationTypeId: equipmentTypeId }, ...args), add: addUpstreamTransportation, mod: modUpstreamTransportation, del: delUpstreamTransportation }
  },
  [DOWNSTREAM_TRANSPORTATION]: {
    selectorApi: fetchDownstreamTransportationMethods,
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchDownstreamTransportation({ ...params, transportationTypeId: equipmentTypeId }, ...args), add: addDownstreamTransportation, mod: modDownstreamTransportation, del: delDownstreamTransportation }
  }
}

const category3 = {
  [SHIP]: ({ category }) => upstreamNdownstreamConf({ ...generalConf[category], stationApi: fetchPorts }),
  [AIR_TRANSPORTATION]: ({ category }) => upstreamNdownstreamConf({ ...generalConf[category], stationApi: fetchAirports, stationApiFormat: { idKey: 'code', nameKey: 'code' } }),
  [LAND_TRANSPORTATION]: ({ category }) => upstreamNdownstreamConf({ ...generalConf[category] }),
  [EMPLOYEE_COMMUTING]: {
    topForm: year => [{ _key: 'useYear', labelName: 'year', type: 'date', disabledDate: current => current > dayjs(), picker: 'year', disabled: true }],
    middleForm: [{ _key: 'employeeCommutingDataDetails', labelName: 'dataFilling', customComponent: props => <TableInput {...props} api={fetchEmployeeCommutingConf} /> }],
    bottomForm: bottomForm.slice(2, 5),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchEmployeeCommuting(params, ...args), add: addEmployeeCommuting, mod: modEmployeeCommuting, del: delEmployeeCommuting },
    saveFormatting: e => {
      const { employeeCommutingDataDetails, ...other } = defFormatSave(e)
      return {
        ...other,
        employeeCommutingDataDetails: JSON.stringify(employeeCommutingDataDetails?.map(i => {
          const { commutingModeId, emissionSourceId, numberOfPeople, distance, remark } = i || {}
          return { commutingModeId, emissionSourceId, numberOfPeople, distance, remark }
        }))
      }
    },
    initSetup: ({ year }) => ({ initFormVal: { useYear: dayjs(year) } })
  },
  [AIRPLANE]: bisTripConf({
    labelName: { departure: 'departureAirport', arrival: 'arrivalAirport', distance: 'totalMiles' },
    stationApi: async (params, facility, equipment, year, all) => {
      return ({ status: 200, data: all?.selected?.exclude?.airportOptions })
    },
    stationApiFormat: { idKey: 'code', nameKey: 'code' },
    extraMidForm: [{ _key: 'airline', type: 'input', required: false }],
    initSetup: async () => {
      const res = await fetchAirports({ maxResults: 10000 })
      if (res?.status === 200) return ({ exclude: { airportOptions: res?.data } })
    }
  }),
  [HIGH_SPEED_RAIL]: bisTripConf({ stationApi: fetchHsrStations }),
  [TRAIN]: bisTripConf({ stationApi: fetchTrainStations }),
  [MRT]: bisTripConf({ stationApi: fetchMrtStations }),
  [BUS]: bisTripConf(),
  [LONG_DISTANCE_BUS]: bisTripConf(),
  [TAXI]: bisTripConf({ labelName: { departure: 'departurePoint', arrival: 'arrivalPoint' } }),
  [CAR]: bisTripConf({ labelName: { departure: 'departurePoint', arrival: 'arrivalPoint' } }),
  [MOTORCYCLE]: bisTripConf({ labelName: { departure: 'departurePoint', arrival: 'arrivalPoint' } })
}

// ---------------------------------------- Category 4 ----------------------------------------
const category4 = {
  [PURCHASED_PRODUCT_N_SERVICE]: {
    middleForm: [
      { _key: 'usage', labelName: 'quantity', type: 'inputNumber', precision: 'unlimited', half: true, left: true, extraRules: valueGreaterThanZeroRule },
      { _key: 'unit', required: false, type: 'input', half: true, disabled: true },
      { _key: 'serviceProvider', type: 'input', required: false }
    ],
    bottomForm: bottomForm.slice(2, 5),
    initSetup: (...args) => getDefaultUnit(...args),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchPurchasedGoodsAndService({ ...params, emissionSourceId: equipmentTypeId }, ...args), add: addPurchasedGoodsAndService, mod: modPurchasedGoodsAndService, del: delPurchasedGoodsAndService },
    saveFormatting: (e, equipmentTypeId) => ({ ...defFormatSave(e), emissionSourceId: equipmentTypeId })
  },
  [FUEL_N_ENERGY_ACTIVITY]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        type: 'select',
        api: (params, ...args) => fetchFuelAndEnergyFactors(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: props => {
          defHandleSelectorChange(props)
          updateWeightAndDistanceUnit({ ...props, weightUnitLabel: 'unit' })
        },
        dependency: 'useDate'
      },
      { _key: 'usage', labelName: 'energyConsumption', type: 'inputNumber', precision: 'unlimited', half: true, left: true, extraRules: valueGreaterThanZeroRule },
      { _key: 'unit', required: false, type: 'input', half: true, disabled: true },
      { _key: 'serviceProvider', type: 'input', required: false }
    ],
    bottomForm: bottomForm.slice(2, 5),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchFuelAndEnergy({ ...params, energyTypeId: equipmentTypeId }, ...args), add: addFuelAndEnergy, mod: modFuelAndEnergy, del: delFuelAndEnergy }
  },
  [UPSTREAM_EMISSION]: {
    middleForm: [
      { _key: 'usage', labelName: 'quantity', type: 'inputNumber', precision: 'unlimited', half: true, left: true, extraRules: valueGreaterThanZeroRule },
      { _key: 'unit', required: false, type: 'input', half: true, disabled: true },
      { _key: 'firm', type: 'input', required: false }
    ],
    bottomForm: bottomForm.slice(2, 5),
    initSetup: (...args) => getDefaultUnit(...args),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchUpstreamEmissions({ ...params, wasteDisposalMethodId: equipmentTypeId }, ...args), add: addUpstreamEmissions, mod: modUpstreamEmissions, del: delUpstreamEmissions },
    saveFormatting: (val, id, category) => ({ ...defFormatSave(val), emissionSourceId: category?.selected?.emissionSourceId })
  },
  [WASTE_DISPOSAL_SERVICE]: {
    middleForm: [
      {
        _key: 'emissionSourceId',
        labelName: 'processingMethod',
        type: 'select',
        api: (params, ...args) => fetchWasteEmissionSrc(formatDateParams(params), ...args).then(res => formatRes(res, 'emissionSourceId', 'emissionFactorName')),
        handleSelectorChange: props => {
          defHandleSelectorChange({ ...props, subId: 1 })
          updateWeightAndDistanceUnit({ ...props, weightUnitLabel: 'unit' })
        },
        dependency: 'useDate'
      },
      { _key: 'usage', labelName: 'wasteWeight', type: 'inputNumber', precision: 'unlimited', half: true, left: true, extraRules: valueGreaterThanZeroRule },
      { _key: 'unit', required: false, type: 'input', half: true, disabled: true },
      { _key: 'serviceProvider', type: 'input', required: false }
    ],
    bottomForm: bottomForm.slice(2, 5),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchWasteDisposalService({ ...params, wasteDisposalMethodId: equipmentTypeId }, ...args), add: addWasteDisposalService, mod: modWasteDisposalService, del: delWasteDisposalService }
  },
  [WASTE_DISPOSAL_TRANSPORTATION]: {
    editModeFetchFirst: true,
    middleForm: transportationMidForm({
      selectorApi: fetchWasteEmissionSrc,
      selectorConf: {
        handleSelectorChange: props => {
          defHandleSelectorChange({ ...props, subId: 2 })
          updateWeightAndDistanceUnit({ ...props, check: true })
        }
      }
    }),
    bottomForm: bottomForm.slice(2, 5),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchWasteTransport({ ...params, wasteDisposalMethodId: equipmentTypeId }, ...args), add: addWasteTransport, mod: modWasteTransport, del: delWasteTransport }
  }
}

// ---------------------------------------- Category 5 ----------------------------------------
const productNserviceConf = props => {
  const { usageLabel, manufacturerLabel } = props || {}
  return {
    middleForm: [
      { _key: 'usage', labelName: usageLabel, type: 'inputNumber', precision: 'unlimited', half: true, left: true, extraRules: valueGreaterThanZeroRule },
      { _key: 'unit', required: false, type: 'input', half: true, disabled: true },
      { _key: 'firm', labelName: manufacturerLabel, type: 'input', required: false }
    ],
    initSetup: (...args) => getDefaultUnit(...args),
    bottomForm: bottomForm.slice(2, 5),
    saveFormatting: (val, id, category) => ({ ...defFormatSave(val), emissionSourceId: category?.selected?.emissionSourceId })
  }
}
const category5 = {
  [PROCESSING_PRODUCT_N_SERVICE]: {
    ...productNserviceConf({ usageLabel: 'processQuantity', manufacturerLabel: 'processor' }),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchProcessingOfProductsAndServices({ ...params, wasteDisposalMethodId: equipmentTypeId }, ...args), add: addProcessingOfProductsAndServices, mod: modProcessingOfProductsAndServices, del: delProcessingOfProductsAndServices }
  },
  [USE_PRODUCT_N_SERVICE]: {
    ...productNserviceConf({ usageLabel: 'usageAmount', manufacturerLabel: 'salesBase' }),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchUseOfProductsAndServices({ ...params, wasteDisposalMethodId: equipmentTypeId }, ...args), add: addUseOfProductsAndServices, mod: modUseOfProductsAndServices, del: delUseOfProductsAndServices }
  },
  [END_TREATMENT_PRODUCT_N_SERVICE]: {
    ...productNserviceConf({ usageLabel: 'finalProcessingQuantity', manufacturerLabel: 'finalProcessingManufacturer' }),
    apis: { fetch: ({ equipmentTypeId, ...params }, ...args) => fetchEndTreatmentOfProductsAndServices(params, ...args), add: addEndTreatmentOfProductsAndServices, mod: modEndTreatmentOfProductsAndServices, del: delEndTreatmentOfProductsAndServices }
  }
}

// ---------------------------------------- Export ----------------------------------------
export const formConf = {
  default: { topForm, bottomForm, middleForm: [], apis: {}, saveFormatting: defFormatSave, loadFormatting: defFormatLoad, fetchKey: 'equipmentTypeId', editModeFetchFirst: false },
  ...category1,
  ...category2,
  ...category3,
  ...category4,
  ...category5
}
