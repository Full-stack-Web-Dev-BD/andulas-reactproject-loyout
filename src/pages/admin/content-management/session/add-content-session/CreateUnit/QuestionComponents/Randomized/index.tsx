import {
  Breadcrumb,
  Button,
  Checkbox,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  notification,
  Select,
  Table,
} from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import React, {
  forwardRef,
  KeyboardEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  createNewContent,
  createNewUnit,
  deleteContentById,
  getAllQuestions,
  getContentDetail,
  getQuestionsNotRandomized,
  updateContentById,
} from 'api/content_management';
import { ISession, ITag, IUnit, LIST_QUESTION_OPTIONS, QuestionType, UnitType } from '../../..';
import SelectSearch from 'components/SelectSearch';
import { createSessionTag, searchSessionTags } from 'api/session_tag';
import moment from 'moment';
import { RuleObject } from 'antd/lib/form';
import { ColumnsType } from 'antd/lib/table';
import { SearchOutlined } from '@ant-design/icons';
import PaginationCustom from 'components/Pagination';
import SelectCustom from 'components/Select';

interface IProps {
  form: any;
  contentTitle: string;
  setContentTitle: (value: string) => void;
  contentData: any;
  setIsPreviewQuestion: (value: boolean) => void;
  setIsOpenQuestion: (value: boolean) => void;
  handleSaveQuestion: () => void;
  isLoading: boolean;
  sessionData: any;
  listQuestionsRandomized: any[];
  setListQuestionRandomized: (value: any[]) => void;
  isNullAnswers: boolean;
  setIsNullAnswers: (value: boolean) => void;
  mutateGetContentRandomizedById: (value: any) => void;
  setContentRandomized: (value?: any) => void;
  isCreateNew: boolean;
}

const RandomizedComponent = forwardRef((props: IProps, ref) => {
  const {
    form,
    contentTitle,
    setContentTitle,
    contentData,
    setIsPreviewQuestion,
    setIsOpenQuestion,
    handleSaveQuestion,
    isLoading,
    sessionData,
    listQuestionsRandomized,
    setListQuestionRandomized,
    isNullAnswers,
    setIsNullAnswers,
    mutateGetContentRandomizedById,
    setContentRandomized,
    isCreateNew,
  } = props;
  console.log('listQuestionsRandomized', listQuestionsRandomized);
  const timeout: any = useRef(null);

  // const [data, setData] = useState<any[]>([]);
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
  console.log('pagination', pagination);
  const [isGetAll, setIsGetAll] = useState<boolean>(false);

  const { mutate: mutateGetAllQuestions } = useMutation(
    'getAllQuestions',
    getQuestionsNotRandomized,
    {
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
    },
  );

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

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Use',
      key: 'use',
      align: 'center',
      width: 200,
      render: (text: any, records) => {
        if (listQuestionsRandomized?.includes(records.id)) {
          return (
            <span>
              <ButtonCustom
                color="orange"
                onClick={() => {
                  let temp = [...listQuestionsRandomized];
                  temp = temp.filter((x) => x !== records.id);
                  setListQuestionRandomized(temp);
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
                  const temp = [...listQuestionsRandomized];
                  temp.push(records.id);
                  console.log('temp', temp, records.id);
                  setListQuestionRandomized(temp);
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
      title: 'Question',
      dataIndex: 'contentTitle',
      key: 'contentTitle',
      align: 'center',
      render: (text: any) => {
        return (
          <span className="randomized-column-content-title">
            {text.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', ' ')}
          </span>
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
      width: 100,
      render: (text: any, record: any) => {
        return (
          <span>
            <Button
              ghost
              icon={<SearchOutlined />}
              style={{
                color: 'rgba(0, 0, 0, 0.85)',
              }}
              onClick={() => {
                setContentRandomized(undefined);
                setIsPreviewQuestion(true);
                mutateGetContentRandomizedById(record.id);
              }}
            />
          </span>
        );
      },
    },
  ];

  const handleGetListSessions = useCallback(
    (sessionID?: number, randomizedIds?: any[], page?: number) => {
      mutateGetAllQuestions({
        limit: Number(limit),
        page: page ? page : Number(pagination.current),
        search: searchValue,
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({
              ...filters,
              sessionID: sessionID || undefined,
              randomizedIds: randomizedIds || undefined,
            }).filter(([, v]) => (v as any)?.toString() !== ''),
          ),
        ]),
      });
    },
    [limit, pagination.current, searchValue],
  );

  // useEffect(() => {
  //     if (!isGetAll) {
  //         if (sessionData?.id || listQuestionsRandomized?.length > 0) {
  //             if (searchValue) {
  //                 handleGetListSessions(sessionData?.id, undefined)
  //             }
  //             else {
  //                 handleGetListSessions(sessionData?.id, listQuestionsRandomized)
  //             }
  //         }
  //         else {
  //             setListQuestions([]);
  //             setPagination({
  //                 ...pagination,
  //                 current: 1,
  //                 total: 0,
  //             });
  //         }
  //     }
  //     else {
  //         handleGetListSessions(undefined, undefined)
  //     }
  // }, [
  //     limit,
  //     pagination.current,
  //     searchValue,
  //     listQuestionsRandomized,
  //     sessionData,
  //     isGetAll,
  // ])

  useEffect(() => {
    if (sessionData?.id) {
      if (isGetAll) {
        handleGetListSessions(undefined, undefined);
      } else {
        handleGetListSessions(sessionData?.id, listQuestionsRandomized || []);
      }
    } else {
      if (isGetAll) {
        handleGetListSessions(undefined, undefined);
      } else {
        handleGetListSessions(-1, listQuestionsRandomized);
      }
    }
  }, [limit, pagination.current, searchValue, listQuestionsRandomized, sessionData, isGetAll]);

  useEffect(() => {
    return () => {
      console.log('here?');
      setIsGetAll(false);
      setContentTitle('');
      setSearchValue('');
      form.setFieldValue('search-value-randomized', '');
    };
  }, [isCreateNew, form]);

  useImperativeHandle(ref, () => ({
    resetRandomized() {
      setSearchValue('');
      setIsGetAll(false);
      form.setFieldValue('search-value-randomized', '');
    },
  }));

  return (
    <div>
      <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">Randomized</p>

      <div className="w-[38%] xl:w-[100%]">
        <Form.Item
          name={'contentTitle'}
          rules={[
            // { required: true, message: "'Question name' is required" },
            {
              validator(_: RuleObject, value: string) {
                if (value?.trim() === '') {
                  return Promise.reject('Question name is required!');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <CustomInput
            type="text"
            placeholder="Question name"
            value={contentTitle}
            onChange={(e) => setContentTitle(e.target.value)}
          />
        </Form.Item>
      </div>

      <div className="flex justify-between items-center mb-4 xl:flex-col xl:items-start flex-wrap">
        <div className="w-[38%] xl:w-[100%]">
          <Form.Item name="search-value-randomized" className="xl-min:mb-0">
            <CustomInput
              type="text"
              placeholder="Search"
              onPressEnter={(e) => {
                // const temp = { ...pagination };
                // temp.current = 1;
                // setPagination(temp);
                // setSearchValue(e.target.value);
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

        {isGetAll ? (
          <ButtonCustom
            className="xl:w-[100%]"
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
            className="xl:w-[100%]"
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
        )}

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

      {isNullAnswers && (
        <p className="text-[#ff4d4f] text-sm">You must specify at least two questions</p>
      )}

      <div className="flex gap-x-3 justify-end">
        <ButtonCustom
          color="outline"
          onClick={() => {
            setIsOpenQuestion(false);
          }}
        >
          Cancel
        </ButtonCustom>

        <ButtonCustom
          onClick={() => {
            if (!contentTitle?.trim()) {
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
            }
            setIsNullAnswers(false);
            setContentRandomized(undefined);
            setIsPreviewQuestion(true);
            const randomId =
              listQuestionsRandomized[Math.floor(Math.random() * listQuestionsRandomized.length)];
            mutateGetContentRandomizedById(randomId);
          }}
        >
          Preview
        </ButtonCustom>

        <ButtonCustom
          color="orange"
          onClick={() => {
            handleSaveQuestion();
          }}
          isLoading={isLoading}
        >
          Save
        </ButtonCustom>
      </div>
    </div>
  );
});
RandomizedComponent.displayName = 'RandomizedComponent';
export default RandomizedComponent;
