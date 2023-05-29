import { Button, Checkbox, Modal, notification } from 'antd';
import ButtonCustom from 'components/Button';
import { IContent, IUnit, QuestionType, UnitType } from 'pages/admin/content-management/session/add-content-session';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useMutation } from 'react-query';
import { getContentDetail } from 'api/content_management';
import MyCourseFreeTextPreview from '../FreeText';
import MyCourseDragAndDropPreview from '../DragAndDrop';
import MyCourseOrderingPreview from '../Ordering';
import MyCourseFillTheGapPreview from '../FillTheGap';
import MyCourseMultipleChoicePreview from '../MultipleChoice';
import Loading from 'components/Loading';
import { IUnitOptions } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';

interface IProps {
    content: IContent;
    unit?: IUnit;
    handleClickContinue: (value: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any, isSubmitedAnswer?: boolean) => void;
    handleClickBack?: (value: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any) => void;
    isSpecialContent?: boolean;
    isUploadedFile?: boolean;
    urlContent?: string;
    // shufflePossibleAnswers?: boolean;
    listTestOptions?: IUnitOptions;
    pagination?: {
        currentIndex: number,
        totalIndex: number,
    };
    isTest?: boolean;
    handleClickLastSubmitAnswer?: (value: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any, isSubmitedAnswer?: boolean) => void;
}

const MyCourseRandomizedPreview = (props: IProps) => {

    const {
        content,
        unit,
        handleClickContinue,
        handleClickBack,
        isSpecialContent,
        isUploadedFile,
        urlContent,
        // shufflePossibleAnswers,
        listTestOptions,
        pagination,
        isTest,
        handleClickLastSubmitAnswer,
    } = props;

    const history = useNavigate();

    const [randomizedContent, setRandomizedContent] = useState<IContent>();

    const { mutate: mutateGetContentById } = useMutation('getContentDetail', getContentDetail, {
        onSuccess: ({ data }: any) => {
            if (unit?.unitType !== UnitType.TEST) {
                if (content.isCompleted) {
                    data.isCompleted = true
                }
                if (content.isPassed) {
                    data.isPassed = true
                }
                if (content.savedAnswers) {
                    data.isPassed = content.savedAnswers
                }
            }
            setRandomizedContent(data);
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

    useEffect(() => {
        if (content?.randomized && content.randomized.length > 0) {
            const randomId = content?.randomized[Math.floor(Math.random() * content?.randomized.length)]?.id;
            if (randomId) {
                mutateGetContentById(Number(randomId));
            }
            else {
                setRandomizedContent(undefined);
            }
        }
        else {
            setRandomizedContent(undefined);
        }
    }, [content])

    if (randomizedContent) {
        switch (randomizedContent?.questionType) {
            case QuestionType.MULTIPLE_CHOICE:
                return (
                    <MyCourseMultipleChoicePreview
                        content={randomizedContent}
                        unit={unit}
                        handleClickContinue={handleClickContinue}
                        handleClickBack={handleClickBack}
                        isSpecialContent={isSpecialContent}
                        isUploadedFile={isUploadedFile}
                        urlContent={urlContent}
                        // shufflePossibleAnswers={shufflePossibleAnswers}
                        listTestOptions={listTestOptions}
                        pagination={pagination}
                        isTest={isTest}
                        handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
                    />
                )
            case QuestionType.FILL_THE_GAP:
                return (
                    <MyCourseFillTheGapPreview
                        content={randomizedContent}
                        unit={unit}
                        handleClickContinue={handleClickContinue}
                        handleClickBack={handleClickBack}
                        isSpecialContent={isSpecialContent}
                        isUploadedFile={isUploadedFile}
                        urlContent={urlContent}
                        // shufflePossibleAnswers={shufflePossibleAnswers}
                        listTestOptions={listTestOptions}
                        pagination={pagination}
                        isTest={isTest}
                        handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
                    />
                )
            case QuestionType.ORDERING:
                return (
                    <MyCourseOrderingPreview
                        content={randomizedContent}
                        unit={unit}
                        handleClickContinue={handleClickContinue}
                        handleClickBack={handleClickBack}
                        isSpecialContent={isSpecialContent}
                        isUploadedFile={isUploadedFile}
                        urlContent={urlContent}
                        // shufflePossibleAnswers={shufflePossibleAnswers}
                        listTestOptions={listTestOptions}
                        pagination={pagination}
                        isTest={isTest}
                        handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
                    />
                )
            case QuestionType.DRAG_DROP:
                return (
                    <MyCourseDragAndDropPreview
                        content={randomizedContent}
                        unit={unit}
                        handleClickContinue={handleClickContinue}
                        handleClickBack={handleClickBack}
                        isSpecialContent={isSpecialContent}
                        isUploadedFile={isUploadedFile}
                        urlContent={urlContent}
                        // shufflePossibleAnswers={shufflePossibleAnswers}
                        listTestOptions={listTestOptions}
                        pagination={pagination}
                        isTest={isTest}
                        handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
                    />
                )
            case QuestionType.FREE_TEXT:
                return (
                    <MyCourseFreeTextPreview
                        content={randomizedContent}
                        unit={unit}
                        handleClickContinue={handleClickContinue}
                        handleClickBack={handleClickBack}
                        isSpecialContent={isSpecialContent}
                        isUploadedFile={isUploadedFile}
                        urlContent={urlContent}
                        // shufflePossibleAnswers={shufflePossibleAnswers}
                        listTestOptions={listTestOptions}
                        pagination={pagination}
                        isTest={isTest}
                        handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
                    />
                )
            default:
                return (
                    <>
                        <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                            <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                                <div className="text-center">
                                    <div>Class content</div>
                                    <div>Video / Quic / Short answers / presentation etc</div>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-end items-center gap-3'>
                            <Button className='w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]' onClick={() => history(-1)}>Exit</Button>
                            {handleClickBack && (
                                <Button className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]" onClick={() => handleClickBack(true)}>
                                    Back
                                </Button>
                            )}
                            <Button className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]" onClick={() => handleClickContinue(true)}>
                                Continue
                            </Button>
                        </div>
                    </>
                )
        }
    }
    else {
        return (
            // <>
            //     <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
            //         <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
            //             <div className="text-center">
            //                 <div>Class content</div>
            //                 <div>Video / Quic / Short answers / presentation etc</div>
            //             </div>
            //         </div>
            //     </div>
            //     <div className='flex justify-end items-center gap-3'>
            //         <Button className='w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]' onClick={() => history(-1)}>Exit</Button>
            //         {handleClickBack && (
            //             <Button className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]" onClick={handleClickBack}>
            //                 Back
            //             </Button>
            //         )}
            //         <Button className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]" onClick={handleClickContinue}>
            //             Continue
            //         </Button>
            //     </div>
            // </>
            <div className="w-full rounded-2xl h-[60vh]">
                <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                        <Loading />
                    </div>
                </div>
            </div>
        )
    }
}

export default MyCourseRandomizedPreview;