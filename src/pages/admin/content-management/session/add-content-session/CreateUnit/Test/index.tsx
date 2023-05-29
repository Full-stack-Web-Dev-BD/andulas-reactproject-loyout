import {
  Breadcrumb,
  Button,
  Checkbox,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  notification,
  Select,
  Tooltip,
} from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import React, { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@novicov/ckeditor5-build-classic-full';
import '@novicov/ckeditor5-build-classic-full/build/translations/en';

import { ReactComponent as OutlineCheckedSVG } from 'assets/icons/outline_checked_icon.svg';
import { ReactComponent as OutlineQuestionSVG } from 'assets/icons/outline_question_icon.svg';
import { ReactComponent as OutlineClockSVG } from 'assets/icons/outline_clock_icon.svg';
import {
  EDITOR_CONFIG,
  KeyFormChangeData,
  PARAMS_SELECT_SEARCH,
  ROUTES,
  TEXT_SELECT_SEARCH,
  VIEW_ITEMS,
} from 'constants/constants';
import DropDownCustom from 'pages/admin/content-management/component/DropDown';
import CustomInput from 'components/Input';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import CustomTooltip from 'components/Tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionById } from 'api/session';
import { useMutation } from 'react-query';
import {
  ANSWER,
  createNewContent,
  createNewUnit,
  deleteContentById,
  getAllQuestions,
  getContentDetail,
  getFileUrlNotExpire,
  getQuestionsNotRandomized,
  getQuestionsTest,
  getUnitById,
  updateAnswers,
  updateContentById,
} from 'api/content_management';
import {
  IContent,
  ISession,
  ITag,
  IUnit,
  LIST_QUESTION_OPTIONS,
  QuestionType,
  UnitType,
} from '../../index';
import SelectSearch from 'components/SelectSearch';
import { createSessionTag, searchSessionTags } from 'api/session_tag';
import moment from 'moment';
import { RuleObject } from 'antd/lib/form';
import UploadFileCustom from 'pages/admin/content-management/component/UploadFile';
import { getFileUrl } from 'api/user';
import MultipleChoiceComponent from '../QuestionComponents/MultipleChoice';
import FillTheGapComponent from '../QuestionComponents/FillTheGap';
import OrderingComponent from '../QuestionComponents/Ordering';
import DragAndDropComponent from '../QuestionComponents/DragAndDrop';
import FreeTextComponent from '../QuestionComponents/FreeText';
import RandomizedComponent from '../QuestionComponents/Randomized';
import RandomizedModalPreview from '../PreviewModalComponent/Randomized';
import FreeTextModalPreview from '../PreviewModalComponent/FreeText';
import DragAndDropModalPreview from '../PreviewModalComponent/DragAndDrop';
import OrderingModalPreview from '../PreviewModalComponent/Ordering';
import FillTheGapModalPreview from '../PreviewModalComponent/FillTheGap';
import QuestionMultipleChoiceModalPreview from '../PreviewModalComponent/QuestionMultipleChoice';
import SelectCustom from 'components/Select';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import Table, { ColumnsType } from 'antd/lib/table';
import PaginationCustom from 'components/Pagination';
import QuestionOrder from './QuestionOrder';
import QuestionWeight from './QuestionWeight';
import TestOptions from './TestOptions';
import TestPreview from './TestPreview';
import GeneralModalPreview from './components/GeneralPreview';
import { initialUnitOptions, IUnitOptions } from './TestConstantsAndInterface';
import './custom.css';
import Loading from 'components/Loading';

export enum ContentType {
  CHECKBOX = 'Checkbox',
  QUESTION = 'Question',
  PERIOD = 'Period',
}

const LIST_UNIT_OPTIONS = [
  {
    icon: <OutlineCheckedSVG />,
    label: 'With a checkbox',
    value: ContentType.CHECKBOX,
  },
  {
    icon: <OutlineQuestionSVG />,
    label: 'With a question',
    value: ContentType.QUESTION,
  },
  {
    icon: <OutlineClockSVG />,
    label: 'After a period of time',
    value: ContentType.PERIOD,
  },
];

export interface IUnitContent {
  id?: number;
  contentID: number;
  unitID?: number;
  points?: number;
  order?: number;
  unit?: IUnit;
}

interface IProps {
  sessionData: ISession;
  selectedUnit: any;
  handleAddOrEditUnit: (values: any) => void;
  handleCancelAddOrEditUnit: () => void;
  setListUnits: (value: any[]) => void;
  listUnits: any[];
}

const CreateUnitWithTest = (props: IProps) => {
  const {
    sessionData,
    selectedUnit,
    handleAddOrEditUnit,
    handleCancelAddOrEditUnit,
    setListUnits,
    listUnits,
  } = props;

  const [form] = Form.useForm();

  const randomizedRef: any = useRef();

  const [contentData, setContentData] = useState<any>(undefined);
  const [questionChoice, setQuestionChoice] = useState<QuestionType>();
  const [contentTitle, setContentTitle] = useState<string>('');

  const [contentChoose, setContentChoose] = useState<IContent>();

  const [listQuestions, setListQuestions] = useState<any[]>();
  const [limit, setLimit] = useState('5');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total?: number;
  }>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [contentId, setContentId] = useState<number>();

  const [isGetAll, setIsGetAll] = useState<boolean>(false);

  // new

  const unitName = Form.useWatch('unitName', form);

  const [listAnswers, setListAnswers] = useState<ANSWER[]>([]);

  const [isNullAnswers, setIsNullAnswers] = useState<boolean>(false);
  const [isModalDeleteContent, setIsModalDeleteContent] = useState<boolean>(false);
  const [urlContent, setUrlContent] = useState<string>();

  // select question create / update
  const [isOpenQuestion, setIsOpenQuestion] = useState<boolean>(false);
  const [isCreateNew, setIsCreateNew] = useState<boolean>(false);
  //

  // select question order
  const [isOpenQuestionOrder, setIsOpenQuestionOrder] = useState<boolean>(false);
  //

  // select question order
  const [isOpenQuestionWeight, setIsOpenQuestionWeight] = useState<boolean>(false);
  //

  // select test options tab
  const [isOpenTestOptions, setIsOpenTestOptions] = useState<boolean>(false);
  //

  // list question randomized
  const [listQuestionsAdded, setListQuestionsAdded] = useState<IUnitContent[]>(
    selectedUnit && selectedUnit.unitContents
      ? selectedUnit.unitContents
        ?.map((x: IUnitContent) => ({
          id: x.id || undefined,
          contentID: x.contentID,
          unitID: x.unitID,
          order: x.order,
          points: x.points || 1,
        }))
        ?.sort((a: any, b: any) => {
          if (a.order < b.order) {
            return -1;
          }
          if (a.order > b.order) {
            return 1;
          }
          return 0;
        })
      : [],
  );

  // list test options
  const [listTestOptions, setListTestOptions] = useState<IUnitOptions>(
    selectedUnit && selectedUnit.unitOptions ? selectedUnit.unitOptions[0] : initialUnitOptions,
  );

  // is null added options
  const [isNullAddedQuestions, setIsNullAddedQuestions] = useState<boolean>(false);

  // preview full test
  const [isPreviewTest, setIsPreviewTest] = useState<boolean>(false);
  //

  // preview multiple question
  const [isPreviewQuestion, setIsPreviewQuestion] = useState<boolean>(false);
  const [isPreviewQuestionInside, setIsPreviewQuestionInside] = useState<boolean>(false);
  //

  // preview fill the gap
  const [isPreviewFillTheGap, setIsPreviewFillTheGap] = useState<boolean>(false);
  const [isPreviewFillTheGapInside, setIsPreviewFillTheGapInside] = useState<boolean>(false);
  //

  // preview ordering
  const [isPreviewOrdering, setIsPreviewOrdering] = useState<boolean>(false);
  const [isPreviewOrderingInside, setIsPreviewOrderingInside] = useState<boolean>(false);
  //

  // preview drag and drop
  const [isPreviewDragAndDrop, setIsPreviewDragAndDrop] = useState<boolean>(false);
  const [isPreviewDragAndDropInside, setIsPreviewDragAndDropInside] = useState<boolean>(false);
  //

  // preview free text
  const [isPreviewFreeText, setIsPreviewFreeText] = useState<boolean>(false);
  const [isPreviewFreeTextInside, setIsPreviewFreeTextInside] = useState<boolean>(false);
  //

  // preview randomized
  const [isPreviewRandomized, setIsPreviewRandomized] = useState<boolean>(false);
  const [isPreviewRandomizedInside, setIsPreviewRandomizedInside] = useState<boolean>(false);
  const [contentRandomized, setContentRandomized] = useState<any>(undefined);
  const [listQuestionsRandomized, setListQuestionRandomized] = useState<any[]>([]);

  // preview item in list
  const [isPreviewContentInList, setIsPreviewContentInList] = useState<boolean>(false);

  const handleSetContentDetail = (content: any) => {
    setContentData(content);
    setQuestionChoice(content.questionType || undefined);
    setContentTitle(content.contentTitle);
    const temp = content.answers
      ?.sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          const momenta = moment(a.createdAt);
          const momentb = moment(b.createdAt);
          return momenta.diff(momentb);
        } else if (!a.createdAt && b.createdAt) return 1;
        else if (a.createdAt && !b.createdAt) return -1;
        else return 0;
      })
      .map((x: any) => {
        return {
          isCorrect: x.isCorrect,
          title: x.answerTitle || x.answerValue,
          value: x.answerValue,
          id: x.id || undefined,
          contentID: x.contentID || undefined,
          order: x.order,
          isContain: x.isContain || false,
          point: x.point || 0,
        };
      });
    setListAnswers(temp);
    form.setFieldValue('contentTitle', content.contentTitle);
    form.setFieldValue(
      'contentTagIDs',
      content.tags?.map((tag: { tagName: string; id: number }) => ({
        label: tag.tagName,
        value: tag.id?.toString(),
      })) || [],
    );
    form.setFieldValue('freeTextPoint', content.freeTextPoint?.toString());
    if (
      content?.questionType &&
      content?.questionType === QuestionType.RANDOMIZED &&
      content?.randomized
    ) {
      const randomized = content.randomized.map((x: any) => x.id);
      setListQuestionRandomized(randomized);
    }
  };

  const { mutate: mutateGetAllQuestions, isLoading: isLoadingGetAllQuestions } = useMutation('getAllQuestions', getQuestionsTest, {
    onSuccess: ({
      data,
    }: {
      data: { records: any[]; total: number; page: number; limit: number };
    }) => {
      console.log('mutateGetAllQuestions', data);
      const newOptions = data.records;
      setListQuestions(newOptions);
      setPagination({
        ...pagination,
        current: data?.page,
        pageSize: Number(data?.limit),
        total: data?.total || 0,
      });
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  const handleGetListSessions = useCallback(
    (sessionID?: number, randomizedIds?: any[], page?: number) => {
      mutateGetAllQuestions({
        limit: Number(limit),
        page: page ? page : Number(pagination.current),
        search: searchValue,
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({
              // sessionID: isGetAll ? undefined : -1,
              sessionID: sessionID || undefined,
              randomizedIds: randomizedIds?.map((x) => x.contentID) || [],
            }).filter(([, v]) => (v as any)?.toString() !== ''),
          ),
        ]),
      });
    },
    [limit, pagination.current, searchValue, isGetAll, selectedUnit],
  );

  const { mutate: mutateCreateContent, isLoading: isLoadingCreateNewContent } = useMutation(
    'createContent',
    createNewContent,
    {
      onSuccess: ({ data }: any) => {
        if (data.id) {
          notification.success({ message: 'Create question successfully!' });
          setIsOpenQuestion(false);
          setIsCreateNew(false);
          const temp = [...listQuestionsAdded];
          temp.push({
            contentID: data.id,
            order: 1,
            points: 1,
            unitID: selectedUnit?.id || undefined,
          });
          setListQuestionsAdded(temp);
          if (pagination.current !== 1) {
            setPagination((prev) => ({
              ...prev,
              current: 1,
            }));
          } else {
            handleGetListSessions(
              isGetAll ? undefined : sessionData?.id || -1,
              isGetAll ? undefined : listQuestionsAdded,
            );
          }
        }
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        if (response.data.message.includes('freeTextPoint')) {
          // notification.error({ message: "This is not a valid Accumulated points!" });
          form.setFields([
            {
              name: 'freeTextPoint',
              errors: ['This is not a valid Accumulated points!'],
            },
          ]);
        } else {
          notification.error({ message: response.data.message });
        }
      },
    },
  );

  const { mutate: mutateDeleteContent, isLoading: isLoadingDeleteContent } = useMutation(
    'deleteContent',
    deleteContentById,
    {
      onSuccess: ({ data }: any) => {
        let temp = [...listUnits];
        let tempListAdded = [...listQuestionsAdded];
        if (contentId) {
          temp = temp.map((unit) => {
            if (
              (unit.contentId?.length > 0 && unit.contentId[0] === contentId) ||
              (unit.content?.length > 0 && unit.content[0].id && unit.content[0].id === contentId)
            ) {
              return {
                ...unit,
                contentId: [],
                content: [],
              };
            }
            if (unit.unitContents && unit.unitContents.length > 0) {
              let listCurrentUnitContents = unit.unitContents;
              listCurrentUnitContents = listCurrentUnitContents.filter(
                (x: any) => x.contentID !== contentId,
              );
              return {
                ...unit,
                contentId: [],
                content: [],
                unitContents: listCurrentUnitContents,
              };
            }
            return unit;
          });
        }
        setListUnits(temp);

        tempListAdded = tempListAdded.filter((x) => x.contentID !== contentId);
        setListQuestionsAdded(tempListAdded);

        notification.success({ message: 'Delete question successfully!' });
        setIsOpenQuestion(false);
        setContentId(undefined);
        if (pagination.current !== 1) {
          setPagination((prev) => ({
            ...prev,
            current: 1,
          }));
        } else {
          handleGetListSessions(
            isGetAll ? undefined : sessionData?.id || -1,
            isGetAll ? undefined : listQuestionsAdded,
          );
        }
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        notification.error({ message: response.data.message });
      },
    },
  );

  const { mutate: mutateUpdateContent, isLoading: isLoadingUpdateContent } = useMutation(
    'updateContent',
    updateContentById,
    {
      onSuccess: ({ data }: any) => {
        if (data.id) {
          notification.success({ message: 'Edit question successfully!' });
          setIsOpenQuestion(false);
          setContentId(undefined);
          if (pagination.current !== 1) {
            setPagination((prev) => ({
              ...prev,
              current: 1,
            }));
          } else {
            handleGetListSessions(
              isGetAll ? undefined : sessionData?.id || -1,
              isGetAll ? undefined : listQuestionsAdded,
            );
          }
        }
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        if (response.data.message.includes('freeTextPoint')) {
          // notification.error({ message: "This is not a valid Accumulated points!" });
          form.setFields([
            {
              name: 'freeTextPoint',
              errors: ['This is not a valid Accumulated points!'],
            },
          ]);
        } else {
          notification.error({ message: response.data.message });
        }
      },
    },
  );

  const { mutate: mutateGetContentById } = useMutation('getContentChoose', getContentDetail, {
    onSuccess: ({ data }: any) => {
      handleSetContentDetail(data);
      setContentChoose(data);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: mutateGetContentRandomizedById } = useMutation(
    'getContentRandomized',
    getContentDetail,
    {
      onSuccess: ({ data }: any) => {
        const temp = { ...data };
        const parseAnswers = temp.answers
          ?.sort((a: any, b: any) => {
            if (a.createdAt && b.createdAt) {
              const momenta = moment(a.createdAt);
              const momentb = moment(b.createdAt);
              return momenta.diff(momentb);
            } else if (!a.createdAt && b.createdAt) return 1;
            else if (a.createdAt && !b.createdAt) return -1;
            else return 0;
          })
          .map((x: any) => {
            return {
              isCorrect: x.isCorrect,
              title: x.answerTitle || x.answerValue,
              value: x.answerValue,
              id: x.id || undefined,
              contentID: x.contentID || undefined,
              order: x.order,
              isContain: x.isContain || false,
              point: x.point || 0,
            };
          });
        temp.answers = parseAnswers;
        setContentRandomized(temp);
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        notification.error({ message: response.data.message });
      },
    },
  );

  const { mutate: mutateGetContentForPreview } = useMutation(
    'getContentRandomized',
    getContentDetail,
    {
      onSuccess: ({ data }: any) => {
        const temp = { ...data };
        const parseAnswers = temp.answers
          ?.sort((a: any, b: any) => {
            if (a.createdAt && b.createdAt) {
              const momenta = moment(a.createdAt);
              const momentb = moment(b.createdAt);
              return momenta.diff(momentb);
            } else if (!a.createdAt && b.createdAt) return 1;
            else if (a.createdAt && !b.createdAt) return -1;
            else return 0;
          })
          .map((x: any) => {
            return {
              isCorrect: x.isCorrect,
              title: x.answerTitle || x.answerValue,
              value: x.answerValue,
              id: x.id || undefined,
              contentID: x.contentID || undefined,
              order: x.order,
              isContain: x.isContain || false,
              point: x.point || 0,
            };
          });
        temp.answers = parseAnswers;
        console.log('detail', data, 'temp', temp);
        setContentChoose(temp);
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        notification.error({ message: response.data.message });
      },
    },
  );

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const startPageSize = useMemo(() => {
    const startSize =
      Number(pagination?.current) * Number(pagination?.pageSize) -
      (Number(pagination?.pageSize) - 1);

    return startSize;
  }, [pagination]);

  const endPageSize = useMemo(() => {
    let endSize = Number(pagination?.current) * Number(pagination?.pageSize);
    endSize =
      pagination?.total && endSize < pagination?.total ? endSize : (pagination?.total as number);

    return endSize;
  }, [pagination]);

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const columns: ColumnsType<any> = [
    {
      title: 'Use',
      key: 'use',
      align: 'center',
      width: 200,
      render: (text: any, records) => {
        if (listQuestionsAdded?.find((x: any) => x.contentID === records.id)) {
          return (
            <span>
              <ButtonCustom
                color="orange"
                onClick={() => {
                  let temp = [...listQuestionsAdded];
                  temp = temp.filter((x) => x.contentID !== records.id);
                  setListQuestionsAdded(temp);
                }}
              >
                Added
              </ButtonCustom>
            </span>
          );
        } else {
          return (
            <span>
              <ButtonCustom
                onClick={() => {
                  const temp = [...listQuestionsAdded];
                  temp.push({
                    contentID: records.id,
                    points: 1,
                    unitID: selectedUnit?.id || undefined,
                    order: 1,
                  });
                  console.log('temp', temp, records.id);
                  setListQuestionsAdded(temp);
                  setIsNullAddedQuestions(false);
                }}
              >
                Add
              </ButtonCustom>
            </span>
          );
        }
      },
    },
    {
      title: 'Session code',
      dataIndex: '',
      key: 'sessionCode',
      align: 'center',
      width: 150,
      render: (text: any, record: any) => {
        const listSession: ISession[] = [];
        const units = record.unit || [];
        for (let i = 0; i < units.length; i++) {
          const session: ISession = units[i]?.session;
          if (session && (listSession.length === 0 || !listSession.find(sess => sess.id === session.id))) {
            listSession.push(session);
          }
        }

        const unitContents = record.unitContents?.map((x: IUnitContent) => x.unit)?.filter((y: IUnit) => y) || [];
        for (let i = 0; i < unitContents.length; i++) {
          const session: ISession = unitContents[i]?.session;
          if (session && (listSession.length === 0 || !listSession.find(sess => sess.id === session.id))) {
            listSession.push(session);
          }
        }

        if (listSession?.length > 0) {
          const sessionCode = listSession.map((sess) => sess.sessionCode ? sess.sessionCode : "").filter(x => x).join(", ");
          return (
            <Tooltip title={sessionCode}>
              <span className='session-code'>
                {sessionCode}
              </span>
            </Tooltip>
          )
        }
        else {
          return (
            <span className='session-code'>
              {
                ""
              }
            </span>
          )
        }
      },
    },
    {
      title: 'Question',
      dataIndex: 'contentTitle',
      key: 'contentTitle',
      align: 'center',
      render: (text: any) => {
        return (
          <Tooltip title={text?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' ')}>
            <span className="randomized-column-content-title">
              {text?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' ')}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'questionType',
      key: 'questionType',
      align: 'center',
      width: 200,
    },
    {
      title: 'Option',
      key: 'option',
      align: 'center',
      width: 150,
      render: (text: any, record: any) => {
        return (
          <span className="display-center ">
            <CustomTooltip title="Edit">
              <Button
                ghost
                icon={<EditOutlined />}
                style={{
                  color: 'rgba(0, 0, 0, 0.85)',
                }}
                onClick={() => {
                  if (record?.id) {
                    setContentChoose(undefined);
                    setContentData(undefined);
                    setQuestionChoice(undefined);
                    setContentId(record?.id);
                    mutateGetContentById(record?.id);
                    setIsOpenQuestion(true);
                  }
                }}
              ></Button>
            </CustomTooltip>
            <CustomTooltip title="Preview">
              <Button
                ghost
                icon={<SearchOutlined />}
                style={{
                  color: 'rgba(0, 0, 0, 0.85)',
                }}
                onClick={() => {
                  setContentChoose(undefined);
                  setIsPreviewContentInList(true);
                  mutateGetContentForPreview(record.id);
                }}
              />
            </CustomTooltip>

            <CustomTooltip title="Delete">
              <Button
                ghost
                icon={<DeleteOutlined />}
                style={{
                  color: 'rgba(0, 0, 0, 0.85)',
                }}
                onClick={() => {
                  if (record?.id) {
                    setContentId(record?.id);
                    setIsModalDeleteContent(true);
                  }
                }}
              />
            </CustomTooltip>
          </span>
        );
      },
    },
  ];

  const onFinish = useCallback(
    (values: any) => {
      if (!unitName || unitName.trim() === '') {
        form.setFields([
          {
            name: 'unitName',
            errors: ['Test Name is required!'],
          },
        ]);
        return;
      }
      form.setFields([
        {
          name: 'unitName',
          errors: undefined,
        },
      ]);
      const temp = [];
      console.log('listQuestionsAdded', listQuestionsAdded);
      if (listTestOptions) {
        temp.push(listTestOptions);
      }
      const dataPush: IUnit = {
        sessionID: sessionData?.id || undefined,
        unitType: UnitType.TEST,
        unitName: values.unitName.trim(),
        isUploadedFile: false,
        filePath: '',
        isDisabled: false,
        content: undefined,
        order: selectedUnit?.order || undefined,
        unitContents: listQuestionsAdded?.map((x, index) => ({
          ...x,
          order: index + 1,
        })),
        unitOptions: temp,
        id: selectedUnit?.id || undefined,
      };
      // mutateCreateUnitWithContent(dataPush);
      handleAddOrEditUnit(dataPush);
    },
    [listQuestionsAdded, sessionData, selectedUnit, listTestOptions, unitName],
  );

  const handleSaveQuestion = useCallback(() => {
    const values = form.getFieldsValue();

    if (questionChoice !== QuestionType.RANDOMIZED && !contentTitle) {
      form.setFields([
        {
          name: 'contentTitle',
          errors: ['Content is required!'],
        },
      ]);
      return;
    }

    if (questionChoice && questionChoice === QuestionType.MULTIPLE_CHOICE) {
      if (listAnswers.length === 0) {
        setIsNullAnswers(true);
        return;
      } else if (
        listAnswers.filter(
          (answer) => answer.isCorrect && answer.title.trim() && answer.value.trim(),
        ).length === 0
      ) {
        setIsNullAnswers(true);
        return;
      } else {
        setIsNullAnswers(false);
      }
    }
    if (questionChoice && questionChoice === QuestionType.ORDERING) {
      if (listAnswers.length === 0) {
        setIsNullAnswers(true);
        return;
      } else if (
        listAnswers.filter((answer) => answer.title.trim() && answer.value.trim()).length < 2
      ) {
        setIsNullAnswers(true);
        return;
      } else {
        setIsNullAnswers(false);
      }
    }
    if (questionChoice && questionChoice === QuestionType.DRAG_DROP) {
      if (listAnswers.length === 0) {
        setIsNullAnswers(true);
        return;
      } else if (
        listAnswers.filter((answer) => answer.title.trim() && answer.value.trim()).length < 2
      ) {
        setIsNullAnswers(true);
        return;
      } else {
        setIsNullAnswers(false);
      }
    }
    if (questionChoice && questionChoice === QuestionType.FREE_TEXT) {
      if (!values?.freeTextPoint?.trim()) {
        form.setFields([
          {
            name: 'freeTextPoint',
            errors: ['Accumulated points is required!'],
          },
        ]);
        return;
      }

      if (!values?.freeTextPoint?.trim().match(/^\+?(0|[1-9]\d*)$/)) {
        form.setFields([
          {
            name: 'freeTextPoint',
            errors: ['This is not a valid Accumulated points!'],
          },
        ]);
        return;
      }

      if (listAnswers.length === 0) {
        setIsNullAnswers(true);
        return;
      } else if (
        listAnswers.filter((answer) => answer.title.trim() && answer.value.trim()).length === 0
      ) {
        setIsNullAnswers(true);
        return;
      } else {
        setIsNullAnswers(false);
      }
    }
    if (questionChoice && questionChoice === QuestionType.FILL_THE_GAP) {
      const matchedPattern = contentTitle.match(/(?:\[)[^\][]*(?=])/g)
        ? contentTitle.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1))
        : null;
      if (!matchedPattern) {
        form.setFields([
          {
            name: 'contentTitle',
            errors: ['You must specify at least two possible answers!'],
          },
        ]);
        return;
      }
      if (matchedPattern?.length <= 1) {
        let checkAnswer = false;
        for (let i = 0; i < matchedPattern.length; i++) {
          if (matchedPattern[i].split('|').filter((x) => x !== '').length > 1) {
            checkAnswer = true;
            break;
          }
        }
        if (!checkAnswer) {
          form.setFields([
            {
              name: 'contentTitle',
              errors: ['You must specify at least two possible answers!'],
            },
          ]);
          return;
        }
      }
    }
    if (questionChoice && questionChoice === QuestionType.RANDOMIZED) {
      if (!values?.contentTitle?.trim()) {
        form.setFields([
          {
            name: 'contentTitle',
            errors: ['Question name is required!'],
          },
        ]);
        return;
      }
      if (listQuestionsRandomized?.length < 2) {
        setIsNullAnswers(true);
        return;
      } else {
        setIsNullAnswers(false);
      }
    }

    const data: any = {
      contentTitle: contentTitle,
      contentType: ContentType.QUESTION,
      tagIds:
        values.contentTagIDs?.map((tag: { value: string; label: string }) => {
          return Number(tag.value);
          // return {
          //     id: Number(tag.value),
          //     tagName: tag.label,
          // }
        }) || [],
      answers:
        questionChoice !== QuestionType.FILL_THE_GAP
          ? listAnswers
            .filter((x) => x.title.trim() && x.value.trim())
            .map((answer, index) => {
              return {
                answerTitle: answer.title.trim(),
                answerValue: answer.value.trim(),
                isCorrect: answer.isCorrect,
                id: answer.id || undefined,
                contentID: answer.contentID || undefined,
                order: index + 1,
                isContain:
                  questionChoice === QuestionType.FREE_TEXT ? answer.isContain : undefined,
                point: answer.point || undefined,
              };
            })
          : [],
      questionType: questionChoice ? questionChoice : undefined,
      randomized: questionChoice === QuestionType.RANDOMIZED ? listQuestionsRandomized : [],
    };
    console.log('values', values);
    if (values.freeTextPoint) {
      data.freeTextPoint = Number.parseInt(values.freeTextPoint);
    }
    if (data.tagIds?.length === 0) {
      data.tags = [];
    }
    if (contentId && !isCreateNew) {
      mutateUpdateContent({ id: contentId, data: data });
    } else {
      mutateCreateContent(data);
    }
  }, [
    form,
    contentTitle,
    listAnswers,
    contentId,
    questionChoice,
    isCreateNew,
    listQuestionsRandomized,
  ]);

  const renderModalConfirmDelete = useCallback(() => {
    return (
      isModalDeleteContent &&
      contentId && (
        <ModalCustom
          visible={isModalDeleteContent}
          onCancel={() => {
            setIsModalDeleteContent(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => mutateDeleteContent(contentId)}
          titleCenter
        >
          <div>Are you sure you want to delete this question? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteContent, contentId]);

  useEffect(() => {
    if (isGetAll) {
      handleGetListSessions(undefined, undefined);
    } else {
      handleGetListSessions(sessionData?.id || -1, listQuestionsAdded);
    }
  }, [
    limit,
    pagination.current,
    searchValue,
    listQuestionsAdded,
    isGetAll,
    selectedUnit,
    sessionData,
  ]);

  const handleAddAnswer = () => {
    console.log('handleAddAnswer', listAnswers);
    const temp = [...listAnswers];
    temp.push({
      isCorrect: false,
      title: '',
      value: '',
      isContain: true,
    });
    setListAnswers(temp);
  };

  const handleDeleteAnswer = (index: number) => {
    let temp = [...listAnswers];
    temp = temp.filter((item, i) => i !== index);
    setListAnswers(temp);
  };

  const handleChangeTitle = useCallback(
    (index: number, event: any) => {
      const list: any = [...listAnswers];

      list[index].title = event.target.value;

      if (questionChoice !== QuestionType.DRAG_DROP) {
        list[index].value = event.target.value;
      }

      setListAnswers(list);
    },
    [listAnswers, questionChoice],
  );

  const handleChangeAnswerIsContain = useCallback(
    (index: number, event: any) => {
      const list: any = [...listAnswers];

      list[index].isContain = event || false;
      console.log('event.target.value handleChangeAnswerIsContain', event, list[index]);

      setListAnswers(list);
    },
    [listAnswers, questionChoice],
  );

  const handleChangeAnswerPoint = useCallback(
    (index: number, event: any) => {
      const list: any = [...listAnswers];

      list[index].point = Number.parseInt(event);
      console.log('event.target.value handleChangeAnswerPoint', event, list[index]);

      setListAnswers(list);
    },
    [listAnswers, questionChoice],
  );

  const handleChangeValueAnswer = (index: number, event: any) => {
    const list: any = [...listAnswers];

    list[index].value = event.target.value;

    setListAnswers(list);
  };

  const handleChangeIsCorrect = (index: number, event: any) => {
    const list: any = [...listAnswers];

    list[index].isCorrect = event.target.checked;

    setListAnswers(list);
  };

  const handleBack = () => {
    setIsOpenQuestion(false);
    setQuestionChoice(undefined);
    setIsOpenQuestionOrder(false);
    setIsOpenQuestionWeight(false);
    setIsOpenTestOptions(false);
    // setIsGetAll(false);
  };

  const handleSubmit = useCallback(() => {
    form.validateFields().then((data) => {
      if (listQuestionsAdded?.length === 0) {
        setIsNullAddedQuestions(true);
        return;
      }
      setIsNullAddedQuestions(false);
      form.submit();
    });
  }, [form, listQuestionsAdded]);

  const renderQuestionComponent = useCallback(
    (value: QuestionType) => {
      switch (value) {
        case QuestionType.MULTIPLE_CHOICE:
          return (
            <MultipleChoiceComponent
              contentTitle={contentTitle}
              form={form}
              handleAddAnswer={handleAddAnswer}
              handleChangeIsCorrect={handleChangeIsCorrect}
              handleChangeTitle={handleChangeTitle}
              handleDeleteAnswer={handleDeleteAnswer}
              isNullAnswers={isNullAnswers}
              listAnswers={listAnswers}
              setContentTitle={setContentTitle}
              setIsPreviewQuestion={setIsPreviewQuestionInside}
              handleSaveQuestion={handleSaveQuestion}
              setIsNullAnswers={setIsNullAnswers}
              setIsOpenQuestion={setIsOpenQuestion}
              isLoading={
                contentId && !isCreateNew ? isLoadingUpdateContent : isLoadingCreateNewContent
              }
            />
          );
        case QuestionType.FILL_THE_GAP:
          return (
            <FillTheGapComponent
              contentTitle={contentTitle}
              form={form}
              handleSaveQuestion={handleSaveQuestion}
              setContentTitle={setContentTitle}
              setIsOpenQuestion={setIsOpenQuestion}
              setIsPreviewQuestion={setIsPreviewFillTheGapInside}
            />
          );
        case QuestionType.ORDERING:
          return (
            <OrderingComponent
              contentTitle={contentTitle}
              form={form}
              handleAddAnswer={handleAddAnswer}
              handleChangeTitle={handleChangeTitle}
              handleDeleteAnswer={handleDeleteAnswer}
              isNullAnswers={isNullAnswers}
              listAnswers={listAnswers}
              setContentTitle={setContentTitle}
              setIsPreviewQuestion={setIsPreviewOrderingInside}
              handleSaveQuestion={handleSaveQuestion}
              setIsNullAnswers={setIsNullAnswers}
              setIsOpenQuestion={setIsOpenQuestion}
              isLoading={
                contentId && !isCreateNew ? isLoadingUpdateContent : isLoadingCreateNewContent
              }
            />
          );
        case QuestionType.DRAG_DROP:
          return (
            <DragAndDropComponent
              contentTitle={contentTitle}
              form={form}
              handleAddAnswer={handleAddAnswer}
              handleChangeTitle={handleChangeTitle}
              handleChangeValueAnswer={handleChangeValueAnswer}
              handleDeleteAnswer={handleDeleteAnswer}
              isNullAnswers={isNullAnswers}
              listAnswers={listAnswers}
              setContentTitle={setContentTitle}
              setIsPreviewQuestion={setIsPreviewDragAndDropInside}
              handleSaveQuestion={handleSaveQuestion}
              setIsNullAnswers={setIsNullAnswers}
              setIsOpenQuestion={setIsOpenQuestion}
              isLoading={
                contentId && !isCreateNew ? isLoadingUpdateContent : isLoadingCreateNewContent
              }
            />
          );
        case QuestionType.FREE_TEXT:
          return (
            <FreeTextComponent
              contentTitle={contentTitle}
              form={form}
              handleAddAnswer={handleAddAnswer}
              handleChangeTitle={handleChangeTitle}
              handleDeleteAnswer={handleDeleteAnswer}
              isNullAnswers={isNullAnswers}
              listAnswers={listAnswers}
              setContentTitle={setContentTitle}
              setIsPreviewQuestion={setIsPreviewFreeTextInside}
              handleSaveQuestion={handleSaveQuestion}
              setIsNullAnswers={setIsNullAnswers}
              setIsOpenQuestion={setIsOpenQuestion}
              isLoading={
                contentId && !isCreateNew ? isLoadingUpdateContent : isLoadingCreateNewContent
              }
              handleChangeAnswerIsContain={handleChangeAnswerIsContain}
              handleChangeAnswerPoint={handleChangeAnswerPoint}
            />
          );
        case QuestionType.RANDOMIZED:
          return (
            <RandomizedComponent
              ref={randomizedRef}
              contentData={contentData}
              form={form}
              handleSaveQuestion={handleSaveQuestion}
              setIsOpenQuestion={setIsOpenQuestion}
              setIsPreviewQuestion={setIsPreviewRandomizedInside}
              isLoading={
                contentId && !isCreateNew ? isLoadingUpdateContent : isLoadingCreateNewContent
              }
              sessionData={sessionData}
              listQuestionsRandomized={listQuestionsRandomized}
              setListQuestionRandomized={setListQuestionRandomized}
              isNullAnswers={isNullAnswers}
              contentTitle={contentTitle}
              setContentTitle={setContentTitle}
              setIsNullAnswers={setIsNullAnswers}
              mutateGetContentRandomizedById={mutateGetContentRandomizedById}
              setContentRandomized={setContentRandomized}
              isCreateNew={isCreateNew}
            />
          );
        default:
          return <></>;
      }
    },
    [
      contentTitle,
      form,
      isNullAnswers,
      listAnswers,
      contentId,
      isCreateNew,
      isLoadingUpdateContent,
      isLoadingCreateNewContent,

      listQuestionsRandomized,
      sessionData,
      contentData,
      randomizedRef,
    ],
  );

  const renderBodyComponent = useCallback(() => {
    if (isOpenQuestion && questionChoice) {
      return renderQuestionComponent(questionChoice);
    } else if (isOpenQuestionOrder) {
      return (
        <QuestionOrder
          listQuestionsAdded={listQuestionsAdded}
          setListQuestionsAdded={setListQuestionsAdded}
          handleBack={handleBack}
          listTestOptions={listTestOptions}
        />
      );
    } else if (isOpenQuestionWeight) {
      return (
        <QuestionWeight
          listQuestionsAdded={listQuestionsAdded}
          setListQuestionsAdded={setListQuestionsAdded}
          handleBack={handleBack}
        />
      );
    } else if (isOpenTestOptions) {
      return (
        <TestOptions
          setListQuestionsAdded={setListQuestionsAdded}
          handleBack={handleBack}
          form={form}
          listTestOptions={listTestOptions}
          setListTestOptions={setListTestOptions}
        />
      );
    } else {
      return (
        <Loading isLoading={isLoadingGetAllQuestions}>
          <div className="">
            <div className="flex justify-between items-center mb-4 display-none">
              <div className="w-[38%] custom-width">
                <Form.Item name="search-value-test" className="mb-0">
                  <CustomInput
                    type="text"
                    placeholder="Search"
                    onPressEnter={(e) => {
                      if (pagination.current !== 1) {
                        setPagination((prev) => ({
                          ...prev,
                          current: 1,
                        }));
                      }
                      if (e.target.value !== searchValue) {
                        setSearchValue(e.target.value);
                      }
                    }}
                  />
                </Form.Item>
              </div>

              <div className="flex justify-between items-center gap-1 mt-4">
                <span className="font-fontFamily mb-0">Items :</span>
                <SelectCustom
                  color="transparent"
                  className="min-w-[72px]"
                  options={VIEW_ITEMS}
                  value={limit || '5'}
                  onChange={onChangeLimit}
                />
              </div>
            </div>
            <Table columns={columns} dataSource={listQuestions} pagination={false} rowKey="id" />

            <div className="flex justify-between items-center mb-4 mt-4 footer-course-sp sm:gap-3">
              <span className="font-fontFamily text-sm text-main-font-color bottom-8">
                {startPageSize} - {endPageSize} of {pagination?.total}
              </span>
              <PaginationCustom
                total={Number(pagination?.total)}
                pageSize={Number(pagination?.pageSize)}
                current={Number(pagination?.current)}
                onChange={(e) => {
                  setPagination((prev) => {
                    return {
                      ...prev,
                      current: e,
                    };
                  });
                }}
                onLastPage={() => {
                  setPagination((prev) => {
                    return {
                      ...prev,
                      current: pageSize,
                    };
                  });
                }}
                onFirstPage={() => {
                  setPagination((prev) => {
                    return {
                      ...prev,
                      current: 1,
                    };
                  });
                }}
              />
            </div>

            {isNullAddedQuestions && (
              <p className="text-[#ff4d4f] text-sm">
                You must assign at least one question to the test
              </p>
            )}

            <div className="flex justify-end items-center  mb-4 mt-4 display-center">
              <div className="flex gap-3 justify-end custom-width  w-full">
                <ButtonCustom
                  color="outline"
                  onClick={() => {
                    setQuestionChoice(undefined);
                    handleCancelAddOrEditUnit();
                  }}
                  className="xl:w-[calc(33.33%-0.5rem)] xl:min-w-fit"
                >
                  Cancel
                </ButtonCustom>

                <ButtonCustom
                  className="xl:w-[calc(33.33%-0.5rem)] xl:min-w-fit"
                  onClick={() => {
                    if (listQuestionsAdded?.length === 0 || !unitName || unitName.trim() === '') {
                      if (!unitName || unitName.trim() === '') {
                        form.setFields([
                          {
                            name: 'unitName',
                            errors: ['Test Name is required!'],
                          },
                        ]);
                      }
                      if (listQuestionsAdded?.length === 0) {
                        setIsNullAddedQuestions(true);
                      }
                      return;
                    } else {
                      setIsNullAddedQuestions(false);
                      form.setFields([
                        {
                          name: 'unitName',
                          errors: undefined,
                        },
                      ]);
                      setIsPreviewTest(true);
                    }
                  }}
                >
                  Preview
                </ButtonCustom>

                <ButtonCustom
                  className="xl:w-[calc(33.33%-0.5rem)] xl:min-w-fit"
                  color="orange"
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  Save
                </ButtonCustom>
              </div>
            </div>
          </div>
        </Loading>
      );
    }
  }, [
    isOpenQuestion,
    questionChoice,
    isOpenQuestionOrder,
    isOpenQuestionWeight,
    isOpenTestOptions,
    listQuestionsAdded,
    listQuestions,
    startPageSize,
    endPageSize,
    pagination,
    form,
    contentTitle,
    isNullAnswers,
    listAnswers,
    contentId,
    isCreateNew,
    isLoadingUpdateContent,
    isLoadingCreateNewContent,
    listTestOptions,
    isNullAddedQuestions,

    listQuestionsRandomized,
    sessionData,
    contentData,
    randomizedRef,
    unitName,
  ]);

  useEffect(() => {
    if (selectedUnit) {
      form.setFieldsValue(selectedUnit);
      // const temp: IUnitContent[] = selectedUnit.unitContents?.map((x: IUnitContent) => ({
      //     id: x.id || undefined,
      //     contentID: x.contentID,
      //     unitID: x.unitID,
      //     order: x.order,
      //     points: x.points || 1,
      // }))?.sort((a: any, b: any) => {
      //     if (a.order < b.order) {
      //         return -1;
      //     }
      //     if (a.order > b.order) {
      //         return 1;
      //     }
      //     return 0;
      // }) || [];
      // setListQuestionsAdded(temp);
      // setListTestOptions(selectedUnit.unitOptions ? selectedUnit.unitOptions[0] : initialUnitOptions);
    }
  }, [selectedUnit]);

  return (
    <div className="">
      <Form
        // layout="vertical"
        className="flex flex-wrap gap-x-4 flex-[62%]"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          className={'w-full sm:w-full lg:w-[49%] unit-name w-49'}
          key={'unitName'}
          validateFirst
          name={'unitName'}
          label={<span className="flex align-center">Test Name</span>}
          rules={
            [
              // { required: true, message: 'Test Name is required!' },
              // {
              //     validator(_: RuleObject, value: string) {
              //         if (value?.trim() === "") {
              //             return Promise.reject('Test Name is required!');
              //         }
              //         return Promise.resolve();
              //     },
              // },
            ]
          }
        >
          <CustomInput type={'string'} />
        </Form.Item>

        {!isOpenQuestion &&
          !isOpenQuestionOrder &&
          !isOpenQuestionWeight &&
          !isOpenTestOptions &&
          (isGetAll ? (
            <ButtonCustom
              color="orange"
              onClick={() => {
                setIsGetAll((prev) => !prev);
                setPagination({
                  ...pagination,
                  current: 1,
                });
                // setSearchValue('');
                // form.setFieldValue('search-value-randomized', '');
              }}
            >
              Show question from all courses
            </ButtonCustom>
          ) : (
            <ButtonCustom
              onClick={() => {
                setIsGetAll((prev) => !prev);
                setPagination({
                  ...pagination,
                  current: 1,
                });
                // setSearchValue('');
                // form.setFieldValue('search-value-randomized', '');
              }}
            >
              Show question from all courses
            </ButtonCustom>
          ))}

        <div className="flex justify-between items-center mb-6 gap-3  mt-5 custom-width xl:overflow-x-auto sm:overflow-unset flex-wrap">
          <DropDownCustom
            items={
              <Menu>
                {LIST_QUESTION_OPTIONS.map((option, index) => {
                  return (
                    <Menu.Item
                      key={index}
                      onClick={() => {
                        handleBack();
                        setIsOpenQuestion(true);
                        setQuestionChoice(option.value);
                        // setContentId(undefined);
                        setListAnswers([]);
                        setContentData(undefined);
                        setContentTitle('');
                        setIsNullAnswers(false);
                        form.setFieldValue('contentTitle', '');
                        form.setFields([
                          {
                            name: 'contentTitle',
                            errors: undefined,
                          },
                          {
                            name: 'contentId',
                            errors: undefined,
                          },
                        ]);
                        form.setFieldValue('contentTagIDs', []);
                        form.setFieldValue('freeTextPoint', null);
                        setIsCreateNew(true);
                        setListQuestionRandomized([]);
                        randomizedRef?.current?.resetRandomized();
                        // setSearchValue('');
                        form.setFieldValue('search-value-randomized', '');
                      }}
                      disabled={option.isDisabled}
                    >
                      <a className="ant-select-item ant-select-item-option">{option.label}</a>
                    </Menu.Item>
                  );
                })}
              </Menu>
            }
            title={'Add Question'}
            className={'bg-transparent  mb-3 xl:w-[calc(50%_-_0.375rem)] min-width-select'}
          />

          <ButtonCustom
            color="outline"
            className="bg-transparent custom-bg-transparent-btn   mb-3 xl:w-[calc(50%_-_0.375rem)]"
            onClick={() => {
              handleBack();
              setIsOpenQuestionOrder(true);
            }}
          >
            Set Question Order
          </ButtonCustom>

          <ButtonCustom
            color="outline"
            className="bg-transparent custom-bg-transparent-btn  mb-3 xl:w-[calc(50%_-_0.375rem)]"
            onClick={() => {
              handleBack();
              setIsOpenQuestionWeight(true);
            }}
          >
            Set Question Weight
          </ButtonCustom>

          <ButtonCustom
            color="outline"
            className="bg-transparent custom-bg-transparent-btn  mb-3 xl:w-[calc(50%_-_0.375rem)]"
            onClick={() => {
              handleBack();
              setIsOpenTestOptions(true);
            }}
          >
            Test Options
          </ButtonCustom>
        </div>

        <Content className="rounded-3xl bg-white p-8 w-full mb-6 cus-table__list-unit">
          {renderBodyComponent()}
        </Content>
      </Form>

      {renderModalConfirmDelete()}
      {(isPreviewQuestion || isPreviewQuestionInside) && (
        <QuestionMultipleChoiceModalPreview
          contentTitle={contentTitle}
          isPreviewQuestion={isPreviewQuestion}
          isPreviewQuestionInside={isPreviewQuestionInside}
          listAnswers={listAnswers || []}
          setIsPreviewQuestion={setIsPreviewQuestion}
          setIsPreviewQuestionInside={setIsPreviewQuestionInside}
          sessionData={sessionData}
          unitName={unitName}
        />
      )}

      {(isPreviewFillTheGap || isPreviewFillTheGapInside) && (
        <FillTheGapModalPreview
          contentTitle={contentTitle}
          isPreviewQuestion={isPreviewFillTheGap}
          isPreviewQuestionInside={isPreviewFillTheGapInside}
          sessionData={sessionData}
          setIsPreviewQuestion={setIsPreviewFillTheGap}
          setIsPreviewQuestionInside={setIsPreviewFillTheGapInside}
          unitName={unitName}
        />
      )}

      {(isPreviewOrdering || isPreviewOrderingInside) && (
        <OrderingModalPreview
          contentTitle={contentTitle}
          isPreviewQuestion={isPreviewOrdering}
          isPreviewQuestionInside={isPreviewOrderingInside}
          listAnswers={
            listAnswers
              ?.filter((answer) => answer.title.trim() && answer.value.trim())
              .map((answer, index) => {
                return {
                  ...answer,
                  order: index + 1,
                };
              }) || []
          }
          sessionData={sessionData}
          setIsPreviewQuestion={setIsPreviewOrdering}
          setIsPreviewQuestionInside={setIsPreviewOrderingInside}
          unitName={unitName}
        />
      )}

      {(isPreviewDragAndDrop || isPreviewDragAndDropInside) && (
        <DragAndDropModalPreview
          contentTitle={contentTitle}
          isPreviewQuestion={isPreviewDragAndDrop}
          isPreviewQuestionInside={isPreviewDragAndDropInside}
          listAnswers={
            listAnswers?.map((answer, index) => {
              return {
                ...answer,
                order: index + 1,
              };
            }) || []
          }
          sessionData={sessionData}
          setIsPreviewQuestion={setIsPreviewDragAndDrop}
          setIsPreviewQuestionInside={setIsPreviewDragAndDropInside}
          unitName={unitName}
        />
      )}

      {(isPreviewFreeText || isPreviewFreeTextInside) && (
        <FreeTextModalPreview
          contentTitle={contentTitle}
          isPreviewQuestion={isPreviewFreeText}
          isPreviewQuestionInside={isPreviewFreeTextInside}
          listAnswers={listAnswers || []}
          sessionData={sessionData}
          setIsPreviewQuestion={setIsPreviewFreeText}
          setIsPreviewQuestionInside={setIsPreviewFreeTextInside}
          unitName={unitName}
          contentData={contentData}
          form={form}
        />
      )}

      {contentRandomized && questionChoice === QuestionType.RANDOMIZED && (
        <RandomizedModalPreview
          contentData={contentRandomized}
          setContentData={setContentRandomized}
          form={form}
          isPreviewRandomized={isPreviewRandomized}
          isPreviewRandomizedInside={isPreviewRandomizedInside}
          questionType={contentRandomized.questionType}
          sessionData={sessionData}
          setIsPreviewRandomized={setIsPreviewRandomized}
          setIsPreviewRandomizedInside={setIsPreviewRandomizedInside}
          unitName={unitName}
          urlContent={urlContent}
          title={!isPreviewRandomizedInside ? 'Audio content' : undefined}
        />
      )}

      {isPreviewContentInList && contentChoose && contentChoose.questionType && (
        <GeneralModalPreview
          contentData={contentChoose}
          setContentData={setContentChoose}
          form={form}
          isPreviewQuestion={false}
          isPreviewQuestionInside={isPreviewContentInList}
          questionType={contentChoose.questionType}
          sessionData={sessionData}
          setIsPreviewQuestionInside={setIsPreviewContentInList}
          setIsPreviewQuestion={(value: boolean) => { }}
          unitName={unitName}
        />
      )}

      {isPreviewTest && (
        <TestPreview
          listQuestionsAdded={listQuestionsAdded}
          isPreviewQuestion={isPreviewTest}
          setIsPreviewQuestion={setIsPreviewTest}
          sessionData={sessionData}
          unitName={unitName}
          listTestOptions={listTestOptions}
          isModal={true}
          selectedUnit={selectedUnit}
        />
      )}
    </div>
  );
};

export default CreateUnitWithTest;
