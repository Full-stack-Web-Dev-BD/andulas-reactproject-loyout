import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import CustomTooltip from 'components/Tooltip';
import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import Select, { GroupBase, PropsValue, SingleValue, StylesConfig } from 'react-select';
import './style.css';

interface IOptions {
  label: string;
  value: string;
  isDisabled?: boolean;
}

interface IProps {
  onChange?: (value: any) => void;
  options: IOptions[] | undefined;
  value?: SingleValue<string>;
  placeholder?: string;
  disable?: boolean;
  handleSearchOptions?: (keySearch: string) => void;
  isMultiple?: boolean;
  className?: string;
  tooltipTitle?: string;
  onKeyPress?: (val: KeyboardEvent<HTMLDivElement>) => void;
  isClearSearchValue?: boolean;
  disableFilterCard?: boolean;
}

const SelectSearch = (props: IProps) => {
  const {
    onChange,
    value,
    options,
    placeholder,
    disable,
    handleSearchOptions,
    isMultiple,
    className,
    tooltipTitle,
    onKeyPress,
    isClearSearchValue,
    disableFilterCard,
  } = props;

  const [valueInput, setValueInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const multiValueContainer = ({
    selectProps,
    data,
  }: {
    selectProps: { value: Array<{ label: string }> };
    data: { label: string };
  }) => {
    const label = data.label;
    const allSelected = selectProps.value;
    const index = allSelected.findIndex((selected: { label: string }) => selected.label === label);
    const isLastSelected = index === allSelected.length - 1;
    const labelSuffix = isLastSelected ? ` (${allSelected.length})` : ', ';
    const val = `${label}${labelSuffix}`;
    return val;
  };

  const customStylesSelectMultiple = {
    valueContainer: (provided: any) => ({
      ...provided,
      textOverflow: 'ellipsis',
      maxWidth: '90%',
      height: '46px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      display: 'flex',
      flexWrap: 'nowrap',
      paddingLeft: '0px',
    }),

    control: (styles: object, { isDisabled }: { isDisabled: boolean }) => ({
      ...styles,
      paddingLeft: '8px',
      backgroundColor: isDisabled ? 'transparent' : 'hsl(0, 0%, 100%)',
    }),
  };

  const customStyles = {};

  const formatOptionLabel = ({ value: valueOption, label }: { value: string; label: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <CustomTooltip title={label}>
        <div
          className={`text-ellipsis overflow-hidden whitespace-nowrap ${
            disable ? 'text-[#00000040]' : ''
          }`}
        >
          {label}
        </div>
      </CustomTooltip>
      <div style={{ color: '#000' }}>
        {Array.isArray(value) && value.some((item) => item.value === valueOption) && (
          <CheckOutlined />
        )}
      </div>
    </div>
  );

  const filterOptions = (candidate: { label: string; value: string }, input: string) => {
    if (input) {
      if (candidate.label.toLowerCase().includes(input.toLowerCase())) return true;
      if (Array.isArray(value)) {
        value.some((opt) => {
          if (opt.value === candidate.value) return true;
          else return false;
        });
      }
      return true;
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isClearSearchValue) {
      setValueInput('');
    }
  }, [isClearSearchValue]);

  const renderSelect = useCallback(() => {
    return (
      <Select
        {...props}
        isMulti={isMultiple}
        onInputChange={(keySearch: string) => {
          setValueInput(keySearch);
          if (handleSearchOptions instanceof Function) {
            handleSearchOptions(keySearch);
          }
        }}
        filterOption={filterOptions}
        formatOptionLabel={formatOptionLabel}
        inputValue={valueInput}
        hideSelectedOptions={false}
        onFocus={() => setIsMenuOpen(true)}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (onKeyPress instanceof Function) {
            onKeyPress(e);
          }
          setIsMenuOpen(true);
        }}
        onBlur={() => setIsMenuOpen(false)}
        className={`custom-select max-w-full border-red-600 ${className} ${
          disableFilterCard ? 'custom-select-disable-bg-white' : ''
        } ${disable ? 'custom-select-disable' : ''} `}
        isDisabled={disable}
        placeholder={placeholder ? placeholder : isMultiple ? '' : 'Select'}
        isClearable
        components={{
          MultiValueContainer: isMultiple && (multiValueContainer as any),
          // IndicatorSeparator: () => null,
          DropdownIndicator: () => <DownOutlined className="dropdown-icon ml-2" />,
        }}
        styles={
          isMultiple
            ? customStylesSelectMultiple
            : (customStyles as StylesConfig<IOptions, boolean, GroupBase<IOptions>> | undefined)
        }
        menuIsOpen={isMultiple && isMenuOpen}
        onChange={onChange}
        value={value as PropsValue<IOptions>}
        options={options}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            neutral50: '#bfbfbf', // Placeholder color
          },
        })}
      />
    );
  }, [
    tooltipTitle,
    handleSearchOptions,
    valueInput,
    isMultiple,
    options,
    value,
    disable,
    placeholder,
    isMultiple,
    isMenuOpen,
    customStylesSelectMultiple,
    customStyles,
  ]);

  return (
    <div className={`relative w-full ${disable ? 'cursor-not-allowed' : ''}`}>
      {renderSelect()}
      {tooltipTitle && (
        <CustomTooltip title={tooltipTitle}>
          <div className={`absolute top-0 left-0 right-0 bottom-0 ${disable ? 'z-10' : '-z-10'}`} />
        </CustomTooltip>
      )}
    </div>
  );
};

export default SelectSearch;
