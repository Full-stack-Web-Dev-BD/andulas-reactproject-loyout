import { Checkbox, Form, Input, Tabs, TabsProps } from 'antd';
import { RuleObject } from 'antd/lib/form';
import TextArea from 'antd/lib/input/TextArea';
import ButtonCustom from 'components/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { IUnitOptions } from './TestConstantsAndInterface';

interface IProps {
    // listTestOptions: IUnitContent[],
    form: any,
    setListQuestionsAdded: (value: any) => void,
    handleBack: () => void,
    listTestOptions: IUnitOptions,
    setListTestOptions: (value: any) => void,
}

const TestOptions = (props: IProps) => {

    const {
        handleBack,
        form,
        listTestOptions,
        setListTestOptions,
    } = props;

    const [isMaximumAttemps, setIsMaximumAttemps] = useState<boolean>(false);
    const [isAllowRepeatTest, setIsAllowRepeatTest] = useState<boolean>(false);
    const [isShowTestScoreAndIfPass, setIsShowTestScoreAndIfPass] = useState<boolean>(false);
    const [isRequirePassword, setIsRequirePassword] = useState<boolean>(false);
    const [isShowCorrectAnswers, setIsShowCorrectAnswers] = useState<boolean>(false);
    const [isShowGivenAnswers, setIsShowGivenAnswers] = useState<boolean>(false);

    const [description, setDescription] = useState<string>('');
    const [messageIfPass, setMessageIfPass] = useState<string>('');
    const [messageIfNotPass, setMessageIfNotPass] = useState<string>('');

    const handleCancel = () => {
        handleBack();
    }

    const onFinish = useCallback(() => {
        form.validateFields().then((data: any) => {
            const values = form.getFieldsValue();

            if (!values.allowMovementQuestions) {
                values.allowMovementQuestions = false;
            }

            if (!values.allowRepeatTest) {
                values.allowRepeatTest = false;
            }

            if (!values.anbandonImmediatelyWheneverCantPass) {
                values.anbandonImmediatelyWheneverCantPass = false;
            }

            if (!values.checkNotContinueUntilCorrectAnswer) {
                values.checkNotContinueUntilCorrectAnswer = false;
            }

            if (!values.hideQuestionsAnsweredCorrectly) {
                values.hideQuestionsAnsweredCorrectly = false;
            }

            if (!values.limitAnswerFeedback) {
                values.limitAnswerFeedback = false;
            }

            if (!values.maximumAttemps || !values.allowRepeatTest) {
                values.maximumAttemps = false;
            }

            if (!values.requirePasswordToStart || !values.password || values.password === '') {
                values.requirePasswordToStart = false;
            }

            if (!values.requireSnapshotToStart) {
                values.requireSnapshotToStart = false;
            }

            if (!values.showCorrectAnswers) {
                values.showCorrectAnswers = false;
            }

            if (!values.showCorrectOrIncorrectLabels || (!values.showCorrectAnswers && !values.showGivenAnswers)) {
                values.showCorrectOrIncorrectLabels = false;
            }

            if (!values.showGivenAnswers) {
                values.showGivenAnswers = false;
            }

            if (!values.showStatsAfterCompletion) {
                values.showStatsAfterCompletion = false;
            }

            if (!values.showStatsAfterCompletion) {
                values.showStatsAfterCompletion = false;
            }

            if (!values.showTestScoreAndIfPass) {
                values.showTestScoreAndIfPass = false;
            }

            if (!values.shufflePossibleAnswers) {
                values.shufflePossibleAnswers = false;
            }

            if (!values.shuffleQuestions) {
                values.shuffleQuestions = false;
            }

            values.duration = values.duration ? (Number(values.duration)) : 0;

            values.passScore = values.passScore ? (Number(values.passScore)) : 0;

            values.numberOfMaximumAttemps = values.maximumAttemps && values.allowRepeatTest && values.numberOfMaximumAttemps ? (Number(values.numberOfMaximumAttemps)) : 0;

            values.passwords = values.requirePasswordToStart ? values.passwords : '';

            values.description = description;
            values.messageIfPass = messageIfPass;
            values.messageIfNotPass = messageIfNotPass;
            console.log("onfinish", values)

            setListTestOptions({
                ...listTestOptions,
                ...values,
            });
            handleBack();
        })
    }, [
        form,
        description,
        messageIfPass,
        messageIfNotPass,
        listTestOptions,
    ]);

    useEffect(() => {
        if (listTestOptions) {
            setDescription(listTestOptions.description || '');
            setMessageIfPass(listTestOptions.messageIfPass || '');
            setMessageIfNotPass(listTestOptions.messageIfNotPass || '');
            if (listTestOptions.maximumAttemps) {
                setIsMaximumAttemps(true);
            }

            if (listTestOptions.allowRepeatTest) {
                setIsAllowRepeatTest(true);
            }

            if (listTestOptions.showTestScoreAndIfPass) {
                setIsShowTestScoreAndIfPass(true);
            }

            if (listTestOptions.requirePasswordToStart) {
                setIsRequirePassword(true);
            }
            if (listTestOptions.showCorrectAnswers || listTestOptions.showGivenAnswers) {
                setIsShowCorrectAnswers(true);
            }
            if (listTestOptions.showGivenAnswers) {
                setIsShowGivenAnswers(true);
            }
            const unitName = form.getFieldValue('unitName');
            form.setFieldsValue({
                ...listTestOptions,
                duration: listTestOptions.duration == 0 ? undefined : listTestOptions.duration,
                passScore: listTestOptions.passScore == 0 ? undefined : listTestOptions.passScore,
                numberOfMaximumAttemps: listTestOptions.numberOfMaximumAttemps == 0 ? undefined : listTestOptions.numberOfMaximumAttemps,
                unitName: unitName || undefined,
            });
        }
        else {
            const unitName = form.getFieldValue('unitName');
            form.resetFields();
            form.setFieldValue("unitName", unitName || undefined);
        }
    }, [listTestOptions, form])

    return (
        <div className="flex gap-x-3 flex-col test-options">
            <div
            >

                <div className="flex gap-4">
                    <Form.Item
                        name={'duration'}
                        label={<span className='text-sm font-fontFamily'>Duration</span>}
                        rules={[
                            {
                                validator(_: RuleObject, value: string) {
                                    if (value === undefined || value.toString().trim() === "") {
                                        return Promise.resolve();
                                    }
                                    if (typeof value === 'string' && !value?.trim().match(/^\+?(0|[1-9]\d*)$/)) {
                                        return Promise.reject("This is not a valid duration!");
                                    }
                                    if (value.toString().trim() === "0") {
                                        return Promise.reject("This is not a valid duration!");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input type='number' />
                    </Form.Item>
                    <span className='relative top-1 text-sm font-fontFamily'>
                        minutes
                    </span>
                </div>

                <div className="flex gap-4">
                    <Form.Item
                        name={'passScore'}
                        label={<span className='text-sm font-fontFamily'>Pass Score</span>}
                        rules={[
                            {
                                validator(_: RuleObject, value: string) {
                                    if (value === undefined || value.toString().trim() === "") {
                                        return Promise.resolve();
                                    }
                                    // if (typeof value === 'string' && !value?.trim().match(/^\+?(0|[1-9]\d*)$/)) {
                                    //     return Promise.reject("This is not a valid pass score!");
                                    // }
                                    if (typeof value === 'string' && !value?.trim().match(/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/)) {
                                        return Promise.reject("This is not a valid pass score!");
                                    }
                                    if (value.toString().trim() === "0") {
                                        return Promise.reject("This is not a valid pass score!");
                                    }
                                    if (value && Number(value) > 100) {
                                        return Promise.reject("This is not a valid pass score!");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input type='number' addonAfter="%" />
                    </Form.Item>
                </div>

                <p className='text-sm font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2'>
                    Shuffle Options
                </p>

                <div className="radio-container">
                    <Form.Item name={'shuffleQuestions'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox'>Shuffle questions</Checkbox>
                    </Form.Item>

                    <Form.Item name={'shufflePossibleAnswers'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox'>Shuffle possible answers</Checkbox>
                    </Form.Item>
                </div>

                <p className='text-sm font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2'>
                    Repeat
                </p>

                <div className="radio-container">
                    <Form.Item name={'allowRepeatTest'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox' onChange={(e) => setIsAllowRepeatTest(e.target.checked)}>Allow student to repeat test</Checkbox>
                    </Form.Item>

                    {isAllowRepeatTest && (
                        <div className="flex pl-6">
                            <Form.Item name={'maximumAttemps'} valuePropName="checked">
                                <Checkbox className='text-sm test-options__checkbox' onChange={(e) => setIsMaximumAttemps(e.target.checked)}>maximum number of attempts</Checkbox>
                            </Form.Item>
                            {isMaximumAttemps && (
                                <Form.Item
                                    name={'numberOfMaximumAttemps'}
                                    rules={[
                                        {
                                            validator(_: RuleObject, value: string) {
                                                if (value === undefined || value.toString().trim() === "") {
                                                    return Promise.resolve();
                                                }
                                                if (typeof value === 'string' && !value?.trim().match(/^\+?(0|[1-9]\d*)$/)) {
                                                    return Promise.reject("This is not a valid number of attemps!");
                                                }
                                                if (value.toString().trim() === "0") {
                                                    return Promise.reject("This is not a valid number of attemps!");
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <Input type='number' className='w-[88px]' />
                                </Form.Item>
                            )}
                        </div>
                    )}
                </div>

                <p className='text-sm font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2'>
                    Completion
                </p>

                <div className="radio-container">
                    <Form.Item name={'showCorrectAnswers'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox' onChange={(e) => setIsShowCorrectAnswers(e.target.checked)}>Show correct answers</Checkbox>
                    </Form.Item>

                    <Form.Item name={'showGivenAnswers'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox' onChange={(e) => setIsShowGivenAnswers(e.target.checked)}>Show given answers</Checkbox>
                    </Form.Item>

                    {(isShowCorrectAnswers || isShowGivenAnswers) && (
                        <Form.Item name={'showCorrectOrIncorrectLabels'} valuePropName="checked">
                            <Checkbox className='text-sm test-options__checkbox'>Show correct / incorrect labels</Checkbox>
                        </Form.Item>
                    )}

                    <Form.Item name={'showTestScoreAndIfPass'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox' onChange={(e) => setIsShowTestScoreAndIfPass(e.target.checked)}>Show test score and passed or not passed</Checkbox>
                    </Form.Item>

                    {isShowTestScoreAndIfPass && (
                        <div className='pl-6'>
                            <Form.Item name={'showStatsAfterCompletion'} valuePropName="checked">
                                <Checkbox className='text-sm test-options__checkbox'>Show stats after completion</Checkbox>
                            </Form.Item>

                            <Form.Item name={'hideQuestionsAnsweredCorrectly'} valuePropName="checked">
                                <Checkbox className='text-sm test-options__checkbox'>Hide questions answered correctly</Checkbox>
                            </Form.Item>

                            <Form.Item name={'limitAnswerFeedback'} valuePropName="checked">
                                <Checkbox className='text-sm test-options__checkbox'>Limit answer feedback</Checkbox>
                            </Form.Item>
                        </div>
                    )}
                </div>

                <p className='text-sm font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2'>
                    Behaviour
                </p>

                <div className="radio-container">
                    <Form.Item name={'allowMovementQuestions'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox'>Allow movement to the next / previous question</Checkbox>
                    </Form.Item>

                    <Form.Item name={'checkNotContinueUntilCorrectAnswer'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox'>Check answers and do not continue until the correct answer is chosen</Checkbox>
                    </Form.Item>

                    <Form.Item name={'anbandonImmediatelyWheneverCantPass'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox'>Abandon immediately whenever cannot pass</Checkbox>
                    </Form.Item>
                </div>

                <p className='text-sm font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2'>
                    Security
                </p>

                <div className="radio-container">
                    <Form.Item name={'requireSnapshotToStart'} valuePropName="checked">
                        <Checkbox className='text-sm test-options__checkbox'>Require learner snapshot to start the test</Checkbox>
                    </Form.Item>

                    <div className="flex display-none">
                        <Form.Item name={'requirePasswordToStart'} valuePropName="checked">
                            <Checkbox className='text-sm test-options__checkbox' onChange={(e) => setIsRequirePassword(e.target.checked)}>Require password to start the test</Checkbox>
                        </Form.Item>
                        {isRequirePassword && (
                            <Form.Item
                                name={'password'}
                            >
                                <Input placeholder="Try to avoid simple passwords" maxLength={30} className={'w-[320px]'} />
                            </Form.Item>
                        )}
                    </div>
                </div>

                <Tabs type="card" className='mb-4'>
                    <Tabs.TabPane tab={<span className='text-sm font-fontFamily font-bold'>Description</span>} key="description">
                        <TextArea maxLength={500} className='min-h-[100px] text-sm font-fontFamily' value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<span className='text-sm font-fontFamily font-bold'>Message (if passed)</span>} key="messageifpassed">
                        <TextArea maxLength={500} className='min-h-[100px] text-sm font-fontFamily' value={messageIfPass} onChange={(e) => setMessageIfPass(e.target.value)} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<span className='text-sm font-fontFamily font-bold'>Message (if not passed)</span>} key="messageifnotpassed">
                        <TextArea maxLength={500} className='min-h-[100px] text-sm font-fontFamily' value={messageIfNotPass} onChange={(e) => setMessageIfNotPass(e.target.value)} />
                    </Tabs.TabPane>
                </Tabs>
            </div>

            <div className="flex gap-x-3 justify-end">
                <ButtonCustom
                    onClick={handleCancel}
                >
                    Cancel
                </ButtonCustom>
                <ButtonCustom
                    color="orange"
                    onClick={onFinish}
                >
                    Save
                </ButtonCustom>
            </div>
        </div>
    );
}

export default TestOptions;