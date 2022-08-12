import { Card } from '../App'
import checkedSvg from '../assets/checkmark-circle-fill.svg'
import uncheckSvg from '../assets/minus-circle.svg'
import { setStorage } from '../utils'

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

  return <div className="block" id={id} onClick={onClick}>
    <div className="svg-wrap">
      <img src={enable ? checkedSvg : uncheckSvg} />
    </div>
    {title}
  </div>
}