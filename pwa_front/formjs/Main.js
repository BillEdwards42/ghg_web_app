import React, { useEffect, useState } from 'react'
import { HeadWrapper, InfoTooltip, RoundedNotification, TableWrapper } from './activity.styled'
import { useTranslation } from 'react-i18next'
import { Icon as MdiIcon } from '@mdi/react'
import { mdiPlus, mdiFolderDownloadOutline } from '@mdi/js'
import useParams from '../../hook/useParams'
import MainTable from '../../components/Basic/MainTable'
import { useSelector } from 'react-redux'
import { App, Button, Drawer, Form, Tooltip } from 'antd'
import { CascaderComponent } from '../../components/Basic/CascaderComponent'
import { checkActivityClose, fetchActivityFile, fetchEquipmentTypeForEmissionSrc } from '../../apis/activity'
import ActivityForm from './ActivityForm'
import { EMISSION_TYPES } from '../../constants/EmissionSrc'
import FilePreview from './components/FilePreview'
import ActivityUpload from './upload/ActivityUpload'
import { columnConf, initFetchParams } from './conf/columnConf'
import { formConf } from './conf/formConf'
import { InfoCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { UploadDownloadIcon } from '../../components/DownloadUpload/Icons'
import { YearSelector } from '../../components/Basic/YearSelectorComponent'

function Activity () {
  const { t: ln_t, i18n } = useTranslation()
  const user = useSelector((state) => state.user)
  const { nowFacility } = user
  const params = useParams({ facilityId: nowFacility?.id, sort: '-carbonEmission', year: dayjs(user?.selectedYear).format('YYYY') })
  const [form] = Form.useForm()
  const { fetchParams, handleFetchParams } = params
  const { message, modal } = App.useApp()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [fileSrc, setFileSrc] = useState()
  const [fileView, setFileView] = useState(false)
  const [drawerProps, setDrawerProps] = useState({})
  const [allSelectedInfo, setAllSelectedInfo] = useState()
  const [selectedSrc, setSelectedSrc] = useState()
  const { emissionTypeKey, emissionTypeName, equipmentTypeKey } = allSelectedInfo?.selected || {}
  const category = emissionTypeKey || emissionTypeName
  const categoryConf = formConf[equipmentTypeKey?.toLowerCase()?.trim()]
  const equipmentConf = formConf[category?.toLowerCase()]
  const extraConf = (equipmentConf?.useConfFirst ? equipmentConf || categoryConf : categoryConf || equipmentConf)
  const conf = { ...formConf.default, ...typeof extraConf === 'function' ? extraConf({ category: category?.toLowerCase(), equipmentTypeName: equipmentTypeKey?.toLowerCase()?.trim() }) : extraConf || {} }
  const { fetch = () => {}, del } = conf?.apis

  const activityApi = () => {
    const params = Object.entries(fetchParams).filter(([key, val]) => val && key !== 'initFormVal').reduce((all, [key, val]) => ({ ...all, [key]: val }), {})
    return selectedSrc && fetchParams[conf?.fetchKey] ? fetch(params) : () => {}
  }

  // ----- drawer control -----
  const onDownload = (src, name) => {
    const url = src
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(url)
    link.remove()
  }
  const checkCloseData = async date => {
    const res = await checkActivityClose({ facilityId: nowFacility.id, date })
    if (res?.status === 200 && !res?.data?.result) modal.warn({ title: ln_t('activity.unableEditClosingData'), content: ln_t('activity.goToSettingToModify') })
    return res?.data?.result
  }
  const handleEdit = async data => {
    const check = await checkCloseData(data.useDate)
    if (!check) return
    const { emissionTypeKey, emissionTypeName, equipmentTypeId: equipmentId, equipmentTypeName: name } = allSelectedInfo?.selected
    const category = emissionTypeKey || emissionTypeName
    const space = i18n.language === 'zh-TW' ? '' : ' '
    setDrawerProps({ title: `${ln_t('util.edit')}${space}${name || emissionTypeName || emissionTypeKey}${space}`, editData: data, category, equipmentId, allCategoryInfo: allSelectedInfo })
    setOpenDrawer(true)
  }
  const handleNew = () => {
    const { emissionTypeKey, emissionTypeName, equipmentTypeId: equipmentId, equipmentTypeName: name } = allSelectedInfo?.selected
    const category = emissionTypeKey || emissionTypeName
    const space = i18n.language === 'zh-TW' ? '' : ' '
    setDrawerProps({ title: `${ln_t('util.add')}${space}${name || emissionTypeName || emissionTypeKey}${space}${ln_t('activity.activityData')}`, category, equipmentId, allCategoryInfo: allSelectedInfo })
    setOpenDrawer(true)
  }
  const handleUpload = () => {
    setDrawerProps({ title: ln_t('activity.sampleDonwloadFileUpload'), type: 'upload', allCategoryInfo: allSelectedInfo, onDownload })
    setOpenDrawer(true)
  }
  const handleCancel = () => {
    setOpenDrawer(false)
    setDrawerProps({})
    form.resetFields()
  }
  const successCallback = msg => {
    message.success(msg)
    handleFetchParams('initPage', { year: fetchParams.year })
    handleCancel()
  }

  // ----- delete api call -----
  const handleDelete = async ({ id, useDate }) => {
    const check = await checkCloseData(useDate)
    if (!check) return
    modal.confirm({
      title: ln_t('message.info.delConfirm'),
      onOk: async () => {
        const res = await del(id)
        if (res?.status === 204) successCallback(ln_t('message.success.delete'))
      }
    })
  }

  // ----- preview attachment -----
  const getPdfPageNum = async blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    reader.onloadend = () => {
      const text = new TextDecoder().decode(reader.result)
      const count = (text.match(/\/Type[\s]*\/Page[^s]/g) || []).length
      resolve(count)
    }
    reader.onerror = (error) => reject(error)
  })

  const handleShowFile = async item => {
    const category = allSelectedInfo?.selected?.emissionTypeKey || allSelectedInfo?.selected?.emissionTypeName
    const type = EMISSION_TYPES[category?.toLowerCase()] || EMISSION_TYPES[allSelectedInfo?.selected?.equipmentTypeKey?.toLowerCase()?.trim()] || ''
    const res = await fetchActivityFile(type, item?.id, item?.fileHash)
    if (res?.status !== 200) return
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const isPDF = item?.fileName?.includes('pdf')
    const totalPage = isPDF ? await getPdfPageNum(blob) : undefined
    setFileSrc({ name: item?.fileName, src: url, isPDF, totalPage })
    setFileView(true)
  }

  const colConf = columnConf(ln_t, i18n, handleEdit, handleDelete, handleShowFile)
  const { topCol, middleCol, bottomCol } = { ...colConf?.default, ...colConf[allSelectedInfo?.selected?.equipmentTypeKey?.toLowerCase()?.trim()] || colConf[allSelectedInfo?.selected?.emissionTypeKey?.toLowerCase()] || colConf[allSelectedInfo?.selected?.emissionTypeName?.toLowerCase()] || {} }
  const columns = [...topCol, ...middleCol, ...bottomCol]

  useEffect(() => {
    if (fetchParams?.facilityId !== nowFacility?.id) setSelectedSrc()
  }, [nowFacility])

  const handleSelectedChange = async () => {
    let extraParams = {}
    if (conf?.initSetup) {
      extraParams = await conf?.initSetup({ category: allSelectedInfo, form, year: fetchParams?.year })
      allSelectedInfo.selected = { ...allSelectedInfo?.selected, ...extraParams }
    }
    const { exclude, ...others } = extraParams
    const customParams = { ...initFetchParams, ...others, [conf?.fetchKey]: selectedSrc }
    handleFetchParams('initPage', { facilityId: nowFacility?.id, year: fetchParams?.year, ...customParams })
  }
  useEffect(() => {
    if (selectedSrc) handleSelectedChange()
  }, [allSelectedInfo])

  const selectorListProps = {
    api: () => nowFacility?.id ? fetchEquipmentTypeForEmissionSrc({ maxResults: 999 }, nowFacility?.id, fetchParams?.year) : () => {},
    refetchBy: [nowFacility?.id, fetchParams?.year],
    langChangeRefetch: true,
    placeholder: `${ln_t('util.pleaseSelect')} ${ln_t('activity.emissionSource')}`,
    selectedItem: selectedSrc,
    setSelectedItem: setSelectedSrc,
    setAllInfo: setAllSelectedInfo,
    allInfo: allSelectedInfo,
    keyConf: {
      0: { id: 'category', name: 'category', sub: 'emissionType' },
      1: { id: 'emissionTypeName', name: 'emissionTypeName', sub: 'equipmentType' },
      2: { id: 'equipmentTypeId', name: 'equipmentTypeName', disabled: item => item.canCreate === 'no' }
    },
    extraProps: {
      popupRender: (menus) => (
        <div style={{ position: 'relative' }}>
          {menus}
          <InfoTooltip>
            <Tooltip
              title={<>
                <div>{ln_t('activity.selectorInfo')}</div>
                <div style={{ display: 'flex' }}><div style={{ margin: '0px 4px' }}>1.</div><div>{ln_t('activity.selectorInfo1')}</div></div>
                <div style={{ display: 'flex' }}><div style={{ margin: '0px 4px' }}>2.</div><div>{ln_t('activity.selectorInfo2')}</div></div>
              </>}
              placement="rightBottom"
              arrow={false}
              color="#c6d2dd"
              style={{ color: '#000', width: 400 }}
            >
              <InfoCircleFilled style={{ color: '#1b76d2', fontSize: '16px' }} />
            </Tooltip>
          </InfoTooltip>
        </div>
      )
    }
  }

  const facilityIsClosed = nowFacility?.closeDownDate && dayjs(nowFacility?.closeDownDate, 'YYYY-MM-DD').hour(23) < dayjs().hour(0)
  const passProps = { ...drawerProps, form, successCallback, handleCancel, params, checkCloseData }
  return <>
    <YearSelector value={dayjs(fetchParams?.year)} onChange={e => handleFetchParams('add', { year: dayjs(e).format('YYYY') })}/>
    <HeadWrapper onClick={() => { if (!nowFacility) message.warning(ln_t('message.info.selectFacilityFirst')) }}>
      <CascaderComponent {...selectorListProps} disabled={!nowFacility} />
      {selectedSrc && !facilityIsClosed
        ? <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
            {process.env.REACT_APP_ENV === 'production' ? '' : <Button type='link' icon={<MdiIcon path={mdiFolderDownloadOutline} size={1} />}>{ln_t('activity.activityDownload')}</Button>}
            <Button type='link' icon={<UploadDownloadIcon />} onClick={handleUpload}>{ln_t('activity.sampleDonwloadFileUpload')}</Button>
            <Button type="primary" icon={<MdiIcon path={mdiPlus} size={0.8} />} onClick={handleNew}>{ln_t('util.add')} {ln_t('menu.activity')}</Button>
          </div>
        : ''}
    </HeadWrapper>
    <TableWrapper>
      {selectedSrc
        ? <MainTable
            rowKey="id"
            params={params}
            apiFunc={activityApi}
            columns={columns}/>
        : <RoundedNotification>{ln_t('message.info.selectEmissionSourceFirst')}</RoundedNotification>}
    </TableWrapper>

    <Drawer title={drawerProps?.title} open={openDrawer} onClose={handleCancel} maskClosable={false} destroyOnHidden size={drawerProps?.type === 'upload' ? 980 : 660}>
      {drawerProps?.type === 'upload'
        ? <ActivityUpload {...passProps} />
        : <ActivityForm {...passProps} />}
    </Drawer>

    <FilePreview fileData={fileSrc} view={fileView} setView={setFileView} onDownload={onDownload} />
  </>
}

export default Activity
