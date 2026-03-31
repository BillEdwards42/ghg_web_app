import React, { useState, useEffect } from 'react'
import { Cascader, ConfigProvider, Form } from 'antd'
import { useSelector } from 'react-redux'

export function CascaderComponent (props) {
  const { id, api, keyConf: customKey = {}, placeholder, form, setSelectedItem = () => {}, setAllInfo = () => {}, refetchBy = false, langChangeRefetch, extraProps = {}, setupAfterLoadingOptions, codeIsNumber = true, setupFirstVal, clear } = props
  const [options, setOptions] = useState([])
  const [optionsMapping, setOptionsMapping] = useState({})
  const [selected, setSelected] = useState([])
  const defaultKeys = { id: 'id', name: 'name', sub: 'sub', disabled: () => false }
  const myVal = form ? Form.useWatch(id) : undefined
  const user = useSelector((state) => state.user)

  const handleSelect = (e, mapping = optionsMapping) => {
    const mappingKey = e?.join('_')
    const allSelectedOpt = mapping[mappingKey] || {}
    setAllInfo(allSelectedOpt)
    form && form.setFieldValue(id, mappingKey)
    setSelectedItem(e?.slice(-1)[0])
    setSelected(e)
  }

  const getKeys = idx => ({ ...defaultKeys, ...customKey[idx] || {} })
  const mapping = {}
  const constructTree = (item, level = 0, mappingId = '', tempMap = {}) => {
    const { id, name, sub, disabled } = getKeys(level)
    const mappingKey = `${mappingId}${mappingId ? '_' : ''}${item[id]}`
    if (!item[sub] || !item[sub].length) mapping[mappingKey] = { ...tempMap, selected: item }

    return {
      value: item[id],
      label: item[name],
      children: item[sub]?.map(i => constructTree(i, level + 1, mappingKey, { ...tempMap, [level]: item })),
      disabled: disabled?.(item)
    }
  }
  const getData = async () => {
    const res = await api()
    if (res?.status !== 200) return
    const opt = res?.data?.map(item => constructTree(item, 0))
    setOptions(opt)
    setOptionsMapping(mapping)
    setupAfterLoadingOptions && setupAfterLoadingOptions(mapping, form)
    setupFirstVal && handleSelect(setupFirstVal?.split('_')?.map(i => Number(i)), mapping)
  }

  useEffect(() => {
    handleSelect([])
    getData()
  }, [...Array.isArray(refetchBy) ? refetchBy : [refetchBy], langChangeRefetch ? user?.language : false])

  useEffect(() => { handleSelect([]) }, [clear])

  useEffect(() => {
    if (myVal && typeof myVal === 'string' && (!selected || !selected?.length)) {
      setSelected(myVal.split('_')?.map(i => codeIsNumber ? Number(i) || i : i))
    }
  }, [myVal])

  return <ConfigProvider theme={{ components: { Cascader: { dropdownHeight: 340 } } }}>
    <Cascader
        value={selected}
        placeholder={placeholder}
        options={options}
        expandTrigger="hover"
        onChange={e => handleSelect(e)}
        allowClear
        {...extraProps}
      />
  </ConfigProvider>
}
