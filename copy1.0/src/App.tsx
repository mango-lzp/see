import { useState, useEffect, useCallback } from 'react'
import { CardItem } from './components/item'
import uncheckSvg from './assets/minus-circle.svg'
import './style.css'
import './index.css'
import { useMount } from './hoooks'
import { NewModal } from './components/modal'

type chromeStorageListener = Parameters<chrome.storage.StorageChangedEvent['addListener']>[0]

function App() {
  const [visible, setVisible] = useState(false)
  const [customList, setCustomList] = useState<Card[]>([])
  const [defaultList, setList] = useState<Card[]>([
    {
      id: 'clear-text',
      title: '去除文本格式',
      type: 'default'
    },
    {
      id: 'clear-disabled',
      title: '解除禁用限制',
      type: 'default'
    }
  ])

  const getList = useCallback(async (type: 'default' | 'extends') => {
    return new Promise<Card[]>(resolve => {
      chrome.storage.sync.get(type, (data) => {
        const obj = data[type] || {}
        resolve(Object.values(obj))
      })
    })
  }, [])

  useMount(async() => {
    const list = await getList('default')
    setList(defaultList.map(card => list.find(item => item.id === card.id) ?? card))
  })

  useMount(async() => {
    const list = await getList('extends')
    setCustomList(list as typeof customList)
  })

  useEffect(() => {
    const listener: chromeStorageListener = (changes) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if(key === 'default') {
          const list = defaultList.map(card => {
            card = newValue[card.id]
            return card
          })
          setList(list)
        }

        if(key === 'extends') {
          setCustomList(Object.values(newValue))
        }
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [defaultList])

  return (
    <div className="App">
      <div className='wrap'>
        <div className='title-wrap padding-16-20' >
          <title>复制助手</title>
          <span onClick={() => setVisible(true)}>设置</span>
        </div>
        <div className='content padding-16-20' id="item-container">
          <header>
            文本功能
          </header>
          {defaultList.map(card => <CardItem {...card} />)}
          <header>
            自定义功能
          </header>
          <div className="block" id='read-all'>
            <div className="svg-wrap">
              <img src={uncheckSvg} />
            </div>
            csdn免关注阅读全文
          </div>
          {customList.map(card => <CardItem {...card} />)}
        </div>
        <NewModal
          visible={visible}
          setVisible={setVisible}
        />
      </div>
    </div>
  )
}

export default App


export interface Card {
  id: string
  title: string
  enable?: boolean
  scripts?: string
  type?: 'extends' | 'default'
}