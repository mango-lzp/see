import { Switch, Button, Popconfirm } from '../antd'
import { Icon } from './icon'
import './style.css'

import { Card } from '../App'
import { storage, classnames } from '../utils'

interface IProps extends Card {
  onClick?: (e) => void
  setVisible: (visible) => void
}

export const CardItem = (props: IProps) => {
  const { onClick, setVisible, ...current } = props
  const { id, enable, title, logs } = props

  const onConfirm = () => {
    storage.remove(id)
  } 

  return <div className='card-wrap' onClick={() => onClick?.(current)} id={id}>
    <div className="block" >
      <div>
        <i className={classnames('healthy-icon', logs?.length ? 'unhealthy' : 'healthy')} />
        <span className='function-title' onClick={() => logs?.length && setVisible('error')}>
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