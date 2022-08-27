import { FC } from 'react'
import { Switch as AntSwitch } from 'antd'
import 'antd/lib/switch/style/css'
import './style.css'

import { SwitchProps } from 'antd/lib/switch'
import { Icon } from '../../components/icon'

const Switch: FC<SwitchProps> = props => {
  return (
    <AntSwitch
      size="small"
      checkedChildren={<Icon type="checkmark" size={12} />}
      unCheckedChildren={<Icon type="close" size={12} />}
      {...props}
    />
  )
}

export { Switch }