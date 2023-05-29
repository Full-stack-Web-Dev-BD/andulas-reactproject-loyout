import { Button, notification } from 'antd';
import { getFileUrlNotExpire, UnitType } from 'api/content_management';
import { IUnit } from 'pages/admin/content-management/session/add-content-session';
import { IUnitOptions } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface IProps {
  content: any;
  handleClickContinue: (value: boolean) => void;
  handleClickBack?: (value: boolean) => void;
  unit?: IUnit;
  isSpecialContent?: boolean;
  // shufflePossibleAnswers?: boolean;
  listTestOptions?: IUnitOptions;
  pagination?: {
    currentIndex: number;
    totalIndex: number;
  };
  isTest?: boolean;
  handleClickLastSubmitAnswer?: (value: boolean) => void;
}

const MyCoursePreviewCheckbox = (props: IProps) => {
  const {
    content,
    handleClickContinue,
    handleClickBack,
    unit,
    isSpecialContent,
    // shufflePossibleAnswers,
    listTestOptions,
    pagination,
    isTest,
    handleClickLastSubmitAnswer,
  } = props;

  const history = useNavigate();

  const [isUploadedFile, setIsUploadedFile] = useState<boolean>(false);
  const [urlContent, setUrlContent] = useState<string>('');

    const { mutate: mutateGetFileUrl } = useMutation('getFileUrl', getFileUrlNotExpire, {
        onSuccess: ({ data }: { data: { fileUrl: string } }) => {
            // console.log("data filepath", data)
            if (unit?.unitType === UnitType.CONTENT) {
                setUrlContent(`<img style='width: 100%' height="500" src='${data?.fileUrl || ''}' />`)
            }
            else if (unit?.unitType === UnitType.VIDEO) {
                setUrlContent(`<video playsinline style='width: 100%' height="500" controls src='${data?.fileUrl || ''}'>Your browser does not support this video.</video>`)
            }
            else if (unit?.unitType === UnitType.AUDIO) {
                setUrlContent(`<audio style='width: 100%' controls src='${data?.fileUrl || ''}'>Your browser does not support this audio.</audio>`)
            }
            else if (unit?.unitType === UnitType.DOCUMENT) {
                const url = data.fileUrl?.split('?')[0] || '';
                if (url.includes('.pdf')) {
                    setUrlContent(`<iframe style='width: 100%' src='${data.fileUrl?.split('?')[0] || ''}' height='623px'></iframe>`)
                }
                else {
                    setUrlContent(`<iframe style='width: 100%' src='https://view.officeapps.live.com/op/embed.aspx?src=${data.fileUrl?.split('?')[0] || ''}' height='623px'></iframe>`)
                }
            }
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

  useEffect(() => {
    if (isSpecialContent && unit) {
      if (unit.isUploadedFile && unit.filePath) {
        setIsUploadedFile(true);
        mutateGetFileUrl(unit.filePath);
      } else {
        setIsUploadedFile(false);
        setUrlContent('');
      }
    }
    return () => {
      setIsUploadedFile(false);
      setUrlContent('');
    };
  }, [unit]);

  return (
    <>
      <div className="w-full bg-white border-solid border-transparent rounded-2xl min-height-60vh p-8 course-preview-container relative flex">
        <div className="preview-checkbox flex flex-col justify-center items-center h-full w-full text-base m-auto">
          {isSpecialContent && (
            <>
              <div className="w-full text-2xl font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2">
                {unit?.unitType || ''}
              </div>
              <div
                className="w-full"
                dangerouslySetInnerHTML={{
                  __html: isUploadedFile ? urlContent || '' : unit?.urlContent || '',
                }}
              ></div>
            </>
          )}
          <div
            className="w-full text-center"
            dangerouslySetInnerHTML={{ __html: content?.contentTitle }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between">
        {pagination && (
          <div className="preview-pagination text-xl">
            {pagination.currentIndex} / {pagination.totalIndex}
          </div>
        )}
        <div className="flex justify-end items-center gap-3 flex-auto">
          <Button
            className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width text-[#32302D]"
            onClick={() => history(-1)}
          >
            Exit
          </Button>
          {handleClickBack && (
            <Button
              className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width bg-[#ED7635] text-[#FFFFFF]"
              onClick={() => handleClickBack(true)}
            >
              Back
            </Button>
          )}
          <Button
            className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width bg-[#ED7635] text-[#FFFFFF]"
            onClick={() => handleClickContinue(true)}
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
};

export default MyCoursePreviewCheckbox;
