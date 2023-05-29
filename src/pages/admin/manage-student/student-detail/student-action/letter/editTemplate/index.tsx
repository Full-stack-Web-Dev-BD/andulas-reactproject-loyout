import { Form } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import React, { useState } from 'react';

const EditTemplate = ({
  templateId,
  setTemplateId,
}: {
  templateId: number;
  setTemplateId: (value: number | undefined) => void;
}) => {
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  return (
    <Content className="rounded-3xl bg-white p-8 pb-0">
      <div className="font-fontFamily text-main-font-color text-2xl font-bold mb-4">Letter</div>
      <Form
        layout="vertical"
        className="flex flex-wrap gap-x-4"
        form={form}
        onChange={() => {
          setIsChanging(true);
        }}
      >
        <Form.Item
          className="sm:w-full lg:w-[49%]"
          name="templateName"
          label="Template Name"
          rules={[{ required: true, message: 'Template Name is required!' }]}
        >
          <CustomInput type="text" placeholder="Please enter content" disabled={!isEdit} />
        </Form.Item>

        <Form.Item
          className="sm:w-full lg:w-[49%]"
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Subject is required!' }]}
        >
          <CustomInput type="text" placeholder="Please enter subject" disabled={!isEdit} />
        </Form.Item>

        <Form.Item
          className="w-full"
          name="content"
          label="Content"
          rules={[{ required: true, message: 'Content is required!' }]}
        >
          <CustomInput
            type="textArea"
            placeholder="Please enter content"
            classNameCustom="h-[240px]"
            disabled={!isEdit}
          />
        </Form.Item>
        <Form.Item className="w-full">
          <div className="flex gap-x-3 justify-end">
            <ButtonCustom
              color="outline"
              onClick={() => {
                setTemplateId(undefined);
              }}
            >
              Cancel
            </ButtonCustom>
            <ModalCustom
              cancelText="Cancel"
              okText="Confirm"
              title={'Confirmation'}
              onSubmit={() => {}}
              viewComponent={<ButtonCustom color="orange">Send</ButtonCustom>}
              titleCenter
            >
              Are you sure you want to activate Admin Name?
            </ModalCustom>
          </div>
        </Form.Item>
      </Form>
    </Content>
  );
};

export default EditTemplate;
