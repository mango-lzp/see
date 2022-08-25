import { Switch } from '../antd'
// 按需引入样式
import 'antd/lib/switch/style/css'
// import 'antd/lib/popconfirm/style/css'
import './style.css'

import { Card } from '../App'
import { storage, classnames } from '../utils'

export const CardItem = (card: Card) => {
  const { id, enable, title, logs } = card

  const onConfirm = () => {
    storage.remove(id)
  }

  return <div className="block" id={id} >
    <div>
      <i className={classnames('healthy-icon', logs?.length ? 'unhealthy' : 'healthy')} />
      <span className='function-title'>
        {title}
      </span>
    </div>
    <div>
      <Switch size='small' onChange={checked => storage.set(id, { enable: checked })} checked={enable} />
    </div>
    {/* <div onClick={e => e.stopPropagation()}>
      <Popconfirm
        placement='topRight'
        title='确认删除？'
        onConfirm={onConfirm}
      >
        <img src={trashSvg} className='icon-trash' />
      </Popconfirm>
    </div> */}
  </div>
}