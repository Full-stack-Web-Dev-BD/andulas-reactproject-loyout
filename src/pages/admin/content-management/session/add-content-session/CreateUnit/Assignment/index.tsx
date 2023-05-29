import { Breadcrumb, Checkbox, Form, Input, Layout, Menu, Modal, notification, Select } from 'antd';
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
import { createNewContent, createNewUnit, getUnitById, updateAnswers } from 'api/content_management';
import { AssignmentType, ISession, ITag, IUnit, QuestionType, UnitType } from '../../index';
import SelectSearch from 'components/SelectSearch';
import { createSessionTag, searchSessionTags } from 'api/session_tag';
import moment from 'moment';
import { RuleObject } from 'antd/lib/form';

interface ANSWER {
    isCorrect: boolean,
    title: string,
    value: string,
}

interface IProps {
    sessionData: ISession;
    selectedUnit: any;
    handleAddOrEditUnit: (values: any) => void;
    handleCancelAddOrEditUnit: () => void;
}

const CreateUnitWithAssignment = (props: IProps) => {

    const {
        sessionData,
        selectedUnit,
        handleAddOrEditUnit,
        handleCancelAddOrEditUnit,
    } = props;

    const history = useNavigate();

    const timeout: any = useRef(null);

    const [form] = Form.useForm();

    const unitName = Form.useWatch('unitName', form);

    const [contentData, setContentData] = useState<any>(undefined);
    const [selectedAssignmentType, setSelectedAssignmentType] = useState<AssignmentType>(AssignmentType.TEACHER_ACCEPTS_ANSWER);
    const [contentTitle, setContentTitle] = useState<string>('');

    // Modal preview
    const [isPreviewCheckbox, setIsPreviewCheckbox] = useState<boolean>(false);

    const handleSelectUnit = useCallback((values: AssignmentType) => {
        setSelectedAssignmentType(values);
    }, [contentData]);

    const onFinish = (values: any) => {
        console.log("Assignment", values)
        const dataPush: IUnit = {
            sessionID: sessionData?.id || undefined,
            unitType: UnitType.ASSIGNMENT,
            unitName: values.unitName.trim(),
            isUploadedFile: false,
            filePath: "",
            isDisabled: false,
            content: [
                {
                    contentTitle: contentTitle,
                    contentType: undefined,
                    assignmentType: selectedAssignmentType,
                    unitID: Number(selectedUnit?.id) || undefined,
                    questionType: undefined,
                    isUploadedFile: false,
                }
            ],
            order: selectedUnit?.order || undefined,
            id: selectedUnit?.id || undefined,
        }
        // mutateCreateUnitWithContent(dataPush);
        handleAddOrEditUnit(dataPush);
    }

    useEffect(() => {
        if (selectedUnit) {
            form.setFieldsValue(selectedUnit);
            if (selectedUnit.content && selectedUnit.content[0]) {
                form.setFieldValue('contentTitle', selectedUnit.content[0].content);
                setContentTitle(selectedUnit.content[0].contentTitle);
                setSelectedAssignmentType(selectedUnit.content[0].assignmentType)
            }
        }
    }, [selectedUnit]);

    const handleSubmit = useCallback(() => {
        form.validateFields().then((data) => {
            if (!contentTitle) {
                form.setFields([
                    {
                        name: 'contentTitle',
                        errors: ["Content is required!"],
                    },
                ]);
                return;
            }
            form.submit();
        });
    }, [form, contentTitle]);

    const LIST_UNIT_OPTIONS = [
        {
            label: 'When teacher accepts the answer',
            value: AssignmentType.TEACHER_ACCEPTS_ANSWER,
        },
        {
            label: 'When uploading an answer',
            value: AssignmentType.UPLOADING_ANSWER,
        },
    ];

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
                    label={
                        <span className='flex align-center'>Unit Name</span>
                    }
                    rules={[
                        { required: true, message: 'Unit Name is required!' },
                        {
                            validator(_: RuleObject, value: string) {
                                if (value?.trim() === "") {
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
                    <div className="flex justify-between items-center gap-6">
                        {
                            LIST_UNIT_OPTIONS.map((item, index) => {
                                return (
                                    <div
                                        className={`cm-add-content assignment-type flex justify-between flex-col items-center cursor-pointer ${item.value === selectedAssignmentType ? "selected" : ""}`}
                                        key={index}
                                        onClick={() => handleSelectUnit(item.value)}
                                    >
                                        <p className="text-lg font-fontFamily font-semibold mb-0 custom-font-content-management text-center">
                                            {item.label}
                                        </p>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <Form.Item
                        className={'w-full mt-6'}
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

                    <div className="flex gap-x-3 justify-end">
                        <ButtonCustom color="outline" onClick={() => {
                            handleCancelAddOrEditUnit()
                        }}>
                            Cancel
                        </ButtonCustom>

                        <ButtonCustom color="outline" onClick={
                            () => {
                                form.validateFields()
                                    .then(() => {
                                        setIsPreviewCheckbox(true);
                                    })
                            }
                        }>
                            Preview
                        </ButtonCustom>

                        <ButtonCustom
                            color="orange"
                            onClick={() => {
                                // setIsOpenConfirmLeave(false);
                                handleSubmit()
                            }}
                        >
                            Save
                        </ButtonCustom>
                    </div>
                </Content>
            </Form>

            <Modal
                centered
                className='content-management__custom-modal'
                title={`${sessionData?.sessionName} - ${unitName}`}
                onCancel={() => {
                    setIsPreviewCheckbox(false);
                }}
                footer={[
                    <ButtonCustom
                        key={""}
                        color="orange"
                        onClick={() => {
                            setIsPreviewCheckbox(false);
                        }}
                        className='text-white'
                    >
                        Continue
                    </ButtonCustom>,
                ]}
                cancelText="Cancel"
                visible={isPreviewCheckbox}
            >
                <div className="container checkbox">
                    <span className='text-base text-[#6E6B68]' dangerouslySetInnerHTML={{ __html: contentTitle || 'Just text content that was filled up in previous page with a completed / continue button below' }}>

                    </span>
                </div>
            </Modal>
        </div>
    )
};

export default CreateUnitWithAssignment;
