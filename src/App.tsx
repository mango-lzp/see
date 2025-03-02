import { useState, useEffect, useCallback } from 'react'
import { DefaultItem, CardItem, Icon } from './components'
import { NewModal, ErrorModal, RuleListModal } from './components/modal'
import { useMount } from './hoooks'
import { storage } from './utils'
import './style.css'
import './index.css'
import { Footer } from './components/custom-footer'
import { Rule } from './components/rule'
import DraggableContainer from './components/draggable-container'

type chromeStorageListener = Parameters<chrome.storage.StorageChangedEvent['addListener']>[0]

// 在 App 组件中添加处理排序变化的函数
function App() {
  const [visible, setVisible] = useState<'normal' | 'update' | 'error' | 'rule'>('normal')
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

        // 扩展修改或删除
        if(newValue?.type === 'extends' || !newValue) {
          storage.getExtendList().then(list => setCustomList(list))
        }

        // 更新 current
        if(newValue) {
          setCurrent(newValue)
        }
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [defaultList])

  const handleOrderChange = (newOrder: string[]) => {
    // 根据新的顺序重新排列 customList
    const orderedList = newOrder.map(id => 
      customList.find(card => card.id === id)
    ).filter(Boolean) as Card[];
    
    setCustomList(orderedList);
  };

  return (
    <div className="App">
      <div className='wrap' style={{ display: visible !== 'normal' ? 'none' : undefined }} >
        <div className='title-wrap padding-16' >
          <title><Icon type='click' style={{ marginRight: 8 }} />Script Executor</title>
          <Icon onClick={() => window.close()} type='close' style={{ color: '#C8CACD', cursor: 'pointer' }} />
        </div>
        <div style={{ paddingBottom: 16 }} className='content' id="item-container">
          <div className='default-wrap'>
            {defaultList.map(card => <DefaultItem onClick={() => setCurrent(card)} setVisible={setVisible} current={card} key={card.id}/>)}
          </div>
          <header className='padding-0-16'>
            {`自定义功能 (${customList.length})`}
          </header>
          
          {/* 使用改进后的拖拽容器 */}
          <DraggableContainer 
            onOrderChange={handleOrderChange}
            className="custom-card-wrap"
          >
            {customList.map(card => 
              <CardItem 
                current={card} 
                onClick={() => setCurrent(card)} 
                setVisible={setVisible} 
                key={card.id}
              />
            )}
          </DraggableContainer>
          
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
      <RuleListModal
        visible={visible === 'rule'}
        setVisible={(_visible) => _visible ? setVisible('rule') : setVisible('normal')}
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
  ruleList?: Rule[]
  enable?: boolean
  scripts?: string
  type?: 'extends' | 'default'
  logs?: string[]
}