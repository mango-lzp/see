import React, { useState } from 'react';

import { Form, Input, Button, Switch } from '../antd'
import { Icon } from './icon'
import { genUuid, storage, classnames, page } from "../utils"
import { useUpdateEffect } from '../hoooks'
import './style.css'

const { Item } = Form

const Modal = (props: ModalProps) => {
  const { visible, onCancel, onOk, title, footer, className } = props

  return <div
    style={{ display: visible ? undefined : 'none' }}
    className={classnames('modal-wrap', className)}
  >
    <p><Icon style={{ marginRight: 8 }} type='arrow-left' onClick={onCancel} />{title}</p>
    {props.children}
    {footer
      ? footer
      : <div>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }} onClick={onOk}>确定</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    }
  </div>
}


export const NewModal = (props: IProps) => {
  const [form] = Form.useForm()
  const { visible, setVisible, current } = props
  const [destroy, setDestroy] = useState(false)
  
  useUpdateEffect(() => setDestroy(current?.destroy), [current])

  useUpdateEffect(() => {
    if(visible) {
      form.resetFields()
    }
  }, [visible])

  const onOk = () => {
    form.validateFields().then(value => {
      const uuid = current?.id || genUuid()

      if(current?.id && current?.scripts !== value?.scripts) {
        page.clearLog(uuid)
      }

      storage.set(uuid, {
        id: uuid,
        type: 'extends',
        ...value,
      }).then(() => setVisible(false))
    })
  }

  return <Modal
    visible={visible}
    onCancel={() => setVisible(false)}
    onOk={onOk}
    title='添加自定义功能'
  >
    <Form
      form={form}
      initialValues={current}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Item name='title' label='功能名称' required>
        <Input />
      </Item>
      <Item name='scripts' label='开启插件执行脚本' required>
        <Input.TextArea rows={5} />
      </Item>
      <Item label='关闭插件执行脚本' className='item-close'>
        <Switch style={{ marginBottom: 8 }} checked={destroy} onChange={checked => setDestroy(checked)}></Switch>
        {destroy &&
          <Item name='destroy' style={{ marginBottom: 0 }}>
            <Input.TextArea rows={5} />
          </Item>
        }
      </Item>
    </Form> 
  </Modal>
}

export const ErrorModal = (props: IProps) => {
  const { visible, setVisible, current } = props
  const [log, setLog] = useState<string>()

  useUpdateEffect(() => {
    if(visible) {
      page.getPageDataById(current.id).then(response => {
        setLog(response?.log!)
      })
    }
  }, [visible])

  return <Modal
    className='modal-error-log'
    visible={visible}
    onCancel={() => setVisible(false)}
    title='查看错误日志'
    footer={<></>}
  >
    <div className='log-wrap'>
      <span>
        {log}
      </span>
    </div>
  </Modal>
}

interface IProps {
  current?: any
  visible: boolean
  setVisible: (visible: boolean) => void
}

interface ModalProps {
  visible: boolean
  title?: string
  footer?: React.ReactNode
  className?: string
  children?: any
  onCancel?: () => any
  onOk?: () => any
}