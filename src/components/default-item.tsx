import { Switch } from '../antd'

import { Card } from '../App'
import { Icon } from './icon'
import { useCardState } from './item'

interface IProps {
  current: Card
  setVisible: (...args: any[]) => any
  onClick?: (...args: any[]) => any
}

export const DefaultItem = ({ current, setVisible, onClick }: IProps) => {
  const { title } = current
  const [enable, onChange] = useCardState(current)

  return <div className='default-card-wrap hover-visible-wrap' onClick={onClick} >
    <div className="default-card">
      <div className='icon-wrap'>
        <Icon type='light' size={20} />
      </div>
      <Switch size='small' onChange={onChange} checked={enable} />
    </div>
    <span className='function-title'>
      {title}
      <Icon className='hover-visible' style={{ marginLeft: 8, cursor: 'pointer' }} type='black-list' onClick={() => setVisible('rule')} />
    </span>
  </div>
}