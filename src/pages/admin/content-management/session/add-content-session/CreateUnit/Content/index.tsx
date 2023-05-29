import {
  Breadcrumb,
  Checkbox,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  notification,
  Select,
} from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
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
} from 'constants/constants';
import DropDownCustom from 'pages/admin/content-management/component/DropDown';
import CustomInput from 'components/Input';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import CustomTooltip from 'components/Tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionById } from 'api/session';
import { useMutation } from 'react-query';
import {
  createNewContent,
  createNewUnit,
  deleteContentById,
  getAllQuestions,
  getContentDetail,
  updateContentById,
} from 'api/content_management';
import { IContent, ISession, ITag, IUnit, LIST_QUESTION_OPTIONS, QuestionType, UnitType } from '../..';
import SelectSearch from 'components/SelectSearch';
import { createSessionTag, searchSessionTags } from 'api/session_tag';
import moment from 'moment';
import { RuleObject } from 'antd/lib/form';
import MultipleChoiceComponent from '../QuestionComponents/MultipleChoice';
import QuestionMultipleChoiceModalPreview from '../PreviewModalComponent/QuestionMultipleChoice';
import FillTheGapComponent from '../QuestionComponents/FillTheGap';
import FillTheGapModalPreview from '../PreviewModalComponent/FillTheGap';
import OrderingComponent from '../QuestionComponents/Ordering';
import OrderingModalPreview from '../PreviewModalComponent/Ordering';
import DragAndDropComponent from '../QuestionComponents/DragAndDrop';
import DragAndDropModalPreview from '../PreviewModalComponent/DragAndDrop';
import FreeTextComponent from '../QuestionComponents/FreeText';
import FreeTextModalPreview from '../PreviewModalComponent/FreeText';
import RandomizedComponent from '../QuestionComponents/Randomized';
import RandomizedModalPreview from '../PreviewModalComponent/Randomized';

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

interface ANSWER {
  isCorrect: boolean;
  title: string;
  value: string;
  id?: number;
  contentID?: number;
  isContain?: boolean;
  point?: number;
  order?: number;
}

interface IProps {
  sessionData: ISession;
  selectedUnit: any;
  handleAddOrEditUnit: (values: any, isDeleteContent?: boolean) => void;
  handleCancelAddOrEditUnit: () => void;
  setListUnits: (value: any[]) => void;
  listUnits: any[];
}

const CreateUnit = (props: IProps) => {
  const {
    sessionData,
    selectedUnit,
    handleAddOrEditUnit,
    handleCancelAddOrEditUnit,
    setListUnits,
    listUnits,
  } = props;

  const history = useNavigate();

  const timeout: any = useRef(null);

  const randomizedRef: any = useRef();

  const [form] = Form.useForm();

  const unitName = Form.useWatch('unitName', form);

  const [contentData, setContentData] = useState<any>(undefined);

  const [selectedUnitType, setSelectedUnitType] = useState<ContentType>();
  const [contentTitle, setContentTitle] = useState<string>('');
  const [questionChoice, setQuestionChoice] = useState<QuestionType>();
  const [listAnswers, setListAnswers] = useState<ANSWER[]>([]);
  const [listQuestions, setListQuestions] = useState<any[]>([]);

  // Modal preview
  const [isPreviewCheckbox, setIsPreviewCheckbox] = useState<boolean>(false);
  const [isPreviewQuestion, setIsPreviewQuestion] = useState<boolean>(false);
  // const [selectedAnswerPreview, setSelectedAnswerPreview] = useState<string[]>([]);
  // const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isNullAnswers, setIsNullAnswers] = useState<boolean>(false);
  // const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);
  const [isModalDeleteContent, setIsModalDeleteContent] = useState<boolean>(false);

  const [isPreviewQuestionInside, setIsPreviewQuestionInside] = useState<boolean>(false);

  // Tag
  // const [sessionTagOptions, setSessionTagOptions] = useState<
  //     { label: string; value: string; isDisabled?: boolean }[]
  // >([]);
  // const [sessionTagValue, setSessionTagValue] = useState('');
  // const [isClearSearchingSession, setIsClearSearchingSession] = useState(false);
  // const contentTagIDs = Form.useWatch('contentTagIDs', form);

  const [listQuestionsRandomized, setListQuestionRandomized] = useState<any[]>([]);

  // select question
  const [contentId, setContentId] = useState<number>();
  const [isOpenQuestion, setIsOpenQuestion] = useState<boolean>(false);
  const [isCreateNew, setIsCreateNew] = useState<boolean>(false);

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
  //

  const handleSetContentDetail = (content: any) => {
    setContentData(content);
    setSelectedUnitType(content.contentType || undefined);
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

  const { mutate: mutateGetAllQuestions } = useMutation('getAllQuestions', getAllQuestions, {
    onSuccess: ({ data }: { data: { records: any[] } }) => {
      console.log('mutateGetAllQuestions', data);
      const newOptions = data.records
        .map((el) => {
          return {
            ...el,
            label: el.contentTitle?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' ') || '',
            value: el.id?.toString(),
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.topic, value: '', isDisabled: true }]);
      setListQuestions(newOptions);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: mutateGetContentById } = useMutation('getContentDetail', getContentDetail, {
    onSuccess: ({ data }: any) => {
      console.log('detail', data);
      handleSetContentDetail(data);
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
        console.log('detail', data, 'temp', temp);
        setContentRandomized(temp);
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        notification.error({ message: response.data.message });
      },
    },
  );

  const { mutate: mutateCreateContent, isLoading: isLoadingCreateNewContent } = useMutation(
    'createContent',
    createNewContent,
    {
      onSuccess: ({ data }: any) => {
        if (data.id) {
          notification.success({ message: 'Create question successfully!' });
          setContentId(Number(data.id));
          setIsOpenQuestion(false);
          mutateGetAllQuestions({...PARAMS_SELECT_SEARCH.default, search: data?.contentTitle});
          setContentData(data);
          // form.submit();
          form.setFields([
            {
              name: 'contentId',
              errors: undefined,
            },
          ]);
          form.setFieldValue('contentId', {
            ...data,
            label: data.contentTitle?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' '),
            value: data.id?.toString(),
            isDisabled: false,
          });
          setIsCreateNew(false);
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

  const { mutate: mutateDuplicateQuestion, isLoading: isLoadingDuplicateContent } = useMutation(
    'duplicateQuestion',
    createNewContent,
    {
      onSuccess: ({ data }: any) => {
        const contentIdArr: number[] = [];
        if (selectedUnitType === ContentType.QUESTION && data.id) {
          contentIdArr.push(data.id);
        }

        const dataPush: IUnit = {
          sessionID: sessionData?.id || undefined,
          unitType: UnitType.CONTENT,
          unitName: form.getFieldValue('unitName')?.trim(),
          isUploadedFile: false,
          filePath: '',
          isDisabled: false,
          contentId: contentIdArr.length > 0 ? contentIdArr : undefined,
          content: [
            {
              ...data,
            },
          ],
          order: selectedUnit?.order || undefined,
          id: selectedUnit?.id || undefined,
        };

        handleAddOrEditUnit(dataPush);
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
        console.log('selectedUnit.content', selectedUnit, contentId);
        // if (contentId && (selectedUnit?.content?.id === contentId || (selectedUnit?.contentId && selectedUnit?.contentId[0] === contentId))) {
        //     const dataPush: IUnit = {
        //         ...selectedUnit,
        //         contentId: [],
        //         content: [],
        //     }
        //     // mutateCreateUnitWithContent(dataPush);
        //     handleAddOrEditUnit(dataPush, true);
        // }
        let temp = [...listUnits];
        if (contentId) {
          temp = temp.map((unit) => {
            console.log('unitunitunit', unit);
            if (
              (unit.contentId?.length > 0 && unit.contentId[0] === contentId) ||
              (unit.content?.length > 0 && unit.content[0].id && unit.content[0].id === contentId)
            ) {
              return {
                ...unit,
                contentId: [],
                content: [],
              };
            } else {
              return unit;
            }
          });
        }
        if (contentId && contentData?.id === contentId) {
          setContentData(undefined);
        }
        setListUnits(temp);
        notification.success({ message: 'Delete question successfully!' });
        setContentId(undefined);
        form.setFieldValue('contentId', null);
        setIsOpenQuestion(false);
        mutateGetAllQuestions(PARAMS_SELECT_SEARCH.default);
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
          console.log('dataaaaa update selectedUnit', selectedUnit);
          console.log('dataaaaa update', data);
          notification.success({ message: 'Edit question successfully!' });
          setContentId(Number(data.id));
          setIsOpenQuestion(false);
          mutateGetAllQuestions({...PARAMS_SELECT_SEARCH.default, search: data?.contentTitle});
          setContentData(data);
          // form.submit();
          form.setFields([
            {
              name: 'contentId',
              errors: undefined,
            },
          ]);
          form.setFieldValue('contentId', {
            ...data,
            label: data.contentTitle?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' '),
            value: data.id?.toString(),
            isDisabled: false,
          });
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

  const handleSearchQuestions = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        mutateGetAllQuestions({ ...PARAMS_SELECT_SEARCH.default, search: value });
      }, 500);
    },
    [timeout],
  );

  const handleSelectUnit = useCallback(
    (values: ContentType) => {
      setSelectedUnitType(values);
      if (contentData?.contentType !== values) {
        form.setFieldValue('contentTitle', null);
        setContentTitle('');
        if (values === ContentType.QUESTION) {
          setContentId(undefined);
          form.setFieldValue('contentId', null);
        }
      } else {
        form.setFieldValue('contentTitle', contentData.contentTitle || '');
        setContentTitle(contentData.contentTitle || '');
      }
    },
    [contentData],
  );

  const handleSelectQuestion = (e: any) => {
    setIsOpenQuestion(false);
    if (!e?.value) {
      form.setFieldValue('contentId', undefined);
      setContentData(undefined);
    }
    if (e?.value) {
      form.setFields([
        {
          name: 'contentId',
          errors: undefined,
        },
      ]);
      mutateGetContentById(Number(e.value));
    }
    console.log('eeeeeeeee', e);
    setContentId(e?.value ? Number(e?.value) : undefined);
  };

  const onFinish = useCallback(
    (values: any) => {
      const contentIdArr: number[] = [];
      if (selectedUnitType === ContentType.QUESTION && contentId) {
        contentIdArr.push(contentId);
      }

      const dataPush: IUnit = {
        sessionID: sessionData?.id || undefined,
        unitType: UnitType.CONTENT,
        unitName: values.unitName.trim(),
        isUploadedFile: false,
        filePath: '',
        isDisabled: false,
        contentId: contentIdArr.length > 0 ? contentIdArr : undefined,
        content: [
          {
            ...contentData,
            contentTitle: contentTitle,
            contentType: selectedUnitType || ContentType.CHECKBOX,
            unitID: Number(selectedUnit?.id),
            tagIds:
              selectedUnitType === ContentType.QUESTION
                ? values.contentTagIDs?.map((tag: { value: string; label: string }) => {
                  return {
                    id: Number(tag.value),
                    tagName: tag.label,
                  };
                })
                : [],
            // answers: selectedUnitType === ContentType.QUESTION && questionChoice ? listAnswers.filter((x) => x.title.trim() && x.value.trim()).map((answer) => {
            //     return {
            //         answerTitle: answer.title.trim(),
            //         answerValue: answer.value.trim(),
            //         isCorrect: answer.isCorrect,
            //     }
            // }) : [],
            questionType:
              selectedUnitType === ContentType.QUESTION && questionChoice
                ? questionChoice
                : undefined,
            timeLimit:
              selectedUnitType === ContentType.PERIOD ? Number(values.timeLimit) : undefined,
            id: contentId || undefined,
          },
        ],
        order: selectedUnit?.order || undefined,
        id: selectedUnit?.id || undefined,
      };
      // mutateCreateUnitWithContent(dataPush);
      if (selectedUnitType !== ContentType.QUESTION || selectedUnit) {
        handleAddOrEditUnit(dataPush);
      }
      else {
        mutateDuplicateQuestion({
          ...contentData,
          contentTitle: "Copy-".concat(contentData.contentTitle),
          answers: contentData?.answers && contentData.answers.length > 0 ? contentData.answers.map((x: any) => ({ ...x, id: undefined, contentID: undefined })) : [],
          tagIds:
            contentData.tags && contentData.tags.length > 0 ? contentData.tags?.map((tag: ITag) => tag.id) : [],
          randomized: contentData.randomized && contentData.randomized.length > 0 ? contentData.randomized?.map((random: IContent) => random.id) : [],
        })
      }
      console.log('dataPush', dataPush.content);
    },
    [
      contentId,
      sessionData,
      selectedUnit,
      selectedUnitType,
      questionChoice,
      listAnswers,
      contentTitle,
      contentData,
    ],
  );

  const handleAddAnswer = () => {
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

  // const handleonChangePreviewQuestion = (values: any[]) => {
  //     setSelectedAnswerPreview(values);
  //     setIsDisabledPreviewSubmitButton(false);
  // }

  // const handleCheckPreviewQuestion = () => {
  //     const answeredAnswers = [...selectedAnswerPreview];
  //     const correctAnswers = [...listAnswers.filter((x) => x.isCorrect && x.title && x.value).map((y) => y.value)];

  //     const difference = correctAnswers
  //         .filter(x => !answeredAnswers.includes(x))
  //         .concat(answeredAnswers.filter(x => !correctAnswers.includes(x)));

  //     if (difference.length > 0) {
  //         setIsWrongAnswer(true);
  //         setIsDisabledPreviewSubmitButton(true);
  //     }

  //     else {
  //         setIsWrongAnswer(false);
  //         setSelectedAnswerPreview([]);
  //         setIsPreviewQuestion(false);
  //         setIsPreviewQuestionInside(false);
  //     }
  // }

  useEffect(() => {
    // getSessionTags(PARAMS_SELECT_SEARCH.sessionTag);
    mutateGetAllQuestions({...PARAMS_SELECT_SEARCH.default, search: contentData?.contentTitle});
  }, [contentData]);

  useEffect(() => {
    if (selectedUnit) {
      form.setFieldsValue(selectedUnit);
      if (
        selectedUnit.content.length > 0 &&
        selectedUnit.content[0].contentType &&
        selectedUnit.content[0].contentType !== ContentType.QUESTION
      ) {
        handleSetContentDetail(selectedUnit.content[0]);
        if (selectedUnit.content[0].id) {
          setContentId(selectedUnit.content[0].id);
        }
      }
      if (
        selectedUnit.content.length > 0 &&
        selectedUnit.content[0].contentType &&
        selectedUnit.content[0].contentType === ContentType.QUESTION
      ) {
        if (selectedUnit.content[0]?.id) {
          mutateGetContentById(selectedUnit.content[0].id);
          setContentId(selectedUnit.content[0].id);
          // handleSetContentDetail(selectedUnit.content[0]);
          // if (selectedUnit.content[0].id) {
          //     setContentId(selectedUnit.content[0].id);
          // }
        }
      }
    }
  }, [selectedUnit]);

  // useEffect(() => {
  //     if (selectedAnswerPreview.length === 0) {
  //         setIsDisabledPreviewSubmitButton(true);
  //     }
  //     else {
  //         setIsDisabledPreviewSubmitButton(false);
  //     }
  // }, [selectedAnswerPreview])

  const handleSubmit = useCallback(() => {
    form.validateFields().then((data) => {
      // if (!contentId && !contentTitle) {
      //     form.setFields([
      //         {
      //             name: 'contentTitle',
      //             errors: ["Content is required!"],
      //         },
      //     ]);
      //     return;
      // }

      if (!contentId && selectedUnitType === ContentType.QUESTION) {
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
      form.submit();
    });
  }, [form, contentTitle, selectedUnitType, listAnswers, isNullAnswers, contentId]);

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

    if (selectedUnitType === ContentType.QUESTION) {
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

  useEffect(() => {
    if (
      listQuestions.length > 0 &&
      contentData?.id &&
      listQuestions.find((x: any) => x.id === contentData?.id)
    ) {
      form.setFieldValue('contentId', {
        ...contentData,
        label: contentData.contentTitle?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' '),
        value: contentData.id?.toString(),
        isDisabled: false,
      });
    }
    if (contentData?.url) {
      form.setFieldValue('url', contentData.url);
    }
    if (selectedUnitType === ContentType.PERIOD && contentData?.timeLimit) {
      form.setFieldValue(
        'timeLimit',
        typeof contentData.timeLimit !== 'number'
          ? contentData.timeLimit?.toString()
          : contentData.timeLimit,
      );
    }
  }, [contentData, selectedUnit, listQuestions, selectedUnitType]);

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
    ],
  );

  console.log(listAnswers, unitName);

  return (
    <div className="">
      <Form
        // layout="vertical"
        className="flex flex-wrap gap-x-4 flex-[62%]"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          className={'w-full sm:w-full lg:w-[49%] unit-name'}
          key={'unitName'}
          validateFirst
          name={'unitName'}
          label={<span className="flex align-center">Unit Name</span>}
          rules={[
            { required: true, message: 'Unit Name is required!' },
            {
              validator(_: RuleObject, value: string) {
                if (value?.trim() === '') {
                  return Promise.reject('Unit Name is required!');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <CustomInput
            type={'string'}
          // placeholder='Unit Name Placeholder'
          />
        </Form.Item>
        <Content className="rounded-3xl bg-white p-8">
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight custom-font-header-content-management">
            Create your unit
          </p>
          <div className="flex justify-between items-center">
            {LIST_UNIT_OPTIONS.map((item, index) => {
              return (
                <div
                  className={`cm-add-content flex justify-between flex-col items-center cursor-pointer ${item.value === selectedUnitType ? 'selected' : ''
                    }`}
                  key={index}
                  onClick={() => handleSelectUnit(item.value)}
                >
                  {item.icon}
                  <p className="text-lg font-fontFamily font-semibold mb-0 custom-font-content-management text-center">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {selectedUnitType &&
            (selectedUnitType === ContentType.CHECKBOX || selectedUnitType === ContentType.PERIOD) ? (
            <>
              {selectedUnitType === ContentType.PERIOD && (
                <Form.Item
                  className={'w-full sm:w-full lg:w-[49%] time-limit'}
                  key={'timeLimit'}
                  validateFirst
                  name={'timeLimit'}
                  label={
                    <span className="flex align-center text-2xl font-fontFamily font-bold custom-font-header-content-management">
                      Set time limit
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Time limit is required!' },
                    {
                      validator(_: RuleObject, value: string) {
                        if (!Number.isInteger(value)) {
                          return Promise.reject('Time limit must be an integer!');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <CustomInput type={'number'} placeholder="Number of seconds" />
                </Form.Item>
              )}
              <Form.Item
                className={'w-full mt-6'}
                key={'editor'}
                validateFirst
                name={'contentTitle'}
                rules={[
                  { required: true, message: 'Content is required!' },
                  {
                    validator(_: RuleObject, value: string) {
                      if (contentTitle?.trim() === '') {
                        return Promise.reject('Content is required!');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <CKEditor
                  editor={ClassicEditor}
                  config={EDITOR_CONFIG}
                  onChange={(event: EventTarget, editor: any) => {
                    const data = editor.getData();
                    setContentTitle(data);
                  }}
                  data={contentTitle}
                />
              </Form.Item>

              <div className="flex gap-x-3 justify-end">
                <ButtonCustom
                  color="outline"
                  onClick={() => {
                    handleCancelAddOrEditUnit();
                  }}
                >
                  Cancel
                </ButtonCustom>

                <ButtonCustom
                  color="outline"
                  onClick={() => {
                    form.validateFields().then(() => {
                      setIsPreviewCheckbox(true);
                    });
                  }}
                >
                  Preview
                </ButtonCustom>

                <ButtonCustom
                  color="orange"
                  onClick={() => {
                    // setIsOpenConfirmLeave(false);
                    handleSubmit();
                  }}
                >
                  Save
                </ButtonCustom>
              </div>
            </>
          ) : (
            ''
          )}

          {selectedUnitType && selectedUnitType === ContentType.QUESTION ? (
            <>
              <div className="mt-6">
                <span className="items-center select-question-container flex gap-x-3 flex-1 sm:flex-col sm:items-start">
                  <span className="text-sm font-fontFamily">Select a question :</span>
                  <span className="w-[450px] sm:w-full lg:w-[49%] select-question">
                    <Form.Item name="contentId" className="mb-0">
                      <SelectSearch
                        handleSearchOptions={handleSearchQuestions}
                        options={listQuestions}
                        // className={errorSelect(field.name) ? 'field-error' : ''}
                        // onChange={field.onChange}
                        isClearSearchValue={true}
                        disable={false}
                        onChange={handleSelectQuestion}
                      />
                    </Form.Item>
                  </span>
                </span>
              </div>

              <div className="flex gap-x-3 justify-end mt-6 flex-wrap	custom-create-w-question gap-y-3">
                <></>
                {selectedUnitType === ContentType.QUESTION && (
                  <ButtonCustom
                    className="custom-button-content-management margin-bottom-content-management margin-right-content-management min-w-fit w-[20%]"
                    onClick={() => {
                      if (!contentId) {
                        form.setFields([
                          {
                            name: 'contentId',
                            errors: ['Select a question!'],
                          },
                        ]);
                        return;
                      }
                      form.setFields([
                        {
                          name: 'contentId',
                          errors: undefined,
                        },
                      ]);
                      mutateGetContentById(contentId);
                      if (contentData.questionType) {
                        if (contentData.questionType === QuestionType.MULTIPLE_CHOICE) {
                          setIsNullAnswers(false);
                          setIsPreviewQuestionInside(true);
                        } else if (contentData.questionType === QuestionType.FILL_THE_GAP) {
                          setIsPreviewFillTheGapInside(true);
                        } else if (contentData.questionType === QuestionType.ORDERING) {
                          setIsNullAnswers(false);
                          setIsPreviewOrderingInside(true);
                        } else if (contentData.questionType === QuestionType.DRAG_DROP) {
                          setIsNullAnswers(false);
                          setIsPreviewDragAndDropInside(true);
                        } else if (contentData.questionType === QuestionType.FREE_TEXT) {
                          setIsNullAnswers(false);
                          setIsPreviewFreeTextInside(true);
                        } else if (
                          contentData.questionType === QuestionType.RANDOMIZED &&
                          listQuestionsRandomized?.length > 0
                        ) {
                          setIsNullAnswers(false);
                          setIsPreviewRandomizedInside(true);
                          setContentRandomized(undefined);
                          const randomId =
                            listQuestionsRandomized[
                            Math.floor(Math.random() * listQuestionsRandomized.length)
                            ];
                          mutateGetContentRandomizedById(randomId);
                        }
                      }
                    }}
                  >
                    Preview
                  </ButtonCustom>
                )}
                <ButtonCustom
                  color="orange"
                  onClick={() => {
                    if (!contentId) {
                      form.setFields([
                        {
                          name: 'contentId',
                          errors: ['Select a question!'],
                        },
                      ]);
                      return;
                    } else {
                      form.setFields([
                        {
                          name: 'contentId',
                          errors: undefined,
                        },
                      ]);
                      setIsModalDeleteContent(true);
                    }
                  }}
                  className="text-white custom-button-content-management margin-bottom-content-management min-w-fit w-[20%]"
                  isLoading={isLoadingDeleteContent}
                >
                  Delete
                </ButtonCustom>
                <ButtonCustom
                  color="orange"
                  onClick={() => {
                    if (!contentId) {
                      form.setFields([
                        {
                          name: 'contentId',
                          errors: ['Select a question!'],
                        },
                      ]);
                      return;
                    }
                    setIsNullAnswers(false);
                    mutateGetContentById(contentId);
                    setIsOpenQuestion(true);
                    setIsCreateNew(false);
                  }}
                  className="text-white w-[20%] custom-button-content-management margin-bottom-content-management margin-left-content-management min-w-fit"
                >
                  Edit
                </ButtonCustom>

                <DropDownCustom
                  items={
                    <Menu>
                      {LIST_QUESTION_OPTIONS.map((option, index) => {
                        return (
                          <Menu.Item
                            key={index}
                            onClick={() => {
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
                            }}
                            disabled={option.isDisabled}
                          >
                            <a className="ant-select-item ant-select-item-option">{option.label}</a>
                          </Menu.Item>
                        );
                      })}
                    </Menu>
                  }
                  title={'Create New'}
                  className={'border-main-button-color !bg-main-button-color !text-white w-[20%]'}
                />
              </div>
            </>
          ) : (
            ''
          )}
        </Content>

        {
          // selectedUnitType && selectedUnitType === ContentType.QUESTION && questionChoice === 'Multiple Choice' ? (
          (contentId || isOpenQuestion) &&
            selectedUnitType &&
            selectedUnitType === ContentType.QUESTION ? (
            <Content className="rounded-3xl bg-white p-8 mt-6 w-full">
              {
                // isOpenQuestion && questionChoice === 'Multiple Choice' && (
                //     <MultipleChoiceComponent
                //         contentTitle={contentTitle}
                //         form={form}
                //         handleAddAnswer={handleAddAnswer}
                //         handleChangeIsCorrect={handleChangeIsCorrect}
                //         handleChangeTitle={handleChangeTitle}
                //         handleDeleteAnswer={handleDeleteAnswer}
                //         isNullAnswers={isNullAnswers}
                //         listAnswers={listAnswers}
                //         setContentTitle={setContentTitle}
                //         setIsPreviewQuestion={setIsPreviewQuestionInside}
                //         handleSaveQuestion={handleSaveQuestion}
                //         setIsNullAnswers={setIsNullAnswers}
                //         setIsOpenQuestion={setIsOpenQuestion}
                //         isLoading={(contentId && !isCreateNew) ? isLoadingUpdateContent : isLoadingCreateNewContent}
                //     />
                // )

                isOpenQuestion && questionChoice && renderQuestionComponent(questionChoice)
              }

              {!isOpenQuestion && (
                <div className="flex gap-x-3 justify-end">
                  <ButtonCustom
                    color="outline"
                    onClick={() => {
                      setQuestionChoice(undefined);
                      handleCancelAddOrEditUnit();
                    }}
                  >
                    Cancel
                  </ButtonCustom>

                  {(contentId || isOpenQuestion) && selectedUnitType === ContentType.QUESTION && (
                    <ButtonCustom
                      onClick={() => {
                        form.validateFields().then(() => {
                          form.setFields([
                            {
                              name: 'contentTitle',
                              errors: undefined,
                            },
                          ]);
                          setIsNullAnswers(false);
                          if (contentId) {
                            mutateGetContentById(Number(contentId));
                          }
                          if (questionChoice === QuestionType.MULTIPLE_CHOICE) {
                            setIsPreviewQuestion(true);
                          } else if (questionChoice === QuestionType.FILL_THE_GAP) {
                            setIsPreviewFillTheGap(true);
                          } else if (contentData.questionType === QuestionType.ORDERING) {
                            setIsPreviewOrdering(true);
                          } else if (contentData.questionType === QuestionType.DRAG_DROP) {
                            setIsPreviewDragAndDrop(true);
                          } else if (contentData.questionType === QuestionType.FREE_TEXT) {
                            setIsPreviewFreeText(true);
                          } else if (
                            contentData.questionType === QuestionType.RANDOMIZED &&
                            listQuestionsRandomized?.length > 0
                          ) {
                            setContentRandomized(undefined);
                            const randomId =
                              listQuestionsRandomized[
                              Math.floor(Math.random() * listQuestionsRandomized.length)
                              ];
                            mutateGetContentRandomizedById(randomId);
                            setIsPreviewRandomized(true);
                          }
                        });
                      }}
                    >
                      Preview
                    </ButtonCustom>
                  )}

                  <ButtonCustom
                    color="orange"
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    Save
                  </ButtonCustom>
                </div>
              )}
            </Content>
          ) : (
            ''
          )
        }
      </Form>

      <Modal
        centered
        className="content-management__custom-modal"
        title={`${sessionData?.sessionName}${unitName ? ` - ${unitName}` : ''}`}
        onCancel={() => {
          setIsPreviewCheckbox(false);
        }}
        footer={[
          <ButtonCustom
            key={'Continue'}
            color="orange"
            onClick={() => {
              setIsPreviewCheckbox(false);
            }}
            className="text-white"
          >
            Continue
          </ButtonCustom>,
        ]}
        cancelText="Cancel"
        visible={isPreviewCheckbox}
      >
        <div className="container checkbox">
          <span
            className="text-base text-[#6E6B68]"
            dangerouslySetInnerHTML={{
              __html:
                contentTitle ||
                'Just text content that was filled up in previous page with a completed / continue button below',
            }}
          ></span>
        </div>
      </Modal>

      {/* <Modal
                centered
                className='content-management__custom-modal'
                // title={`${sessionData?.sessionName}${unitName ? ` - ${unitName}` : ""}`}
                title={"Preview question"}
                onCancel={() => {
                    setIsPreviewQuestion(false);
                    setSelectedAnswerPreview([]);
                    setIsWrongAnswer(false);
                }}
                footer={[
                    <ButtonCustom
                        key={"Submit"}
                        color="orange"
                        onClick={() => {
                            // setIsPreviewQuestion(false);
                            handleCheckPreviewQuestion();
                        }}
                        className='text-white'
                        disabled={isDisabledPreviewSubmitButton}
                    >
                        Submit
                    </ButtonCustom>,
                ]}
                cancelText="Cancel"
                visible={isPreviewQuestion}
            >
                <div className="container">
                    <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">
                        Question
                    </p>
                    <span className='text-base text-[#6E6B68]' dangerouslySetInnerHTML={{ __html: contentTitle || 'Just text content that was filled up in previous page with a completed / continue button below' }}>

                    </span>
                </div>

                <div className="container mt-6 answer-container">
                    <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">
                        Answer
                    </p>
                    <Checkbox.Group
                        onChange={handleonChangePreviewQuestion}
                        className="multiple-choose__list-answer__answer-item"
                        value={selectedAnswerPreview}
                    >
                        {listAnswers.filter((x) => x.title.trim() && x.value.trim()).map((answer, index) => (
                            <Checkbox value={answer.value} key={index} className='table-component custom-checkbox'>
                                {answer.title || answer.value}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </div>

                {
                    isWrongAnswer ? (
                        <span className='text-sm italic font-semibold text-[#EB5757] mt-3'
                            style={{
                                fontFamily: 'Montserrat',
                            }}
                        >
                            Incorrect answer. Please try again.
                        </span>
                    ) : ""
                }
            </Modal> */}
      {renderModalConfirmDelete()}
      {(isPreviewQuestion || isPreviewQuestionInside) && (
        <QuestionMultipleChoiceModalPreview
          contentTitle={contentTitle}
          // handleCheckPreviewQuestion={handleCheckPreviewQuestion}
          // handleonChangePreviewQuestion={handleonChangePreviewQuestion}
          // isDisabledPreviewSubmitButton={isDisabledPreviewSubmitButton}
          isPreviewQuestion={isPreviewQuestion}
          isPreviewQuestionInside={isPreviewQuestionInside}
          // isWrongAnswer={isWrongAnswer}
          listAnswers={listAnswers || []}
          // selectedAnswerPreview={selectedAnswerPreview}
          setIsPreviewQuestion={setIsPreviewQuestion}
          setIsPreviewQuestionInside={setIsPreviewQuestionInside}
          // setIsWrongAnswer={setIsWrongAnswer}
          // setSelectedAnswerPreview={setSelectedAnswerPreview}
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
        />
      )}
    </div>
  );
};

export default CreateUnit;