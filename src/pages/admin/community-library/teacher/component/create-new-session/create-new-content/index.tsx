import { Layout } from 'antd';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { SCREEN } from 'constants/constants';
import React, { useState } from 'react';

const CreateNewContent = ({
  setScreen,
  setIsShowContactAttached,
  setIsShowSaveOfDaft,
}: {
  setScreen: (screen: string) => void;
  setIsShowContactAttached: (isShow: boolean) => void;
  setIsShowSaveOfDaft: (isShow: boolean) => void;
}) => {
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [isModalNotice, setIsModalNotice] = useState<boolean>(false);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Content Creation
        </p>

        <ButtonCustom color="outline" onClick={() => {}}>
          Reset
        </ButtonCustom>
      </div>

      <div className="flex justify-end items-center bg-transparent gap-x-3 mt-[600px]">
        <ButtonCustom
          color="outline"
          onClick={() => {
            setIsModalNotice(true);
          }}
        >
          Exit
        </ButtonCustom>

        <ButtonCustom
          color="orange"
          onClick={() => {
            setIsModalConfirm(true);
          }}
        >
          Submit
        </ButtonCustom>
      </div>
      {isModalNotice && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setIsModalNotice(false);
          }}
          okText="Leave"
          onSubmit={() => {
            setScreen(SCREEN.newSession);
          }}
          title="Notice"
          titleCenter
          content={
            'The content you have created will be saved automatically.  Are you sure you want to leave the content creation?'
          }
        />
      )}
      {isModalConfirm && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Submit"
          onSubmit={() => {
            setScreen(SCREEN.newSessionSummary);
            setIsShowContactAttached(true);
            setIsShowSaveOfDaft(false);
          }}
          onCancel={() => {
            setIsModalConfirm(false);
          }}
          title="Confirmation"
          titleCenter
          content={'Are you sure you want to create the content?'}
        />
      )}
    </Layout>
  );
};

export default CreateNewContent;
