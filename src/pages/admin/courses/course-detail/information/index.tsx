import { DatePicker, Form, Select } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import {
  createCourse,
  deleteCourses,
  getCourseDetail,
  getListCategories,
  updateCourse,
} from 'api/courses';
import ButtonCustom from 'components/Button';
import CheckboxCustom from 'components/Checkbox';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import SelectSearch from 'components/SelectSearch';
import UploadFile from 'components/UploadFile';
import { PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH } from 'constants/constants';
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  ERROR_MESSAGE,
  FIELDS,
  ICategory,
  IFieldListForm,
  InfoType,
  ROUTES,
} from 'constants/index';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

const { RangePicker } = DatePicker;

interface IProps {
  learningModes: { label: string; value: string }[];
  courseTypes: { label: string; value: string }[];
  programTypes: { label: string; value: string }[];
  classTypes: { label: string; value: string }[];
  categories: { label: string; value: string }[];
  onNextTab: () => void;
  onSubmitted: () => void;
  setCourseId: (id: string) => void;
  courseId: string;
  setCourseName: (value: string) => void;
  setEditing: (value: boolean) => void;
  editing: boolean;
  setIsChanging: (value: boolean) => void;
  isChanging: boolean;
  setCourseTypeValue: (value: string) => void;
  courseTypeValue: string;
  setIsChangeCourseValue: (value: boolean) => void;
  onNextRegistrationDetail: () => void;
  setIsOpenConfirmLeave: (value: boolean) => void;
}

enum FIELD {
  LEARNING_MODE = 'learningMode',
  CLASS_TYPE = 'classType',
  PROGRAM_TYPE = 'programType',
  COURSE_TYPE = 'courseType',
  CATEGORY = 'category',
  AUTO_CLASS = 'Auto Class',
  CAPACITY = 'capacity',
  MAXIMUM_CLASS = 'maximumClass',
  UPLOAD_FILE = 'uploadFile',
}

const catalogImageUrl = 'https://d1hjkbq40fs2x4.cloudfront.net/2016-01-31/files/1045.jpg';

const InformationTab = (props: IProps) => {
  const {
    learningModes,
    classTypes,
    programTypes,
    courseTypes,
    onNextTab,
    onSubmitted,
    categories,
    setCourseId,
    courseId,
    setCourseName,
    setEditing,
    editing,
    setIsChanging,
    isChanging,
    setCourseTypeValue,
    courseTypeValue,
    setIsChangeCourseValue,
    onNextRegistrationDetail,
    setIsOpenConfirmLeave,
  } = props;
  const [form] = Form.useForm();
  const history = useNavigate();
  const timeout: any = useRef();
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState(true);
  const [isFieldChange, setIsFieldChange] = useState(false);
  const [isLeavePage, setIsLeavePage] = useState(false);
  const [isOpenConfirmLeaveCreate, setIsOpenConfirmLeaveCreate] = useState(false);
  const [isOpenModalCancelEdit, setIsOpenModalCancelEdit] = useState(false);
  const [limit] = useState(10);
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);
  const [dataRequest, setDataRequest] = useState<InfoType>({});
  const [categoriesOptions, setCategoriesOptions] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [messageWarning, setMessageWarning] = useState('');
  const [status, setStatus] = useState<boolean>(false);
  const classType = Form.useWatch('classType', form);
  const courseType = Form.useWatch('courseType', form);
  const fieldList = useMemo(
    () => [
      {
        label: 'Course Name',
        name: 'courseName',
        rules: [{ required: true, message: 'Course Name is required!' }],
        type: 'string',
        isHidden: false,
      },
      {
        label: 'Category',
        name: 'category',
        rules: [{ required: true, message: 'Category is required!' }],
        type: 'select-search',
        options: categoriesOptions,
        isHidden: false,
      },
      {
        label: 'Learning Method',
        name: 'learningMode',
        rules: [{ required: true, message: 'Learning Method is required!' }],
        type: 'select',
        options: learningModes,
        isHidden: false,
      },
      {
        label: 'Class Type',
        name: 'classType',
        rules: [{ required: true, message: 'Class Type is required!' }],
        type: 'select',
        options: classTypes,
        isHidden: false,
      },
      {
        label: 'Capacity (auto class)',
        name: 'capacity',
        rules: [
          { required: true, message: 'Capacity (auto class) is required!' },
          // { min: 1, message: 'Capacity (auto class) must be greater than 0.' },
        ],
        type: 'number',
        isHidden: classType === FIELD.AUTO_CLASS ? false : true,
      },
      {
        label: 'Maximum Class (auto class)',
        name: 'maximumClass',
        rules: [
          { required: true, message: 'Maximum Class (auto class) is required!' },
          // { min: 1, message: 'Maximum class (auto class) must be greater than 0.' },
        ],
        type: 'number',
        isHidden: classType === FIELD.AUTO_CLASS ? false : true,
      },
      {
        label: 'Program Type',
        name: 'programType',
        rules: [{ required: true, message: 'Program Type is required!' }],
        type: 'select',
        options: programTypes,
        isHidden: false,
      },
      {
        label: 'Duration',
        name: 'duration',
        rules: [{ required: true, message: 'Duration is required!' }],
        type: 'date',
        isHidden: false,
      },
      {
        label: 'Course Type',
        name: 'courseType',
        rules: [{ required: true, message: 'Course Type is required!' }],
        type: 'select',
        options: courseTypes,
        isHidden: false,
      },
      {
        label: '',
        name: 'status',
        type: 'checkbox-group',
        isHidden: false,
      },
      {
        label: 'Description',
        name: 'description',
        rules: [{ required: true, message: 'Description is required!' }],
        type: 'textArea',
        isFullWidth: true,
        rows: 2,
        isHidden: false,
      },
      {
        label: 'Upload Course Catalog Image',
        name: 'catalogImage',
        // rules: [{ required: true, message: 'Description is required!' }],
        type: 'uploadFile',
        isFullWidth: true,
        isHidden: false,
      },
    ],
    [learningModes, categoriesOptions, classTypes, courseTypes, classType],
  );

  // const [fieldList, setFieldList] = useState<Array<IFieldListForm>>(fieldListInitial);

  const { mutate: handleCreateCourse } = useMutation('createCourse', createCourse, {
    onSuccess: ({ data }: { data: InfoType }) => {
      setCourseId(data.id as string);
      onSubmitted();
      setEditing(false);
      setIsChanging(false);
      setIsFieldChange(false);
      onNextTab();
    },
    onError: (error: { response: { data: { message: string }; status: number } }) => {
      if (error.response.status == 403) {
        setMessageWarning('You are not allowed to create course.');
      } else {
        form.setFields([
          {
            name: 'courseName',
            errors: [ERROR_MESSAGE.COURSE_ALREADY_EXIST],
          },
        ]);
      }
    },
  });

  const renderModalWarning = useCallback(() => {
    return (
      messageWarning && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageWarning('');
          }}
          title="Notice"
          titleCenter
          content={messageWarning}
        />
      )
    );
  }, [messageWarning]);

  const { mutate: deleteCourse } = useMutation('deleteCourses', deleteCourses, {
    onSuccess: () => {
      history(ROUTES.manage_course);
    },
  });

  const { mutate: getCourse } = useMutation('getCourseDetail', getCourseDetail, {
    onSuccess: ({ data }: { data: InfoType }) => {
      const formData = {
        courseName: data.courseName,
        category: {
          label: data?.courseCategory?.categoryName,
          value: data?.courseCategory?.id?.toString(),
        },
        classType: data.classType,
        capacity: data?.capacity || 1,
        maximumClass: data?.maximumClass || 1,
        learningMode: data.learningMethod,
        programType: data.programType,
        description: data.description,
        courseType: data.courseType,
        catalogImageUrl: data.catalogImageUrl,
        duration: [
          moment.utc(data.startDate, DATE_TIME_FORMAT).local(),
          moment.utc(data.endDate, DATE_TIME_FORMAT).local(),
        ],
      };
      setCourseTypeValue(data.courseType as string);
      setCourseName(data.courseName as string);
      form.setFieldsValue(formData);
      setStatus(data?.isActive as boolean);
    },
  });

  const { mutate: handleUpdateCourse } = useMutation('updateCourse', updateCourse, {
    onSuccess: () => {
      setEditing(false);
      setIsChanging(false);
      onNextTab();
      setIsFieldChange(false);
    },
    onError: (error: { response: { data: { message: string }; status: number } }) => {
      if (error.response.status == 403) {
        setMessageWarning('You are not allowed to edit course.');
      }
    },
  });

  const { mutate: handleConfirmUpdateCourse } = useMutation('updateCourse', updateCourse, {
    onSuccess: () => {
      onSubmitted();
      setIsEdit(false);
      setIsOpenConfirmLeave(false);
      setEditing(false);
      setIsChanging(false);
      getCourse(Number(courseId));
      setIsFieldChange(false);
      if (courseType !== courseTypeValue) {
        setIsChangeCourseValue(true);
        onNextRegistrationDetail();
      } else {
        setIsChangeCourseValue(false);
      }
    },
    onError: (error: { response: { data: { message: string }; status: number } }) => {
      if (error.response.status == 403) {
        setMessageWarning('You are not allowed to edit course.');
      }
    },
  });

  const getFilePath = (file: { fileUrl?: string }) => {
    console.log(file?.fileUrl);
    form.setFieldsValue({ catalogImage: file?.fileUrl });
  };

  const handleSubmit = useCallback(
    (values: InfoType) => {
      const dataRequests = {
        courseName: values.courseName,
        courseCategoryID: Number(values?.category?.value),
        classType: values.classType,
        capacity: values.capacity || 0,
        maximumClass: values.maximumClass || 0,
        learningMethod: values.learningMode,
        programType: values.programType,
        isActive: !!status,
        description: values.description,
        courseType: values.courseType,
        catalogImageUrl: values.catalogImage || catalogImageUrl,
        startDate: values?.duration && values?.duration[0]?.startOf('day')?.toISOString(),
        endDate: values?.duration && values?.duration[1]?.endOf('day')?.toISOString(),
      };
      if (courseId && id) {
        setDataRequest(dataRequests);
        setIsOpenModalConfirm(true);
        return;
      } else if (courseId) {
        handleUpdateCourse({ ...dataRequests, courseId: Number(courseId) });
        return;
      }
      handleCreateCourse(dataRequests);
    },
    [courseId, status, catalogImageUrl, id],
  );

  const handleConfirmSubmit = useCallback(() => {
    if (courseId) {
      handleConfirmUpdateCourse({ ...dataRequest, courseId: Number(courseId) });
      return;
    }
  }, [courseId, status, catalogImageUrl, dataRequest]);

  const { mutate: getCategories } = useMutation('getListCategories', getListCategories, {
    onSuccess: ({ data }: { data: { listCategories: ICategory[] } }) => {
      const newCategories = data.listCategories
        .map((item) => {
          return { label: item.categoryName, value: item.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.category, value: '', isDisabled: true }]);
      setCategoriesOptions(newCategories);
    },
  });

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
  }, [limit]);

  const handleSearchOptions = useCallback(
    (keySearch: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCategories({ ...PARAMS_SELECT_SEARCH.category, search: keySearch });
      }, 500);
    },
    [limit, timeout],
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput type={field.type} disabled={!isEdit} />;
        case FIELDS.NUMBER:
          return <CustomInput type={field.type} disabled={!isEdit} />;
        case FIELDS.DATE:
          return (
            <RangePicker
              disabled={!isEdit}
              ranges={{
                Today: [moment(), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
              }}
              format={DATE_FORMAT}
              inputReadOnly
              allowClear
            />
          );
        case FIELDS.TEXT_AREA:
          return <CustomInput rows={field.rows} disabled={!isEdit} type={field.type} />;
        case FIELDS.UPLOAD_FILE:
          return <UploadFile disabled={!isEdit} getFilePath={getFilePath}/>;
        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              handleSearchOptions={handleSearchOptions}
              options={field.options}
              disable={!isEdit}
            />
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={!isEdit}
            />
          );
        default:
          return <CustomInput type={field.type} disabled={!isEdit} />;
      }
    },
    [isEdit, form, DATE_FORMAT, categories],
  );

  useEffect(() => {
    if (courseId && !editing && !isChanging) {
      getCourse(Number(courseId));
    }
  }, [courseId, editing, isChanging]);

  useEffect(() => {
    if (id) {
      setIsEdit(false);
    }
  }, [id]);

  const handleChangeStatus = useCallback(
    (key: string) => (value: CheckboxChangeEvent) => {
      const checked = value.target.checked;

      if (key === FIELDS.ACTIVE && checked) {
        setStatus(checked);
        setIsFieldChange(true);
      }

      if (key === FIELDS.HIDE && checked) {
        setStatus(!checked);
        setIsFieldChange(true);
      }
    },
    [status],
  );

  const renderFieldList = useCallback(() => {
    return fieldList?.map((field, index) =>
      field.type === FIELDS.CHECKBOX_GROUP ? (
        <Form.Item label="Status" className="w-full" name={field.name}>
          <CheckboxCustom
            checked={status}
            onChange={handleChangeStatus(FIELDS.ACTIVE)}
            label="Active"
            disabled={!isEdit}
          />
          <br />
          <CheckboxCustom
            checked={!status}
            onChange={handleChangeStatus(FIELDS.HIDE)}
            disabled={!isEdit}
            label="Hide From Course Catalog"
          />
        </Form.Item>
      ) : (
        !field?.isHidden && (
          <Form.Item
            className={
              field?.isFullWidth
                ? 'w-full'
                : 'w-[100%] sm:w-[100%] md:w-[48%] lg:w-[31.2%] xl:w-[32%] 2xl:w-[32.2%] w-32'
            }
            key={index}
            validateFirst
            name={field.name}
            label={field.label}
            rules={field.rules}
          >
            {renderField(field)}
          </Form.Item>
        )
      ),
    );
  }, [fieldList, isEdit, status]);

  const handleCancelEdit = useCallback(() => {
    if (isFieldChange) {
      setIsOpenModalCancelEdit(true);
      return;
    }

    if (id) {
      setIsEdit(false);
    }

    setEditing(false);
    if (courseId) {
      getCourse(Number(courseId));
      return;
    }
    setStatus(false);
    form.resetFields();
  }, [isFieldChange, id]);

  const handleConfirmCancelEdit = useCallback(() => {
    if (id) {
      setIsEdit(false);
    }
    setEditing(false);
    setIsChanging(false);
    setIsFieldChange(false);
    if (courseId) {
      getCourse(Number(courseId));
      return;
    }
    setStatus(false);
    form.resetFields();
    setIsLeavePage(true);
    setIsOpenConfirmLeave(false);
  }, [courseId, id]);

  const handleBackToCourseList = useCallback(() => {
    setIsOpenConfirmLeave(false);
    if (isLeavePage) {
      history(ROUTES.manage_course);
      return;
    }

    setIsOpenConfirmLeaveCreate(true);
  }, [courseId, isFieldChange, isLeavePage]);

  const handleConfirmBackToCourse = useCallback(() => {
    if (courseId) {
      deleteCourse({ id: Number(courseId) });
      return;
    }
    history(ROUTES.manage_course);
  }, [courseId]);

  return (
    <Form
      onFieldsChange={() => {
        setIsFieldChange(true);
        setIsOpenConfirmLeave(true);
        if (id) {
          setEditing(true);

          return;
        }

        if (courseId) {
          setIsChanging(true);
        }
      }}
      onFinish={handleSubmit}
      form={form}
      layout="vertical"
      className="flex gap-x-4 flex-wrap"
    >
      {renderFieldList()}
      <Form.Item className="w-full">
        <div className="flex gap-3 justify-end">
          {isEdit ? (
            <>
              {(courseId && id) || isFieldChange ? (
                <ButtonCustom color="outline" onClick={handleCancelEdit}>
                  Cancel
                </ButtonCustom>
              ) : (
                <ButtonCustom onClick={handleBackToCourseList} color="outline">
                  Back
                </ButtonCustom>
              )}
              <ButtonCustom onClick={form.submit} color="orange">
                {courseId && id ? 'Save' : 'Next'}
              </ButtonCustom>
            </>
          ) : (
            courseId &&
            id && (
              <ButtonCustom
                onClick={() => {
                  setIsEdit(true);
                }}
                color="orange"
              >
                Edit
              </ButtonCustom>
            )
          )}
        </div>
        <ModalCustom
          visible={isOpenModalConfirm}
          onCancel={() => setIsOpenModalConfirm(false)}
          title={'Update course'}
          okText="Confirm"
          onSubmit={handleConfirmSubmit}
          cancelText="Cancel"
          titleCenter
          content={`Are you sure you want to update this Information?`}
        />
        {isOpenModalCancelEdit && (
          <ModalCustom
            onSubmit={handleConfirmCancelEdit}
            visible={true}
            content="You have modified the Course Information. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving"
            title="Notice"
            okText="Confirm"
            onCancel={() => setIsOpenModalCancelEdit(false)}
            cancelText="Cancel"
            titleCenter
          />
        )}

        {isOpenConfirmLeaveCreate && (
          <ModalCustom
            onSubmit={handleConfirmBackToCourse}
            visible={true}
            content="You have modified the Course Information. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving"
            title="Notice"
            okText="Confirm"
            onCancel={() => setIsOpenConfirmLeaveCreate(false)}
            cancelText="Cancel"
            titleCenter
          />
        )}
      </Form.Item>
      {renderModalWarning()}
    </Form>
  );
};

export default InformationTab;
