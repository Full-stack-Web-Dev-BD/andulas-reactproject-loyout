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
  Row,
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
  getUnitById,
  scrapeContent,
  updateAnswers,
  updateContentById,
} from 'api/content_management';
import { IContent, ISession, ITag, IUnit, LIST_QUESTION_OPTIONS, QuestionType, UnitType } from '../../index';
import SelectSearch from 'components/SelectSearch';
import { createSessionTag, searchSessionTags } from 'api/session_tag';
import moment from 'moment';
import { RuleObject } from 'antd/lib/form';
// import './style.css';
import Loading from 'components/Loading';
import MultipleChoiceComponent from '../QuestionComponents/MultipleChoice';
import FillTheGapComponent from '../QuestionComponents/FillTheGap';
import OrderingComponent from '../QuestionComponents/Ordering';
import DragAndDropComponent from '../QuestionComponents/DragAndDrop';
import FreeTextComponent from '../QuestionComponents/FreeText';
import RandomizedComponent from '../QuestionComponents/Randomized';
import QuestionMultipleChoiceModalPreview from '../PreviewModalComponent/QuestionMultipleChoice';
import FillTheGapModalPreview from '../PreviewModalComponent/FillTheGap';
import OrderingModalPreview from '../PreviewModalComponent/Ordering';
import DragAndDropModalPreview from '../PreviewModalComponent/DragAndDrop';
import FreeTextModalPreview from '../PreviewModalComponent/FreeText';
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
  handleAddOrEditUnit: (values: any) => void;
  handleCancelAddOrEditUnit: () => void;
  setListUnits: (value: any[]) => void;
  listUnits: any[];
}

const regexYoutubeUrl =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gim;

const regexDocsGoogle = /https:\/\/docs\.google\.com\/document\/d\/(.*?)/g;

const regexUrl =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/g;

const CreateUnitWithWebContent = (props: IProps) => {
  const {
    sessionData,
    selectedUnit,
    handleAddOrEditUnit,
    handleCancelAddOrEditUnit,
    setListUnits,
    listUnits,
  } = props;
  console.log('selectedUnit', selectedUnit);

  const [form] = Form.useForm();

  const [contentData, setContentData] = useState<any>(undefined);
  const [selectedUnitType, setSelectedUnitType] = useState<ContentType>();
  const [questionChoice, setQuestionChoice] = useState<QuestionType>();

  const [isPreviewUrl, setIsPreviewUrl] = useState<boolean>(false);
  // const [isPreviewUrlYoutube, setIsPreviewUrlYoutube] = useState<boolean>(false);
  // const [isPreviewUrlGoogleDocs, setIsPreviewUrlGoogleDocs] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [urlContent, setUrlContent] = useState<string>();
  console.log('urlContent', urlContent);
  const [contentTitle, setContentTitle] = useState<string>('');

  // new

  const timeout: any = useRef(null);

  const randomizedRef: any = useRef();

  const unitName = Form.useWatch('unitName', form);

  const [listAnswers, setListAnswers] = useState<ANSWER[]>([]);
  const [listQuestions, setListQuestions] = useState<any[]>([]);
  const [isNullAnswers, setIsNullAnswers] = useState<boolean>(false);
  const [isModalDeleteContent, setIsModalDeleteContent] = useState<boolean>(false);

  // select question
  const [contentId, setContentId] = useState<number>();
  const [isOpenQuestion, setIsOpenQuestion] = useState<boolean>(false);
  const [isCreateNew, setIsCreateNew] = useState<boolean>(false);
  //

  // list question randomized
  const [listQuestionsRandomized, setListQuestionRandomized] = useState<any[]>([]);

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

  const [isClickInputUrl, setIsClickInputUrl] = useState<boolean>(false);

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

  const { mutate: mutateScrapeContent, isLoading: isLoadingUrlContent } = useMutation(
    'getContent',
    scrapeContent,
    {
      onSuccess: ({ data }) => {
        console.log('data content', data);
        setUrlContent(data.content);
      },
      onError: ({ response }) => {
        setIsPreviewUrl(false);
        // setIsPreviewUrlYoutube(false);
        setUploadedUrl('');
        if (response.status == 403) {
          notification.error({ message: 'You are not allowed to create content management.' });
          return;
        } else {
          // notification.error({ message: response.data.message });
          form.setFields([
            {
              name: 'url',
              errors: [response.data.message],
            },
          ]);
        }
      },
    },
  );

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

        const htmlUrlContent =
          document
            .querySelector('.w-full.mt-6.url-content-editor')
            ?.querySelector('.ck-editor__editable_inline')?.innerHTML || '';

        const dataPush: IUnit = {
          sessionID: sessionData?.id || undefined,
          unitType: UnitType.WEB_CONTENT,
          unitName: form.getFieldValue('unitName')?.trim(),
          isUploadedFile: false,
          filePath: '',
          isDisabled: false,
          contentId: contentIdArr.length > 0 ? contentIdArr : undefined,
          content: [
            {
              ...data
            },
          ],
          order: selectedUnit?.order || undefined,
          url: form.getFieldValue('url')?.trim() || undefined,
          urlContent: htmlUrlContent || urlContent || '',
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

  const handlePreviewUrl = useCallback(
    (url?: any) => {
      const testURL = form.getFieldValue('url') || url?.target?.value || '';
      const testRegexURL = testURL?.match(regexUrl);
      if (testURL && testURL !== '') {
        if (testRegexURL) {
          setIsPreviewUrl(true);
          setUploadedUrl(testURL);
          mutateScrapeContent({
            url: testURL,
          });
        } else {
          setIsPreviewUrl(false);
          // setIsPreviewUrlYoutube(false);
          setUploadedUrl('');
          form.setFields([
            {
              name: 'url',
              errors: ['Invalid url!'],
            },
          ]);
        }
      } else {
        setIsPreviewUrl(false);
        // setIsPreviewUrlYoutube(false);
        setUploadedUrl('');
        form.setFields([
          {
            name: 'url',
            errors: ['URL is required!'],
          },
        ]);
      }
    },
    [form],
  );

  function getIdYoutube(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  }

  const onFinish = useCallback(
    (values: any) => {
      if (urlContent === undefined) {
        form.setFields([
          {
            name: 'urlContent',
            errors: ['Please load a url'],
          },
        ]);
        return;
      } else {
        const contentIdArr: number[] = [];
        if (selectedUnitType === ContentType.QUESTION && contentId) {
          contentIdArr.push(contentId);
        }

        const htmlUrlContent =
          document
            .querySelector('.w-full.mt-6.url-content-editor')
            ?.querySelector('.ck-editor__editable_inline')?.innerHTML || '';

        const dataPush: IUnit = {
          sessionID: sessionData?.id || undefined,
          unitType: UnitType.WEB_CONTENT,
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
          url: values.url.trim() || undefined,
          urlContent: htmlUrlContent || urlContent || '',
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
      }
    },
    [
      urlContent, 
      selectedUnitType, 
      selectedUnit, 
      questionChoice, 
      contentId, 
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

  useEffect(() => {
    if (selectedUnit) {
      form.setFieldsValue(selectedUnit);
      // if (selectedUnit.content && selectedUnit.content[0]) {
      //     setContentData(selectedUnit.content[0]);
      //     setSelectedUnitType(selectedUnit.content[0].contentType || undefined);
      //     setQuestionChoice(selectedUnit.content[0].questionType || undefined);
      //     // if (selectedUnit.content[0].contentTitle && selectedUnit.content[0].contentTitle !== '') {
      //     //     setIsPreviewUrl(true);
      //     //     setUrlContent(selectedUnit.content[0].contentTitle);
      //     // }
      // }
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
        }
      }
      if (selectedUnit.url && selectedUnit.url !== '') {
        setUploadedUrl(selectedUnit.url);
        setIsPreviewUrl(true);
        setUrlContent(selectedUnit.urlContent || '');
      }
    }
  }, [selectedUnit]);

  const handleSubmit = useCallback(() => {
    form.validateFields().then((data) => {
      form.submit();
    });
  }, [form]);

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

  useEffect(() => {
    // getSessionTags(PARAMS_SELECT_SEARCH.sessionTag);
    mutateGetAllQuestions({...PARAMS_SELECT_SEARCH.default, search: contentData?.contentTitle});
  }, [contentData]);

  useEffect(() => {
    // const element = document.querySelector('.input-upload-url');
    // const body = document.body;
    // const onClickInput = (event: any) => {
    //     event.stopPropagation();
    //     setIsClickInputUrl(true);
    // }
    // const onClickOutside = (event: any) => {
    //     if (isClickInputUrl) {
    //         handlePreviewUrl();
    //         setIsClickInputUrl(false);
    //     }
    // }
    // if (element) {
    //     element.addEventListener('click', onClickInput, true);
    // }
    // body.addEventListener('click', onClickOutside, true)

    // return () => {
    //     if (element) {
    //         element.removeEventListener('click', onClickInput, true);
    //     }
    //     body.removeEventListener('click', onClickOutside, true)
    // }
    const onClickElement = (event: any) => {
      if (event.target.tagName === 'INPUT' && event.target.className.includes('input-upload-url')) {
        setIsClickInputUrl(true);
      } else if (isClickInputUrl) {
        handlePreviewUrl();
        setIsClickInputUrl(false);
      }
    };
    window.addEventListener('click', onClickElement, true);
    return () => {
      window.removeEventListener('click', onClickElement, true);
    };
  }, [form, selectedUnitType, isClickInputUrl]);

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
        <Content className="rounded-3xl bg-white p-8 w-full" title="Add content">
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight custom-font-header-content-management">
            Create your unit
          </p>

          <div className="flex justify-between items-center mb-6">
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

          {selectedUnitType && (
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

              <p className="text-base font-fontFamily font-bold mb-2 tracking-tight">
                Web address (URL)
              </p>

              <Row className="web-content__upload">
                <Form.Item
                  className={'url'}
                  key={'url'}
                  validateFirst
                  name={'url'}
                  rules={[
                    { required: true, message: 'Url is required!' },
                    {
                      validator(_: RuleObject, value: string) {
                        if (value?.trim() === '') {
                          return Promise.reject('Url is required!');
                        } else if (!value?.trim().match(regexUrl)) {
                          return Promise.reject('Invalid url!');
                        }
                        return Promise.resolve();
                      },
                    },
                    // {
                    //     type: "url",
                    //     message: "Invalid url."
                    // }
                  ]}
                >
                  <CustomInput
                    classNameCustom="input-upload-url custom"
                    type={'text'}
                    placeholder="Start writing for suggestions or paste a URL 1"
                    onPressEnter={handlePreviewUrl}
                    onChange={() => {
                      setIsClickInputUrl(true);
                    }}
                  />
                </Form.Item>

                <Form.Item className="btn-upload custom-width">
                  <Button
                    className="bg-[#FCECD9] btn-load-iframe rounded-xl h-11 min-w-[188px] custom-width font-fontFamily font-bold text-black"
                    onClick={handlePreviewUrl}
                  >
                    Upload
                  </Button>
                </Form.Item>
              </Row>

              {/* {
                                    isPreviewUrlYoutube && uploadedUrl && (
                                        <iframe
                                            width="100%"
                                            height="500"
                                            src={`https://www.youtube.com/embed/${getIdYoutube(uploadedUrl)}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )
                                }

                                {
                                    isPreviewUrlGoogleDocs && uploadedUrl && (
                                        <iframe
                                            width="100%"
                                            height="1000px"
                                            src={uploadedUrl}
                                            title="Content"
                                        />
                                    )
                                } */}

              {isPreviewUrl && uploadedUrl && (
                <Loading isLoading={isLoadingUrlContent}>
                  <div className="web-content__url-content">
                    <Form.Item
                      className={'w-full mt-6 url-content-editor'}
                      key={'editor'}
                      validateFirst
                      name={'urlContent'}
                    >
                      <CKEditor
                        editor={ClassicEditor}
                        config={EDITOR_CONFIG}
                        onChange={(event: EventTarget, editor: any) => {
                          const data = editor.getData();
                          setUrlContent(data);
                        }}
                        data={urlContent}
                      />
                    </Form.Item>
                  </div>
                </Loading>
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
                  <div className="flex gap-x-3 justify-end mt-6 flex-wrap custom-create-w-question gap-y-3">
                    {selectedUnitType === ContentType.QUESTION && (
                      <ButtonCustom
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
                      className="text-white"
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
                      className="text-white"
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
                                <a className="ant-select-item ant-select-item-option">
                                  {option.label}
                                </a>
                              </Menu.Item>
                            );
                          })}
                        </Menu>
                      }
                      title={'Create New'}
                      className={'border-main-button-color !bg-main-button-color !text-white'}
                    />
                  </div>
                </>
              ) : (
                ''
              )}

              {selectedUnitType !== ContentType.QUESTION && (
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
                    color="orange"
                    onClick={() => {
                      // setIsOpenConfirmLeave(false);
                      handleSubmit();
                    }}
                  >
                    Save
                  </ButtonCustom>
                </div>
              )}
            </>
          )}
        </Content>

        {
          // selectedUnitType && selectedUnitType === ContentType.QUESTION && questionChoice === 'Multiple Choice' ? (
          (contentId || isOpenQuestion) &&
            selectedUnitType &&
            selectedUnitType === ContentType.QUESTION ? (
            <Content className="rounded-3xl bg-white p-8 mt-6 w-full">
              {isOpenQuestion && questionChoice && renderQuestionComponent(questionChoice)}

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
          urlContent={
            urlContent
              ? document
                .querySelector('.w-full.mt-6.url-content-editor')
                ?.querySelector('.ck-editor__editable_inline')?.innerHTML || ''
              : ''
          }
          title={!isPreviewQuestionInside ? 'Web content' : undefined}
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
          urlContent={
            urlContent
              ? document
                .querySelector('.w-full.mt-6.url-content-editor')
                ?.querySelector('.ck-editor__editable_inline')?.innerHTML || ''
              : ''
          }
          title={!isPreviewFillTheGapInside ? 'Web content' : undefined}
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
          urlContent={
            urlContent
              ? document
                .querySelector('.w-full.mt-6.url-content-editor')
                ?.querySelector('.ck-editor__editable_inline')?.innerHTML || ''
              : ''
          }
          title={!isPreviewOrderingInside ? 'Web content' : undefined}
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
          urlContent={
            urlContent
              ? document
                .querySelector('.w-full.mt-6.url-content-editor')
                ?.querySelector('.ck-editor__editable_inline')?.innerHTML || ''
              : ''
          }
          title={!isPreviewDragAndDropInside ? 'Web content' : undefined}
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
          urlContent={
            urlContent
              ? document
                .querySelector('.w-full.mt-6.url-content-editor')
                ?.querySelector('.ck-editor__editable_inline')?.innerHTML || ''
              : ''
          }
          title={!isPreviewFreeTextInside ? 'Web content' : undefined}
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
          urlContent={
            urlContent
              ? document
                .querySelector('.w-full.mt-6.url-content-editor')
                ?.querySelector('.ck-editor__editable_inline')?.innerHTML || ''
              : ''
          }
          title={!isPreviewRandomizedInside ? 'Web content' : undefined}
        />
      )}
    </div>
  );
};

export default CreateUnitWithWebContent;
