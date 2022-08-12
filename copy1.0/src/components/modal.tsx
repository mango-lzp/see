import { useState } from "react"
import { Form, Input, Button } from 'antd'
import { genUuid, setStorage } from "../utils"
import './style.css'

const { Item } = Form

const Modal = (props: ModalProps) => {
  const { visible, onCancel, onOk } = props

  return <div
    style={{ display: visible ? 'block' : 'none' }}
    className='modal-wrap'
  >
    <p>添加自定义功能</p>
    {props.children}
    <div>
      <Button onClick={onCancel}>cancel</Button>
      <Button type="primary" htmlType="submit" onClick={onOk}>ok</Button>
    </div>
  </div>
}


export const NewModal = (props: IProps) => {
  const [form] = Form.useForm()
  const { visible, setVisible } = props

  const onOk = () => {
    form.validateFields().then(value => {
      const uuid = genUuid()
      setStorage('extends', {
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
  >
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onOk}
    >
      <Item name='title' label='title'>
        <Input />
      </Item>
      <Item name='scripts' label='scripts'>
        <Input.TextArea />
      </Item>
    </Form> 
  </Modal>
}

interface IProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

interface ModalProps {
  visible: boolean
  children?: any
  onCancel?: () => any
  onOk?: () => any
}