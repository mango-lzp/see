import { Switch, Button, Popconfirm } from '../antd'
import { Icon } from './icon'
import './style.css'

import { Card } from '../App'
import { storage, classnames, page, genUuid, isPass, getMatchRule } from '../utils'
import { useCallback, useEffect, useState } from 'react';
import { useMount } from '../hoooks/index';
import { Rule } from './rule'

type chromeStorageListener = Parameters<chrome.runtime.ExtensionMessageEvent['addListener']>[0]
interface IProps {
  current: Card
  onClick?: () => void
  setVisible: (visible) => void
}

export const useCardState = (current) => {
  const [enable, setEnable] = useState(current.enable)
  const [matchRule, setMatchRule] = useState<Rule | null>(null)

  useEffect(() => {
    page.getPageDataById('info').then(info => {
      setEnable(isPass(info?.url, current))
      setMatchRule(getMatchRule(info?.url, current?.ruleList || []))
    })
  }, [current])

  const onCheckedChange = useCallback(async (checked) => {
    const id = current.id
    const pageInfo = await page.getPageDataById('info')
    const url = pageInfo?.url
    const _location = new URL(url)
    let name = _location.host
    if(_location.pathname.split('/')[1]) {
      name = `${_location.host}/${_location.pathname.split('/')[1]}`
    }
    const ruleList = current.ruleList || []

    const lastModify = Date.now()
    if(matchRule) {
      const list = ruleList.map(r => {
        if(r.id === matchRule?.id) {
          return { ...r, enable: checked, lastModify }
        }
        return r
      })
      storage.set(id, { ruleList: list })
    } else {
      storage.set(id, { ruleList: [...ruleList, {
        id: genUuid(),
        name,
        enable: checked,
        createDate: lastModify,
        lastModify,
      }] })
    }
  }, [matchRule, current])

  return [enable, onCheckedChange]
}

// TODO  抽象成组件。带编辑和删除功能的 Item 卡片。
export const CardItem = (props: IProps) => {
  const { onClick, setVisible, current } = props
  const { id, title } = current
  const [hasLog, setHasLog] = useState(false)
  const [enable, onCheckedChange] = useCardState(current)

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

  return <div className='card-wrap hover-visible-wrap' onClick={onClick} id={id}>
    <div className="block" >
      <div>
        <i className={classnames('healthy-icon', enable ? hasLog ? 'unhealthy' : 'healthy' : 'inactive')} />
        <span className='function-title' onClick={() => hasLog && setVisible('error')}>
          {title}
        </span>
      </div>
      <div>
        <Icon className='hover-visible' style={{ marginRight: 8, cursor: 'pointer' }} type='black-list' onClick={() => setVisible('rule')} />
        <Switch size='small' onChange={onCheckedChange} checked={enable} />
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