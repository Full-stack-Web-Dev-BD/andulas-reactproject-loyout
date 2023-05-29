import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { DatePicker, Form, TimePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/en_US';
import { Rule } from 'antd/lib/form';
import { FormInstance } from 'antd/lib/form/Form';
import ButtonCustom from 'components/Button';
import moment, { Moment } from 'moment';
import { ICalendarListFilter } from 'pages/admin/calendar/constants';
import { MouseEvent, useEffect, useState } from 'react';
import DatePickerSwitch from './component/Switch/DatePickerSwitch';
import './style.css';

interface IProps {
  datePickerFormat: string;
  timePickerFormat: string;
  picker: 'date' | 'week' | 'month' | 'year';
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  datePickerPlaceHolder?: string;
  timePickerPlaceHolder?: string;
  className?: string;
  form?: FormInstance<any>;
  isSwapIcon: boolean;
  filter?: ICalendarListFilter;
  // onChangeFilter?: (newFilter: ICalendarListFilter, isSubmit?: boolean) => void;
  onChangeFilter?: (newFilter: ICalendarListFilter) => void;
  isSubmit?: boolean;
  datePickerName: string;
  timePickerName: string;
  datePickerRules?: Rule[];
  timePickerRules?: Rule[];
  disabledDate?: (currentDate: Moment) => boolean;
  disabledTime?: (currentDate: Moment) => {
    disabledHours?: () => number[];
    disabledMinutes?: (selectedHour: number) => number[];
  };
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  onBlur?: () => void;
  popupClassName?: string;
}

const DatePickerCustom = (props: IProps) => {
  const {
    datePickerFormat,
    timePickerFormat,
    picker = 'date',
    open = false,
    onClose,
    onOpen,
    datePickerPlaceHolder,
    timePickerPlaceHolder,
    className,
    form,
    isSwapIcon,
    filter,
    onChangeFilter,
    datePickerName,
    timePickerName,
    datePickerRules,
    timePickerRules,
    disabledDate,
    disabledTime,
    placement = 'bottomLeft',
    onBlur,
    popupClassName,
  } = props;

  const [datePicker, setDatePicker] = useState<Moment | null>(null);
  const [timePicker, setTimePicker] = useState<Moment | null>(null);

  useEffect(() => {
    if (timePicker) {
      const timeCellElm = document.querySelectorAll(
        '.ant-picker-content > .ant-picker-time-panel-column:first-child > .ant-picker-time-panel-cell-selected',
      );
      timeCellElm.forEach((elm) => {
        elm?.classList.remove('ant-picker-time-panel-cell-selected');
      });
    }
  }, [timePicker]);

  // const handleBackDateToday = (e?: MouseEvent<HTMLElement>) => {
  //   if (!e) return;
  //   e.stopPropagation();

  //   const newDate = `${moment().format('YYYY/MM/DD')} ${moment().format('hh:mm')} ${
  //     moment().format('hh:mm A').includes('AM') ? 'AM' : 'PM'
  //   }`;

  //   form?.setFieldsValue({
  //     [datePickerName]: moment(newDate),
  //     [timePickerName]: moment(),
  //     amOrPm: moment().format('hh:mm A').includes('AM') ? 'AM' : 'PM',
  //   });

  //   onClose();
  //   setDatePicker(null);
  //   setTimePicker(null);

  //   if (!onChangeFilter) return;
  //   onChangeFilter(
  //     {
  //       [datePickerName]: moment(newDate),
  //       [timePickerName]: moment(),
  //       amOrPm: moment().format('hh:mm A').includes('AM') ? 'AM' : 'PM',
  //     },
  //     true,
  //   );
  // };

  const handleClickTimePicker = () => {
    const timeCellElm = document.querySelectorAll(
      '.ant-picker-content > .ant-picker-time-panel-column:first-child > .ant-picker-time-panel-cell',
    );
    if (!timeCellElm || !filter?.[datePickerName]) return;

    const time = moment(filter?.[datePickerName], 'YYYY/MM/DD HH:mm').format('HH');

    if (+time < 12) return;

    let index = +time - 12;

    if (timeCellElm.length === 48) {
      index += 24;
    }

    // timeCellElm.forEach((elm) => {
    //   if (
    //     elm?.parentElement?.querySelector('.ant-picker-time-panel-cell-selected') &&
    //     elm != timeCellElm[index]
    //   ) {
    //     elm.parentElement
    //       ?.querySelector('.ant-picker-time-panel-cell-selected')
    //       ?.classList.remove('ant-picker-time-panel-cell-selected');
    //   }
    // });

    timeCellElm[index].classList.add('ant-picker-time-panel-cell-selected');

    timeCellElm[index].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  };

  const handleChangeDate = () => {
    // if (!e) return;
    // e.stopPropagation();

    // const newDate =
    //   !timePicker && !filter?.[timePickerName]
    //     ? `${moment(datePicker || filter?.[datePickerName]).format('YYYY/MM/DD')} `
    //     : `${moment(datePicker || filter?.[datePickerName]).format('YYYY/MM/DD')} ${moment(
    //         timePicker || filter?.[timePickerName],
    //       ).format('hh:mm')} ${filter?.amOrPm}`;

    // form?.setFieldsValue({
    //   [datePickerName]: datePicker || filter?.[datePickerName] ? moment(newDate) : null,
    //   [timePickerName]: timePicker || filter?.[timePickerName] ? moment(newDate) : null,
    // });

    // onClose();

    // setDatePicker(null);
    // setTimePicker(null);

    // if (!onChangeFilter) return;
    // onChangeFilter(
    //   {
    //     [datePickerName]: datePicker || filter?.[datePickerName] ? moment(newDate) : null,
    //     [timePickerName]: timePicker || filter?.[timePickerName] ? moment(newDate) : null,
    //   },
    //   true,
    // );

    const fields = form?.getFieldsValue();

    if (!onChangeFilter) return;
    onChangeFilter({
      [datePickerName]: fields?.[datePickerName],
    });
  };

  const renderExtraFooter = () => {
    return (
      <div className="w-full flex flex-col">
        <div className="w-full flex items-center justify-between mt-4">
          <p className="mb-0 font-bold font-fontFamily ml-2">Time</p>
          <div className="flex items-center">
            <Form.Item className="mr-2 mb-0" name={timePickerName} rules={timePickerRules}>
              <TimePicker
                format={timePickerFormat}
                showNow={false}
                allowClear={false}
                suffixIcon={null}
                locale={{
                  ...locale,
                  lang: {
                    ...locale.lang,
                    ok: 'Pick',
                  },
                }}
                placeholder={timePickerPlaceHolder}
                className="time-picker"
                inputReadOnly
                onChange={(newTime: Moment | null) => {
                  setTimePicker(newTime);
                  form?.setFieldsValue({
                    [timePickerName]: newTime,
                  });

                  if (!onChangeFilter) return;
                  onChangeFilter({
                    [timePickerName]: newTime,
                  });
                }}
                popupClassName="time-picker-popup"
                disabledTime={disabledTime}
                onClick={handleClickTimePicker}
              />
            </Form.Item>
            <DatePickerSwitch filter={filter} onChangeFilter={onChangeFilter} />
          </div>
        </div>
        <div className="w-full flex justify-between mb-4 mt-8">
          <ButtonCustom
            isWidthFitContent
            className="custom-button-date-picker ml-5 hover:!border-main-button-color"
            // onClick={handleBackDateToday}
          >
            Clear
          </ButtonCustom>
          <ButtonCustom
            color="orange"
            isWidthFitContent
            className="custom-button-date-picker mr-5"
            onClick={handleChangeDate}
          >
            Pick
          </ButtonCustom>
        </div>
      </div>
    );
  };

  return (
    // <div onClick={onOpen} id="date-picker-custom" onBlur={onBlur}>
    <div id="date-picker-custom">
      <Form.Item className="mb-0" name={datePickerName} rules={datePickerRules}>
        <DatePicker
          // nextIcon={<ArrowRightOutlined />}
          // prevIcon={<ArrowLeftOutlined />}
          // superNextIcon={null}
          // superPrevIcon={null}
          format={datePickerFormat}
          // renderExtraFooter={renderExtraFooter}
          allowClear={false}
          showToday={false}
          showNow={false}
          picker={picker}
          placeholder={datePickerPlaceHolder}
          // open={open}
          getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
          inputReadOnly
          className={`date-picker-custom relative ${className || ''} ${isSwapIcon ? 'isSwap' : ''}`}
          // onChange={(newDate: Moment | null) => {
          //   setDatePicker(newDate);
          //   form?.setFieldsValue({
          //     [datePickerName]: newDate,
          //   });

          //   if (!onChangeFilter) return;
          //   onChangeFilter({
          //     [datePickerName]: newDate,
          //   });
          // }}
          disabledDate={disabledDate}
          placement={'bottomLeft'}
          showTime={{ format: 'hh:mm a' }}
          locale={{
            ...locale,
            lang: {
              ...locale.lang,
              ok: 'Pick',
            },
          }}
          onOk={handleChangeDate}
        />
      </Form.Item>
    </div>
  );
};

export default DatePickerCustom;
