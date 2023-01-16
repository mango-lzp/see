import { Switch } from '../antd'

import { Card } from '../App'
import { storage } from '../utils'
import { Icon } from './icon'

export const DefaultItem = ({ title, enable, id }: Card) => {

  return <div className='default-card-wrap' >
    <div className="default-card">
      <div className='icon-wrap'>
        <Icon type='light' size={20} />
      </div>
      <Switch size='small' onChange={checked => storage.set(id, { enable: checked })} checked={enable} />
    </div>
    <span className='function-title'>
      {title}
    </span>
  </div>
}