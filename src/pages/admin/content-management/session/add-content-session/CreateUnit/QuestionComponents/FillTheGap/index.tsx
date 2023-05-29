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
    setIsPreviewQuestion: (value: boolean) => void,
    setIsOpenQuestion: (value: boolean) => void,
    handleSaveQuestion: () => void,
}

const FillTheGapComponent = (props: IProps) => {

    const {
        form,
        contentTitle,
        setContentTitle,
        setIsPreviewQuestion,
        setIsOpenQuestion,
        handleSaveQuestion,
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
                Fill the gap
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
                            const matchedPattern = contentTitle.match(/(?:\[)[^\][]*(?=])/g) ? contentTitle.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1)) : null;
                            if (!matchedPattern) {
                                return Promise.reject('You must specify at least two possible answers!');
                            }
                            if (matchedPattern?.length <= 1) {
                                let checkAnswer = false;
                                for (let i = 0; i < matchedPattern.length; i++) {
                                    if (matchedPattern[i].split("|").filter(x => x !== '').length > 1) {
                                        checkAnswer = true;
                                        return;
                                    }
                                }
                                if (!checkAnswer) {
                                    return Promise.reject('You must specify at least two possible answers!');
                                }
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

            <div className="fill-the-gap-notes mb-6">
                Note: Compose the question and use [brackets] for the possible answers. For example, The quick brown [fox] jumps over the lazy [dog].
                <br />
                OR
                <br />
                The [biggest|bigger] planet of our solar system is [jupiter|neptune|earth]. When you use | to offer multiple answers the first should be the correct one.
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
                        const matchedPattern = contentTitle.match(/(?:\[)[^\][]*(?=])/g) ? contentTitle.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1)) : null;
                        if (!matchedPattern) {
                            form.setFields([
                                {
                                    name: 'contentTitle',
                                    errors: ['You must specify at least two possible answers!'],
                                },
                            ]);
                            return;
                        }
                        console.log("matchedPattern", matchedPattern.length)
                        if (matchedPattern?.length <= 1) {
                            let checkAnswer = false;
                            for (let i = 0; i < matchedPattern.length; i++) {
                                if (matchedPattern[i].split("|").filter(x => x !== '').length > 1) {
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

                        form.setFields([
                            {
                                name: 'contentTitle',
                                errors: undefined,
                            },
                        ]);
                        setIsPreviewQuestion(true);
                    }
                }>
                    Preview
                </ButtonCustom>

                <ButtonCustom
                    color="orange"
                    onClick={() => {
                        handleSaveQuestion()
                    }}
                >
                    Save
                </ButtonCustom>
            </div>
        </div>
    );
}

export default FillTheGapComponent;