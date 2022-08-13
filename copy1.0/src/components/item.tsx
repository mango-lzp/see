import { Popover } from 'antd'
import { Card } from '../App'
import checkedSvg from '../assets/checkmark-circle-fill.svg'
import uncheckSvg from '../assets/minus-circle.svg'
import trashSvg from '../assets/trash.svg'
import { setStorage, deleteStorage } from '../utils'
import { useState } from 'react';

export const CardItem = (card: Card) => {
  const { id, enable, type, title, ...res} = card
  const onClick = () => {
    console.log('click', id)
    
    setStorage(type, {
      id,
      title,
      enable: !enable,
      ...res
    })
  }

  const [deleteVisible, setDeleteVisible] = useState(false)
  // const onClickTrash: React.DOMAttributes<HTMLImageElement>['onClick'] = (e) => {
    
  // }

  const content = (
    <div>
      <p>Content</p>
      <button onClick={() => {
        deleteStorage('extends', id)
        setDeleteVisible(false)
      }}>OK</button>
      <button onClick={() => setDeleteVisible(false)}>cancel</button>
    </div>
  );

  return <div className="block" id={id} onClick={onClick}>
    <div>
      <div className="svg-wrap">
        <img src={enable ? checkedSvg : uncheckSvg} />
      </div>
      {title}
    </div>
    {type === 'extends' &&
      <div onClick={e => e.stopPropagation()}>
        <Popover visible={deleteVisible} placement='topRight' title='确认删除？' content={content} trigger="click">
          <img onClick={() => setDeleteVisible(true)} src={trashSvg} className='icon-trash' />
        </Popover>
      </div>
    }
  </div>
}