import { useState, useEffect, useCallback } from 'react'
import { DefaultItem, CardItem, Icon } from './components'
import { NewModal, ErrorModal } from './components/modal'
import { useMount } from './hoooks'
import { storage } from './utils'
import './style.css'
import './index.css'
import { Footer } from './components/custom-footer'

type chromeStorageListener = Parameters<chrome.storage.StorageChangedEvent['addListener']>[0]

function App() {
  const [visible, setVisible] = useState<'normal' | 'update' | 'error'>('normal')
  const [customList, setCustomList] = useState<Card[]>([])
  const [current, setCurrent] = useState<Card | null>(null)
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

  useMount(() => {
    storage.get<Card>(defaultList.map(item => item.id))
      .then(list => {
        if(list.some(item => !item?.id)) {
          return defaultList.map(item => {
            storage.set(item.id, item)
          })
        }
        setList(list)
      })
  })
  useMount(() => storage.getExtendList().then(list => setCustomList(list)))

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

        if(newValue?.type === 'extends' || !newValue) {
          storage.getExtendList().then(list => setCustomList(list))
        }
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [defaultList])

  return (
    <div className="App">
      <div className='wrap' style={{ display: visible !== 'normal' ? 'none' : undefined }} >
        <div className='title-wrap padding-24' >
          <title><Icon type='click' style={{ marginRight: 8 }} />复制助手</title>
          <Icon onClick={() => window.close()} type='close' style={{ color: '#C8CACD', cursor: 'pointer' }} />
        </div>
        <div style={{ paddingBottom: 24 }} className='content' id="item-container">
          <div className='default-wrap'>
            {defaultList.map(card => <DefaultItem {...card} key={card.id}/>)}
          </div>
          <header className='padding-0-24'>
            {`自定义功能 (${customList.length})`}
          </header>
          <div className='custom-card-wrap' style={{ maxHeight: customList.length * 52 }}>
            {customList.map(card => <CardItem {...card} onClick={setCurrent} setVisible={setVisible} key={card.id}/>)}
          </div>
          <Footer onClick={() => {setVisible('update');setCurrent(null)} } />
        </div>
      </div>
      <NewModal
        visible={visible === 'update'}
        current={current}
        setVisible={(_visible) => _visible ? setVisible('update') : setVisible('normal')}
      />
      <ErrorModal
        visible={visible === 'error'}
        setVisible={(_visible) => _visible ? setVisible('error') : setVisible('normal')}
        current={current}
      />
    </div>
  )
}

export default App


export interface Card {
  id: string
  title: string
  loading?: boolean
  enable?: boolean
  scripts?: string
  type?: 'extends' | 'default'
  logs?: string[]
}