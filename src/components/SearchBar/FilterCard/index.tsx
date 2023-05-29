import { Dropdown, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import SelectSearch from 'components/SelectSearch';
import React, { useEffect } from 'react';

import { ChangeEvent, ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
enum TYPE {
  SELECT_SEARCH = 'select-search',
  SELECT_MULTIPLE = 'select-multiple',
}

enum FieldName {
  CENTRES = 'centres',
}

interface IFilterCard {
  fields?: {
    name: string;
    placeholder: string;
    className: string;
    options?: { label: string; value: string }[];
    handleSearch?: (value: string) => void;
    isDefaultValue?: boolean;
  }[];
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
  searchResults?: { id: number; courseName?: string; className?: string }[];
  keyResult?: string;
  pathSearchDetail?: string;
  handleSearchOptions?: (value: string) => void;
  dependencyFiled?: string;
  fieldNameReset?: string;
  handleSearchDependency?: (val: string | number) => void;
  pathEndPointSearchDetail?: string;
}

const FilterCard = (props: IFilterCard) => {
  const history = useNavigate();
  const {
    fields,
    handleSearchCourses,
    onFinish,
    onValuesChange,
    handleReset,
    handleChangeSearch,
    searchResults,
    keyResult,
    form,
    pathSearchDetail,
    handleSearchOptions,
    dependencyFiled,
    fieldNameReset,
    handleSearchDependency,
    pathEndPointSearchDetail,
  } = props;
  const [valueSearch, setValueSearch] = useState('');

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

  const searchResult = useMemo(
    () => (
      <>
        {valueSearch && keyResult ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px]">
            {searchResults && searchResults?.length > 0 ? (
              searchResults?.map((item: any) => (
                <div
                  className={`py-2 font-fontFamily font-normal ${
                    pathSearchDetail ? 'cursor-pointer' : ''
                  }`}
                  onClick={() =>
                    pathSearchDetail
                      ? history(
                          `${pathSearchDetail}/${item.id}${
                            pathEndPointSearchDetail ? pathEndPointSearchDetail : ''
                          }`,
                        )
                      : {}
                  }
                  key={item.id}
                >
                  {item[keyResult]}
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
      <div className="filter-content w-full filter-sp">
        <Form
          form={form}
          className="w-full flex flex-wrap gap-4"
          name="basic"
          initialValues={{ layout: 'inline' }}
          autoComplete="off"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
        >
          <div className="flex w-full gap-4 relative custom-gap">
            <Dropdown
              trigger={['click']}
              overlay={searchResult}
              placement="bottom"
              className="w-full relative"
              getPopupContainer={(trigger: any) => trigger?.parentNode}
            >
              <div className="relative" onClick={(e) => e.preventDefault()}>
                <Form.Item name="search" className={`${fields ? 'basis-full' : 'w-[70%]'} mb-0`}>
                  <Input
                    value={valueSearch}
                    placeholder="Search"
                    onChange={onChangeSearch}
                    suffix={<img src={images.search} alt="search" />}
                    className="style_input_custom_login_page"
                  />
                </Form.Item>
              </div>
            </Dropdown>
            <Form.Item className="mb-0">
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

          {fields &&
            fields.map(
              (select: {
                name: string;
                className: string;
                placeholder: string | undefined;
                options?: { label: string; value: string }[];
                type?: string;
                handleSearch?: (value: string) => void;
                isDefaultValue?: boolean;
                disabled?: boolean;
                valueDefaultSelectSearch?: {
                  default: boolean;
                  fieldsValue: { label: string; value: string };
                };
              }) => {
                if (
                  select?.isDefaultValue &&
                  select.name === FieldName.CENTRES &&
                  select?.options?.length === 2
                ) {
                  form?.setFieldsValue({ centres: select?.options[0] });
                }

                if (select.valueDefaultSelectSearch?.default) {
                  form?.setFieldsValue({
                    [select.name]: select.valueDefaultSelectSearch.fieldsValue,
                  });
                }

                return (
                  <React.Fragment key={select.name}>
                    <Form.Item
                      name={select.name}
                      className={select.className + ' mb-0' || ''}
                      key={select.name}
                    >
                      {select?.type === TYPE.SELECT_SEARCH ? (
                        <SelectSearch
                          handleSearchOptions={
                            select?.handleSearch ? select?.handleSearch : handleSearchOptions
                          }
                          options={select?.options}
                          placeholder={select?.placeholder}
                          disable={select.disabled}
                          disableFilterCard={
                            select.valueDefaultSelectSearch?.default ? true : false
                          }
                        />
                      ) : (
                        <Select
                          disabled={select.disabled}
                          getPopupContainer={(triggerNode) => triggerNode}
                          placeholder={select.placeholder}
                          allowClear
                          options={select?.options}
                          className="text-main-font-color font-fontFamily text-sm"
                        />
                      )}
                    </Form.Item>
                  </React.Fragment>
                );
              },
            )}

          <Form.Item className="basis-[calc(15%_-_0.75rem)] mb-0">
            <ButtonCustom
              className="h-12 min-w-fit w-full"
              htmlType="submit"
              color="orange"
              onClick={handleSearchCourses}
            >
              Search
            </ButtonCustom>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FilterCard;
