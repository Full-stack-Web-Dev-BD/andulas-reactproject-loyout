import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Dropdown, Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import React, { useEffect } from 'react';
import { ChangeEvent, ReactElement, useMemo, useState } from 'react';
import { IEvent } from '../../constants';

import "./cus-style-calendar.css";

interface ICalendarFilter {
  handleSearchCourses?: () => void;
  handleReset?: () => void;
  onFinish?: (values: any) => void;
  onValuesChange?: (values: any) => void;
  dropdown?: {
    overlay: React.ReactElement;
    visible?: boolean;
  };
  form?: FormInstance<any>;
  handleChangeSearch?: (value: string) => void;
  searchResults?: IEvent[];
  keyResult?: string;
  dependencyFiled?: string;
  fieldNameReset?: string;
  handleSearchDependency?: (val: string | number) => void;
}

const CalendarFilter = (props: ICalendarFilter) => {
  const {
    handleSearchCourses,
    onFinish,
    onValuesChange,
    handleReset,
    handleChangeSearch,
    searchResults,
    keyResult,
    form,
    dependencyFiled,
    fieldNameReset,
    handleSearchDependency,
  } = props;
  const [valueSearch, setValueSearch] = useState('');
  const [positionLimitByIcon, setPositionLimitByIcon] = useState<'UP' | 'DOWN'>('DOWN');

  const onChangeSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setValueSearch(event.target.value);
    if (handleChangeSearch instanceof Function) {
      handleChangeSearch(event.target.value);
    }
  };

  const dependency = Form.useWatch(dependencyFiled ? dependencyFiled : '', form);
  useEffect(() => {
    if (fieldNameReset) {
      form?.setFieldsValue({ [fieldNameReset]: '' });
      if (handleSearchDependency instanceof Function) {
        handleSearchDependency(dependency?.value);
      }
    }
  }, [dependency, fieldNameReset]);

  const onSearch = (title: string, id: string) => {
    setValueSearch(title);
    form?.setFieldsValue({ search: title });
    if (onFinish instanceof Function) {
      onFinish({ id });
    }
  };

  const searchResult = useMemo(
    () => (
      <>
        {valueSearch && keyResult ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px] custom-dropdown-search">
            {searchResults && searchResults?.length > 0 ? (
              searchResults?.map((event: IEvent) => (
                <div
                  className="py-2 font-fontFamily font-normal cursor-pointer text-truncate"
                  key={event?.resource?.id}
                  onClick={() => onSearch(event?.title || '', event?.resource?.id || '')}
                >
                  {event.title}
                </div>
              ))
            ) : valueSearch ? (
              <div className="text-center font-fontFamily font-normal pt-4 word-break">
                No results found for “{valueSearch}”
              </div>
            ) : null}
          </div>
        ) : (
          <div />
        )}
      </>
    ),
    [searchResults, valueSearch, keyResult],
  ) as ReactElement<string>;

  return (
    <div className="filter-card">
      <div className="filter-content w-full">
        <Form
          form={form}
          className="w-full flex flex-wrap gap-4"
          name="basic"
          initialValues={{ layout: 'inline' }}
          autoComplete="off"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
        >
          <div className="flex w-full gap-4 relative cus-flex">
            <div className='custom-width-col-search cus-flex-item'>
              <Dropdown
                trigger={['click']}
                overlay={searchResult}
                placement="bottom"
                className="w-full h-full relative cus-width-min-180"
                getPopupContainer={(trigger: any) => trigger?.parentNode}
              >
                <div className="relative" onClick={(e) => e.preventDefault()}>
                  <Form.Item name="search" className="w-full mb-0">
                    <Input
                      value={valueSearch}
                      placeholder="Search"
                      onChange={onChangeSearch}
                      suffix={<img src={images.search} alt="search" />}
                      className="style_input_custom_login_page rounded-xl"
                    />
                  </Form.Item>
                </div>
              </Dropdown>
            </div>
            <div className='custom-width-col-limit'>
              <Dropdown
                trigger={['click']}
                placement="bottom"
                className="w-[45%] h-full relative cus-flex-item"
                overlay={<div></div>}
                disabled
              >
                <div
                  className="flex items-center justify-between border border-[#E9E6E5] border-solid rounded-xl px-4 bg-white custom-width cus-width-min-180 cus-height-min-50"
                  // onClick={() => setPositionLimitByIcon((prev) => (prev === 'UP' ? 'DOWN' : 'UP'))}
                >
                  <p className="mb-0 font-fontFamily text-[#32302D]">Limit by </p>
                  {positionLimitByIcon === 'DOWN' ? (
                    <DownOutlined className="dropdown-icon" />
                  ) : (
                    <UpOutlined className="text-[10px]" />
                  )}
                </div>
              </Dropdown>
            </div>
            <div className='custom-width-col-button-search'>
              <Form.Item className="basis-[15%] mb-0 cus-width-min-180 cus-flex-item">
                <ButtonCustom
                  className="h-12"
                  htmlType="submit"
                  color="orange"
                  onClick={handleSearchCourses}
                >
                  Search
                </ButtonCustom>
              </Form.Item>
            </div>
            <div className='custom-width-col-button-search'>
              <Form.Item className="mb-0 cus-flex-item">
                <ButtonCustom
                  className="h-12"
                  htmlType="button"
                  color="outline"
                  onClick={() => {
                    if (handleReset instanceof Function) {
                      handleReset();
                    }
                    form?.resetFields();
                    setValueSearch('');
                  }}
                  isWidthFitContent
                >
                  Reset
                </ButtonCustom>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CalendarFilter;
