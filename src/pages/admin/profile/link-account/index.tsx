import { Checkbox, Form, Switch } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import CustomInput from 'components/Input';
import React from 'react';

import "./custom-link-acount.css";

const LinkAccount = () => {
  return (
    <Content className="p-8 mt-5 bg-white rounded-3xl shadow[#0000000a]">
      <div className="font-fontFamily font-bold text-2xl mb-4">Child 1</div>
      <Form layout="vertical" colon={false} autoComplete="off">
        <div className="flex flex-wrap gap-x-6 custom-link-acount">
          <Form.Item name={'child'} label="Child Email Address" className="flex-1 custom-link-acount-item">
            <CustomInput disabled type="string" />
          </Form.Item>
          <Form.Item
            name={'child'}
            label="Children IC number / Birth Cert number: "
            className="flex-1 custom-link-acount-item"
          >
            <CustomInput disabled type="string" />
          </Form.Item>
          <div className="flex custom-link-acount-item">
            <Form.Item name={'status'} label="Status: ">
              <Switch defaultChecked />
            </Form.Item>
            <div className="pt-9 font-fontFamily text-main-button-color">Active</div>
          </div>
        </div>
        <Form.Item>
          <Checkbox className="custom-checkbox">Receive Notifications</Checkbox>
        </Form.Item>
        <div className="font-fontFamily text-sm bg-[#E9E6E5] py-3 px-4 rounded-xl w-fit min-w-fit">
          View as
        </div>
      </Form>
    </Content>
  );
};

export default LinkAccount;
