import { Form, Input, Button } from '../antd'

import { genUuid, storage } from "../utils"
import { useUpdateEffect } from '../hoooks'
import './style.css'

const { Item } = Form

const Modal = (props: ModalProps) => {
  const { visible, onCancel, onOk } = props

  return <div
    style={{ display: visible ? undefined : 'none' }}
    className='modal-wrap'
  >
    <p>添加自定义功能</p>
    {props.children}
    <div>
      <Button type="primary" htmlType="submit" style={{ marginRight: 8 }} onClick={onOk}>确定</Button>
      <Button onClick={onCancel}>取消</Button>
    </div>
  </div>
}


export const NewModal = (props: IProps) => {
  const [form] = Form.useForm()
  const { visible, setVisible } = props

  useUpdateEffect(() => {
    if(visible) {
      form.resetFields()
    }
  }, [visible])

  const onOk = () => {
    form.validateFields().then(value => {
      const uuid = genUuid()
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
  >
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Item name='title' label='title' required>
        <Input />
      </Item>
      <Item name='scripts' label='scripts' required>
        <Input.TextArea rows={6} />
      </Item>
      <Item name='destroy' label='destroy'>
        <Input.TextArea rows={6} />
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