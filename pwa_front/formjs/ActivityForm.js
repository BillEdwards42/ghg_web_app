import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { App, Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { formConf } from './conf/formConf'
import { ActivitySelector, ActivitySelectorWithDescription, ActivityUploadComponent } from './components/FormComponent'
import { FormButton, FormItemWrapper } from './activity.styled'
import { useSelector } from 'react-redux'
import { localeNumberFormat, parseLocaleNumber } from '../../components/utils/i18nNumberFormat'

function ActivityForm (props) {
  const { category, equipmentId, form, editData, successCallback, handleCancel, allCategoryInfo, params, checkCloseData } = props
  const { t: ln_t, i18n } = useTranslation()
  const { message } = App.useApp()
  const user = useSelector((state) => state.user)
  const { nowFacility } = user
  const { equipmentTypeKey } = allCategoryInfo?.selected || {}
  const categoryConf = formConf[category?.toLowerCase()]
  const equipmentConf = formConf[equipmentTypeKey?.toLowerCase()?.trim()]
  const extraConf = (equipmentConf?.useConfFirst ? equipmentConf || categoryConf : categoryConf || equipmentConf)
  const conf = { ...formConf.default, ...typeof extraConf === 'function' ? extraConf({ category: category?.toLowerCase(), equipmentTypeName: equipmentTypeKey?.toLowerCase()?.trim() }) : extraConf || {} }
  const { topForm, bottomForm, middleForm, saveFormatting, loadFormatting, apis, editModeFetchFirst } = conf
  const { add, mod, fetch } = apis
  const { fetchParams } = params
  const [loading, setLoading] = useState(false)
  const [blockSave, setBlockSave] = useState({ block: false, msg: '' })
  const [hideUsage2, setHideUsage2] = useState(false)

  const defPlaceholder = (name, type) => {
    const message = type === 'input' ? ln_t('util.pleaseEnter') : type === 'select' ? ln_t('util.pleaseSelect') : ''
    return `${message} ${ln_t(`activity.${name}`)}`
  }
  const defConfig = (name, labelName, type, required = true, extraRules = []) => {
    const label = labelName || name
    return {
      name,
      label: ln_t(`activity.${label}`),
      rules: [{ required, message: defPlaceholder(label, type) }, ...extraRules]
    }
  }

  const handleAdd = async reqBody => {
    const res = await add(reqBody)
    if (res?.status === 201) successCallback(ln_t('message.success.create'))
  }
  const handleMod = async reqBody => {
    const res = await mod(editData?.id, reqBody)
    if (res?.status === 200) successCallback(ln_t('message.success.modify'))
  }
  const handleSave = async e => {
    if (blockSave?.block) return message.error(blockSave?.msg)
    const reqBody = { ...saveFormatting(e, equipmentId, allCategoryInfo), facilityId: nowFacility?.id, emissionTypeId: category?.id, ...hideUsage2 ? { usage2: 1 } : {} }
    setLoading(true)
    const api = editData ? handleMod : handleAdd
    // if (api) console.log(reqBody)
    await api(reqBody)
    setLoading(false)
  }

  const components = {
    select: props => <ActivitySelector {...props} />,
    selectWithDesc: props => <ActivitySelectorWithDescription {...props} />,
    date: ({ onChange = () => {}, disabledDate, ...props }) => <DatePicker {...props} style={{ width: '100%' }} onChange={e => onChange(e, checkCloseData, form)} disabledDate={current => disabledDate(current, fetchParams?.year)} />,
    upload: props => <ActivityUploadComponent {...props} />,
    input: props => <Input placeholder={props.placeholder} disabled={props?.disabled} />,
    inputNumber: props => <InputNumber
      placeholder={props?.placeholder}
      precision={props?.precision === 'unlimited' ? undefined : props?.precision || 0}
      min={props?.min || 0}
      style={{ width: '100%' }}
      formatter={value => localeNumberFormat(value, i18n.language, { showAllDecimal: true })}
      parser={value => parseLocaleNumber(value, i18n.language, { showAllDecimal: true })}
    />,
    empty: props => <></>
  }

  const initFetch = async () => {
    const res = await fetch(fetchParams, editData.id)
    if (res?.status === 200) form.setFieldsValue({ ...loadFormatting(res?.data, setHideUsage2) })
  }
  useEffect(() => {
    const { initFormVal } = allCategoryInfo?.selected || {}
    if (initFormVal) form.setFieldsValue(initFormVal)
    if (!editData) return
    if (!editModeFetchFirst) return form.setFieldsValue({ ...loadFormatting(editData, setHideUsage2) })
    initFetch()
  }, [editData])

  return (
    <Form form={form} layout="vertical" onFinish={e => handleSave(e)}>
      {[...topForm(fetchParams.year), ...middleForm, ...bottomForm]?.map(item => {
        const { _key, labelName, type, customComponent, noForm, half, left, required = true, disabled, tooltip, formConf, extraRules } = item
        if ((_key === 'usage2' || _key === 'unit2') && hideUsage2) return ''
        const placeholderType = type === 'input' || type === 'inputNumber' ? 'input' : 'select'
        const passProps = { form, ...item, equipmentId, placeholder: defPlaceholder(labelName || _key, placeholderType), editData, allCategoryInfo, disabled, setBlockSave, setHideUsage2, year: fetchParams?.year }
        const component = customComponent || components[type]
        const formProps = { ...formConf, half: `${half}`, left: `${left}`, disabled, tooltip: tooltip ? { ...tooltip, title: ln_t(`activity.${tooltip.title}`) } : undefined }
        const formattedComponent = noForm
          ? component(passProps)
          : <FormItemWrapper key={_key} {...defConfig(_key, labelName, placeholderType, required, extraRules)} {...formProps}>
              {component(passProps)}
            </FormItemWrapper>
        return React.cloneElement(formattedComponent, { key: _key })
      })}
      <FormButton>
        <Button onClick={handleCancel}>{ln_t('util.cancel')}</Button>
        <Button type="primary" htmlType="submit" loading={loading}>{ln_t('util.save')}</Button>
      </FormButton>
    </Form>
  )
}

export default ActivityForm
