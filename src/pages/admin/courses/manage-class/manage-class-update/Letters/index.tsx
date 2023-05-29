import { Form, Select } from 'antd';
import { Rule } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import CustomInput from 'components/Input';
import { EDITOR_CONFIG, FIELDS, IFieldListForm } from 'constants/index';
import { useCallback, useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@novicov/ckeditor5-build-classic-full';
import '@novicov/ckeditor5-build-classic-full/build/translations/en';
import ButtonCustom from 'components/Button';

interface ITemplate {
  id: number;
  templateName: string;
}

const fieldListInitial = [
  {
    label: 'To',
    name: 'to',
    rules: [{ required: true, message: 'To is required!' }],
    options: [
      { label: 'To All Student & Teacher', value: 'To All Student & Teacher' },
      { label: 'To All Student', value: 'To All Student & Teacher' },
      { label: 'To All Teacher', value: 'To All Teacher' },
    ],
    type: 'select',
    isFullWidth: true,
  },
  {
    label: 'Template Name',
    name: 'templateName',
    rules: [{ required: true, message: 'Template Name is required!' }],
    type: 'string',
  },
  {
    label: 'Subject',
    name: 'subject',
    rules: [{ required: true, message: 'Subject is required!' }],
    type: 'string',
  },
  {
    label: 'Content',
    name: 'content',
    rules: [{ required: true, message: 'Content is required!' }],
    type: 'editor',
    isFullWidth: true,
  },
];

const ManageClassUpdateLetters = () => {
  const [form] = Form.useForm();
  const [templates] = useState<ITemplate[]>([
    { id: 1, templateName: 'Template A' },
    { id: 1, templateName: 'Template B' },
  ]);
  const [fieldList] = useState<Array<IFieldListForm>>(fieldListInitial);
  const [templateIdEdit, setTemplateIdEdit] = useState<number | string>('');
  const [isEditTemplate, setIsEditTemplate] = useState<boolean>(false);

  const openEditTemplate = useCallback((id: number) => {
    setTemplateIdEdit(id);
    setIsEditTemplate(true);
  }, []);

  useEffect(() => {
    if (templateIdEdit) {
      // get template detail
    }
  }, [templateIdEdit]);

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput type={field.type} />;
        case FIELDS.EDITOR:
          return (
            <CKEditor
              editor={ClassicEditor}
              config={EDITOR_CONFIG}
              onChange={(event: EventTarget, editor: any) => {
                const data = editor.getData();
                form.setFieldsValue({ content: data });
              }}
            />
          );
        case FIELDS.SELECT:
          return <Select options={field.options as (BaseOptionType | DefaultOptionType)[]} />;
        default:
          return <CustomInput type={field.type} />;
      }
    },
    [form],
  );

  const handleEditTemplate = useCallback(() => {}, []);

  return !isEditTemplate ? (
    <Content className="flex flex-col gap-4">
      {templates.map((template: ITemplate) => (
        <div
          onClick={() => openEditTemplate(template.id)}
          className="cursor-pointer px-6 py-4 bg-white rounded-2xl text-[1rem] font-semibold"
          key={template.id}
        >
          {template.templateName}
        </div>
      ))}
    </Content>
  ) : (
    <Content className="rounded-3xl bg-white p-8" title="Letter">
      <Form
        layout="vertical"
        form={form}
        onFinish={handleEditTemplate}
        className="flex flex-wrap gap-x-4"
      >
        {fieldList.map((field: IFieldListForm) => (
          <Form.Item
            label={field.label}
            className={field.isFullWidth ? 'w-full' : 'w-[49%]'}
            name={field.name}
            rules={field.rules as Rule[] | undefined}
            colon={true}
            key={field.name}
          >
            {renderField(field)}
          </Form.Item>
        ))}
        <Form.Item className="w-full">
          <div className="flex gap-3 justify-end">
            <ButtonCustom color="outline" onClick={() => setIsEditTemplate(false)}>
              Cancel
            </ButtonCustom>
            <ButtonCustom onClick={form.submit} color="orange">
              Send
            </ButtonCustom>
          </div>
        </Form.Item>
      </Form>
    </Content>
  );
};

export default ManageClassUpdateLetters;
