import { Button, ConfigProvider, Empty, Table } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useMemo } from 'react'
import './Table.less'
import { useTranslation } from 'react-i18next'

function MainTable (props) {
  const {
    className, style, rowKey, columns = [], noPage = false, disabled,
    scrollY, scrollX,
    apiFunc = () => {}, disabledRow, useSelection, params,
    useHeader, headerRender, btnTitle, onBtnClick = () => {}, expandable = false,
    footer, getCustomList, rowClassName, width, clickedRowClassName = 'row-clicked', handledApi, autoRefresh
  } = props

  const {
    tableParams, fetchParams, list, ready, handleFetchParams, listLoading, setListLoading,
    setList, handleTableParams, clickedRowKey, selectedItem, setSelectedItem, setClickedRowKey
  } = params
  const { i18n } = useTranslation()

  const matchRowKey = record => rowKey?.split('_')?.map(key => record[key])?.join('_')

  const getList = async () => {
    setListLoading(true)
    const result = await apiFunc()
    if (result?.status === 200) {
      setList(result.data)
      const n = { ...tableParams }
      n.total = result.headers?.['x-content-record-total'] || 0
      n.current = (fetchParams.startIndex / fetchParams.maxResults) + 1
      handleTableParams('add', n)
    }
    setListLoading(false)
  }

  const sort = key => {
    const { sort } = fetchParams
    return !(sort && (sort === key || sort === `-${key}`))
      ? false
      : fetchParams.sort.includes('-') ? 'descend' : 'ascend'
  }

  const cols = useMemo(() => columns?.filter(item => item.dataIndex)?.map(item => {
    const { dataIndex, render, type, format, prefix } = item || {}
    let n = { width: 90, align: 'left', ...item }
    if (width <= 576) n = { ...item }
    if (item.sorter) {
      n.sortOrder = sort(dataIndex)
      n.className = 'sorter-td'
    }
    n.render = (e, record) => {
      if (render) return render(e, record)
      if (!e) return '-'

      let tmp = e
      if (type === 'time' && format) tmp = dayjs(e).format(format)
      if (type === 'number') tmp = Number(tmp).toLocaleString()
      if (prefix) tmp = prefix + tmp
      return tmp
    }
    return n
  }) || [], [columns])

  const handleTableChange = (pagination, filters, sorter, { action: paginate }) => {
    const n = { ...fetchParams }
    const filter = {}
    if (paginate === 'paginate') n.startIndex = (pagination.current - 1) * pagination.pageSize
    else if (paginate === 'sort') {
      n.startIndex = 0
      if (n.sort) n.sort = (sorter.order === 'ascend') ? sorter.field : `-${sorter.field}`
    } else if (paginate === 'filter') {
      n.startIndex = 0
      Object.keys(filters).map(key => { filter[key] = filters[key]?.join(); return '' })
    }
    // to handle different fields of params need to change, if using backend API
    if (paginate === 'paginate' && handledApi === 'backend') {
      n.offset = (pagination.current - 1) * pagination.pageSize
    } else if (paginate === 'sort' && handledApi === 'backend') {
      n.offset = 0
      n.sortBy = sorter.field === 'name' ? '__typeName' : sorter.field
      if (n.sortOrder) n.sortOrder = (sorter.order === 'ascend') ? 'ASCENDING' : 'DESCENDING'
    }
    handleFetchParams('add', { ...n, ...filter })
  }

  const defaultClassName = record => (matchRowKey(record) === clickedRowKey ? clickedRowClassName : '')

  const rowSelection = {
    selectedRowKeys: selectedItem?.map(item => matchRowKey(item)),
    onSelect: record => {
      const find = selectedItem.find(item => matchRowKey(item) === matchRowKey(record))
      if (find) setSelectedItem(selectedItem.filter(item => matchRowKey(item) !== matchRowKey(find)))
      else setSelectedItem([...selectedItem, record])
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) setSelectedItem([...selectedItem, ...changeRows])
      else if (!selected) {
        const newArr = []
        selectedItem.forEach(item => {
          if (changeRows.find(row => matchRowKey(row) === matchRowKey(item))) return
          if (!changeRows.find(row => matchRowKey(row) === matchRowKey(item))) newArr.push(item)
        })
        setSelectedItem(newArr)
      }
    },
    getCheckboxProps: record => ({
      disabled: ((disabledRow && disabledRow(record)) || disabled),
      name: matchRowKey(record)
    })
  }

  useEffect(() => {
    if (ready) getCustomList ? getCustomList() : getList()
  }, [fetchParams, ready, i18n.language])

  useEffect(() => {
    let interval = ''
    if (autoRefresh) {
      interval = setInterval(() => {
        getList()
      }, 60000)
      return () => clearInterval(interval)
    }
    interval = ''
  }, [autoRefresh])

  return (
        <>
            {useHeader
              ? (
                    <div className="w-100 d-flex align-items-center flex-wrap justify-content-between">
                        {headerRender || <div />}
                        {btnTitle && (
                            <Button
                                className="main-button mb-2"
                                type="secondary"
                                onClick={() => onBtnClick()}
                            >
                                {btnTitle}
                            </Button>
                        )}
                    </div>
                )
              : ''}
            <div className={`main-table-container ${className}`} style={style}>
                <ConfigProvider renderEmpty={() => <Empty style={{ padding: '40px 0px' }} />}>
                    <Table
                        loading={listLoading}
                        columns={cols}
                        sortDirections={['descend', 'ascend', 'descend']}
                        dataSource={list}
                        pagination={!noPage ? tableParams : false}
                        rowKey={record => matchRowKey(record)}
                        onChange={handleTableChange}
                        scroll={{ x: scrollX, y: scrollY, scrollToFirstRowOnChange: true }}
                        showSorterTooltip={false}
                        rowSelection={useSelection ? rowSelection : false}
                        rowClassName={rowClassName || defaultClassName}
                        expandable={expandable}
                        footer={footer}
                        onRow={record => ({ onClick: e => setClickedRowKey(matchRowKey(record)) })}
                    />
                </ConfigProvider>
                {/* {!pageInfo ? '' : <PageInfo tableParams={tableParams} />} */}
            </div>
        </>
  )
}

export default MainTable
