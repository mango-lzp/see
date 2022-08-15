import { Popconfirm } from 'antd'
// 按需引入样式
import 'antd/lib/popconfirm/style/css'

import { Card } from '../App'
import checkedSvg from '../assets/checkmark-circle-fill.svg'
import uncheckSvg from '../assets/minus-circle.svg'
import trashSvg from '../assets/trash.svg'
import { storage } from '../utils'

export const CardItem = (card: Card) => {
  const { id, enable, type, title, ...res } = card
  const onClick = () => {
    console.log('click', id)
    
    storage.set(id, {
      type,
      id,
      title,
      enable: !enable,
      ...res
    })
  }

  const onConfirm = () => {
    storage.remove(id)
  }

  return <div className="block" id={id} onClick={onClick}>
    <div>
      <div className="svg-wrap">
        <img src={enable ? checkedSvg : uncheckSvg} />
      </div>
      {title}
    </div>
    {type === 'extends' &&
      <div onClick={e => e.stopPropagation()}>
        <Popconfirm
          placement='topRight'
          title='确认删除？'
          onConfirm={onConfirm}
        >
          <img src={trashSvg} className='icon-trash' />
        </Popconfirm>
      </div>
    }
  </div>
}