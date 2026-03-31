import React, { useEffect, useMemo, useState } from 'react'
import { GreyBox, UploadBtnWrapper, UploadDescTitle, UploadDescWrapper, UploadTableWrapper } from '../activity.styled'
import { useTranslation } from 'react-i18next'
// import UploadExample from './UploadExample'
import { Button, DatePicker, Input, Modal, Spin, Upload, message } from 'antd'
import Icon from '@mdi/react'
import { mdiTrayArrowUp, mdiContentSaveOutline, mdiTrayArrowDown } from '@mdi/js'
import { readExcel } from '../../../components/utils/readExcel'
import useParams from '../../../hook/useParams'
import MainTable from '../../../components/Basic/MainTable'
import { dateFormat, downloadConf, excelDateFormatting, uploadConf } from '../conf/uploadConf'
import { useSelector } from 'react-redux'
import { downloadActivityExample } from '../../../apis/activity'
import { WEIGHT_AND_DISTANCE_UNIT } from '../../../constants/EmissionSrc'

const maxUpload = 100
function ActivityUpload (props) {
  const { allCategoryInfo, successCallback, onDownload, params: mainParams } = props
  const year = Number(mainParams?.fetchParams?.year)
  const { t: ln_t } = useTranslation()
  const user = useSelector((state) => state.user)
  const { nowFacility } = user
  const params = useParams()
  const { handleFetchParams, fetchParams } = params
  const [fileList, setFileList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [blockSave, setBlockSave] = useState(false)
  const [tableHeader, setTableHeader] = useState()
  const [headerToKey, setHeaderToKey] = useState({})
  const [extraInfo, setExtraInfo] = useState({})
  const category = allCategoryInfo?.selected?.emissionTypeKey || allCategoryInfo?.selected?.emissionTypeName
  const equipment = allCategoryInfo?.selected?.equipmentTypeKey || allCategoryInfo?.selected?.equipmentTypeName
  const uploadConfig = { ...uploadConf.default, ...uploadConf[category?.toLowerCase()] || uploadConf[equipment?.toLowerCase()] || {} }
  const { api, formatSave, extraSavePayload, columnConf, readExcelFormatting, extraFetch } = uploadConfig
  const isRequired = (item = '') => item?.toLocaleLowerCase()?.includes('required') || item.includes('必填')
  const downloadConfig = { ...downloadConf.default, ...downloadConf[category?.toLowerCase()] || {} }

  const handleSave = async () => {
    if (blockSave) return message.error(blockSave)
    const defFormatting = formatSave({ facilityId: user?.nowFacility?.id, year, catInfo: allCategoryInfo, uploadData: fetchParams?.data, extraSavePayload, tableHeader, headerToKey })
    const reqBody = downloadConfig.formatSave(defFormatting)
    // if (api) return console.log(reqBody)
    const upload = await api(reqBody)
    if (upload?.status === 201 || upload?.status === 200) successCallback(ln_t('message.success.upload'))
    else if (upload?.status === 500) return message.error(ln_t('message.error.excelFormatError'))
    else if (upload?.status === 403) {
      Modal.error({
        title: ln_t('message.error.fileContentError'),
        content: ln_t('activity.invalidEntries')
      })
    }
  }

  // ----- download sample file -----
  const handleDownload = async () => {
    const { emissionTypeId, emissionTypeName, equipmentTypeId, fugitiveTypeId, equipmentTypeName } = allCategoryInfo?.selected
    const payload = downloadConfig.formatSave({ facilityId: nowFacility?.id, year, emissionTypeId, equipmentTypeId, fugitiveTypeId })
    const res = await downloadActivityExample(payload)
    if (res?.status === 200) {
      const src = window.URL.createObjectURL(new Blob([res.data]))
      const name = `${emissionTypeName}${equipmentTypeName ? `_${equipmentTypeName}` : ''}.xlsx`
      onDownload(src, name)
    }
  }

  // ----- config of table after upload -----
  const checkUsage2Empty = (item, reverseKey) => {
    if (!Object.keys(reverseKey)?.includes('usage2')) return false
    const emissionFactorUnit = extraInfo[item[reverseKey.emissionSourceId]]?.emissionFactorUnit || ''
    const usage2required = Object.keys(WEIGHT_AND_DISTANCE_UNIT)?.includes(emissionFactorUnit?.toLowerCase())
    const val = item[reverseKey.usage2]
    return usage2required && (val === null || val === '')
  }
  const apiTable = async () => ({ status: 200, data: fetchParams?.data || [] })
  const tableColumn = useMemo(() => {
    const { data = [] } = fetchParams || {}
    const columns = Object.keys(data?.[0] || {}).filter(i => !columnConf.exclude.includes(i.toLowerCase())) || []
    const onChange = (value, key, record) => {
      const n = [...data]
      const index = n.indexOf(record)
      if (index !== -1) {
        n[index] = { ...n[index], [key.toLowerCase()]: value }
        handleFetchParams('add', { data: n })
      }
    }
    const reverseKey = Object.entries(headerToKey)?.reduce((all, [key, val]) => ({ ...all, [val]: key }), {})
    return columns?.map(item => ({
      title: isRequired(item) ? <><span style={{ color: '#ff4d4f' }}>*</span> {item}</> : item,
      dataIndex: item,
      render: (e, record) => {
        const usage2empty = headerToKey[item] === 'usage2' && checkUsage2Empty(record, reverseKey)
        const warn = (isRequired(item) && (e === null || e === '')) || usage2empty
        const props = { style: { width: '100%', minWidth: '100px', borderColor: warn ? '#ff4d4f' : '' }, disabled: true, placeholder: '' }
        const isDate = headerToKey[item] === 'useDate'
        return isDate
          ? <DatePicker {...props} value={excelDateFormatting(e)} format={dateFormat} onChange={e => onChange(e, item, record)} />
          : <Input value={e === null ? '' : e} {...props} onChange={e => onChange(e.target.value, item, record)} />
      }
    }))
  }, [fetchParams])

  // ----- upload setting -----
  const removeEmptyCol = (obj = {}) => Object.entries(obj).filter(([key, val]) => !key.includes('__EMPTY')).reduce((all, [key, val]) => ({ ...all, [key]: val }), {})
  const handleUpload = (file) => {
    setIsLoading(true)
    readExcel(file, readExcelFormatting, true).then(({ status, message: msg = 'message.error.uploadError', data, extras, headerToKey }) => {
      if (!status) return message.error(ln_t(msg))
      setHeaderToKey(headerToKey || {})
      setTableHeader(extras)
      const formattedData = data?.map((item, index) => ({ id: index + 1, ...removeEmptyCol(item) })).filter(({ id, ...i }) => Object.values(i).some(j => j))
      handleFetchParams('add', { data: formattedData })
      setFileList([file])

      const reverseKey = Object.entries(headerToKey)?.reduce((all, [key, val]) => ({ ...all, [val]: key }), {})
      const requiredFieldEmpty = formattedData?.some(item => Object.entries(item)?.some(([key, val]) => isRequired(key) && (val === null || val === '')))
      const usage2empty = formattedData?.some(item => checkUsage2Empty(item, reverseKey))
      const incomplete = requiredFieldEmpty || usage2empty
      const yearNotMatch = formattedData?.some(i => i[reverseKey.useDate] && excelDateFormatting(i[reverseKey.useDate])?.year() !== Number(year))
      const warn = incomplete ? ln_t('message.error.activityUploadNotComplete') : yearNotMatch ? ln_t('message.error.activityUploadYearNotMatch') : false
      setBlockSave(warn)
      warn && message.error(warn)
    })
    setIsLoading(false)
    return false
  }
  const handleRemove = () => setFileList(undefined)

  const initSetup = async () => {
    const res = await extraFetch({ useDate: `${year}-01-01` }, user?.nowFacility?.id, allCategoryInfo?.selected?.equipmentTypeId, year)
    if (res?.status === 200) setExtraInfo(res?.data?.reduce((all, i) => ({ ...all, [i.emissionSourceId]: i }), {}))
  }
  useEffect(() => {
    initSetup()
  }, [])

  const uploadProps = {
    maxCount: 1,
    fileList,
    beforeUpload: file => handleUpload(file),
    onRemove: handleRemove,
    showUploadList: { showRemoveIcon: false }
  }

  const anyUploadedFile = fileList && fileList.length
  return (
    <>
      <UploadDescWrapper style={{ marginTop: 0 }}>
        <UploadDescTitle style={{ color: 'rgb(6 68 150)' }}>{ln_t('activity.fileFormatDesc')}</UploadDescTitle>
        <ul>
          <li>{ln_t('activity.uploadFormat')}</li>
          <li>{ln_t('activity.maxUpload')} {maxUpload} {ln_t('activity.dataAtATime')}</li>
          <li>{ln_t('activity.useDownloadedExampleToUpload')}</li>
          <li>{ln_t('activity.pleaseIncludeHeader')}</li>
          <li>{ln_t('activity.acceptedDateFormat')} {dateFormat}</li>
        </ul>
      </UploadDescWrapper>

      <UploadBtnWrapper>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button icon={<Icon path={mdiTrayArrowDown} size={0.8} />} onClick={handleDownload}>
            {ln_t('activity.downloadSample')}
          </Button>
          <Upload {...uploadProps}>
            <Button icon={<Icon path={mdiTrayArrowUp} size={0.8} />}>
              {ln_t('activity.uploadActivity')}
            </Button>
          </Upload>
        </div>
        {anyUploadedFile
          ? <Button type="primary" icon={<Icon path={mdiContentSaveOutline} size={0.8} />} onClick={handleSave}>{ln_t('util.save')}</Button>
          : ''}
      </UploadBtnWrapper>
      {anyUploadedFile
        ? isLoading
          ? <Spin style={{ display: 'flex', justifyContent: 'center', margin: '60px 0px' }} />
          : <UploadTableWrapper>
              {tableHeader
                ? Object.entries(tableHeader)?.map(([key, val]) => `${key}: ${val || '-'}`).join(', ')
                : ''}
              <MainTable
                columns={tableColumn}
                rowKey="id"
                apiFunc={apiTable}
                params={params}
              />
            </UploadTableWrapper>
        : <GreyBox>
          {ln_t('message.info.uploadFirst')}
        </GreyBox>
      }
    </>
  )
}

export default ActivityUpload
