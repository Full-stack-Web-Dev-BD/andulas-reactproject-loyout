import { DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/en_US';
import { FormInstance } from 'antd/es/form/Form';
import { Moment } from 'moment';
import './style.css';

const { RangePicker } = DatePicker;

interface IProps {
  dateFormat: string;
  form: FormInstance<any>;
  timeFormat: string;
  placeholder?: [string, string];
  duration?: [Moment, Moment];
  onChangeDuration: (duration: [Moment, Moment]) => void;
  disable?: boolean;
  dropdownClassname?: string;
}

const RangePickerCustom = (props: IProps) => {
  const {
    dateFormat,
    timeFormat,
    form,
    placeholder,
    onChangeDuration,
    duration,
    disable,
    dropdownClassname,
  } = props;

  return (
    <RangePicker
      disabled={disable ? disable : false}
      showTime={{ format: timeFormat }}
      format={dateFormat}
      placeholder={placeholder}
      inputReadOnly
      dropdownClassName={`range-picker-dropdown-custom ${dropdownClassname}`}
      locale={{
        ...locale,
        lang: {
          ...locale.lang,
          ok: 'Pick',
        },
      }}
      value={duration}
      onChange={(newDuration) => onChangeDuration(newDuration as [Moment, Moment])}
    />
  );
};

export default RangePickerCustom;
