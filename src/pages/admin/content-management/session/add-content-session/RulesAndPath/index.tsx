import { Form, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import React, { useEffect, useState } from 'react';
import { ISession } from '..';
import { CalculateScoreByAverageOf, CourseCompletedWhen, LearningPath, ShowUnits } from './constant';

interface IRulesAndPath {
    showUnits?: ShowUnits;
    courseCompleteWhen?: CourseCompletedWhen;
    calculateScoreByAverageOf?: CalculateScoreByAverageOf;
    learningPath?: LearningPath;
}

interface IProps {
    onSubmitRulesAndPath: (data: IRulesAndPath) => void;
    setActiveTab: (values: number) => void;
    sessionData: ISession
}

export const OPTIONS = {
    showUnits: [
        {
            label: ShowUnits.ANY_ORDER,
            value: ShowUnits.ANY_ORDER,
        },
        {
            label: ShowUnits.SEQUENTIAL_ORDER,
            value: ShowUnits.SEQUENTIAL_ORDER,
        }
    ],
    courseCompleteWhen: [
        {
            label: CourseCompletedWhen.ALL_UNITS_COMPLETED,
            value: CourseCompletedWhen.ALL_UNITS_COMPLETED,
        },
        {
            label: CourseCompletedWhen.PERCENTAGE_UNITS_COMPLETED,
            value: CourseCompletedWhen.PERCENTAGE_UNITS_COMPLETED,
        },
        {
            label: CourseCompletedWhen.SELECTED_UNITS_COMPLETED,
            value: CourseCompletedWhen.SELECTED_UNITS_COMPLETED,
        }
        ,
        {
            label: CourseCompletedWhen.SELECTED_TEST_COMPLETED,
            value: CourseCompletedWhen.SELECTED_TEST_COMPLETED,
        }
    ],
    calculateScoreByAverageOf: [
        {
            label: CalculateScoreByAverageOf.ALL_TESTS_ASSIGNMENTS,
            value: CalculateScoreByAverageOf.ALL_TESTS_ASSIGNMENTS,
        },
        {
            label: CalculateScoreByAverageOf.TESTS_ONLY,
            value: CalculateScoreByAverageOf.TESTS_ONLY,
        },
        {
            label: CalculateScoreByAverageOf.UNITS_CHOOSE,
            value: CalculateScoreByAverageOf.UNITS_CHOOSE,
        }
    ],
    learningPath: [
        {
            label: LearningPath.DIPLOMA_PENGAJIAN_ISLAM_ONLINE,
            value: LearningPath.DIPLOMA_PENGAJIAN_ISLAM_ONLINE,
        },
        {
            label: LearningPath.AQIDAH1,
            value: LearningPath.AQIDAH1,
        },
        {
            label: LearningPath.AQIDAH2,
            value: LearningPath.AQIDAH2,
        },
        {
            label: LearningPath.FARAIDH,
            value: LearningPath.FARAIDH,
        },
        {
            label: LearningPath.MAQASID_SYARIAH,
            value: LearningPath.MAQASID_SYARIAH,
        },
        {
            label: LearningPath.SEJARAH_PENDIDIKAN_ISLAM_1,
            value: LearningPath.SEJARAH_PENDIDIKAN_ISLAM_1,
        },
        {
            label: LearningPath.SEJARAH_PENDIDIKAN_ISLAM,
            value: LearningPath.SEJARAH_PENDIDIKAN_ISLAM,
        }
    ],
}

const RulesAndPath = (props: IProps) => {

    const { sessionData, onSubmitRulesAndPath, setActiveTab } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        if (sessionData) {
            form.setFieldsValue(sessionData);
        }
    }, [sessionData]);

    const handleBack = () => {
        setActiveTab(0);
    };

    const onFinish = (values: IRulesAndPath) => {
        const dataRulesAndPath = {...values};
        if (!dataRulesAndPath.showUnits) {
            dataRulesAndPath.showUnits = OPTIONS.showUnits[0].value
        }
        if (!dataRulesAndPath.courseCompleteWhen) {
            dataRulesAndPath.courseCompleteWhen = OPTIONS.courseCompleteWhen[0].value
        }
        if (!dataRulesAndPath.calculateScoreByAverageOf) {
            dataRulesAndPath.calculateScoreByAverageOf = OPTIONS.calculateScoreByAverageOf[0].value
        }
        if (!dataRulesAndPath.learningPath) {
            dataRulesAndPath.learningPath = OPTIONS.learningPath[0].value
        }
        onSubmitRulesAndPath(values);
    }

    return (
        <Content className="rounded-3xl bg-white p-8" title="Rules and Path">
            <div className="flex gap-x-3">
                <Form
                    layout="vertical"
                    className="flex flex-wrap gap-x-4 flex-[62%]"
                    form={form}
                    onFinish={onFinish}
                >
                    <Form.Item
                        className='w-full sm:w-full lg:w-[49%] w-49'
                        key='showUnits'
                        validateFirst
                        name='showUnits'
                        label='Show Units'
                    >
                        <Select
                            getPopupContainer={(node) => node}
                            options={OPTIONS.showUnits as (BaseOptionType | DefaultOptionType)[]}
                            defaultValue={OPTIONS.showUnits[0]}
                        />
                    </Form.Item>

                    <Form.Item
                        className='w-full sm:w-full lg:w-[49%] w-49'
                        key='courseCompleteWhen'
                        validateFirst
                        name='courseCompleteWhen'
                        label='Course is completed when'
                    >
                        <Select
                            getPopupContainer={(node) => node}
                            options={OPTIONS.courseCompleteWhen as (BaseOptionType | DefaultOptionType)[]}
                            defaultValue={OPTIONS.courseCompleteWhen[0]}
                        />
                    </Form.Item>

                    <Form.Item
                        className='w-full sm:w-full lg:w-[49%] w-49'
                        key='calculateScoreByAverageOf'
                        validateFirst
                        name='calculateScoreByAverageOf'
                        label='Calculate score by average of'
                    >
                        <Select
                            getPopupContainer={(node) => node}
                            options={OPTIONS.calculateScoreByAverageOf as (BaseOptionType | DefaultOptionType)[]}
                            defaultValue={OPTIONS.calculateScoreByAverageOf[0]}
                        />
                    </Form.Item>

                    <Form.Item
                        className='w-full sm:w-full lg:w-[49%] w-49'
                        key='learningPath'
                        validateFirst
                        name='learningPath'
                        label='Learning path'
                    >
                        <Select
                            getPopupContainer={(node) => node}
                            options={OPTIONS.learningPath as (BaseOptionType | DefaultOptionType)[]}
                            defaultValue={OPTIONS.learningPath[0]}
                        />
                    </Form.Item>
                </Form>
            </div>
            <div className="flex gap-x-3 justify-end">
                <ButtonCustom color="outline" onClick={handleBack}>
                    Cancel
                </ButtonCustom>

                <ButtonCustom
                    color="orange"
                    onClick={() => {
                        // setIsOpenConfirmLeave(false);
                        form.validateFields().then(() => {
                            form.submit();
                        });
                    }}
                >
                    Save
                </ButtonCustom>
            </div>
        </Content>
    );
}

export default RulesAndPath;