import dayjs from 'dayjs'
import { fetchBisTripType, fetchDownstreamTransportationMethods, fetchUpstreamTransportationMethods, fetchWasteEmissionSrc, uploadBusinessTripActivity, uploadDownstreamTransportationActivity, uploadEmployeeCommutingActivity, uploadEndTreatmentOfProductsAndServicesActivity, uploadFuelAndEnergyActivity, uploadFugitiveActivity, uploadImportedElectricityActivity, uploadImportedEnergyActivity, uploadIndustrialActivity, uploadMobileActivity, uploadProcessingOfProductsAndServicesActivity, uploadPurchasedGoodsAndServiceActivity, uploadStationaryActivity, uploadUpstreamEmissionsActivity, uploadUpstreamTransportationActivity, uploadUseOfProductsAndServicesActivity, uploadWasteDisposalServiceActivity, uploadWasteTransportServiceActivity } from '../../../apis/activity'
import { EMISSION_SOURCE } from '../../../constants/EmissionSrc'

export const dateFormat = 'YYYY-MM-DD'
export const excelDateFormatting = serial => serial ? dayjs(new Date(Math.floor(serial - 25569) * 86400 * 1000)) : undefined

const {
  STATIONARY_COMBUSTION, MOBILE_COMBUSTION, INDUSTRIAL_PROCESS, FUGITIVE_EMISSION,
  IMPORTED_ELECTRICITY, IMPORTED_ENERGY,
  UPSTREAM_TRANSPORTATION, DOWNSTREAM_TRANSPORTATION, EMPLOYEE_COMMUTING, BUSSINESS_TRIP,
  PURCHASED_PRODUCT_N_SERVICE, FUEL_N_ENERGY_ACTIVITY, UPSTREAM_EMISSION, WASTE_DISPOSAL_SERVICE, WASTE_DISPOSAL_TRANSPORTATION,
  PROCESSING_PRODUCT_N_SERVICE, USE_PRODUCT_N_SERVICE, END_TREATMENT_PRODUCT_N_SERVICE
} = EMISSION_SOURCE

// ----------------- saving -----------------
const valueFormatting = {
  default: val => val,
  useDate: val => excelDateFormatting(val).format(dateFormat),
  emissionTypeId: val => `${val}`,
  commutingModeId: val => `${val}`,
  useYear: val => Number(val)
}
const formattingData = (obj, headerToKey) => Object.entries(obj)?.map(([k, val]) => {
  const key = headerToKey[k]
  const formatFunc = valueFormatting[key] || valueFormatting.default
  const value = formatFunc(val)
  return key && value ? { [key]: formatFunc(val) } : {}
})?.reduce((all, x) => ({ ...all, ...x }), {})

const defFormatSave = ({ facilityId, catInfo, year, uploadData, extraSavePayload = [], headerToKey }) => {
  const { emissionTypeId, equipmentTypeId } = catInfo?.selected || {}
  const extras = extraSavePayload.map(i => ({ [i]: catInfo?.selected?.[i] } || {}))?.reduce((all, x) => ({ ...all, ...x }), {})
  const datas = uploadData?.map(({ id, ...other }) => ({ ...formattingData(other, headerToKey), facilityId }))
  return { facilityId, year, emissionTypeId: `${emissionTypeId}`, equipmentTypeId, datas, ...extras }
}

const employeeCommutingUploadFormatSave = value => {
  const { tableHeader, headerToKey } = value
  const defaultFormat = defFormatSave(value)
  const extras = formattingData(tableHeader, headerToKey)
  return { ...defaultFormat, ...extras, emissionTypeId: '10' }
}

// ----------------- excel formatting -----------------
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i).toUpperCase())
const readExcelFormatting = data => {
  const tableData = {}
  const getObj = row => data?.[row]?.w
  const headerToKey = alphabet?.reduce((all, i) => ({ ...all, ...getObj(`${i}2`) ? { [getObj(`${i}3`)]: getObj(`${i}2`) } : {} }), {})
  Object.entries(data).forEach(([key, val]) => { if (!key.includes('2') || key.length > 2) tableData[key] = val })
  tableData['!ref'] = data['!ref'].replace('A2', 'A3')
  return { data: tableData, headerToKey }
}

const employeeCommutingKey = {
  'number of': 'numberOfPeople',
  distance: 'distance',
  remark: 'remark',
  emissionsourceid: 'emissionSourceId',
  commutingmodeid: 'commutingModeId',
  year: 'useYear',
  'data source': 'source',
  custodian: 'custodian',
  員工人次: 'numberOfPeople',
  平均通勤距離: 'distance',
  備註: 'remark',
  排放源id: 'emissionSourceId',
  通勤方式id: 'commutingModeId',
  年: 'useYear',
  數據來源: 'source',
  保存單位: 'custodian'
}
const employeeCommutingReadExcelFormat = data => {
  const tableData = {}
  const getObj = row => data?.[row]?.w
  const extras = { [getObj('A2')]: getObj('B2'), [getObj('C2')]: getObj('D2'), [getObj('C3')]: getObj('D3') }
  const header = alphabet?.map(i => getObj(`${i}4`))?.filter(i => i)
  const headerToKey = [...header, ...Object.keys(extras)]?.reduce((all, i) => {
    const findKey = Object.entries(employeeCommutingKey)?.find(([key]) => i?.toLowerCase()?.includes(key))?.[1]
    return { ...all, ...findKey ? { [i]: findKey } : {} }
  }, {})
  Object.entries(data).forEach(([key, val]) => { if (!key.includes('3') || key.length > 2) tableData[key] = val })
  tableData['!ref'] = data['!ref'].replace('A2', 'A4')
  return { data: tableData, extras, headerToKey }
}

// ----------------- config -----------------
const tableColConf = {
  exclude: ['id', '設備id', '排放源id', 'equipmentid', 'emissionsourceid', 'commutingmodeid', '通勤方式id', 'departure id', 'destination id', '起點id', '終點id', '出發站id', '抵達站id'],
  disabled: ['設備名稱', '燃料', '所在位置', '是否為生質能', '單位', '產品/原料', '係數/氣體名稱', '填充氣體',
    'equipment_name', 'equipment name', 'fuel', 'location', 'is_biomass', 'unit', 'product/raw material', 'filling gas', 'coefficient/gas name']
}
export const uploadConf = {
  default: { api: () => {}, formatSave: defFormatSave, columnConf: tableColConf, readExcelFormatting, extraFetch: () => {} },
  [STATIONARY_COMBUSTION]: { api: uploadStationaryActivity },
  [MOBILE_COMBUSTION]: { api: uploadMobileActivity },
  [INDUSTRIAL_PROCESS]: { api: uploadIndustrialActivity },
  [FUGITIVE_EMISSION]: { api: uploadFugitiveActivity, extraSavePayload: ['fugitiveTypeId'] },
  [IMPORTED_ENERGY]: { api: uploadImportedEnergyActivity },
  [IMPORTED_ELECTRICITY]: { api: uploadImportedElectricityActivity },
  [UPSTREAM_TRANSPORTATION]: { api: uploadUpstreamTransportationActivity, extraFetch: fetchUpstreamTransportationMethods },
  [DOWNSTREAM_TRANSPORTATION]: { api: uploadDownstreamTransportationActivity, extraFetch: fetchDownstreamTransportationMethods },
  [BUSSINESS_TRIP]: { api: uploadBusinessTripActivity, extraFetch: fetchBisTripType },
  [PURCHASED_PRODUCT_N_SERVICE]: { api: uploadPurchasedGoodsAndServiceActivity },
  [FUEL_N_ENERGY_ACTIVITY]: { api: uploadFuelAndEnergyActivity },
  [UPSTREAM_EMISSION]: { api: uploadUpstreamEmissionsActivity },
  [WASTE_DISPOSAL_SERVICE]: { api: uploadWasteDisposalServiceActivity },
  [WASTE_DISPOSAL_TRANSPORTATION]: { api: uploadWasteTransportServiceActivity, extraFetch: fetchWasteEmissionSrc },
  [PROCESSING_PRODUCT_N_SERVICE]: { api: uploadProcessingOfProductsAndServicesActivity },
  [USE_PRODUCT_N_SERVICE]: { api: uploadUseOfProductsAndServicesActivity },
  [END_TREATMENT_PRODUCT_N_SERVICE]: { api: uploadEndTreatmentOfProductsAndServicesActivity },
  [EMPLOYEE_COMMUTING]: { api: uploadEmployeeCommutingActivity, readExcelFormatting: employeeCommutingReadExcelFormat, formatSave: employeeCommutingUploadFormatSave }
}

export const downloadConf = {
  default: { formatSave: payload => payload },
  [EMPLOYEE_COMMUTING]: { formatSave: payload => ({ ...payload, emissionTypeId: '10' }) }
}
