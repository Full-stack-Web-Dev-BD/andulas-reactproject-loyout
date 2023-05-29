import { Breadcrumb, Checkbox, Form, Input, Layout, Menu, message, Modal, notification, Select } from 'antd';
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
import { EDITOR_CONFIG, KeyFormChangeData, PARAMS_SELECT_SEARCH, ROUTES, TEXT_SELECT_SEARCH } from 'constants/constants';
import DropDownCustom from 'pages/admin/content-management/component/DropDown';
import CustomInput from 'components/Input';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import CustomTooltip from 'components/Tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionById } from 'api/session';
import { useMutation } from 'react-query';
import { createNewContent, createNewUnit, deleteContentById, getAllQuestions, getContentDetail, updateContentById } from 'api/content_management';
import { ISession, ITag, IUnit, LIST_QUESTION_OPTIONS, QuestionType, UnitType } from '../../..';
import SelectSearch from 'components/SelectSearch';
import { createSessionTag, searchSessionTags } from 'api/session_tag';
import moment from 'moment';
import { RuleObject } from 'antd/lib/form';

interface IProps {
    form: any,
    contentTitle: string,
    setContentTitle: (value: string) => void,
    listAnswers: any[],
    handleChangeTitle: (index: number, e: any) => void,
    handleChangeValueAnswer: (index: number, e: any) => void,
    handleDeleteAnswer: (value: number) => void,
    isNullAnswers: boolean,
    handleAddAnswer: (value?: any) => void,
    setIsPreviewQuestion: (value: boolean) => void,
    setIsOpenQuestion: (value: boolean) => void,
    setIsNullAnswers: (value: boolean) => void,
    handleSaveQuestion: () => void,
    isLoading: boolean,
}

const DragAndDropComponent = (props: IProps) => {

    const {
        form,
        contentTitle,
        setContentTitle,
        listAnswers,
        handleChangeTitle,
        handleChangeValueAnswer,
        handleDeleteAnswer,
        isNullAnswers,
        handleAddAnswer,
        setIsPreviewQuestion,
        setIsOpenQuestion,
        setIsNullAnswers,
        handleSaveQuestion,
        isLoading,
    } = props;

    const timeout: any = useRef(null);

    // Tag
    const [sessionTagOptions, setSessionTagOptions] = useState<
        { label: string; value: string; isDisabled?: boolean }[]
    >([]);
    const [sessionTagValue, setSessionTagValue] = useState('');
    const [isClearSearchingSession, setIsClearSearchingSession] = useState(false);
    const contentTagIDs = Form.useWatch('contentTagIDs', form);

    const { mutate: createNewSessionTag } = useMutation('createSessionTag', createSessionTag, {
        onSuccess: ({ data }: { data: { id: number; tagName: string } }) => {
            setSessionTagOptions([
                ...sessionTagOptions,
                { label: data.tagName, value: data.id.toString(), isDisabled: false },
            ]);
            form.setFieldsValue({
                contentTagIDs: contentTagIDs
                    ? [
                        ...contentTagIDs,
                        { label: data.tagName, value: data.id.toString(), isDisabled: false },
                    ]
                    : [{ label: data.tagName, value: data.id.toString(), isDisabled: false }],
            });
            setIsClearSearchingSession(true);
            setSessionTagValue('');
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

    const { mutate: getSessionTags } = useMutation('searchSessionTags', searchSessionTags, {
        onSuccess: ({ data }: { data: { records: ITag[] } }) => {
            if (data?.records?.length > 0) {
                const newOptions = data.records
                    .map((el) => {
                        return { label: el.tagName.toString(), value: el.id.toString(), isDisabled: false };
                    })
                    .concat([{ label: 'Type to search for more tag', value: '', isDisabled: true }]);
                setSessionTagOptions(newOptions);
                return;
            }
            setSessionTagOptions([]);
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

    const handleSearchSessionTags = useCallback(
        (value: string) => {
            setSessionTagValue(value);
            clearTimeout(timeout?.current);
            timeout.current = setTimeout(() => {
                getSessionTags({ ...PARAMS_SELECT_SEARCH.sessionTag, search: value });
                setIsClearSearchingSession(false);
            }, 500);
        },
        [timeout],
    );

    const handleCreateSessionTag = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (
                event.key === KeyFormChangeData.ENTER &&
                !sessionTagOptions?.some((session) => session.label === sessionTagValue) &&
                sessionTagValue
            ) {
                createNewSessionTag({ tagName: sessionTagValue });
            }
        },
        [sessionTagOptions, sessionTagValue, createNewSessionTag],
    );

    useEffect(() => {
        getSessionTags(PARAMS_SELECT_SEARCH.sessionTag);
    }, [])

    return (
        <div>
            <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">
                Drag and drop
            </p>
            <Form.Item
                className={'w-full'}
                key={'editor'}
                validateFirst
                name={'contentTitle'}
                rules={[
                    { required: true, message: 'Content is required!' },
                    {
                        validator(_: RuleObject, value: string) {
                            if (contentTitle?.trim() === "") {
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

            <p className="text-sm font-fontFamily mb-6 mt-6">
                Note: Add possible answers in the correct order. We&apos;ll present them randomly for the end-user.
            </p>

            <div className="multiple-choose__list-answer">
                {
                    listAnswers.length > 0 && listAnswers.map((answer, index) => {
                        return (
                            <div className="multiple-choose__list-answer__answer-item flex items-center justify-between mb-4" key={index}>
                                <Input
                                    className='multiple-choose__list-answer__answer-item__title'
                                    onChange={(e) => handleChangeTitle(index, e)}
                                    placeholder={`Pair ${index + 1}`}
                                    value={answer.title}
                                />
                                <svg
                                    width="58"
                                    height="24"
                                    viewBox="0 0 58 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{
                                        margin: "0 10px"
                                    }}
                                >
                                    <path
                                        d="M57.0607 13.0607C57.6464 12.4749 57.6464 11.5251 57.0607 10.9393L47.5147 1.3934C46.9289 0.807611 45.9792 0.807611 45.3934 1.3934C44.8076 1.97919 44.8076 2.92893 45.3934 3.51472L53.8787 12L45.3934 20.4853C44.8076 21.0711 44.8076 22.0208 45.3934 22.6066C45.9792 23.1924 46.9289 23.1924 47.5147 22.6066L57.0607 13.0607ZM0 13.5H56V10.5H0V13.5Z"
                                        fill="black"
                                    />
                                </svg>
                                <Input
                                    className='multiple-choose__list-answer__answer-item__title'
                                    onChange={(e) => handleChangeValueAnswer(index, e)}
                                    placeholder={`Pair ${index + 1}`}
                                    value={answer.value}
                                />
                                <div
                                    className="cursor-pointer ml-5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <CustomTooltip title="Delete">
                                        <TrashSVG className="icon-hover" onClick={() => handleDeleteAnswer(index)} />
                                    </CustomTooltip>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            {
                isNullAnswers && (
                    <p className='text-[#ff4d4f] text-sm'>Please specify at least two possible pairs!</p>
                )
            }

            <div className="multiple-choose__add-answer">
                <ButtonCustom color="outline" onClick={handleAddAnswer}>
                    Add Answer
                </ButtonCustom>
            </div>


            <p className='mt-3 mb-2 text-sm font-fontFamily text-[#6E6B68]'>
                Select Tag
            </p>

            <Form.Item
                className={'w-full'}
                validateFirst
                name={'contentTagIDs'}
            >
                <SelectSearch
                    handleSearchOptions={handleSearchSessionTags}
                    options={sessionTagOptions}
                    // className={errorSelect(field.name) ? 'field-error' : ''}
                    // onChange={field.onChange}
                    isMultiple={true}
                    isClearSearchValue={isClearSearchingSession}
                    onKeyPress={handleCreateSessionTag}
                    disable={false}
                />
            </Form.Item>

            <div className="flex gap-x-3 justify-end">
                <ButtonCustom color="outline" onClick={
                    () => {
                        setIsOpenQuestion(false);
                    }
                }>
                    Cancel
                </ButtonCustom>

                <ButtonCustom onClick={
                    () => {
                        if (!contentTitle) {
                            form.setFields([
                                {
                                    name: 'contentTitle',
                                    errors: ["Content is required!"],
                                },
                            ]);
                            return;
                        }

                        form.setFields([
                            {
                                name: 'contentTitle',
                                errors: undefined,
                            },
                        ]);
                        if (listAnswers.length === 0) {
                            setIsNullAnswers(true);
                            return;
                        }
                        else if (listAnswers.filter((answer) => answer.title.trim() && answer.value.trim()).length < 2) {
                            setIsNullAnswers(true);
                            return;
                        }
                        else {
                            setIsNullAnswers(false);
                            setIsPreviewQuestion(true);
                        }
                    }
                }>
                    Preview
                </ButtonCustom>

                <ButtonCustom
                    color="orange"
                    onClick={() => {
                        handleSaveQuestion()
                    }}
                    isLoading={isLoading}
                >
                    Save
                </ButtonCustom>
            </div>
        </div>
    );
}

export default DragAndDropComponent;