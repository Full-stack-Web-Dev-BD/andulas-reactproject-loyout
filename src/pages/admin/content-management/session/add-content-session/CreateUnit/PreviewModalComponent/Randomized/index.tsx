import { Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { QuestionType } from '../../..';
import DragAndDropModalPreview from '../DragAndDrop';
import FillTheGapModalPreview from '../FillTheGap';
import FreeTextModalPreview from '../FreeText';
import OrderingModalPreview from '../Ordering';
import QuestionMultipleChoiceModalPreview from '../QuestionMultipleChoice';

interface IProps {
    setIsPreviewRandomized: (value: boolean) => void,
    setIsPreviewRandomizedInside: (value: boolean) => void,
    isPreviewRandomized: boolean,
    isPreviewRandomizedInside: boolean,
    sessionData: any,
    unitName: string,
    questionType: QuestionType,
    form: any,
    contentData: any,
    setContentData: (value?: any) => void,
    title?: string,
    urlContent?: string,
}

const RandomizedModalPreview = (props: IProps) => {

    const {
        setIsPreviewRandomized,
        setIsPreviewRandomizedInside,
        isPreviewRandomized,
        isPreviewRandomizedInside,
        sessionData,
        unitName,
        questionType,
        form,
        contentData,
        setContentData,
        title,
        urlContent,
    } = props;

    useEffect(() => {

        return () => {
            setContentData(undefined);
        }
    }, [])

    switch (questionType) {
        case QuestionType.MULTIPLE_CHOICE:
            return (
                <QuestionMultipleChoiceModalPreview
                    contentTitle={contentData.contentTitle}
                    isPreviewQuestion={isPreviewRandomized}
                    isPreviewQuestionInside={isPreviewRandomizedInside}
                    listAnswers={contentData.answers || []}
                    setIsPreviewQuestion={setIsPreviewRandomized}
                    setIsPreviewQuestionInside={setIsPreviewRandomizedInside}
                    sessionData={sessionData}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.FILL_THE_GAP:
            return (
                <FillTheGapModalPreview
                    contentTitle={contentData.contentTitle}
                    isPreviewQuestion={isPreviewRandomized}
                    isPreviewQuestionInside={isPreviewRandomizedInside}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewRandomized}
                    setIsPreviewQuestionInside={setIsPreviewRandomizedInside}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.ORDERING:
            return (
                <OrderingModalPreview
                    contentTitle={contentData.contentTitle}
                    isPreviewQuestion={isPreviewRandomized}
                    isPreviewQuestionInside={isPreviewRandomizedInside}
                    listAnswers={contentData.answers?.filter((answer: any) => answer.title.trim() && answer.value.trim()).map((answer: any, index: number) => {
                        return {
                            ...answer,
                            order: index + 1,
                        }
                    }) || []}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewRandomized}
                    setIsPreviewQuestionInside={setIsPreviewRandomizedInside}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.DRAG_DROP:
            return (
                <DragAndDropModalPreview
                    contentTitle={contentData.contentTitle}
                    isPreviewQuestion={isPreviewRandomized}
                    isPreviewQuestionInside={isPreviewRandomizedInside}
                    listAnswers={contentData.answers?.map((answer: any, index: number) => {
                        return {
                            ...answer,
                            order: index + 1,
                        }
                    }) || []}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewRandomized}
                    setIsPreviewQuestionInside={setIsPreviewRandomizedInside}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.FREE_TEXT:
            return (
                <FreeTextModalPreview
                    contentTitle={contentData.contentTitle}
                    isPreviewQuestion={isPreviewRandomized}
                    isPreviewQuestionInside={isPreviewRandomizedInside}
                    listAnswers={contentData.answers || []}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewRandomized}
                    setIsPreviewQuestionInside={setIsPreviewRandomizedInside}
                    unitName={unitName}
                    contentData={contentData}
                    form={form}
                    urlContent={urlContent}
                    title={title}
                />
            );
        default:
            return (
                <></>
            );
    }
}

export default RandomizedModalPreview;