import { useState, useEffect } from 'react'
import { CardItem } from './components/item'
import uncheckSvg from './assets/minus-circle.svg'
import './style.css'

type chromeStorageListener = Parameters<chrome.storage.StorageChangedEvent['addListener']>[0]

function App() {
  const [cardList, setCardList] = useState([
    {
      id: 'clear-text',
      title: '去除文本格式',
      checked: true
    },
    {
      id: 'clear-disabled',
      title: '解除禁用限制'
    }
  ])

  useEffect(() => {
    (async () => {
      const list = await Promise.all(
        cardList.map(async card => {
          const key = card.id
          return new Promise(resolve => {
            chrome.storage.sync.get(key, (data) => {
              card.checked = data[key]
              resolve(card)
            })
          })
        })
      )

      setCardList(list as typeof cardList)
    })()
  }, [])

  useEffect(() => {
    const listener: chromeStorageListener = (changes) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        const list = cardList.map(card => {
          if(card.id === key) card.checked = newValue
          return card
        })
        setCardList(list)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [cardList])

  return (
    <div className="App">
      <div className='wrap'>
        <div className='title-wrap padding-16-20' >
          <title>复制助手</title>
          <span>设置</span>
        </div>
        <div className='content padding-16-20' id="item-container">
          <header>
            文本功能
          </header>
          {cardList.map(card => <CardItem {...card} />)}
          <header>
            自定义功能
          </header>
          <div className="block" id='read-all'>
            <div className="svg-wrap">
              <img src={uncheckSvg} />
            </div>
            csdn免关注阅读全文
          </div>
        </div>
        <input id="title-text"></input>
        <textarea id="scripts"></textarea>
        <button id="create">new</button>
      </div>
    </div>
  )
}

export default App
