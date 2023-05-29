import { Form, Input, notification, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import CustomTooltip from 'components/Tooltip';
import React, { useCallback, useEffect, useState } from 'react';

import { ReactComponent as ContentSVG } from 'assets/icons/content_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as BlockSVG } from 'assets/icons/block_icon.svg';
import { ReactComponent as PenNoteSVG } from 'assets/icons/pen_note_icon.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as CheckedSVG } from 'assets/icons/checked_icon.svg';
import { ReactComponent as CloseSVG } from 'assets/icons/x-icon.svg';
import { ReactComponent as LinkSVG } from 'assets/icons/link.svg';
import { ReactComponent as OutlineCheckedSVG } from 'assets/icons/outline_checked_icon.svg';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useMutation } from 'react-query';
import { getQuestionsNotRandomized, getQuestionsTest } from 'api/content_management';
import { IUnitContent } from '.';
import { IUnitOptions } from './TestConstantsAndInterface';

interface IProps {
    listQuestionsAdded: IUnitContent[];
    setListQuestionsAdded: (value: any) => void;
    handleBack: () => void;
    listTestOptions: IUnitOptions;
}

const QuestionOrder = (props: IProps) => {

    const {
        listQuestionsAdded,
        setListQuestionsAdded,
        handleBack,
        listTestOptions,
    } = props;

    const [listDnDContents, setListDnDContents] = useState<any[]>([]);
    console.log("listDnDContents", listDnDContents)

    const { mutate: mutateGetAllQuestions } = useMutation('getAllQuestions', getQuestionsTest, {
        onSuccess: ({ data }: { data: { records: any[]; total: number; page: number; limit: number } }) => {
            const newOptions = listQuestionsAdded?.map((item, index) => {
                console.log(item, 'item', data)
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

    const onDragEnd = (result: any) => {
        const newItems = Array.from(listDnDContents);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        setListDnDContents(newItems);
    };

    const handleCancel = () => {
        handleBack();
    }

    const handleSaveReorder = useCallback(() => {
        const temp: IUnitContent[] = [...listDnDContents].map((content, index) => {
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

    return (
        <div className="flex gap-x-3 flex-col">
            {listTestOptions && listTestOptions.shuffleQuestions ? (
                <p className='text-center text-base font-bold bg-[#FAF9F9] border border-solid border-[#E9E6E5] rounded-2xl py-4 px-6'>
                    You have selected to shuffle the order of questions
                </p>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                        {
                            (provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} style={{ height: `${60 * (listDnDContents?.length || 0)}px` }}>
                                    {listDnDContents.map((unit, index) => (
                                        <Draggable key={unit.order} draggableId={unit.order?.toString()} index={index}>
                                            {(providedIn) => {
                                                return (
                                                    <div
                                                        className=""
                                                        ref={providedIn.innerRef}
                                                        {...providedIn.draggableProps}
                                                        {...providedIn.dragHandleProps}
                                                    >
                                                        <div
                                                            className={`question-order-item w-full relative flex items-center gap-2 mb-4 bg-white`}
                                                        >
                                                            <div
                                                                className="question-order-title"
                                                            >
                                                                {unit.contentTitle?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', " ") || '...'}
                                                            </div>
                                                            <div
                                                                className="drag-item-layer"
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "0",
                                                                    bottom: "0",
                                                                    left: "0",
                                                                    right: "0",
                                                                    zIndex: "1"
                                                                }}
                                                            >

                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )
                        }
                    </Droppable >
                </DragDropContext >
            )}
            <div className="flex gap-x-3 justify-end">
                {!(listTestOptions && listTestOptions.shuffleQuestions) && listQuestionsAdded && listQuestionsAdded.length > 0 && (
                    <ButtonCustom
                        onClick={handleCancel}
                    >
                        Cancel
                    </ButtonCustom>
                )}
                <ButtonCustom
                    color="orange"
                    onClick={!(listTestOptions && listTestOptions.shuffleQuestions) ? handleSaveReorder : handleCancel}
                >
                    Save
                </ButtonCustom>
            </div>
        </div >
    );
}

export default QuestionOrder;