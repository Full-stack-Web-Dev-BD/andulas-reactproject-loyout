import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@novicov/ckeditor5-build-classic-full';
import { Breadcrumb, Checkbox, Form, Input, Layout, Select, Tabs, notification } from 'antd';
import { postAnnouncement } from 'api/announcement';
import { searchClass } from 'api/class';
import ButtonCustom from 'components/Button';
import DatePickerCustom from 'components/DatePicker';
import ModalCustom from 'components/Modal';
import { EDITOR_CONFIG, PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH } from 'constants/constants';
import moment, { Moment } from 'moment';
import EmailSentSVG from 'assets/images/emailsent.svg';
import { ICalendarListFilter } from 'pages/admin/calendar/constants';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import './new-announcement.css';
import RangePickerCustom from 'components/RangePicker';
import { WARNING_MESSAGE } from 'constants/messages';
import usePrompt from 'constants/function';

const { TabPane } = Tabs;

const NewAnnouncement = () => {
  const [form] = Form.useForm();
  const [isModelConfirm, setIsModalConfirm] = useState(false);
  const [dataCreateAnnouncement, setDataCreateAnnouncement] = useState<any>({});
  const [sessionDetail, setSessionDetail] = useState<string>('');
  const [messageSucces, setMessageSuccess] = useState('');
  const [checkboxSendMail, setCheckboxSendMail] = useState(false);
  const [duration, setDuration] = useState<[Moment, Moment]>();
  const [disableWhenCreate, setDisableWhenCreate] = useState(false);
  const [isOpenModalCancelEdit, setIsOpenModalCancelEdit] = useState(false);
  const [isFieldsChange, setIsFieldsChange] = useState(false);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState(false);

  const navigate = useNavigate();

  const [classOptions, setClassOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  usePrompt(WARNING_MESSAGE.LEAVE_ANNOUNCEMENT, isOpenConfirmLeave);

  const {
    mutate: createAnnouncement,
    status: statusCreateAnnouncement,
    isLoading: isLoadingAnnouncement,
  } = useMutation('postAnnouncement', postAnnouncement, {
    onSuccess: (data) => {
      setMessageSuccess('Announcement Successfully Created');
      setDisableWhenCreate(false);
    },
    onError: ({ response }) => {
      notification.error({ message: 'Something was wrong!' });
      setDisableWhenCreate(false);
    },
  });

  const { mutate: getClasses } = useMutation('searchClass', searchClass, {
    onSuccess: ({
      data,
    }: {
      data: { listClasses: { id: number; className: string; course: { courseName: string } }[] };
    }) => {
      let newOptions = data.listClasses.map((el) => {
        return {
          label: el.className + ' - ' + el.course.courseName,
          value: el.id.toString(),
          disabled: false,
        };
      });
      newOptions = newOptions.concat([
        { label: TEXT_SELECT_SEARCH.class, value: '', disabled: true },
      ]);
      setClassOptions(newOptions);
    },
  });

  const handleChangeDuration = (newDuration: [Moment, Moment]) => {
    setDuration(newDuration);
    setIsFieldsChange(true);
    setIsOpenConfirmLeave(true);
  };

  useEffect(() => {
    getClasses(PARAMS_SELECT_SEARCH.class);
  }, []);

  const handleOkModule = () => {
    setIsModalConfirm(false);
    setDisableWhenCreate(true);

    createAnnouncement(dataCreateAnnouncement);
  };

  const onSubmit = (e: any) => {
    setIsModalConfirm(true);

    const classes = e.classes.map((item: any) => {
      return { id: item };
    });

    const dataCreate = {
      ...e,
      classes: classes,
      sendEmail: checkboxSendMail,
      startDate: duration?.[0],
      endDate: duration?.[1],
    };
    setDataCreateAnnouncement(dataCreate);
  };

  const onClickCancel = () => {
    if (isFieldsChange) {
      setIsOpenModalCancelEdit(true);
      return;
    }
    navigate('/announcement');
  };

  return (
    <Layout className="bg-transparent">
      <Breadcrumb className="content-title text-preview-theme-font-color !font-previewFontFamily custom-font-header">
        <Breadcrumb.Item className="font-fontFamily text-main-font-color">
          New Announcement
        </Breadcrumb.Item>
      </Breadcrumb>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        layout="vertical"
        onFinish={onSubmit}
        className="p-10 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] rounded-3xl w-full mb-4"
        autoComplete="off"
        form={form}
        onFieldsChange={() => {
          setIsFieldsChange(true);
          setIsOpenConfirmLeave(true);
        }}
      >
        <Form.Item
          name="classes"
          label="Recipients :"
          rules={[{ required: true, message: 'Recipients is required!' }]}
        >
          <Select
            mode="multiple"
            options={classOptions}
            className="new_announcement_select_class xl-min:w-[710px] w-[100%] rounded-xl"
            filterOption={(input, option) =>
              option!.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          ></Select>
        </Form.Item>

        <Form.Item
          label="Title : "
          name="title"
          rules={[{ required: true, min: 1, message: 'Title is required!', whitespace: true }]}
        >
          <Input className="h-[48px] xl-min:w-[710px] w-[100%] rounded-xl" />
        </Form.Item>

        <Form.Item
          label="Message"
          name="message"
          required
          rules={[{ required: true, message: 'Message is required!' }]}
        >
          {/* <TextArea className='h-[170px] xl-min:w-[710px]' /> */}
          <div className="xl-min:w-[710px] w-[100%]">
            <CKEditor
              editor={ClassicEditor}
              config={EDITOR_CONFIG}
              onChange={(event: EventTarget, editor: any) => {
                const data = editor.getData();
                setSessionDetail(data);
                setIsFieldsChange(true);
                setIsOpenConfirmLeave(true);
                form.setFieldsValue({ message: data });
              }}
              data={sessionDetail}
            />
          </div>
        </Form.Item>

        <div className="flex gap-[24px] xl-min:w-[710px] w-[100%]">
          <Form.Item
            name="duration"
            label="Duration: "
            className="h-[48px] xl-min:w-[710px] w-[100%]"
            rules={[{ required: true, message: 'Duration is required!' }]}
          >
            <RangePickerCustom
              form={form}
              placeholder={['Start date time', 'End date time']}
              dateFormat="YYYY/MM/DD hh:mm a"
              timeFormat="hh:mm A"
              duration={duration}
              onChangeDuration={(newDuration) => {
                handleChangeDuration(newDuration);
                form.setFieldsValue({ duration: newDuration });
              }}
            />
          </Form.Item>
        </div>
        <Form.Item name="sendEmail" className="mt-[26px] mb-[26px]">
          <Checkbox
            className="custom-checkbox"
            checked={checkboxSendMail}
            onChange={(e) => {
              setCheckboxSendMail(e.target.checked);
            }}
          >
            Send the announcement to email
          </Checkbox>
        </Form.Item>

        <div className="flex justify-end gap-[8px]">
          <ButtonCustom className="text-[#ed7635]" onClick={onClickCancel}>
            Cancel
          </ButtonCustom>
          <ButtonCustom color="orange" htmlType="submit" disabled={disableWhenCreate}>
            Create
          </ButtonCustom>
        </div>
      </Form>
      <ModalCustom
        onSubmit={() => {
          setDisableWhenCreate(true);
          handleOkModule();
        }}
        visible={isModelConfirm}
        content={`Are you sure you want to create this announcement?`}
        title="Confirmation"
        okText="Confirm"
        onCancel={() => setIsModalConfirm(false)}
        cancelText="Cancel"
        titleCenter
      ></ModalCustom>
      <ModalCustom
        cancelText="Back"
        onCancel={() => {
          setIsOpenConfirmLeave(false);
          setTimeout(() => {
            setMessageSuccess('');
            navigate('/announcement');
          }, 100);
        }}
        visible={messageSucces ? true : false}
      >
        <div className="w-full flex justify-center items-center flex-col">
          <img src={EmailSentSVG} alt="email sent" />
          <div className="font-fontFamily font-bold text-2xl text-center">{messageSucces}</div>
        </div>
      </ModalCustom>

      <ModalCustom
        onSubmit={() => {
          setIsOpenConfirmLeave(false);
          setTimeout(() => {
            setMessageSuccess('');
            navigate('/announcement');
          }, 100);
        }}
        visible={isOpenModalCancelEdit}
        content={WARNING_MESSAGE.LEAVE_ANNOUNCEMENT}
        title="Notice"
        okText="Confirm"
        onCancel={() => setIsOpenModalCancelEdit(false)}
        cancelText="Cancel"
        titleCenter
      />
    </Layout>
  );
};

export default NewAnnouncement;
