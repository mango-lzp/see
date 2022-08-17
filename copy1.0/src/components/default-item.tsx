import { Switch } from 'antd'
import 'antd/lib/switch/style/css'

import { Card } from '../App'
import { storage } from '../utils'

export const DefaultItem = ({ title, enable, id }: Card) => {

  return <div className='default-card-wrap'>
  <div className="default-card">
    <div className='icon-wrap'>
      *
    </div>
    <Switch size='small' onChange={checked => storage.set(id, { enable: checked })} checked={enable} />
  </div>
  {title}
</div>
}