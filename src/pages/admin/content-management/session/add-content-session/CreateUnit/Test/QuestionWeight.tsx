import { Form, Input, notification, Select, Table } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import CustomTooltip from 'components/Tooltip';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useMutation } from 'react-query';
import { getQuestionsNotRandomized, getQuestionsTest } from 'api/content_management';
import { ColumnsType } from 'antd/lib/table';
import { IUnitContent } from '.';

interface IProps {
    listQuestionsAdded: IUnitContent[],
    setListQuestionsAdded: (value: any) => void,
    handleBack: () => void,
}

const QuestionWeight = (props: IProps) => {

    const {
        listQuestionsAdded,
        setListQuestionsAdded,
        handleBack,
    } = props;

    const [listDnDContents, setListDnDContents] = useState<IUnitContent[]>([]);console.log('listDnDContents', listDnDContents)
    const [totalPoints, setTotalPoints] = useState<number>(0);

    const { mutate: mutateGetAllQuestions } = useMutation('getAllQuestions', getQuestionsTest, {
        onSuccess: ({ data }: { data: { records: any[]; total: number; page: number; limit: number } }) => {
            const newOptions = listQuestionsAdded?.map((item, index) => {
                console.log(item, 'item')
                return ({
                    ...(data?.records?.find(x => x.id && item.contentID && x.id === item.contentID) || {}),
                    ...item,
                    order: index + 1,
                })
            });
            setListDnDContents(newOptions);
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

    const handleChangePoints = useCallback((contentID: number, points: number) => {
        const temp = [...listDnDContents];
        const findOneIndex = temp.findIndex(x => x.contentID === contentID);
        console.log("findOneIndex", findOneIndex)
        if (findOneIndex >= 0) {
            temp[findOneIndex].points = points;
            setListDnDContents(temp);
        }
    }, [listDnDContents])

    const handleSaveReorder = useCallback(() => {
        const temp = [...listDnDContents].map((content, index) => {
            return {
                contentID: content.contentID,
                id: content.id || undefined,
                points: content.points,
                unitID: content.unitID || undefined,
                order: index + 1,
            }
        });
        setListQuestionsAdded(temp);
        handleBack();
    }, [listDnDContents, listQuestionsAdded])

    const handleCancel = () => {
        handleBack();
    }

    useEffect(() => {
        if (listQuestionsAdded?.length > 0) {
            mutateGetAllQuestions({
                filters: JSON.stringify([
                    Object.fromEntries(
                        Object.entries({
                            sessionID: -1,
                            randomizedIds: listQuestionsAdded?.map(x => x.contentID) || []
                        }).filter(([, v]) => (v as any)?.toString() !== ''),
                    ),
                ]),
                limit: 999,
            });
        }
        else {
            setListDnDContents([]);
        }
    }, [listQuestionsAdded]);

    useEffect(() => {
        let total = 0;
        for (let i=0; i<listDnDContents.length; i++) {
            total += (listDnDContents[i].points || 1);
        }
        setTotalPoints(total);
    }, [listDnDContents])

    const columns: ColumnsType<any> = [
        {
            title: 'Question',
            dataIndex: 'contentTitle',
            key: 'contentTitle',
            align: 'center',
            render: (text: any) => {
                return (
                    <span className='randomized-column-content-title'>
                        {text?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', " ")}
                    </span>
                )
            },
        },
        {
            title: 'Points',
            key: 'percentPoints',
            align: 'center',
            width: 300,
            render: (text: any, record: IUnitContent) => {
                return (
                    <span className='randomized-column-content-title'>
                        <Select
                            className='w-full'
                            value={record.points || 1}
                            onChange={(value) => handleChangePoints(record.contentID, value)}
                        >
                            <Select.Option key={1} value={1}>1</Select.Option>
                            <Select.Option key={2} value={2}>2</Select.Option>
                            <Select.Option key={3} value={3}>3</Select.Option>
                            <Select.Option key={4} value={4}>4</Select.Option>
                            <Select.Option key={5} value={5}>5</Select.Option>
                            <Select.Option key={6} value={6}>6</Select.Option>
                        </Select>
                    </span>
                )
            },
        },
        {
            title: '%',
            key: 'percentPoints',
            align: 'center',
            width: 300,
            render: (text: any, record: any) => {
                return (
                    <span className='randomized-column-content-title'>
                        {(record?.points / totalPoints * 100).toFixed(2)}
                    </span>
                )
            },
        },
    ];

    return (
        <div className="flex gap-x-3 flex-col">
            <div className="mb-6">
                <Table
                    columns={columns}
                    dataSource={listDnDContents}
                    pagination={false}
                    rowKey='id'
                />
            </div>
            <div className="flex gap-x-3 justify-end">
                <ButtonCustom
                    onClick={handleCancel}
                >
                    Cancel
                </ButtonCustom>
                <ButtonCustom
                    color="orange"
                    onClick={handleSaveReorder}
                >
                    Save
                </ButtonCustom>
            </div>
        </div>
    );
}

export default QuestionWeight;