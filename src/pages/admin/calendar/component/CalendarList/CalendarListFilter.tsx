import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Form, FormInstance, Select, Row, Col } from 'antd';
import ButtonCustom from 'components/Button';
import DatePickerCustom from 'components/DatePicker';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Views } from 'react-big-calendar';
import { ICalendarListFilter } from '../../constants';
import { CALENDAR_SORT } from '../../constants/constants';
import { View } from 'react-big-calendar';
import './style.css';

interface IProps {
  form?: FormInstance<any>;
  filter?: ICalendarListFilter;
  onChangeFilter?: (newFilter: ICalendarListFilter) => void;
}

const CalendarListFilter = (props: IProps) => {
  const { form, filter, onChangeFilter } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    form?.setFieldsValue({
      date: filter?.date || moment(),
      sort: filter?.sort || Views.DAY,
      time: filter?.time,
    });
  }, [filter]);

  const handleChangeFilter = (newCalendarFilter: ICalendarListFilter) => {
    if (onChangeFilter) {
      onChangeFilter({
        ...newCalendarFilter,
      });
    }
  };

  const onClose = () => {
    if (!open) return;

    setOpen(false);
  };

  const handleChangeDate = (number: number) => {
    if (!onChangeFilter) return;

    const date = moment(filter?.date).add(number, 'days');

    onChangeFilter({ date: moment(date) });
  };

  const handleBackDateToday = () => {
    if (!onChangeFilter) return;

    onChangeFilter({
      date: moment(),
      time: filter?.sort === Views.DAY ? null : moment(),
      amOrPm:
        filter?.sort === Views.DAY ? 'AM' : moment().format('hh:mm A').includes('AM') ? 'AM' : 'PM',
    });

    onClose();
  };

  const handleSelect = (value: string) => {
    if (!onChangeFilter) return;

    let sort: View = Views.DAY;

    switch (value) {
      case 'day':
        sort = Views.DAY;
        break;
      case 'week':
        sort = Views.WEEK;
        break;
      case 'month':
        sort = Views.MONTH;
        break;
      case 'agenda':
        sort = Views.AGENDA;
        break;
      default:
        sort = Views.DAY;
        break;
    }

    onChangeFilter({
      sort,
      amOrPm: moment().format('hh:mm A').includes('AM') ? 'AM' : 'PM',
    });

    form?.setFieldsValue({
      time: value === Views.DAY ? null : moment(),
    });
  };

  const handleBlur = () => {
    if (!open) return;

    onClose();
  };

  return (
    <div className="filter-content w-full">
      <Form
        className={`w-full flex flex-wrap gap-4 items-center ${
          filter?.sort === Views.DAY ? 'justify-between' : ''
        }`}
        name="basic"
        autoComplete="off"
        form={form}
      >
        <Form.Item className="mb-0 grow">
          <div className="flex items-center mr-2 h-11">
            {form?.getFieldValue('sort') !== Views.AGENDA && (
              <LeftOutlined onClick={() => handleChangeDate(-1)} className="mr-5 text-[10px]" />
            )}
            <p className="mb-0 font-semibold font-fontFamily text-sm title-date">
              {moment(filter?.date).format('DD MMMM YYYY')}
            </p>
            {form?.getFieldValue('sort') === Views.AGENDA && (
              <>
                <span className="ml-1 mr-1 font-semibold font-fontFamily text-sm">→</span>
                <p className="mb-0 font-semibold font-fontFamily text-sm title-date">
                  {moment(filter?.date).add(90, 'days').format('DD MMMM YYYY')}
                </p>
              </>
            )}
            {form?.getFieldValue('sort') !== Views.AGENDA && (
              <RightOutlined onClick={() => handleChangeDate(1)} className="ml-5 text-[10px]" />
            )}
          </div>
        </Form.Item>
        <Row className="flex items-end custom-width" gutter={[12, 12]}>
          <Col className="w-fit">
            <Form.Item name="sort" className="mb-0 mr-2 custom-select h-11">
              <Select
                suffixIcon={
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.666687 0.666667C0.666687 0.298477 0.965164 0 1.33335 0H10.6667C11.0349 0 11.3334 0.298477 11.3334 0.666667C11.3334 1.03486 11.0349 1.33333 10.6667 1.33333H1.33335C0.965164 1.33333 0.666687 1.03486 0.666687 0.666667ZM2.00002 4C2.00002 3.63181 2.2985 3.33333 2.66669 3.33333H9.33335C9.70154 3.33333 10 3.63181 10 4C10 4.36819 9.70154 4.66667 9.33335 4.66667H2.66669C2.2985 4.66667 2.00002 4.36819 2.00002 4ZM3.33335 7.33333C3.33335 6.96514 3.63183 6.66667 4.00002 6.66667H8.00002C8.36821 6.66667 8.66669 6.96514 8.66669 7.33333C8.66669 7.70152 8.36821 8 8.00002 8H4.00002C3.63183 8 3.33335 7.70152 3.33335 7.33333Z"
                      fill="#32302D"
                    />
                  </svg>
                }
                optionLabelProp="label"
                placeholder="Sort by"
                className="h-11"
                onSelect={handleSelect}
              >
                {CALENDAR_SORT.map((calendar) => (
                  <Select.Option
                    value={calendar.value}
                    label={calendar.label}
                    key={calendar.value}
                    disabled={calendar.disabled}
                  >
                    {calendar.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col className="cus-w-150-calendar-today">
            <Form.Item className="mb-0 mr-2">
              <ButtonCustom
                className="h-11 text-sm font-semibold custom-button-color hover:!border-main-button-color hover:!text-main-button-color"
                isWidthFitContent
                onClick={handleBackDateToday}
              >
                Today
              </ButtonCustom>
            </Form.Item>
          </Col>
          <Col>
            <div onBlur={handleBlur}>
              <DatePickerCustom
                datePickerFormat={filter?.time ? 'ddd, DD/MM/YYYY hh:mm a' : 'ddd, DD/MM/YYYY'}
                timePickerFormat="hh:mm"
                open={open}
                onClose={onClose}
                onOpen={() => setOpen(true)}
                picker="date"
                className="h-11 font-semibold hide-date-input min-w-[110px] w-[110px]"
                form={form}
                isSwapIcon
                filter={filter}
                onChangeFilter={handleChangeFilter}
                datePickerName="date"
                timePickerName="time"
                placement="bottomRight"
              />
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CalendarListFilter;
