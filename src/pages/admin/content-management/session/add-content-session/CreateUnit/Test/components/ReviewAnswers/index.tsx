import { Checkbox, Modal, notification, Tag } from 'antd';
import { getContentDetail } from 'api/content_management';
import ButtonCustom from 'components/Button';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useMutation } from 'react-query';
import { IContent, QuestionType } from '../../../..';
import DragAndDropModalPreview from '../../../PreviewModalComponent/DragAndDrop';
import FillTheGapModalPreview from '../../../PreviewModalComponent/FillTheGap';
import FreeTextModalPreview from '../../../PreviewModalComponent/FreeText';
import OrderingModalPreview from '../../../PreviewModalComponent/Ordering';
import QuestionMultipleChoiceModalPreview from '../../../PreviewModalComponent/QuestionMultipleChoice';
import RandomizedModalPreview from '../../../PreviewModalComponent/Randomized';
import { IUnitOptions } from '../../TestConstantsAndInterface';
import ReviewDragAndDrop from './ReviewDragAndDrop';
import ReviewFillTheGap from './ReviewFillTheGap';
import ReviewFreeText from './ReviewFreeText';
import ReviewMultipleChoice from './ReviewMultipleChoice';
import ReviewOrdering from './ReviewOrdering';

interface IProps {
    listTestOptions: IUnitOptions;
    listContentsAnswered: any[];
}

export interface IContentAnswered extends IContent {
    result: boolean;
    savedAnswers: any;
    studentAnswers: any;
    correctAnswers: any;
}

const ReviewAnswers = (props: IProps) => {

    const {
        listTestOptions,
        listContentsAnswered,
    } = props;

    const [listContents, setListContents] = useState<IContentAnswered[]>([]);
    console.log("listContents", listContents)
    useEffect(() => {
        if (listContentsAnswered && listContentsAnswered.length > 0) {
            if (listTestOptions && listTestOptions.hideQuestionsAnsweredCorrectly) {
                const temp = listContentsAnswered.filter(x => !x.result);
                setListContents(temp);
            }
            else {
                setListContents(listContentsAnswered);
            }
        }
        else {
            setListContents([]);
        }
    }, [listTestOptions, listContentsAnswered]);

    const renderDetailAnswers = (item: IContentAnswered) => {
        switch (item.questionType) {
            case QuestionType.FREE_TEXT:
                return (
                    <ReviewFreeText
                        content={item}
                        listTestOptions={listTestOptions}
                    />
                );
            case QuestionType.MULTIPLE_CHOICE:
                return (
                    <ReviewMultipleChoice
                        content={item}
                        listTestOptions={listTestOptions}
                    />
                );
            case QuestionType.FILL_THE_GAP:
                return (
                    <ReviewFillTheGap
                        content={item}
                        listTestOptions={listTestOptions}
                    />
                );
            case QuestionType.ORDERING:
                return (
                    <ReviewOrdering
                        content={item}
                        listTestOptions={listTestOptions}
                    />
                );
            case QuestionType.DRAG_DROP:
                return (
                    <ReviewDragAndDrop
                        content={item}
                        listTestOptions={listTestOptions}
                    />
                );
            default:
                return (
                    <>
                        {listTestOptions.showGivenAnswers && (
                            <>
                                <p className='text-base underline underline-offset-2'>Your answer:</p>
                                {/* {x.studentAnswers || ''} */}
                                <div className="" dangerouslySetInnerHTML={{ __html: item.studentAnswers || '' }}></div>
                            </>
                        )}
                        {listTestOptions.showCorrectAnswers && (
                            <>
                                <p className='text-base underline underline-offset-2'>Correct answer:</p>
                                {/* {x.correctAnswers || ''} */}
                                <div className="" dangerouslySetInnerHTML={{ __html: item.correctAnswers || '' }}></div>
                            </>
                        )}
                    </>
                );
        }
    }

    return (
        <div className="test-preview__list-label w-full mt-6 mb-6">
            {listContents.map((x, index) => (
                <div className="label-answer" key={index}>
                    <hr className="tl-questions-separator" />
                    {
                        listTestOptions.showCorrectOrIncorrectLabels && (
                            <p>
                                {x.result ? (
                                    <Tag color="#00c853">CORRECT</Tag>
                                ) : (
                                    <Tag color="#ef5350">INCORRECT</Tag>
                                )}
                            </p>
                        )
                    }
                    <p className='font-bold text-base'>{x.contentTitle?.replace(/<[^>]+>/g, '').replaceAll('&nbsp;', " ") || `Question ${index}`}</p>
                    {renderDetailAnswers(x)}
                </div>
            ))}
        </div>
    );
}

export default ReviewAnswers;