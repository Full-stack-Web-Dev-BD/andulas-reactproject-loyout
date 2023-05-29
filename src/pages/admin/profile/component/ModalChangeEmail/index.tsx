import { Divider, Form, FormInstance } from "antd";
import { RuleObject } from "antd/lib/form";
import ButtonCustom from "components/Button";
import CustomInput from "components/Input";
import ModalCustom from "components/Modal";
import { ERROR_MESSAGE, REGEX_EMAIL } from "constants/index";

interface IProps {
    formInsertEmail: FormInstance;
    handleChangeEmail: (val: { newEmail: string}) => void;
    setIsOpen: (val: boolean) => void;
    isOpen: boolean;
}

const ModalChangeEmail = (props: IProps) => {
    const {isOpen, setIsOpen, formInsertEmail, handleChangeEmail} = props;
    return (
        <ModalCustom
          onCancel={() => {
            setIsOpen(false);
            formInsertEmail.resetFields();
          }}
          visible={isOpen}
          title="Change Email Address"
          titleCenter
        >
          <Form
            form={formInsertEmail}
            layout="vertical"
            className="w-full text-left"
            name="basic"
            autoComplete="off"
            onFinish={handleChangeEmail}
          >
            <div className="font-fontFamily text-sm text-[#6E6B68] text-center my-3">
              Please select a verification option below to change your email address.
            </div>
            <Form.Item
              name="newEmail"
              label="Insert new email :"
              validateFirst
              rules={[
                { required: true, message: 'New email is required!' },
                {
                  validator(_: RuleObject, value: string) {
                    const regex = new RegExp(REGEX_EMAIL);
                    if (regex.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(ERROR_MESSAGE.EMAIL);
                  },
                },
              ]}
            >
              <CustomInput type="text" classNameCustom="rounded-xl h-11" />
            </Form.Item>

            <div className="flex gap-x-2">
              <ButtonCustom color="outline" fullWidth onClick={() => setIsOpen(false)}>
                Cancel
              </ButtonCustom>
              <ButtonCustom color="orange" fullWidth onClick={formInsertEmail.submit}>
                Confirm
              </ButtonCustom>
            </div>
            <Divider />
            <div className="font-fontFamily text-sm text-[#6E6B68] text-center mb-5">
              Or continue with
            </div>
            <div className="flex gap-x-2 mt-2">
              <ButtonCustom color="outline" fullWidth onClick={() => {}}>
                Google
              </ButtonCustom>
              <ButtonCustom color="outline" fullWidth onClick={() => {}}>
                Office 365
              </ButtonCustom>
            </div>
          </Form>
        </ModalCustom>
    )
}

export default ModalChangeEmail;