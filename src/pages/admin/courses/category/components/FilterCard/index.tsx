import { Dropdown, Form, Input, Select } from 'antd';
import ButtonCustom from 'components/Button';
import images from 'assets/images';
import React from 'react';
import { FormInstance } from 'antd/lib/form/Form';
declare type OverlayFunc = () => React.ReactElement;

interface IFilterCard {
  fields?: { name: string; placeholder: string; className: string; option: { value: string }[] }[];
  handleSearchCourses?: () => void;
  handleReset?: () => void;
  onFinish?: (values: any) => void;
  onValuesChange?: (values: any) => void;
  dropdown?: {
    overlay: React.ReactElement | OverlayFunc;
    visible?: boolean;
  };
  form?: FormInstance<any>;
}

const FilterCard = (props: IFilterCard) => {
  const { fields, handleSearchCourses, onFinish, onValuesChange, dropdown, handleReset, form } =
    props;

  return (
    <div className="filter-card">
      <div className="filter-content w-full">
        <Form
          form={form}
          className="w-full flex gap-4"
          name="basic"
          initialValues={{ layout: 'inline' }}
          autoComplete="off"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
        >
          {dropdown ? (
            <Dropdown
              trigger={['click']}
              overlay={dropdown?.overlay}
              placement="bottomRight"
              className="w-full h-full"
            >
              <Form.Item
                name="search"
                className={`${fields ? 'basis-full' : 'w-[70%]'} mb-0 cus-width-sp`}
              >
                <Input
                  placeholder="Search..."
                  suffix={<img src={images.search} alt="search" />}
                  className="style_input_custom_login_page"
                />
              </Form.Item>
            </Dropdown>
          ) : (
            <Form.Item
              name="search"
              className={`${fields ? 'basis-full' : 'w-[70%]'} mb-0 cus-width-sp`}
            >
              <Input
                placeholder="Search"
                suffix={<img src={images.search} alt="search" />}
                className="style_input_custom_login_page"
              />
            </Form.Item>
          )}

          {fields &&
            fields.map(
              (select: {
                name: string;
                className: string;
                placeholder: string | undefined;
                option: { value: string }[];
              }) => {
                return (
                  <>
                    <Form.Item
                      name={select.name}
                      className={select.className + ' mb-0' || ''}
                      key={select.name}
                    >
                      <Select
                        placeholder={select.placeholder}
                        allowClear
                        className="text-main-font-color font-fontFamily text-sm"
                      >
                        {select.option.map((option) => {
                          return (
                            <>
                              <Select.Option value={option.value} key={option.value}>
                                {option.value}
                              </Select.Option>
                            </>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </>
                );
              },
            )}

          <Form.Item className="basis-[15%] mb-0 flex-basic-48">
            <ButtonCustom
              className="h-12"
              htmlType="submit"
              color="orange"
              onClick={handleSearchCourses}
            >
              Search
            </ButtonCustom>
          </Form.Item>

          <Form.Item className="mb-0 w-48-class">
            <ButtonCustom
              className="h-12"
              htmlType="submit"
              color="outline"
              onClick={handleReset}
              isWidthFitContent
            >
              Reset
            </ButtonCustom>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FilterCard;
