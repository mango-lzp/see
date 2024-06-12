import { Switch, Button, Popconfirm, Input } from '../antd'
import { Icon } from './icon'
import './style.css'

import { classnames } from '../utils'
import { useState } from 'react';

interface IProps {
  id?: string
  rule: Pick<Rule, 'id'|'enable'|'name'>
  onChange: (rule) => void
  onDelete: (visible) => void
  isLight?: boolean
}

export const RuleItem = (props: IProps) => {
  const { onChange, onDelete, isLight, rule } = props
  const { id, enable, name } = rule
  const isGlobal = id === 'global'
  const [inputName, setName] = useState(name)
  const [isEdit, setIsEdit] = useState(false)

  const changeName = () => {
    onChange?.({ name: inputName })
    setIsEdit(false)
  }

  return <div className='card-wrap hover-visible-wrap' id={id}>
    <div className="block" >
      <div style={{ flex: 1 }}>
        {!isEdit && <i className={classnames('healthy-icon', isLight ? 'healthy' : 'inactive')} />}
        {!isEdit && <span className='function-title'>
          {name}
        </span>}
        {isEdit && <Input value={inputName} onChange={e => setName(e.target.value)}/>}
      </div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        {!isGlobal && !isEdit && <Icon className='cursor-pointer hover-visible' type='edit' onClick={() => setIsEdit(true)} />}
        <Switch size='small' style={{ marginLeft: '4px' }} onChange={checked => onChange?.({ enable: checked })} checked={enable} />
        {!isGlobal && !isEdit &&
          <div className='hover-visible hover-visible-delete width0' style={{
            display: 'inline-block'
          }}>
            <Popconfirm
              placement='topRight'
              title='确认删除该规则？'
              onConfirm={onDelete}
              getPopupContainer={(triggerNode) => triggerNode.parentElement!}
            >
              <Icon className={classnames('btn-trash', 'cursor-pointer')} type='trash' />
            </Popconfirm>
          </div>
        }
      </div>
    </div>
    {isEdit && <div className='edit-wrap' style={{
        opacity: 1,
        visibility: 'visible'
    }}>
      <Button className='btn-edit' type='text' onClick={changeName}>确认</Button>
      <Button className='btn-trash' type='text' onClick={() => setIsEdit(false)}>取消</Button>
    </div>}
  </div>
}

export interface Rule {
  id: string
  name: string
  enable?: boolean
  createDate: number
  lastModify: number
}