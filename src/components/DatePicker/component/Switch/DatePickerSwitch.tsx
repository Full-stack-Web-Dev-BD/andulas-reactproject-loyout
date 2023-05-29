import { ICalendarListFilter } from 'pages/admin/calendar/constants';
import { ChangeEvent, useEffect, useState } from 'react';
import './style.css';

interface IProps {
  filter?: ICalendarListFilter;
  onChangeFilter?: (newFilter: ICalendarListFilter) => void;
}

const DatePickerSwitch = (props: IProps) => {
  const { filter, onChangeFilter } = props;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(filter?.amOrPm === 'AM' ? false : true);
  }, [filter]);

  const handleChangeFilter = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChangeFilter) return;

    setChecked((prev) => !prev);

    onChangeFilter({ amOrPm: e.target.checked ? 'PM' : 'AM' });
  };

  return (
    <label className="switch btn-hour-mode-switch font-fontFamily text-[#32302D] relative m-0 font-semibold inline-block cursor-pointer">
      <input
        type="checkbox"
        name="hour_mode"
        id="hour_mode"
        value={1}
        className="cursor-pointer absolute m-0"
        checked={checked}
        onChange={handleChangeFilter}
      />
      <label
        htmlFor="hour_mode"
        data-on="PM"
        data-off="AM"
        className="btn-hour-mode-switch-inner relative m-0 block cursor-pointer"
      />
    </label>
  );
};

export default DatePickerSwitch;
