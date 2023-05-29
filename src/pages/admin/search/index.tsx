import { Button, Form, Input, Select } from 'antd';
import React from 'react';

const Search = () => {
  // const formItemLayout = {
  //   labelCol: {
  //     span: 4,
  //   },
  //   wrapperCol: {
  //     span: 14,
  //   },
  // };
  return (
    <>
      <div className="content-title">Search</div>

      <div className="filter-card">
        <div className="filter-title">Filter</div>

        <div className="filter-content w-full">
          <Form
            className="w-full"
            name="basic"
            initialValues={{ layout: 'inline' }}
            autoComplete="off"
          >
            <div className="flex gap-4">
              <Form.Item name="search" className="flex-1">
                <Input placeholder="" className="style_input_custom_login_page" />
              </Form.Item>

              <Form.Item name="student" className="flex-none">
                <Select
                  placeholder="Please select"
                  allowClear
                  className="text-[#32302D] font-fontFamily text-sm"
                >
                  <Select.Option value="sms">SMS</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="app">App</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="status" className="flex-none">
                <Select
                  placeholder="Please select"
                  allowClear
                  className="text-[#32302D] font-fontFamily text-sm"
                >
                  <Select.Option value="sms">SMS</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="app">App</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="flex gap-4">
              <Form.Item name="student" className="flex-1">
                <Select
                  placeholder="Please select"
                  allowClear
                  className="text-[#32302D] font-fontFamily text-sm"
                >
                  <Select.Option value="sms">SMS</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="app">App</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="student" className="flex-1">
                <Select
                  placeholder="Please select"
                  allowClear
                  className="text-[#32302D] font-fontFamily text-sm"
                >
                  <Select.Option value="sms">SMS</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="app">App</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="student" className="flex-1">
                <Select
                  placeholder="Please select"
                  allowClear
                  className="text-[#32302D] font-fontFamily text-sm"
                >
                  <Select.Option value="sms">SMS</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="app">App</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="student" className="flex-1">
                <Select
                  placeholder="Please select"
                  allowClear
                  className="text-[#32302D] font-fontFamily text-sm"
                >
                  <Select.Option value="sms">SMS</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="app">App</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item className="flex-none">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="border-0 font-semibold rounded-2xl text-white text-base font-fontFamily h-12 px-16"
                  size="large"
                >
                  Search
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Search;
