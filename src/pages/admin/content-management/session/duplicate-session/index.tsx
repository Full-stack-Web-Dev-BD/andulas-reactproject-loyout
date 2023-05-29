import { Form, FormInstance } from 'antd';
import { searchModules } from 'api/module';
import { searchTopics } from 'api/topic';
import ModalCustom from 'components/Modal';
import SelectSearch from 'components/SelectSearch';
import { TEXT_SELECT_SEARCH, PARAMS_SELECT_SEARCH, IModule, ITopic, IOptionItem, TopicType } from 'constants/index';
import { AppContext } from 'context';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { RoleName } from '../..';

interface IProps {
  isModalDuplicateSession: boolean;
  isKeepOpen: boolean;
  handleDuplicateSession: (values: {
    topicName: IOptionItem;
    moduleName: IOptionItem;
  }) => void;
  formDuplicateSession: FormInstance<any>;
  onCancel: () => void;
}

const ModalDuplicateSession = (props: IProps) => {
  const {
    isModalDuplicateSession,
    isKeepOpen,
    handleDuplicateSession,
    formDuplicateSession, 
    onCancel,
  } = props;
  const topicName = Form.useWatch('topicName', formDuplicateSession);
  const moduleName = Form.useWatch('moduleName', formDuplicateSession);
  const [topicsOptions, setTopicsOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [modulesOfTopicOptions, setModulesOfTopicOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [state]: any = useContext(AppContext);
  const isTeacher = state?.user?.userRole?.roleName === RoleName.TEACHER;

  const { mutate: getTopics } = useMutation('searchTopics', searchTopics, {
    onSuccess: ({ data }: { data: { records: ITopic[] } }) => {
      const newOptions = data.records
        .map((el) => {
          return { label: el.topicName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.topic, value: '', isDisabled: true }]);
      setTopicsOptions(newOptions);
    },
  });

  const { mutate: getModulesOfTopic } = useMutation('searchModules', searchModules, {
    onSuccess: ({ data }: { data: { listModules: IModule[] } }) => {
      const newOptions = data.listModules
        .map((el) => {
          const codeMudule = el?.moduleCode && el?.moduleCode !== "" ? `(${el?.moduleCode})` : ""
          return { label: el.moduleName.toString() + " " + codeMudule, value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.module, value: '', isDisabled: true }]);
      setModulesOfTopicOptions(newOptions);
    },
  });

  useEffect(() => {
    getTopics(!isTeacher ? PARAMS_SELECT_SEARCH.topic : PARAMS_SELECT_SEARCH.community_topic);
  }, []);

  useEffect(() => {
    if (topicName) {
      getModulesOfTopic({
        ...(!isTeacher ? PARAMS_SELECT_SEARCH.module : PARAMS_SELECT_SEARCH.community_module),
        filters: JSON.stringify([
          {
            topicID: Number(topicName?.value),
            topicType: isTeacher ? TopicType.COMMUNITY_LIBRARY : '',
          },
        ]),
      });
      formDuplicateSession.setFieldsValue({ moduleName: '' });
    }
  }, [topicName]);

  const handleSubmit = useCallback(() => {
    handleDuplicateSession({moduleName, topicName});
  },[moduleName, topicName]);

  return (
    <>
    <ModalCustom
      visible={isModalDuplicateSession}
      onCancel={onCancel}
      cancelText="Cancel"
      isKeepOpen={isKeepOpen}
      okText="Confirm"
      title="Duplicate Session to"
      onSubmit={formDuplicateSession.submit}
    >
      <Form
        form={formDuplicateSession}
        layout="vertical"
        colon={true}
        onFinish={handleSubmit}
      >
        <Form.Item
          rules={[{ required: true, message: 'Topic Name  is required!' }]}
          colon={true}
          label="Topic Name :"
          name="topicName"
        >
          <SelectSearch options={topicsOptions} />
        </Form.Item>
        {topicName && (
          <Form.Item
            rules={[{ required: true, message: 'Module Name is required!' }]}
            colon={true}
            label="Module Name :"
            name="moduleName"
          >
            <SelectSearch options={modulesOfTopicOptions} />
          </Form.Item>
        )}
      </Form>
    </ModalCustom>
    </>
  );
};

export default ModalDuplicateSession;
