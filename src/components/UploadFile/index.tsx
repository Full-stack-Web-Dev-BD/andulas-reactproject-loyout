import { notification, UploadProps } from 'antd';
import Upload, { RcFile, UploadFile as UploadFileProp } from 'antd/lib/upload';
import Dragger from 'antd/lib/upload/Dragger';
import { ReactComponent as UploadIcon } from 'assets/icons/upload.svg';
import ButtonCustom from 'components/Button';
import { config } from 'config';
import { ERROR_MESSAGE, TYPES_IMAGE_UPLOAD } from 'constants/index';

const MAX_SIZE = 1048576;

const propsUpload: UploadProps = {
  name: 'file',
  method: 'post',
  action: `${config.BASE_URL}/api/upload-image`,
  headers: {
    authorization: 'authorization-text',
  },
  maxCount: 1,
};

interface IProps {
  disabled?: boolean;
  isUploadMultipleFile?: boolean;
  getFilePath?: (fileUrl: { filePath: string; fileUrl?: string }) => void;
  defaultFileList?: UploadFileProp<any>[];
  sizeWidth?: number;
  sizeHeight?: number;
}

const UploadFile = (props: IProps) => {
  const { disabled, isUploadMultipleFile, getFilePath, defaultFileList, sizeWidth, sizeHeight } =
    props;

  const onBeforeUpload = (file: RcFile) => {
    if (file?.size > MAX_SIZE) {
      notification.error({ message: ERROR_MESSAGE.LIMIT_SIZE });
      return Upload.LIST_IGNORE;
    }

    if (file && TYPES_IMAGE_UPLOAD.includes(file?.type) && file?.size <= MAX_SIZE) {
      return true;
    }

    notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE });
    return Upload.LIST_IGNORE;
  };

  const onChange: UploadProps['onChange'] = ({ fileList }) => {
    if (isUploadMultipleFile) {
      return;
    }
    if (getFilePath instanceof Function) {
      getFilePath(fileList[0]?.response?.data);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center rounded-xl bg-[#F4F4F4] text-center box-upload">
        <Dragger
          onChange={onChange}
          beforeUpload={onBeforeUpload}
          disabled={disabled}
          className="py-12"
          {...propsUpload}
          defaultFileList={defaultFileList}
        >
          <p className="mb-2">Drag & Drop your image here</p>
          <p className="mb-2">Or</p>
          <div className="lg:max-w-fit m-auto">
            <ButtonCustom
              color="outline"
              className="m-auto"
              icon={<UploadIcon className="icon-button" />}
            >
              &nbsp; Upload Image
            </ButtonCustom>
          </div>
        </Dragger>
      </div>
      <div className="font-fontFamily text-[#6E6B68] italic mt-2">
        Recommended size: {sizeWidth ? sizeWidth : 'XX'} x {sizeHeight ? sizeHeight : 'XX'} px{' '}
        <br />
        (maximum 1MB)
      </div>
    </>
  );
};

export default UploadFile;
