import { Switch, Button, Popconfirm } from '../antd'
import { Icon } from './icon'
import './style.css'

import { Card } from '../App'
import { storage, classnames, page } from '../utils'
import { useState } from 'react';
import { useMount } from '../hoooks/index';

type chromeStorageListener = Parameters<chrome.runtime.ExtensionMessageEvent['addListener']>[0]
interface IProps extends Card {
  onClick?: (e) => void
  setVisible: (visible) => void
}

export const CardItem = (props: IProps) => {
  const { onClick, setVisible, ...current } = props
  const { id, enable, title } = props
  const [hasLog, setHasLog] = useState(false)

  useMount(() => {
    page.getPageDataById(id).then(response => {
      setHasLog(Reflect.has(response || {}, 'log'))
    })

    const listener: chromeStorageListener = (request, sender, sendResponse) => {
      if (request.type === "error_log") {
        const data = request?.state?.[id] || {}
        setHasLog(data?.log)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  })

  const onConfirm = () => {
    storage.remove(id)
  } 

  return <div className='card-wrap' onClick={() => onClick?.(current)} id={id}>
    <div className="block" >
      <div>
        <i className={classnames('healthy-icon', enable ? hasLog ? 'unhealthy' : 'healthy' : 'inactive')} />
        <span className='function-title' onClick={() => hasLog && setVisible('error')}>
          {title}
        </span>
      </div>
      <div>
        <Switch size='small' onChange={checked => storage.set(id, { enable: checked })} checked={enable} />
      </div>
    </div>
    <div className='edit-wrap'>
      <Button className='btn-edit' type='text' icon={<Icon type='edit' />} onClick={() => setVisible('update')}>编辑</Button>
      <Popconfirm
        placement='topRight'
        title='确认删除？'
        onConfirm={onConfirm}
        getPopupContainer={(triggerNode) => triggerNode.parentElement!}
      >
        <Button className='btn-trash' type='text' icon={<Icon type='trash' />}>删除</Button>
      </Popconfirm>
    </div>
  </div>
}