import ButtonCustom from 'components/Button';
import { useCallback, useState } from 'react';
import CertificateDetail from './certificate-detail';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import ModalCustom from 'components/Modal';

const CertificateTab = () => {
  const [certificates, setCertificates] = useState<Array<{ certificateType: string , id: number}>>([
    { certificateType: 'Certificate Type', id: 1 },
  ]);
  const [isAddNew, setIsAddNew] = useState(false);

  const handleDeleteCertificate = useCallback((id: number) => {
     const newCertificates = certificates.filter(item => item.id !== id);
     setCertificates(newCertificates);
  },[certificates]);

  return !isAddNew ? (
    <div>
      {certificates?.length > 0 ? (
        certificates?.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-3 items-center mb-4"
          >
            <div onClick={() => setIsAddNew(true)} className="h-12 pl-4 flex items-center w-full border border-solid border-gray-300 rounded-xl cursor-pointer">
              {item.certificateType}
            </div>
            <ModalCustom
              title="Delete"
              titleCenter
              cancelText="Cancel"
              onSubmit={() => handleDeleteCertificate(item.id)}
              okText="Confirm"
              content={`Are you sure want to delete “${item.certificateType}”?`}
              viewComponent={
                <ButtonCustom
                  isRound
                  icon={<DeleteIcon className="icon-button" />}
                  color="outline"
                />
              }
            />
          </div>
        ))
      ) : (
        <div>Click on “Add new” to add certificates for this course.</div>
      )}
      <div className="w-full flex gap-3 justify-end mt-4">
        <ButtonCustom color="outline">Cancel</ButtonCustom>
        <ButtonCustom onClick={() => setIsAddNew(true)} color="orange">
          Add new
        </ButtonCustom>
      </div>
    </div>
  ) : (
    <CertificateDetail closeAddNew={() => setIsAddNew(false)} />
  );
};

export default CertificateTab;
