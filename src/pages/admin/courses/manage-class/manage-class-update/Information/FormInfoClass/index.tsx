import { DatePicker, Form, FormInstance } from 'antd';
import { searchCentres, searchCentresOfAdmin } from 'api/centres';
import { searchCourses } from 'api/courses';
import CustomInput from 'components/Input';
import SelectSearch from 'components/SelectSearch';
import { PARAMS_SELECT_SEARCH, ROLE, TEXT_SELECT_SEARCH } from 'constants/constants';
import { DATE_FORMAT, ERROR_MESSAGE, FIELDS, IFieldListForm } from 'constants/index';
import { AppContext } from 'context';
import moment, { Moment } from 'moment';
import { ICourse } from 'pages/admin/courses';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';

export interface IClassField {
  courseName: { label: string; value: string };
  centre: { label: string; value: string };
  className: string;
  capacity: string;
  startDate: string;
  endDate: string;
}
interface IProps {
  index: number;
  isEdit: boolean;
  errorMessage: string;
  isSubmit: boolean;
  setIsError: (val: boolean) => void;
  onChangeForm: ({ index, key, value }: { index: number; key: string; value: any }) => void;
  data: IClassField;
  handleSubmit: (form: FormInstance<any>) => void;
  setIsChangeField: (val: boolean) => void;
  setEditing: (val: boolean) => void;
  setIsOpenConfirmLeave: (val: boolean) => void;
  // forms: Array<{ name: string; label: string; type?: string; rules?: Rule[]; className: string }>;
}

enum ErrorRequired {
  COURSE_NAME = 'Course Name is required!',
  CENTRE = 'Centre is required!',
  CLASS_NAME = 'Class Name is required!',
  CAPACITY = 'Capacity is required!',
  START_DATE = 'Start Date is required!',
  END_DATE = 'End Date is required!',
  CLASS_ALREADY = 'This Class name already!',
}

enum FieldName {
  COURSE_NAME = 'courseName',
  CENTRE = 'centre'
}

const FormInfoClass = (props: IProps) => {
  const {
    index,
    onChangeForm,
    data,
    isEdit,
    handleSubmit,
    setIsError,
    isSubmit,
    errorMessage,
    setIsChangeField,
    setEditing,
    setIsOpenConfirmLeave,
  } = props;
  const [form] = Form.useForm();
  const { id } = useParams();
  const [state]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const timeout: any = useRef();
  const endDate = Form.useWatch('endDate', form);
  const startDate = Form.useWatch('startDate', form);
  const capacity = Form.useWatch('capacity', form);
  const className = Form.useWatch('className', form);
  const centre = Form.useWatch('centre', form);
  const courseName = Form.useWatch('courseName', form);
  const [isShowError, setIsShowError] = useState(false);
  const [isSearchingCentre, setIsSearchingCentre] = useState(false);
  const [courseOptions, setCourseOptions] = useState<{ label: string; value: string }[]>([]);
  const [centreOptions, setCentreOptions] = useState<{ label: string; value: string }[]>([]);
  const isDisabledCentre = !!(centreOptions?.length === 2 && !isSearchingCentre && !isEdit);
  const { mutate: searchCourse } = useMutation('searchCourses', searchCourses, {
    onSuccess: (res: { data: { listCourses: ICourse[] } }) => {
      const options = res.data.listCourses
        .map((item) => {
          return {
            label: item.courseName,
            value: item.id.toString(),
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.course, value: '', isDisabled: true }]);
      setCourseOptions(options as { label: string; value: string }[]);
    },
  });

  const { mutate: searchCentre } = useMutation('searchCentres', searchCentres, {
    onSuccess: (res: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = res.data.listCentres
        .map((item) => {
          return {
            label: item.centreName,
            value: item.id.toString(),
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentreOptions(options as { label: string; value: string }[]);
    },
  });

  const { mutate: searchListCentresOfAdmin } = useMutation(
    'searchCentresOfAdmin',
    searchCentresOfAdmin,
    {
      onSuccess: (res: { data: { listCentres: { centreName: string; id: number }[] } }) => {
        if (res.data.listCentres.length > 0) {
          const options = res.data.listCentres
            .map((item) => {
              return {
                label: item.centreName,
                value: item.id.toString(),
                isDisabled: false,
              };
            })
            .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
          setCentreOptions(options as { label: string; value: string }[]);
          return;
        }
        setCentreOptions([]);
      },
    },
  );

  const forms = useMemo(
    () => [
      {
        label: 'Course Name',
        name: 'courseName',
        className: 'item-half-width',
        type: 'select-search',
        options: courseOptions,
      },
      {
        name: 'centre',
        label: 'Centre',
        type: 'select-search',
        className: 'item-half-width',
        options: centreOptions,
      },
      {
        label: 'Class Name',
        name: 'className',
        type: 'string',
        className: 'item-half-width',
      },
      {
        name: 'capacity',
        label: 'Capacity',
        type: 'number',
        className: 'item-half-width',
      },
      {
        label: 'Class Start Date',
        name: 'startDate',
        className: 'item-half-width',
        type: 'date',
      },
      {
        label: 'Class End Date',
        name: 'endDate',
        className: 'item-half-width',
        type: 'date',
      },
    ],
    [courseOptions, centreOptions],
  );

  useEffect(() => {
    searchCourse(PARAMS_SELECT_SEARCH.course);
    if (isAdmin && adminId) {
      searchListCentresOfAdmin({ ...PARAMS_SELECT_SEARCH.centre, id: Number(adminId) });
      return;
    }
    searchCentre(PARAMS_SELECT_SEARCH.centre);
  }, [adminId, isAdmin]);

  useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        ...data,
        startDate: data?.startDate ? moment.utc(data.startDate).local() : '',
        endDate: data.endDate ? moment.utc(data.endDate).local() : '',
      });
    }
  }, [isEdit]);

  useEffect(() => {
    onChangeForm({ index, key: 'endDate', value: endDate });

    if (!endDate && isSubmit) {
      form.setFields([{ name: 'endDate', errors: [ErrorRequired.END_DATE] }]);
      return;
    }
    form.setFields([{ name: 'endDate', errors: [] }]);
  }, [endDate, isSubmit]);

  useEffect(() => {
    onChangeForm({ index, key: 'startDate', value: startDate });
    if (!startDate && isSubmit) {
      form.setFields([{ name: 'startDate', errors: [ErrorRequired.START_DATE] }]);
      return;
    }
    form.setFields([{ name: 'startDate', errors: [] }]);
  }, [startDate, isSubmit]);

  useEffect(() => {
    onChangeForm({ index, key: 'capacity', value: capacity });
    if (!capacity && isSubmit) {
      form.setFields([{ name: 'capacity', errors: [ErrorRequired.CAPACITY] }]);
      return;
    }
    form.setFields([{ name: 'capacity', errors: [] }]);
  }, [capacity, isSubmit]);

  useEffect(() => {
    onChangeForm({ index, key: 'className', value: className });
    if (
      errorMessage
        .replace('Class ', '')
        .replace(' already exists!', '')
        .trim()
        .includes(className) &&
      isSubmit
    ) {
      form.setFields([{ name: 'className', errors: [ErrorRequired.CLASS_ALREADY] }]);
      return;
    }
    if (!className && isSubmit) {
      form.setFields([{ name: 'className', errors: [ErrorRequired.CLASS_NAME] }]);
      return;
    }
    form.setFields([{ name: 'className', errors: [] }]);
  }, [className, isSubmit, errorMessage]);

  useEffect(() => {
    if (!centre?.value && isSubmit) {
      form.setFields([{ name: 'centre', errors: [ErrorRequired.CENTRE] }]);
      setIsShowError(true);
      return;
    }
    form.setFields([{ name: 'centre', errors: [] }]);
    setIsShowError(false);
    if (isDisabledCentre) {
      form.setFieldsValue({ centre: centreOptions[0] });
    }
    onChangeForm({ index, key: 'centre', value: centre });
  }, [centre, isSubmit, isDisabledCentre]);

  useEffect(() => {
    onChangeForm({ index, key: 'courseName', value: courseName });
    if (!courseName?.value && isSubmit) {
      form.setFields([{ name: 'courseName', errors: [ErrorRequired.COURSE_NAME] }]);
      setIsShowError(true);
      return;
    }
    form.setFields([{ name: 'courseName', errors: [] }]);
    setIsShowError(false);
  }, [courseName, isSubmit]);

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        setIsSearchingCentre(true);
        if (isAdmin && adminId) {
          searchListCentresOfAdmin({
            ...PARAMS_SELECT_SEARCH.centre,
            search: value,
            id: Number(adminId),
          });
          return;
        }
        searchCentre({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout, isAdmin, adminId],
  );

  useEffect(() => {
    if (
      startDate &&
      endDate &&
      moment(startDate?.startOf('day').toISOString()).unix() >=
        moment(endDate?.startOf('day').toISOString()).unix()
    ) {
      setIsError(true);
      form.setFields([
        {
          name: 'startDate',
          errors: [ERROR_MESSAGE.START_DATE],
        },
        {
          name: 'endDate',
          errors: [ERROR_MESSAGE.END_DATE],
        },
      ]);
      return;
    }
    if (startDate && endDate) {
      form.setFields([
        {
          name: 'startDate',
          errors: [],
        },
        {
          name: 'endDate',
          errors: [],
        },
      ]);
      setIsError(false);
    }
  }, [startDate, endDate]);

  const handleSearchCourse = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchCourse({ ...PARAMS_SELECT_SEARCH.course, search: value });
      }, 500);
    },
    [timeout],
  );

  const isDisabledDate = (current: Moment) => {
    const dateNow = new Date().toISOString();
    const formatCurrent = current.startOf('day').toISOString();
    const startCheck = moment.utc(formatCurrent).add(1, 'day') < moment.utc(dateNow);

    return !!startCheck;
  };

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput disabled={isEdit} type={field.type} />;
        case FIELDS.NUMBER:
          return <CustomInput disabled={isEdit} type={field.type} />;
        case FIELDS.DATE:
          return (
            <DatePicker
              disabled={isEdit}
              disabledDate={isDisabledDate}
              format={DATE_FORMAT}
              inputReadOnly
              className="style_input_custom_login_page"
            />
          );
        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              disable={!!id || field.name === FieldName.CENTRE && isDisabledCentre}
              handleSearchOptions={
                field.name === FieldName.COURSE_NAME ? handleSearchCourse : handleSearchCentre
              }
              options={field?.options}
              className={
                field.name === FieldName.COURSE_NAME && !courseName?.value && isSubmit
                  ? 'field-error'
                  : field.name === FieldName.CENTRE && !centre?.value && isSubmit
                  ? 'field-error'
                  : ''
              }
            />
          );
        // case FIELDS.SELECT:
        //   return (
        //     <Select
        //       getPopupContainer={(node) => node}
        //       options={field.options as (BaseOptionType | DefaultOptionType)[]}
        //       disabled={!isEdit}
        //     />
        //   );
        default:
          return <CustomInput disabled={isEdit} type={field.type} />;
      }
    },
    [
      DATE_FORMAT,
      isEdit,
      id,
      isShowError,
      isSubmit,
      centre,
      courseName,
      handleSearchCourse,
      handleSearchCentre,
      isDisabledCentre
    ],
  );

  const onSubmit = () => {
    handleSubmit(form);
  };

  return (
    <Form
      onFinish={onSubmit}
      form={form}
      autoComplete="off"
      layout="vertical"
      className="flex flex-wrap gap-x-3"
      onFieldsChange={() => {
        setIsChangeField(true);
        setIsOpenConfirmLeave(true);
        if (id) {
          setEditing(true);
        }
      }}
    >
      {forms.map((item) => (
        <div className={item.className} key={item.name}>
          <Form.Item
            className="preview-field-item"
            name={item.name}
            colon={true}
            label={item.label}
          >
            {renderField(item)}
          </Form.Item>
        </div>
      ))}
    </Form>
  );
};

export default FormInfoClass;
