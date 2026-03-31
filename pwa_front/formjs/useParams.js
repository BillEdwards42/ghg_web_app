import { useEffect, useState } from 'react'

const initTable = {
  showSizeChanger: false,
  showQuickJumper: false,
  pageSize: 10,
  current: 1,
  total: 0
}

const useParams = (extraInitParams = {}, isReady = true) => {
  const initFetch = {
    maxResults: 10,
    startIndex: 0,
    sort: '-updatedAt',
    ...extraInitParams
  }

  const [tableParams, setTableParams] = useState(initTable)
  const [fetchParams, setFetchParams] = useState(initFetch)
  const [list, setList] = useState([])
  const [ready, setReady] = useState(isReady)
  const [updatedRowId, setUpdatedRowId] = useState(-1)
  const [selectedItem, setSelectedItem] = useState([])
  const [searchParams, setSearchParams] = useState()
  const [listLoading, setListLoading] = useState()
  const [clickedRowKey, setClickedRowKey] = useState()

  const handleTableParams = (type, payload = {}) => {
    if (type === 'init') setTableParams({ ...payload, ...initTable })
    else if (type === 'add') setTableParams({ ...tableParams, ...payload })
    else if (type === 'clear') setTableParams({ ...initTable })
  }

  const handleFetchParams = (type, payload = {}) => {
    if (type === 'init') setFetchParams({ ...initFetch, ...payload })
    else if (type === 'initPage') setFetchParams({ ...fetchParams, ...initFetch, ...payload })
    else if (type === 'add') setFetchParams({ ...fetchParams, ...payload })
    else if (type === 'clear') setFetchParams({ ...initFetch })
    else if (type === 'new') setFetchParams({ ...payload })
  }

  const deletedCallback = () => {
    const n = {}
    if (fetchParams?.startIndex && list?.length === 1) {
      n.startIndex = fetchParams.startIndex - fetchParams.maxResults
    }
    handleFetchParams('add', n)
  }

  const patchListRow = (record = {}, patchParams = {}, key = undefined) => {
    const index = list?.findIndex(item => item[key] === record[key])
    // console.log(list, record, index)
    if (index !== -1) {
      const n = [...list]
      n[index] = { ...record, ...patchParams }
      // console.log(record, patchParams, {...record, ...patchParams})
      setList([...n])
      setUpdatedRowId(record[key])
    }
  }

  useEffect(() => {
    if (updatedRowId !== -1) {
      const t = setTimeout(() => setUpdatedRowId(-1), 10000)
      return () => clearTimeout(t)
    }
  }, [updatedRowId])

  return {
    tableParams,
    fetchParams,
    list,
    ready,
    updatedRowId,
    selectedItem,
    searchParams,
    listLoading,
    clickedRowKey,
    setClickedRowKey,
    handleTableParams,
    handleFetchParams,
    setList,
    patchListRow,
    setReady,
    setUpdatedRowId,
    deletedCallback,
    setSelectedItem,
    setSearchParams,
    setListLoading
  }
}

export default useParams
