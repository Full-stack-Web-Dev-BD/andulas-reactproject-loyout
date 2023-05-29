import { Form, Tabs } from 'antd';
import './style.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Content } from 'antd/lib/layout/layout';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import LetterTab from './letter';
import { IAdminProfile } from 'constants/types';
import { useMutation } from 'react-query';
import { activateCentreAdmin, deactivateCentreAdmin, deleteCentreAdmin } from 'api/admin';
import { useNavigate, useParams } from 'react-router-dom';
import { WARNING_MESSAGE } from 'constants/messages';
import { ROUTES } from 'constants/index';

const AdminAction = ({
  profile,
  setProfile,
  isEdit,
  setIsEdit,
  isChanging,
  setIsChanging,
  setActiveKey,
}: {
  profile?: IAdminProfile;
  setProfile: (profile: any) => void;
  isChanging: boolean;
  setIsChanging: (value: boolean) => void;
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  setActiveKey: (value: string) => void;
}) => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const history = useNavigate();
  const [activeActionKey, setActiveActionKey] = useState('1');
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isModalNotice, setIsModalNotice] = useState(false);
  const [isModalActionNotice, setIsModalActionNotice] = useState(false);
  const [messageWarning, setMessageWarning] = useState('');

  const firstName = profile?.user.userProfile.firstName;
  const lastName = profile?.user.userProfile.lastName;

  const renderModalWarning = useCallback(() => {
    return (
      messageWarning && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageWarning('');
          }}
          title="Notice"
          titleCenter
          content={messageWarning}
        />
      )
    );
  }, [messageWarning]);

  const { mutate: mutateDeactivateCentreAdmin } = useMutation(
    'deactivateCentreAdmin',
    deactivateCentreAdmin,
    {
      onSuccess: ({ data }) => {
        setProfile(data);
        setIsChanging(false);
        setIsEdit(false);
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to edit admin.');
        }
      },
    },
  );

  const { mutate: mutateActivateCentreAdmin } = useMutation(
    'activateCentreAdmin',
    activateCentreAdmin,
    {
      onSuccess: ({ data }) => {
        setProfile(data);
        setIsChanging(false);
        setIsEdit(false);
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to edit admin.');
        }
      },
    },
  );

  const { mutate: mutateDeleteCentreAdmin } = useMutation('deleteCentreAdmin', deleteCentreAdmin, {
    onSuccess: () => {
      history(ROUTES.manage_admin);
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete admin.');
      }
    },
  });

  const handleChangeTab = (key: string) => {
    if (key !== '3') {
      if (isChanging) {
        setIsModalNotice(true);
        return;
      }
      setActiveActionKey(key);
    }
  };

  const handleClickTab = (key: string) => {
    switch (key) {
      case '3':
        setIsModalDelete(true);
        break;
      case '1':
        if (!profile?.isActive) {
          setIsModalActive(true);
        }
        break;
    }
  };

  const handleActiveCentreAdmin = () => {
    mutateActivateCentreAdmin({ isActive: true, id: Number(id) });
  };

  const handleDeactivationCentreAdmin = (values: { reason: string }) => {
    mutateDeactivateCentreAdmin({
      isActive: false,
      id: Number(id),
      deactivationReason: values.reason,
    });
  };

  useEffect(() => {
    form.setFieldsValue({ reason: profile?.deactivationReason });
  }, [profile?.isActive, isChanging]);

  return (
    <>
      <Tabs
        className="tab-action-page"
        onChange={(key) => handleChangeTab(key)}
        activeKey={activeActionKey}
        size={'small'}
        style={{ marginBottom: 32 }}
        onTabClick={handleClickTab}
      >
        <Tabs.TabPane
          tab={profile?.isActive ? 'Deactivate' : 'Activate'}
          key="1"
          style={{ outline: 'none' }}
        >
          <Content className="rounded-3xl bg-white p-8 pb-0" title="Letter">
            {/* <div className="font-fontFamily text-base text-main-font-color mb-4 font-semibold">
              Are you sure you want to deactivate Admin Name?
            </div> */}
            <Form
              layout="vertical"
              className="flex flex-wrap gap-x-4"
              form={form}
              onFinish={handleDeactivationCentreAdmin}
              onChange={() => {
                setIsChanging(true);
              }}
            >
              <Form.Item
                className="w-full"
                name="reason"
                label={profile?.isActive ? 'Reason' : 'Reason for deactivation'}
                rules={[{ required: true, message: 'Reason is required!' }]}
              >
                <CustomInput
                  type="textArea"
                  placeholder="Please enter deactivate reason"
                  classNameCustom="h-[240px]"
                  disabled={!isEdit || !profile?.isActive}
                />
              </Form.Item>
              {profile?.isActive && (
                <Form.Item className="w-full">
                  <div className="flex gap-x-3 justify-end">
                    <ButtonCustom
                      className="lg:w-[calc(50%_-_0.375rem)]"
                      color="outline"
                      onClick={() => {
                        if (isChanging) {
                          setIsModalActionNotice(true);
                          return;
                        }
                        if (isEdit) {
                          setIsEdit(false);
                          return;
                        }
                        setActiveKey('1');
                      }}
                    >
                      {isChanging || isEdit ? 'Cancel' : 'Back'}
                    </ButtonCustom>
                    {isEdit ? (
                      <>
                        <div className="lg:w-[calc(50%_-_0.375rem)]">
                          <ModalCustom
                            cancelText="Cancel"
                            okText="Confirm"
                            title={'Confirmation'}
                            onSubmit={() => {
                              form.submit();
                            }}
                            viewComponent={<ButtonCustom color="orange">Confirm</ButtonCustom>}
                            titleCenter
                          >
                            Are you sure you want to deactivate {firstName + ' ' + lastName}?
                          </ModalCustom>
                        </div>
                      </>
                    ) : (
                      <ButtonCustom
                        className="lg:w-[calc(50%_-_0.375rem)]"
                        color="orange"
                        onClick={() => {
                          setIsEdit(!isEdit);
                        }}
                      >
                        Edit
                      </ButtonCustom>
                    )}
                  </div>
                </Form.Item>
              )}
              {renderModalWarning()}
            </Form>
            {isModalActionNotice && (
              <ModalCustom
                visible={true}
                cancelText="Cancel"
                onCancel={() => {
                  setIsModalActionNotice(false);
                }}
                okText="Leave"
                onSubmit={() => {
                  setIsChanging(false);
                  setIsEdit(false);
                }}
                title="Notice"
                titleCenter
                content={WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO}
              />
            )}
            {isModalActive && (
              <ModalCustom
                visible={true}
                cancelText="Cancel"
                okText="Confirm"
                title="Activate"
                onCancel={() => {
                  setIsModalActive(false);
                }}
                onSubmit={handleActiveCentreAdmin}
                titleCenter
              >
                Are you sure you want to activate {firstName + ' ' + lastName}?
              </ModalCustom>
            )}
          </Content>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Letters" key="2" style={{ outline: 'none' }} disabled>
          <LetterTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Delete" key="3" style={{ outline: 'none' }}></Tabs.TabPane>
      </Tabs>
      {isModalDelete && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          title={'Delete'}
          onCancel={() => {
            setIsModalDelete(false);
          }}
          onSubmit={() => {
            mutateDeleteCentreAdmin({ id: Number(id) });
          }}
          titleCenter
        >
          Are you sure you want to delete {firstName + ' ' + lastName}? This action cannot be
          undone.
        </ModalCustom>
      )}
      {isModalNotice && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setIsModalNotice(false);
          }}
          okText="Leave"
          onSubmit={() => {
            setIsChanging(false);
            setIsEdit(false);
            setActiveActionKey('2');
          }}
          title="Notice"
          titleCenter
          content={WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO}
        />
      )}
    </>
  );
};

export default AdminAction;
