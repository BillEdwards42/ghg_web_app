import React, { useState, useEffect } from 'react'
import { Button, Descriptions, Form, Input, InputNumber, Select, Upload, message } from 'antd'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { DescriptionWrapper, UploadIconOnly } from '../activity.styled'
import Icon from '@mdi/react'
import { mdiTrayArrowUp } from '@mdi/js'
import MainTable from '../../../components/Basic/MainTable'
import useParams from '../../../hook/useParams'
import { fetchEmployeeCommuting } from '../../../apis/activity'
import { localeNumberFormat, parseLocaleNumber } from '../../../components/utils/i18nNumberFormat'

export function ActivitySelector (props) {
  const { equipmentId, id, dependency, api, form, placeholder, handleSelectorChange, disabled, allCategoryInfo, setBlockSave, setHideUsage2, year, editData } = props
  const { i18n, t: ln_t } = useTranslation()
  const user = useSelector((state) => state.user)
  const { nowFacility } = user
  const [options, setOptions] = useState()
  const [finishSetup, setFinishSetup] = useState(false)
  const dependencyVal = dependency ? Form.useWatch(dependency, form) : undefined
  const myVal = Form.useWatch(id, form)

  const getOption = async params => {
    const res = await api(params, nowFacility?.id, equipmentId, year, allCategoryInfo)
    if (res?.status === 200) setOptions(res?.data?.map(i => ({ ...i, value: i.id, label: i18n.language === 'zh-TW' ? i.name : (i.eName || i.name) })))
  }
  const handleChange = e => {
    form.setFieldValue(id, e)
    handleSelectorChange && handleSelectorChange({ item: options?.find(i => i.value === e), form, facilityId: nowFacility?.id, catInfo: allCategoryInfo, ln_t, setBlockSave, setHideUsage2 })
  }

  useEffect(() => { if (!dependency) getOption({}) }, [])
  useEffect(() => {
    if (!dependency || !dependencyVal) return
    if (!disabled && !(editData && !finishSetup)) form.setFieldValue(id, undefined)
    getOption({ [dependency]: dependencyVal })
    setFinishSetup(true)
  }, [dependencyVal])

  return <Select
    showSearch
    optionFilterProp="label"
    placeholder={placeholder}
    options={options?.map(i => ({ label: i.label, value: i.value }))}
    value={myVal}
    onChange={handleChange}
    disabled={disabled || (dependency && !dependencyVal)} />
}

export function ActivitySelectorWithDescription (props) {
  const { equipmentId, id, dependency, api, form, placeholder, handleSelectorChange, disabled, desc, descDependency, allCategoryInfo, editData, setBlockSave, checkerDependency, checkerFunc = () => {}, setHideUsage2, year } = props
  const { t: ln_t } = useTranslation()
  const user = useSelector((state) => state.user)
  const { nowFacility } = user
  const [options, setOptions] = useState()
  const [selectedInfo, setSelectedInfo] = useState()
  const [initSetup, setInitSetup] = useState(false)
  const dependencyVal = dependency ? Form.useWatch(dependency, form) : undefined
  const checkerVal = checkerDependency ? Form.useWatch(checkerDependency, form) : undefined
  const myVal = Form.useWatch(id, form)

  const getOption = async params => {
    const res = await api(params, nowFacility?.id, equipmentId, year)
    if (res?.status === 200) setOptions(res?.data?.map(i => ({ ...i, value: i.id, label: i.name })))
  }
  const handleChange = e => {
    form.setFieldValue(id, e)
    const info = options?.find(i => i.value === e)
    handleSelectorChange && handleSelectorChange({ item: info, form, facilityId: nowFacility?.id, catInfo: allCategoryInfo, setBlockSave, ln_t, setHideUsage2 })
    setSelectedInfo(info)
  }

  useEffect(() => { if (!myVal) setSelectedInfo() }, [myVal])
  useEffect(() => { if (!dependency) getOption({}) }, [])
  useEffect(() => {
    if (editData && !selectedInfo && !initSetup && myVal && options && options.length) {
      handleChange(myVal)
      setInitSetup(true)
    }
  }, [options])
  useEffect(() => {
    if (!dependency || !dependencyVal) return
    if (!disabled && initSetup) form.setFieldValue(id, undefined)
    getOption({ [dependency]: dependencyVal })
  }, [dependencyVal])

  useEffect(() => {
    if (!checkerDependency || !checkerVal) return
    checkerFunc({ item: options?.find(i => i.value === myVal), form, facilityId: nowFacility?.id, catInfo: allCategoryInfo, setBlockSave, ln_t })
  }, [checkerVal])

  const descList = descDependency ? desc[allCategoryInfo?.selected?.[descDependency]] : desc
  const descInfo = descList?.map(({ key, label = key, render = e => e }) => ({
    key, label: ln_t(`activity.${label}`), render: render(selectedInfo?.[key] || '-', ln_t)
  }))

  return <>
    <Select
      showSearch
      optionFilterProp="label"
      placeholder={placeholder}
      options={options?.map(i => ({ label: i.label, value: i.value }))}
      value={myVal}
      onChange={handleChange}
      disabled={disabled || (dependency && !dependencyVal)} />
    {selectedInfo
      ? <DescriptionWrapper column={1}>
          {descInfo?.map(i => <Descriptions.Item key={i?.key} label={i?.label}>{i.render}</Descriptions.Item>)}
        </DescriptionWrapper>
      : ''}
  </>
}

export function ActivityUploadComponent (props) {
  const { uploadProps, form, id, maxSize } = props
  const { t: ln_t } = useTranslation()
  const [fileList, setFileList] = useState([])
  const myVal = Form.useWatch(id, form)

  const handleUpload = file => {
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' ||
                        file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                        file.type === 'application/vnd.ms-excel'
    if (!isValidType) {
      message.error(ln_t('message.error.invalidFileType'))
      return Upload.LIST_IGNORE
    }
    if (maxSize && file.size > (maxSize * 1000000)) {
      message.error(`${ln_t('message.error.maxUploadSize')} ${maxSize}MB`)
      return true
    }
    form.setFieldValue(id, file)
    form.validateFields([id])
    return false
  }
  const handleRemove = () => form.setFieldValue(id, undefined)

  useEffect(() => setFileList(myVal ? [myVal] : []), [myVal])

  const defProps = {
    maxCount: 1,
    fileList,
    beforeUpload: file => handleUpload(file),
    onRemove: handleRemove
  }
  const propsForUpload = { ...defProps, ...uploadProps }

  return <Upload {...propsForUpload}>
    <Button style={{ width: '100%' }} icon={<Icon path={mdiTrayArrowUp} size={0.8} />}>
      {ln_t('activity.upload')}
    </Button>
  </Upload>
}

export function ActivityAttachmentInUpload (props) {
  const { uploadProps, onChange = () => {} } = props
  const [fileList, setFileList] = useState([])

  const handleUpload = file => {
    setFileList([file])
    onChange(file)
    return false
  }
  const handleRemove = () => setFileList(undefined)

  const defProps = {
    maxCount: 1,
    fileList,
    beforeUpload: file => handleUpload(file),
    onRemove: handleRemove
  }
  const propsForUpload = { ...defProps, ...uploadProps }

  return <Upload {...propsForUpload}>
    <UploadIconOnly><Icon path={mdiTrayArrowUp} size={0.8} /></UploadIconOnly>
  </Upload>
}

export function TableInput (props) {
  const { id, form, api, editData, year } = props
  const user = useSelector((state) => state.user)
  const { nowFacility } = user
  const { t: ln_t, i18n } = useTranslation()
  const params = useParams()
  const { setList, list, fetchParams } = params
  const [setupFormVal, setSetupFormVal] = useState(false)

  const createAPI = async () => api(fetchParams, nowFacility?.id, year)?.then(res => ({ ...res, data: res?.data?.map(i => ({ ...defData, ...i })) }))
  const editAPI = async () => fetchEmployeeCommuting({}, editData?.id)?.then(res => ({ ...res, data: res?.data[id] }))

  const handleInputChange = (colKey, val, data) => {
    const check = e => e.commutingModeId === data?.commutingModeId && e.emissionSourceId === data?.emissionSourceId
    const newList = [...list]?.map(i => check(i) ? { ...i, [colKey]: val } : i)
    setList(newList)
    form.setFieldValue(id, newList)
  }
  const inputInTable = (key, value, data) => <Input value={value} onChange={e => handleInputChange(key, e?.target?.value, data)} />
  const inputNumInTable = (key, value, data, props) => <InputNumber
    value={value || 0}
    onChange={e => handleInputChange(key, e, data)}
    formatter={value => localeNumberFormat(value, i18n.language, { showAllDecimal: true })}
    parser={value => parseLocaleNumber(value, i18n.language, { showAllDecimal: true })}
    {...props}
  />
  const columns = [
    { title: ln_t('activity.emissionSource'), dataIndex: 'commutingModeName' },
    { title: ln_t('activity.emissionCoefficient'), dataIndex: 'emissionFactorName' },
    { title: ln_t('activity.numberOfPeople'), dataIndex: 'numberOfPeople', render: (e, data) => inputNumInTable('numberOfPeople', e, data, { min: 0 }) },
    { title: ln_t('activity.commutingDistance'), dataIndex: 'distance', render: (e, data) => inputNumInTable('distance', e, data, { min: 0 }) },
    { title: ln_t('activity.remark'), dataIndex: 'remark', render: (e, data) => inputInTable('remark', e, data) }
  ]

  useEffect(() => {
    if (list && list?.length && !setupFormVal) {
      form.setFieldValue(id, list)
      setSetupFormVal(true)
    }
  }, [list])

  const defData = { remark: '', percent: 0, distance: 0 }
  return <MainTable
    rowKey='commutingModeId'
    columns={columns}
    apiFunc={editData?.id ? editAPI : createAPI}
    params={params}
    noPage={true}
  />
}
