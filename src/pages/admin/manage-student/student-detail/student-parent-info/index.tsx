import { DatePicker, Form, Input, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { ReactComponent as AttachSVG } from 'assets/icons/attach.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import { DATE_FORMAT, FIELDS, REGEX_EMAIL, REGEX_NUMBER } from 'constants/constants';
import { ERROR_MESSAGE } from 'constants/messages';
import { IFieldListForm } from 'constants/types';
import { codesPhoneNumber } from 'pages/auth/register';
import React, { useCallback, useState } from 'react';

const StudentParentInfo = () => {
  const [isEdit, setIsEdit] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  const [formParentInfo] = Form.useForm();

  const handleOpenUpdateProfile = useCallback(() => {
    setIsEdit(!isEdit);
  }, [isEdit]);

  const onFinishParentInfo = (values: any) => {};

  const handleCancelEditProfile = useCallback(() => {
    // if (isChanging) {
    //   setIsOpenConfirmCancelEditProfile(true);
    //   return;
    // }
    setIsEdit(true);
  }, [isChanging]);
  const fieldList = [
    {
      label: 'Parent Name',
      name: 'parentName',
      type: 'string',
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
      rules: [{ required: true, message: 'Please input your Parent Name!' }],
    },
    {
      label: 'Relationship',
      name: 'relationship',
      type: 'string',
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
      rules: [{ required: true, message: 'Please input your Relationship!' }],
    },
    {
      label: 'Contact Number',
      name: 'contactNumber',
      nameChild: ['mobileCountryCode', 'contactNumber'],
      type: 'phoneNumber',
      rules: [
        { required: true, message: 'Contact Number is required!' },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_NUMBER);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.CONTACT_NUMBER);
          },
        },
      ],
      options: codesPhoneNumber.map((item) => {
        return { label: `+ ${item.code}`, value: item.code.toString() };
      }),
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'string',
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
      rules: [
        { required: true, message: 'Please input your email address!' },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_EMAIL);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.EMAIL);
          },
        },
      ],
    },
    {
      label: 'Address',
      name: 'address1',
      type: 'string',
      rules: [{ required: true, message: 'Address is required!' }],
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
    {
      label: 'Address',
      name: 'address2',
      type: 'string',
      rules: [{ required: true, message: 'Address is required!' }],
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
    {
      label: 'Country',
      name: 'country',
      type: 'select',
      options: [{ label: 'Singapore', value: 'Singapore' }],
      rules: [{ required: true, message: 'Country is required!' }],
    },
    {
      label: 'Postal Code',
      name: 'postalCode',
      type: 'string',
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
      rules: [
        { required: true, message: 'Postal Code is required!' },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_NUMBER);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.POSTAL_CODE);
          },
        },
      ],
    },
    {
      label: 'Nationality',
      name: 'nationality',
      type: 'string',
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
      rules: [{ required: true, message: 'Nationality is required!' }],
    },
    {
      label: 'Employment Info',
      name: '',
      type: 'section',
      isFullWidth: true,
    },
    {
      label: 'Job Title',
      name: 'jobTitle',
      type: 'string',
      rules: [{ required: true, message: 'Job title is required!' }],
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
    {
      label: 'Company Name',
      name: 'companyName',
      type: 'string',
      rules: [{ required: true, message: 'Company name is required!' }],
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
    {
      label: 'Address',
      name: 'address3',
      type: 'string',
      rules: [{ required: true, message: 'Address is required!' }],
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
    {
      label: 'Address',
      name: 'address4',
      type: 'string',
      rules: [{ required: true, message: 'Address is required!' }],
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
    {
      label: 'Country',
      name: 'country',
      type: 'select',
      options: [{ label: 'Singapore', value: 'Singapore' }],
      rules: [{ required: true, message: 'Country is required!' }],
    },
    {
      label: 'Postal Code',
      name: 'postalCode2',
      type: 'string',
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
      rules: [
        { required: true, message: 'Postal Code is required!' },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_NUMBER);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.POSTAL_CODE);
          },
        },
      ],
    },
    {
      label: 'Link Child Account',
      name: 'linkChildAccount',
      type: 'string',
      rules: [{ required: true, message: 'Company name is required!' }],
      icon: (
        <AttachSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            // setIsModalInsertEmail(true);
          }}
        />
      ),
    },
  ];

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return (
            <CustomInput
              disabled={isEdit || field.disabled}
              type={field.type}
              suffix={!isEdit && field.icon ? field.icon : <span />}
            />
          );
        case FIELDS.NUMBER:
          return <CustomInput disabled={isEdit} type={field.type} />;
        case FIELDS.DATE:
          return (
            <DatePicker
              disabled={!isEdit || field.disabled}
              format={DATE_FORMAT}
              className="style_input_custom_login_page"
            />
          );
        case FIELDS.GROUP_NAME:
          return (
            <div className="flex gap-x-3">
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'First Name is required!' }]}
                name={field.nameChild ? field.nameChild[0] : ''}
              >
                <CustomInput disabled={isEdit} placeholder="First Name" type="string" />
              </Form.Item>
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'Last Name is required!' }]}
                name={field.nameChild ? field.nameChild[1] : ''}
              >
                <CustomInput disabled={isEdit} placeholder="Last Name" type="string" />
              </Form.Item>
            </div>
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={isEdit}
            />
          );

        case FIELDS.PHONE_NUMBER:
          return (
            <Input.Group compact>
              <Form.Item
                noStyle
                name={field?.nameChild ? field?.nameChild[0] : ('' as string)}
                rules={[{ required: true, message: 'Prefix is required!' }]}
              >
                <Select
                  options={field.options}
                  getPopupContainer={(node) => node}
                  className="w-[25%]"
                  disabled={true}
                />
              </Form.Item>
              <Form.Item
                noStyle
                name={field?.nameChild ? field?.nameChild[1] : ('' as string)}
                // rules={field.rules}
              >
                <Input
                  className="style_input_custom_login_page w-[75%] rounded-r-2xl"
                  suffix={
                    !isEdit ? (
                      <EditSVG
                        className="icon-hover cursor-pointer"
                        onClick={() => {
                          //   setIsModalChangeContactNumber(true);
                        }}
                      />
                    ) : (
                      <span />
                    )
                  }
                />
              </Form.Item>
            </Input.Group>
          );
        case '':
          return <div></div>;
        case 'section':
          return <div className="w-full text-2xl font-bold font-fontFamily">{field.label}</div>;
        default:
          return <CustomInput disabled={isEdit} type={field.type} />;
      }
    },
    [DATE_FORMAT, isEdit],
  );
  const renderFieldList = useCallback(() => {
    return fieldList?.map((field, index) => (
      <Form.Item
        className={field.isFullWidth ? `w-full` : `w-full sm:w-full md:w-full lg:w-[47%]`}
        key={index}
        validateFirst
        name={field.name}
        label={field.type !== 'section' ? field.label : ''}
        rules={field.rules}
      >
        {renderField(field)}
      </Form.Item>
    ));
  }, [fieldList, isEdit]);

  return (
    <Content className="mt-8 p-8 bg-white rounded-3xl shadow[#0000000a]">
      <div className="md:flex lg:flex xl:flex 2xl:flex gap-x-6 form-edit">
        <Form
          onFinish={onFinishParentInfo}
          form={formParentInfo}
          layout="vertical"
          onFieldsChange={() => {
            setIsChanging(true);
          }}
          colon={false}
          autoComplete="off"
          className="flex flex-wrap gap-x-6"
          initialValues={{
            designation: 'https://dev.andaluslldp.com',
            mobileCountryCode: '65',
          }}
        >
          {renderFieldList()}
        </Form>
      </div>
      <div className="gap-[10px] flex justify-end flex-wrap">
        {isEdit ? (
          <>
            <ButtonCustom onClick={handleOpenUpdateProfile} color="orange">
              Edit
            </ButtonCustom>
          </>
        ) : (
          <>
            <ButtonCustom color="outline" onClick={handleCancelEditProfile}>
              Cancel
            </ButtonCustom>
            <ButtonCustom htmlType="submit" onClick={formParentInfo.submit} color="orange">
              Update
            </ButtonCustom>
          </>
        )}
      </div>
    </Content>
  );
};

export default StudentParentInfo;
