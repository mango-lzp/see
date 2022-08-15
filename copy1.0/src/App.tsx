import { useState, useEffect, useCallback } from 'react'
import { CardItem } from './components/item'
import { NewModal } from './components/modal'
import { useMount } from './hoooks'
import { storage } from './utils'
import './style.css'
import './index.css'

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
      // storage.get()
      chrome.storage.sync.get(type, (data) => {
        const obj = data[type] || {}
        resolve(Object.values(obj))
      })
    })
  }, [])

  useMount(async() => {
    const list = await storage.get<Card>(defaultList.map(item => item.id))
    if(list.some(item => !item?.id)) {
      return defaultList.map(item => {
        storage.set(item.id, item)
      })
    }
    setList(list)
  })

  useMount(async() => {
    const list = await getList('extends')
    setCustomList(list as typeof customList)
  })

  useEffect(() => {
    const listener: chromeStorageListener = (changes) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if(newValue?.type === 'default') {
          const list = defaultList.map(card => {
            if(card.id === newValue.id) { return newValue }
            return card
          })
          setList(list)
        }

        if(newValue?.type === 'extends') {
          storage.get().then(data => {
            const list = Object.values(data).filter(item => item.type === 'extends')
            setCustomList(list)
          })
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