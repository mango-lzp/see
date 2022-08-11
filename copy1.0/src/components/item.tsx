import checkedSvg from '../assets/checkmark-circle-fill.svg'
import uncheckSvg from '../assets/minus-circle.svg'

interface IProps {
  id: string
  title: string
  checked?: boolean
}

export const CardItem = ({ id, title, checked }: IProps) => {
  const onClick = () => {
    console.log('click', id)
    chrome.storage.sync.set({ [id]: !checked })
  }

  return <div className="block" id={id} onClick={onClick}>
    <div className="svg-wrap">
      <img src={checked ? checkedSvg : uncheckSvg} />
    </div>
    {title}
  </div>
}