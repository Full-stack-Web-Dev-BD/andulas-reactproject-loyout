import { memo, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@novicov/ckeditor5-build-classic-full';
import { Form, Input, Modal, Select } from 'antd';
import CustomInput from 'components/Input';
import RangePickerCustom from 'components/RangePicker';
import moment, { Moment } from 'moment';
import { EDITOR_CONFIG } from 'constants/constants';

const { TextArea } = Input;

function stripHTML(text: string) {
  const regex = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
  if(text){
    const translateRe: any = /&(nbsp|amp|quot|lt|gt);/g;
    const translate: any = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return text.replace(translateRe, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    }).replace(regex, '');
  }    
}

interface IAnnouncementProps {
  data: any, form: any, visible: boolean, onCancel: () => void
}

const ModalDetail = (props: IAnnouncementProps) => {
  const { data, form, visible, onCancel } = props
  const [visiblePopup, setVisiblePopup] = useState<boolean>(visible)

  const handleChangeDuration = (newDuration: [Moment, Moment]) => {
  };

  const classes = data?.classes.map((item: any) => item.className).join(', ')


  const duration: [Moment, Moment] = [moment(data?.startDate), moment(data?.endDate)]

  form.setFieldsValue({
    ...data,
    classes,
    message: data?.message,
    duration: [moment(data?.startDate), moment(data?.endDate)],
  });
  return (
    <Modal
      className={`rounded-3xl p-0`}
      width={600}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <span
        className={`font-fontFamily flex justify-left text-left
      font-bold text-2xl leading-8 tracking-tight mt-6 normal pb-[16px]`}
      >
        Announcement Details
      </span>

      <div className={`font-fontFamily font-normal text-sm mt-3}`}>
        <Form layout="vertical" form={form}>
          <div className="flex  justify-between gap-5 hide-search">
            <Form.Item className="w-full" name="classes" label={'To'}>
              <Select
                mode="multiple"
                placeholder="Placeholder"
                maxTagCount={2}
                className={'announcement_select_multi'}
                tagRender={(dataSelect) => {
                  return <div className="text-black classes_overflow">{dataSelect?.value}</div>
                }}
                disabled
              />
            </Form.Item>
            <Form.Item name="author" label={'From'} className="w-full">
              <CustomInput
                placeholder="Placeholder"
                type="string"
                disabled={true}
                classNameCustom="text-black"
              />
            </Form.Item>
          </div>
          <Form.Item name="title" label={'Title'} className="w-full">
            <CustomInput
              disabled
              placeholder="Placeholder"
              type="string"
              classNameCustom="text-black title_annoucement_fix_width"
            />
          </Form.Item>
          <Form.Item name="message" label={'Message'} className="w-full">
          <CKEditor
                editor={ClassicEditor}
                config={EDITOR_CONFIG}
                data={form.getFieldValue('message')}
              />
          </Form.Item>
          <div className="flex items-center justify-between gap-5">
            <Form.Item className="w-full" name="duration" label={'Duration'}>
              <RangePickerCustom
                disable={true}
                form={form}
                placeholder={['Start date time', 'End date time']}
                dateFormat="YYYY/MM/DD hh:mm a"
                timeFormat="hh:mm A"
                duration={duration}
                onChangeDuration={handleChangeDuration}
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default memo(ModalDetail);
