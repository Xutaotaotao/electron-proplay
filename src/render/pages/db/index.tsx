import { sqDelete, sqInsert, sqQuery, sqUpdate } from '@/common/db'
import { Button, Space } from 'antd'
import React from 'react'

const DBPage = () => {

  const sqInsertHandle = () => {
    sqInsert({
      table: 'test',
      data: {
        name: 'a',
        age: 18
      }
    }).then((res:any) => {
      console.log(res)
    })
  }

  const queryHandle = () => {
    sqQuery({
      sql: 'SELECT * FROM test',
      params: []
    }).then((res:any) => {
      console.log(res)
    })
  }

  const updateHandle = () => {
    sqUpdate({
      table: 'test',
      data: {
        age: 22
      },
      condition: 'name = "a"'
    }).then((res:any) => {
      console.log(res)
    })
  }

  const deleteHandle = () => {
    sqDelete({
      table: 'test',
      condition: 'name = "a"'
    }).then((res:any) => {
      console.log(res)
    })
  }

  return <div> 
      <Space>
        <Button onClick={sqInsertHandle}>增加数据</Button>
        <Button onClick={queryHandle}>查询数据</Button>
        <Button onClick={updateHandle}>更新数据</Button>
        <Button onClick={deleteHandle}>删除数据</Button>
      </Space>
     </div>
}

export default DBPage