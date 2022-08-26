import React from 'react';

import { Form, Input, Button } from '../antd'
import { genUuid, storage } from "../utils"
import { useUpdateEffect } from '../hoooks'
import './style.css'

const { Item } = Form

const Modal = (props: ModalProps) => {
  const { visible, onCancel, onOk, title, footer } = props

  return <div
    style={{ display: visible ? undefined : 'none' }}
    className='modal-wrap'
  >
    <p><span onClick={onCancel}>{'<-  '}</span>{title}</p>
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
  useUpdateEffect(() => {
    if(visible) {
      form.resetFields()
    }
  }, [visible])

  const onOk = () => {
    form.validateFields().then(value => {
      const uuid = current?.id || genUuid()
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
      <Item name='destroy' label='关闭插件执行脚本'>
        <Input.TextArea rows={5} />
      </Item>
    </Form> 
  </Modal>
}

export const ErrorModal = (props: IProps) => {
  const { visible, setVisible, current } = props

  return <Modal
    visible={visible}
    onCancel={() => setVisible(false)}
    title='查看错误日志'
    footer={<></>}
  >
      {current?.logs?.map(log => {
        return <div className='log-wrap'>
          <span>
            {log}
          </span>
        </div>
      })}
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
  children?: any
  onCancel?: () => any
  onOk?: () => any
}