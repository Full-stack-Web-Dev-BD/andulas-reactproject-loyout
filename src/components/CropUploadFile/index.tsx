import { notification } from 'antd';
import Upload from 'antd/lib/upload';
import AvtDefault from 'assets/images/avt.png';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { getCroppedImg } from 'constants/imageCrop';
import { ERROR_MESSAGE, TYPES_IMAGE_UPLOAD } from 'constants/index';
import { ChangeEvent, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import './style.css';
interface IProps {
  avatarUrl: string;
  onChangeFile: (event: React.ChangeEvent<HTMLInputElement>, croppedAreaPixels: Area) => void;
  isEdit?: boolean;
}

const MAX_SIZE = 1048576;

const CropUploadFile = (props: IProps) => {
  const { avatarUrl, onChangeFile, isEdit = true } = props;
  const uploadAvatarRef: any = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [fileUpload, setFileUpload] = useState<ChangeEvent<HTMLInputElement> | string>('');

  const openUploadAvatar = () => {
    uploadAvatarRef.current.click();
  };

  const onChangeUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file && file[0]?.size > MAX_SIZE) {
      notification.error({ message: ERROR_MESSAGE.LIMIT_SIZE });
      return Upload.LIST_IGNORE;
    }

    if (file && TYPES_IMAGE_UPLOAD.includes(file[0]?.type) && file[0]?.size <= MAX_SIZE) {
      setImageUrl(URL.createObjectURL(file[0]));
      setFileUpload(event);
      return;
    }
    notification.error({ message: ERROR_MESSAGE.UPLOAD_FILE });
    return Upload.LIST_IGNORE;
  };

  const handleCropImage = () => {
    if (fileUpload && croppedAreaPixels) {
      onChangeFile(fileUpload as ChangeEvent<HTMLInputElement>, croppedAreaPixels);
    }
  };

  const onCropComplete = (croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const showCroppedImage = async () => {
    const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels as Area, 0);
    setCropImageUrl(croppedImage as string);
  };

  return (
    <div className="rounded-xl custom-flex mx-auto">
      <div className=" custom-avt">
        <img
          className="w-full h-full object-cover rounded-xl"
          src={avatarUrl ? avatarUrl : AvtDefault}
          alt="avatar"
        />
      </div>
      {isEdit && (
        <>
          <div
            onClick={openUploadAvatar}
            className="font-bold mt-2 text-main-button-color text-center font-fontFamily cursor-pointer"
          >
            Edit
          </div>

          <div className="italic text-[#6E6B68] text-center">
            Recommended size: 500 x 600 px <br />
            (maximum 1MB)
          </div>

          <input
            ref={uploadAvatarRef}
            className="hidden"
            type="file"
            name="myImage"
            onChange={onChangeUploadFile}
          />
        </>
      )}
      {imageUrl && (
        <ModalCustom
          visible={true}
          title="Crop Image"
          cancelText="Cancel"
          okText="Crop"
          width={700}
          titleCenter
          onCancel={() => {
            setImageUrl('');
            setCropImageUrl('');
            setFileUpload('');
            uploadAvatarRef.current.value = '';
          }}
          onSubmit={handleCropImage}
        >
          <div className="bg-white h-[400px] relative w-[60%] box-crop mt-6">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={5 / 6}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={(zoomValue: number) => setZoom(zoomValue)}
            />
          </div>
          <div className="ml-4 w-[38%] mt-6">
            <ButtonCustom onClick={showCroppedImage}>Preview</ButtonCustom>
            {cropImageUrl && <img alt="Image Crop" className="mt-4 w-full" src={cropImageUrl} />}
          </div>
        </ModalCustom>
      )}
    </div>
  );
};

export default CropUploadFile;
