import { notification, UploadProps } from 'antd';
import Upload, { RcFile, UploadFile as UploadFileProp } from 'antd/lib/upload';
import Dragger from 'antd/lib/upload/Dragger';
import { ReactComponent as UploadIcon } from 'assets/icons/upload.svg';
import ButtonCustom from 'components/Button';
import { config } from 'config';
import { ERROR_MESSAGE, TYPES_DOCUMENT_UPLOAD, TYPES_IMAGE_UPLOAD } from 'constants/index';
import { useCallback, useState } from 'react';

const MAX_SIZE = 1048576;

interface IProps {
  title?: string;
  buttonTitle?: string;
  maximumSize?: number;
  disabled?: boolean;
  isUploadMultipleFile?: boolean;
  getFilePath?: (fileUrl: { filePath: string; fileUrl?: string }) => void;
  defaultFileList?: UploadFileProp<any>[];
  sizeWidth?: number;
  sizeHeight?: number;
  // imageOnly?: boolean;
  isButton?: boolean;
  customClassNameText?: string;
  type?: 'image' | 'video' | 'audio' | 'document' | 'media';
  onRemove?: (file: any) => void;
}

const UploadFileCustom = (props: IProps) => {
  const {
    disabled,
    isUploadMultipleFile,
    getFilePath,
    defaultFileList,
    sizeWidth,
    sizeHeight,
    title,
    buttonTitle,
    maximumSize,
    // imageOnly,
    isButton,
    customClassNameText,
    type,
    onRemove,
  } = props;

  const [token, setToken] = useState<string>(
    sessionStorage.getItem('token') || localStorage.getItem('token') || '',
  );

  const onBeforeUpload = useCallback(
    (file: RcFile) => {
      if (maximumSize) {
        if (file?.size > maximumSize * MAX_SIZE) {
          notification.error({ message: ERROR_MESSAGE.LIMIT_SIZE });
          return Upload.LIST_IGNORE;
        }
      }

      if (type) {
        if (
          type === 'image' &&
          file &&
          !(TYPES_IMAGE_UPLOAD.includes(file?.type) || ['application/pdf'].includes(file?.type))
        ) {
          notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE_IMAGE_PDF_ONLY });
          return Upload.LIST_IGNORE;
        } else if (
          type === 'video' &&
          file &&
          !(file.type.includes('flv') || file.type.includes('ogg') || file.type.includes('video'))
        ) {
          notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE_VIDEO_ONLY });
          return Upload.LIST_IGNORE;
        } else if (
          type === 'audio' &&
          file &&
          !(file.type.includes('audio') || file.type.includes('mpeg') || file.type.includes('webm'))
        ) {
          notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE_AUDIO_ONLY });
          return Upload.LIST_IGNORE;
        } else if (type === 'document' && file && !TYPES_DOCUMENT_UPLOAD.includes(file?.type)) {
          notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE_DOCUMENT_ONLY });
          return Upload.LIST_IGNORE;
        }
      }

      // notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE });
      // return Upload.LIST_IGNORE;
    },
    [maximumSize, type],
  );

  const onChange: UploadProps['onChange'] = ({ fileList }) => {
    if (isUploadMultipleFile) {
      return;
    }
    if (getFilePath instanceof Function) {
      getFilePath(fileList[0]?.response?.data);
    }
  };

  const propsUpload: UploadProps = {
    name: 'file',
    method: 'post',
    action: `${config.BASE_URL}/api/upload-file`,
    headers: {
      authorization: `Bearer ${JSON.parse(token)}`,
    },
    maxCount: 1,
  };

  return (
    <>
      {!isButton ? (
        <div className="flex justify-center items-center rounded-xl bg-[#F4F4F4] text-center box-upload">
          <Dragger
            onChange={onChange}
            beforeUpload={onBeforeUpload}
            disabled={disabled}
            className="py-12"
            {...propsUpload}
            defaultFileList={defaultFileList}
            onRemove={onRemove ? onRemove : () => {}}
          >
            {title ? (
              <>
                <p className="mb-2">{title}</p>
                <p className="mb-2">Or</p>
              </>
            ) : (
              <></>
            )}
            <ButtonCustom
              className="m-auto min-button"
              color="outline"
              icon={<UploadIcon className="icon-button mr-2" />}
            >
              {`${buttonTitle ? buttonTitle : 'Upload'}`}
            </ButtonCustom>
          </Dragger>
        </div>
      ) : (
        <Upload
          onChange={onChange}
          beforeUpload={onBeforeUpload}
          disabled={disabled}
          className="py-12"
          {...propsUpload}
          defaultFileList={defaultFileList}
          onRemove={onRemove ? onRemove : () => {}}
        >
          <ButtonCustom
            color="outline"
            className="m-auto min-button"
            icon={<UploadIcon className="icon-button mr-2" />}
          >
            {`${buttonTitle ? buttonTitle : 'Upload'}`}
          </ButtonCustom>
        </Upload>
      )}

      {/* {
        sizeHeight || sizeWidth || maximumSize
          ?
          (
            <div className="font-fontFamily text-[#6E6B68] italic mt-2">
              {
                sizeHeight || sizeWidth
                ?
                (`Recommended size: ${sizeWidth ? sizeWidth : 'XX'} x ${sizeHeight ? sizeHeight : 'XX'} px{' '}`)
                : ""
              }
              <br />
              { maximumSize ? `(maximum ${maximumSize}MB)` : ""}
            </div>
          )
          :
          ""
      } */}
    </>
  );
};

export default UploadFileCustom;
