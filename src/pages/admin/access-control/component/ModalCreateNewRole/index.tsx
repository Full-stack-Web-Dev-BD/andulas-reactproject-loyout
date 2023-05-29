import { Form, Input, Select } from 'antd';
import { createNewRole } from 'api/access_control';
import { getAllTemplate } from 'api/theme';
import ModalCustom from 'components/Modal';
import { CLASS_NAME_FIELD, ERROR_MESSAGE, ROUTES } from 'constants/index';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ModalCreateNewRole = ({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
}) => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const roleType = Form.useWatch('roleType', form);
  const roleName = Form.useWatch('roleName', form);
  const [isKeepOpen, setIsKeepOpen] = useState(true);

  const { mutate: mutateCreateNewRole } = useMutation('createNewRole', createNewRole, {
    onSuccess: ({ data }) => {
      onCancel();
      history(`${ROUTES.access_control}/${data.id}`);
      setIsKeepOpen(false);
    },
    onError: () => {
      setIsKeepOpen(true);
      form.setFields([
        {
          name: 'roleName',
          errors: [ERROR_MESSAGE.ROLE_NAME_ALREADY_EXIST],
        },
      ])
    },
  });

  const [roleTypes, setRoleTypes] = useState([]);
  const onSubmit = useCallback((value: {roleName: string, roleType: number}) => {
    mutateCreateNewRole({ roleName: value.roleName, templateID: Number(value.roleType) });
  }, [roleName, roleType]);

  const { mutate: mutateRoleTypes } = useMutation('getAllTemplate', getAllTemplate, {
    onSuccess: ({ data }) => {
      setRoleTypes(data.templates);
    },
  });

  useEffect(() => {
    mutateRoleTypes();
  }, []);

  return (
    <ModalCustom
      title="Create new role"
      cancelText="Cancel"
      okText="Confirm"
      onSubmit={form.submit}
      visible={visible}
      onCancel={onCancel}
      isKeepOpen={isKeepOpen}
    >
      <Form onFinish={onSubmit} layout="vertical" form={form}>
        <Form.Item
          rules={[{ required: true, message: 'Role Name is required!' }]}
          label="Role Name"
          name="roleName"
        >
          <Input className={CLASS_NAME_FIELD} />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Role Type is required!' }]}
          label="Role Type"
          name="roleType"
        >
          <Select>
            {roleTypes
              .filter((role: { templateName: string }) => role.templateName !== 'Student')
              .map(
                (role: { id: React.Key | null | undefined; templateName: string | undefined }) => (
                  <>
                    <Option value={role.id} key={role.id}>
                      {role.templateName}
                    </Option>
                  </>
                ),
              )}
          </Select>
        </Form.Item>
      </Form>
    </ModalCustom>
  );
};

export default ModalCreateNewRole;
