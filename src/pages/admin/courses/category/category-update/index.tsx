import { Breadcrumb, Form, Input, Layout } from 'antd';
import { createCategory, getCategoryById, updateCategory } from 'api/courses';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { ROUTES } from 'constants/constants';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import EmailSentSVG from 'assets/images/emailsent.svg';
import { WARNING_MESSAGE } from 'constants/messages';
import usePrompt from 'constants/function';

const CategoryUpdate = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const history = useNavigate();
  const [messageSucces, setMessageSuccess] = useState('');
  const [messageConfirm, setMessageConfirm] = useState('');
  const [titleModal, setTitleModal] = useState('');
  const categoryName = Form.useWatch('categoryName', form);
  const [messageWarning, setMessageWarning] = useState('');
  const [valueConfirm, setValueCofirm] = useState('');
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState(false);

  const messageError = useMemo(() => {
    return `The category name “${categoryName}” already exists. Please try again with another name.`;
  }, [categoryName]);

  const { mutate: mutateCreateCategory, isLoading: isLoadingCreate } = useMutation(
    'createCategory',
    createCategory,
    {
      onSuccess: () => {
        setMessageSuccess('Category Successfully Created');
        setMessageConfirm('');
      },
      onError: (error: { response: { data: { message: string }; status: number } }) => {
        if (error.response.status == 403) {
          setMessageWarning('You are not allowed to create category.');
        } else {
          setMessageWarning(messageError);
        }
      },
    },
  );

  const { mutate: mutateUpdateCategory, isLoading: isLoadingUpdate } = useMutation(
    'updateCategory',
    updateCategory,
    {
      onSuccess: () => {
        setMessageSuccess('Category Successfully Updated!');
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to edit category.');
        } else {
          setMessageWarning(messageError);
        }
      },
    },
  );

  const { mutate: mutateCategoryById } = useMutation('getCategoryById', getCategoryById, {
    onSuccess: ({ data }) => {
      const result = data.categoryName;
      setValueCofirm(result);
      form.setFieldsValue({ categoryName: result });
    },
  });

  usePrompt(WARNING_MESSAGE.LEAVE_CATEGORY, isOpenConfirmLeave);

  useEffect(() => {
    if (id) mutateCategoryById({ id: Number(id) });
  }, []);

  const handleSubmit = (values: { categoryName: string }) => {
    if (!id)
      setMessageConfirm(`Are you sure you want to create ${values.categoryName} as a category?`);
    else setMessageConfirm(`Are you sure you want to update the category name to ${categoryName}?`);
    setTitleModal('Confirmation');
  };

  const handleConfirmSubmit = useCallback(() => {
    setIsOpenConfirmLeave(false);
    if (messageConfirm === WARNING_MESSAGE.LEAVE_CATEGORY) {
      history(ROUTES.category);
      return;
    }
    if (!id) {
      mutateCreateCategory({ categoryName });
      return;
    }
    mutateUpdateCategory({ id: Number(id), categoryName });
  }, [categoryName, id, messageConfirm]);

  const handleBack = () => {
    setTitleModal('Notice');
    setIsOpenConfirmLeave(false);

    if (!id) {
      if (categoryName) {
        setMessageConfirm(WARNING_MESSAGE.LEAVE_CATEGORY);

        return;
      }
    } else {
      if (categoryName !== valueConfirm) {
        setMessageConfirm(WARNING_MESSAGE.LEAVE_CATEGORY);
        return;
      }
    }
    history(ROUTES.category);
  };

  const renderModalConfirm = useCallback(() => {
    return (
      messageConfirm && (
        <ModalCustom
          cancelText="Cancel"
          onSubmit={handleConfirmSubmit}
          onCancel={() => {
            setMessageConfirm('');
          }}
          okText="Confirm"
          title={titleModal}
          titleCenter
          content={messageConfirm}
          visible={true}
        />
      )
    );
  }, [messageConfirm]);

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

  return (
    <Layout className="p-0 sm:p-0 md:p-0 lg:p-0 xl:p-16 2xl:p-16 bg-transparent gap-4">
      <Breadcrumb
        style={{
          color: '#AEA8A5',
          fontWeight: '700',
          lineHeight: '36px',
          fontSize: '28px',
        }}
        className="font-fontFamily text-main-font-color custom-font-header"
      >
        <Breadcrumb.Item
          className="opacity-50 cursor-pointer"
          onClick={() => {
            history(ROUTES.category);
          }}
        >
          Category
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color ">
          {!id ? 'New Category' : `Edit ${categoryName}`}
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="p-10 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] rounded-3xl w-full">
        <Form
          onFinish={handleSubmit}
          form={form}
          autoComplete="off"
          layout="vertical"
          className="flex flex-wrap gap-x-3"
          onFieldsChange={() => {
            setIsOpenConfirmLeave(true);
          }}
        >
          <Form.Item
            className="w-full"
            name="categoryName"
            colon={true}
            label="Category Name"
            rules={[{ required: true, message: 'Category Name is required!' }]}
          >
            <Input
              placeholder="Please enter"
              className="style_input_custom_login_page"
              type="text"
            />
          </Form.Item>
          <div className="flex justify-end gap-2 w-full mt-5">
            <ButtonCustom color="ouline" onClick={handleBack}>
              Back
            </ButtonCustom>

            <ButtonCustom
              color="orange"
              htmlType="submit"
              isLoading={isLoadingCreate || isLoadingUpdate}
            >
              {id ? 'Update' : 'Create'}
            </ButtonCustom>
          </div>
        </Form>
      </div>
      <ModalCustom
        cancelText="Back"
        onCancel={() => {
          history(ROUTES.category);
        }}
        visible={messageSucces ? true : false}
      >
        <div className="w-full flex justify-center items-center flex-col">
          <img src={EmailSentSVG} alt="email sent" />
          <div className="font-fontFamily font-bold text-2xl sm:text-xl">{messageSucces}</div>
        </div>
      </ModalCustom>
      {renderModalConfirm()}
      {renderModalWarning()}
    </Layout>
  );
};

export default CategoryUpdate;
