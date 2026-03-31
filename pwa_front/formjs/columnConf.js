import React from 'react'
import { EMISSION_SOURCE } from '../../../constants/EmissionSrc'
import dayjs from 'dayjs'
import { Tag, Tooltip } from 'antd'
import Icon from '@mdi/react'
import { mdiDeleteForever, mdiPencil } from '@mdi/js'
import { PaperClipOutlined } from '@ant-design/icons'
import { localeNumberFormat } from '../../../components/utils/i18nNumberFormat'

const {
  STATIONARY_COMBUSTION, MOBILE_COMBUSTION, INDUSTRIAL_PROCESS, FUGITIVE_EMISSION, FUGITIVE_EMISSION_SEPTIC_TANK,
  IMPORTED_ELECTRICITY, IMPORTED_ENERGY,
  UPSTREAM_TRANSPORTATION, DOWNSTREAM_TRANSPORTATION, EMPLOYEE_COMMUTING, BUSSINESS_TRIP,
  PURCHASED_PRODUCT_N_SERVICE, FUEL_N_ENERGY_ACTIVITY, WASTE_DISPOSAL_SERVICE, WASTE_DISPOSAL_TRANSPORTATION, UPSTREAM_EMISSION, PROCESSING_PRODUCT_N_SERVICE, USE_PRODUCT_N_SERVICE, END_TREATMENT_PRODUCT_N_SERVICE
} = EMISSION_SOURCE

export const initFetchParams = { equipmentTypeId: undefined, processId: undefined, energyTypeId: undefined }

// ----- Table Column Config -----
export const columnConf = (ln_t, i18n, handleEdit, handleDelete, handleShowFile) => {
  const formatNumber = (e, data, decimal) => localeNumberFormat(e, i18n.language, { maximumFractionDigits: decimal })
  const topCol = [{ title: ln_t('activity.date'), dataIndex: 'useDate', sorter: true, render: e => <span style={{ whiteSpace: 'nowrap' }}>{dayjs(e).format('YYYY-MM-DD')}</span> }]
  const bottomCol = [
    { title: ln_t('activity.usage'), dataIndex: 'usage', sorter: true, render: formatNumber },
    { title: ln_t('activity.unit'), dataIndex: 'unit' },
    { title: `${ln_t('activity.carbonEmission')} (KgCO2e)`, dataIndex: 'carbonEmission', sorter: true, render: e => formatNumber(e, {}, 8) },
    {
      title: ln_t('activity.file'),
      dataIndex: 'fileName',
      render: (e, item) => e
        ? <Tooltip title={e}>
            <Tag icon={<PaperClipOutlined />} className='cursor-pointer' onClick={() => handleShowFile(item)}>
              <span style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e?.split('.')?.slice(0, -1)?.join('')}</span>
              <span>.{e?.split('.')?.splice(-1)}</span>
            </Tag>
          </Tooltip>
        : '-'
    },
    { title: ln_t('activity.creator'), dataIndex: 'creator' },
    {
      title: ln_t('util.manage'),
      dataIndex: 'id',
      render: (id, data) => <div key={id} className="action-btn">
          <Icon className="edit" path={mdiPencil} size={0.75} onClick={() => handleEdit(data)} />
          <Icon className="delete" path={mdiDeleteForever} size={0.75} onClick={() => handleDelete(data)} />
        </div>
    }
  ]
  const emissionFacorCol = [{ title: ln_t('activity.emissionCoefficient'), dataIndex: 'emissionFactorName', sorter: true }]
  const defMiddleCol = (useFuel) => [
    { title: ln_t('activity.equipment'), dataIndex: 'equipmentName', sorter: true },
    ...useFuel ? [{ title: ln_t('activity.fuel'), dataIndex: 'fuelName', sorter: true }] : [],
    ...emissionFacorCol
  ]

  const transportationMidCol = [
    ...emissionFacorCol,
    { title: ln_t('activity.usage1'), dataIndex: 'usage1', sorter: true, render: formatNumber },
    { title: ln_t('activity.unit'), dataIndex: 'unit1' },
    { title: ln_t('activity.usage2'), dataIndex: 'usage2', sorter: true, render: formatNumber },
    { title: ln_t('activity.unit'), dataIndex: 'unit2' }
  ]

  return {
    default: { topCol, middleCol: defMiddleCol(), bottomCol },
    [STATIONARY_COMBUSTION]: { middleCol: defMiddleCol(true) },
    [MOBILE_COMBUSTION]: { middleCol: defMiddleCol(true) },
    [INDUSTRIAL_PROCESS]: { middleCol: [{ title: ln_t('activity.material'), dataIndex: 'materialName', sorter: true }, ...emissionFacorCol] },
    [FUGITIVE_EMISSION]: { bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.fillingAmount') : i.title })) },
    [FUGITIVE_EMISSION_SEPTIC_TANK]: { bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.employeeWorkingHours') : i.title })) },
    [IMPORTED_ELECTRICITY]: { middleCol: emissionFacorCol },
    [IMPORTED_ENERGY]: { middleCol: emissionFacorCol },
    [UPSTREAM_TRANSPORTATION]: { middleCol: transportationMidCol, bottomCol: bottomCol?.slice(2, bottomCol?.length) },
    [DOWNSTREAM_TRANSPORTATION]: { middleCol: transportationMidCol, bottomCol: bottomCol?.slice(2, bottomCol?.length) },
    [EMPLOYEE_COMMUTING]: {
      topCol: [{ title: ln_t('activity.year'), dataIndex: 'useYear', sorter: true, render: e => dayjs(e).format('YYYY') }],
      middleCol: [{
        title: ln_t('activity.commutingModeId'),
        dataIndex: 'commutingMode',
        render: (e = '') => <Tooltip title={e?.split(',')?.length > 3 ? e : ''}>
          {e?.split(',')?.splice(0, 3).join(', ')}{e?.split(',')?.length > 3 ? '...' : ''}
        </Tooltip>
      }],
      bottomCol: bottomCol?.slice(2, bottomCol?.length)
    },
    [BUSSINESS_TRIP]: { middleCol: emissionFacorCol, bottomCol: bottomCol?.slice(2, bottomCol?.length) },
    [PURCHASED_PRODUCT_N_SERVICE]: { middleCol: emissionFacorCol, bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.quantity') : i.title })) },
    [FUEL_N_ENERGY_ACTIVITY]: { middleCol: emissionFacorCol },
    [WASTE_DISPOSAL_SERVICE]: {
      middleCol: [
        ...emissionFacorCol,
        { title: ln_t('activity.wasteWeight'), dataIndex: 'usage', sorter: true, render: formatNumber },
        { title: ln_t('activity.unit'), dataIndex: 'unit' }
      ],
      bottomCol: bottomCol?.slice(2, bottomCol?.length)
    },
    [WASTE_DISPOSAL_TRANSPORTATION]: { middleCol: transportationMidCol, bottomCol: bottomCol?.slice(2, bottomCol?.length) },
    [UPSTREAM_EMISSION]: { middleCol: emissionFacorCol, bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.quantity') : i.title })) },
    [PROCESSING_PRODUCT_N_SERVICE]: { middleCol: emissionFacorCol, bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.processQuantity') : i.title })) },
    [USE_PRODUCT_N_SERVICE]: { middleCol: emissionFacorCol, bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.usageAmount') : i.title })) },
    [END_TREATMENT_PRODUCT_N_SERVICE]: { middleCol: emissionFacorCol, bottomCol: bottomCol.map(i => ({ ...i, title: i.dataIndex === 'usage' ? ln_t('activity.finalProcessingQuantity') : i.title })) }
  }
}
