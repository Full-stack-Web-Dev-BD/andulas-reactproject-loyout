import { Checkbox, Modal, notification } from 'antd';
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

interface IProps {
    setIsPreviewQuestion: (value: boolean) => void,
    setIsPreviewQuestionInside: (value: boolean) => void,
    isPreviewQuestion: boolean,
    isPreviewQuestionInside: boolean,
    sessionData: any,
    unitName: string,
    questionType: QuestionType,
    form: any,
    contentData: IContent,
    setContentData: (value?: any) => void,
    title?: string,
    urlContent?: string,
}

const GeneralModalPreview = (props: IProps) => {

    const {
        setIsPreviewQuestion,
        setIsPreviewQuestionInside,
        isPreviewQuestion,
        isPreviewQuestionInside,
        sessionData,
        unitName,
        questionType,
        form,
        contentData,
        setContentData,
        title,
        urlContent,
    } = props;

    const [randomizedContent, setRandomizedContent] = useState<IContent>();

    const { mutate: mutateGetContentRandomizedById } = useMutation('getContentRandomized', getContentDetail, {
        onSuccess: ({ data }: any) => {
            const temp = { ...data };
            const parseAnswers = temp.answers?.sort((a: any, b: any) => {
                if (
                    a.createdAt
                    && b.createdAt
                ) {
                    const momenta = moment(a.createdAt);
                    const momentb = moment(b.createdAt);
                    return momenta.diff(momentb);
                }
                else if (!a.createdAt && b.createdAt) return 1;

                else if (a.createdAt && !b.createdAt) return -1;

                else return 0;
            }).map((x: any) => {
                return {
                    isCorrect: x.isCorrect,
                    title: x.answerTitle || x.answerValue,
                    value: x.answerValue,
                    id: x.id || undefined,
                    contentID: x.contentID || undefined,
                    order: x.order,
                    isContain: x.isContain || false,
                    point: x.point || 0,
                }
            })
            temp.answers = parseAnswers;
            setRandomizedContent(temp);
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

    useEffect(() => {

        return () => {
            setContentData(undefined);
        }
    }, [])
    
    useEffect(() => {
        if (questionType === QuestionType.RANDOMIZED && contentData.randomized && contentData.randomized.length > 0) {
            console.log("contentData", contentData)
            const arrayIds = contentData.randomized.map((x) => x.id)
            const randomId = arrayIds[Math.floor(Math.random() * arrayIds.length)]
            mutateGetContentRandomizedById(randomId);
        }
        else if (questionType === QuestionType.RANDOMIZED && contentData.randomized && contentData.randomized.length === 0) {
            notification.error({ message: 'This randomized content does not have any questions' });
            setRandomizedContent(undefined);
        }
        else {
            setRandomizedContent(undefined);
        }
    }, [questionType, contentData])
    
    switch (questionType) {
        case QuestionType.MULTIPLE_CHOICE:
            return (
                <QuestionMultipleChoiceModalPreview
                    contentTitle={contentData.contentTitle || ''}
                    isPreviewQuestion={isPreviewQuestion}
                    isPreviewQuestionInside={isPreviewQuestionInside}
                    listAnswers={contentData.answers || []}
                    setIsPreviewQuestion={setIsPreviewQuestion}
                    setIsPreviewQuestionInside={setIsPreviewQuestionInside}
                    sessionData={sessionData}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.FILL_THE_GAP:
            return (
                <FillTheGapModalPreview
                    contentTitle={contentData.contentTitle || ''}
                    isPreviewQuestion={isPreviewQuestion}
                    isPreviewQuestionInside={isPreviewQuestionInside}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewQuestion}
                    setIsPreviewQuestionInside={setIsPreviewQuestionInside}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.ORDERING:
            return (
                <OrderingModalPreview
                    contentTitle={contentData.contentTitle || ''}
                    isPreviewQuestion={isPreviewQuestion}
                    isPreviewQuestionInside={isPreviewQuestionInside}
                    listAnswers={contentData.answers?.filter((answer: any) => answer.title.trim() && answer.value.trim()).map((answer: any, index: number) => {
                        return {
                            ...answer,
                            order: index + 1,
                        }
                    }) || []}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewQuestion}
                    setIsPreviewQuestionInside={setIsPreviewQuestionInside}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.DRAG_DROP:
            return (
                <DragAndDropModalPreview
                    contentTitle={contentData.contentTitle || ''}
                    isPreviewQuestion={isPreviewQuestion}
                    isPreviewQuestionInside={isPreviewQuestionInside}
                    listAnswers={contentData.answers?.map((answer: any, index: number) => {
                        return {
                            ...answer,
                            order: index + 1,
                        }
                    }) || []}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewQuestion}
                    setIsPreviewQuestionInside={setIsPreviewQuestionInside}
                    unitName={unitName}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.FREE_TEXT:
            return (
                <FreeTextModalPreview
                    contentTitle={contentData.contentTitle || ''}
                    isPreviewQuestion={isPreviewQuestion}
                    isPreviewQuestionInside={isPreviewQuestionInside}
                    listAnswers={contentData.answers || []}
                    sessionData={sessionData}
                    setIsPreviewQuestion={setIsPreviewQuestion}
                    setIsPreviewQuestionInside={setIsPreviewQuestionInside}
                    unitName={unitName}
                    contentData={contentData}
                    form={form}
                    urlContent={urlContent}
                    title={title}
                />
            );
        case QuestionType.RANDOMIZED:
            if (randomizedContent && randomizedContent?.questionType) {
                return (
                    <RandomizedModalPreview 
                        contentData={randomizedContent}
                        setContentData={setContentData}
                        form={form}
                        isPreviewRandomized={isPreviewQuestion}
                        isPreviewRandomizedInside={isPreviewQuestionInside}
                        questionType={randomizedContent?.questionType}
                        sessionData={sessionData}
                        setIsPreviewRandomized={setIsPreviewQuestion}
                        setIsPreviewRandomizedInside={setIsPreviewQuestionInside}
                        unitName={unitName}
                    />
                );
            }
            else {
                return <></>;
            }
        default:
            return (
                <></>
            );
    }
}

export default GeneralModalPreview;