import { Form } from 'antd';
import { getCourseModules, searchModules, updateCourseModule } from 'api/courses';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { PARAMS_SELECT_SEARCH } from 'constants/constants';
import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { SingleValue } from 'react-select';
import CardModule from '../../component/CardModule';

interface IProps {
  onNextTab: () => void;
  courseId: string;
  setEditing: (value: boolean) => void;
  onBackTab: () => void;
  editing: boolean;
  courseName: string;
  onSubmitted: () => void;
  setIsChanging: (value: boolean) => void;
  isChanging: boolean;
  setIsOpenConfirmLeave: (value: boolean) => void;
}

const ModuleTab = (props: IProps) => {
  const {
    onNextTab,
    courseId,
    setEditing,
    onBackTab,
    editing,
    courseName,
    onSubmitted,
    isChanging,
    setIsChanging,
    setIsOpenConfirmLeave,
  } = props;
  const [form] = Form.useForm();
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [isFieldChange, setIsFieldChange] = useState(false);
  const [isOpenConfirmCancelEdit, setIsOpenConfirmCancelEdit] = useState(false);
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState<boolean>(false);
  const [optionsModule, setOptionsModule] = useState<Array<{ label: string; value: string }>>([]);
  const [isOpenConfirmBackTab, setIsOpenConfirmBackTab] = useState(false);
  const [messageWarning, setMessageWarning] = useState('');

  const generateId = useCallback(() => {
    return Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(2, 10);
  }, []);

  const [modules, setModules] = useState<
    Array<{ id: string; module: { label: string; value: string } | SingleValue<string> }>
  >([{ id: generateId(), module: '' }]);

  const { mutate: getModules } = useMutation('getCourseModules', getCourseModules, {
    onSuccess: ({ data }) => {
      if (data?.length > 0) {
        const newData = data.map(
          (item: {
            id: number;
            moduleName: string;
            moduleCode?: string;
            topic: { topicName: string };
          }) => {
            return {
              ...item,
              module: {
                label: `${item.topic.topicName} - ${item.moduleName} ${
                  item?.moduleCode && item?.moduleCode !== '' ? `(${item?.moduleCode})` : ''
                }`,
                value: item.id.toString(),
              },
            };
          },
        );
        setModules(newData);
        setIsFieldChange(false);
        if (id) {
          setIsEdit(false);
        }
        setErrorMessage('');

        return;
      }
      setModules([{ id: generateId(), module: '' }]);
      // setErrorMessage("Module can't be blank!");
    },
  });

  const { mutate: searchModule } = useMutation('searchModules', searchModules, {
    onSuccess: ({
      data,
    }: {
      data: {
        listModules: Array<{
          id: number;
          moduleName: string;
          moduleCode?: string;
          topic: { topicName: string };
        }>;
      };
    }) => {
      const newOptions =
        data?.listModules?.length > 0
          ? data?.listModules?.map((item) => {
              return {
                label: `${item.topic.topicName} - ${item.moduleName} ${
                  item?.moduleCode && item?.moduleCode !== '' ? `(${item?.moduleCode})` : ''
                }`,
                value: item.id.toString(),
              };
            })
          : [];
      setOptionsModule(newOptions);
    },
  });

  useEffect(() => {
    if (id) {
      setIsUpdate(true);
    }
  }, [id]);

  useEffect(() => {
    searchModule(PARAMS_SELECT_SEARCH.module);
  }, []);

  const { mutate: updateModule } = useMutation('updateCourseModules', updateCourseModule, {
    onSuccess: () => {
      getModules(Number(courseId));
      if (id) {
        setIsEdit(false);
        setIsOpenConfirmLeave(false);
      }
      setEditing(false);
      setIsChanging(false);
      setIsFieldChange(false);
      onSubmitted();
      if (!isUpdate) onNextTab();
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        setMessageWarning('You are not allowed to edit course.');
      }
    },
  });

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

  const handleSubmit = useCallback(() => {
    if (!errorMessage) {
      setIsFieldChange(false);
      const moduleIds = modules.map((module) => {
        return typeof module?.module === 'object' ? module?.module?.value : '';
      }) as string[];
      updateModule({ courseId: Number(courseId), moduleIds });
    }
  }, [courseId, modules, errorMessage]);

  const handleAddModule = useCallback(() => {
    setIsFieldChange(true);
    const newModule = [...modules];
    if (newModule.filter((item) => !item.module)?.length === 0 && !errorMessage) {
      newModule.push({
        id: generateId(),
        module: '',
      });
    }

    setModules(newModule);
    if (id) {
      setEditing(true);

      return;
    }
    setIsChanging(true);
  }, [modules, optionsModule, errorMessage]);

  const handleDeleteModule = useCallback(
    (idModule: string) => {
      setIsFieldChange(true);
      setIsOpenConfirmLeave(true);
      const newModule = modules.filter((item) => item.id !== idModule);
      setModules(newModule);
      setErrorMessage('');
      if (id) {
        setEditing(true);

        return;
      }
      setIsChanging(true);
    },
    [modules],
  );

  useEffect(() => {
    if (courseId && !isChanging && !editing) {
      getModules(Number(courseId));
      return;
    }
    // setEditing(true);
  }, [courseId, isChanging, editing]);

  const onChangeSelectModule = (idModule: string, value: string) => {
    setErrorMessage('');
    setIsFieldChange(true);
    setIsOpenConfirmLeave(true);

    const newModule = modules.map((item) => {
      if (item.id === idModule) {
        return { ...item, module: value };
      }
      return item;
    });

    const modulesCheck = newModule.map((module) =>
      typeof module?.module === 'object' ? module?.module?.label : '',
    );

    const isAlready = modulesCheck.filter((item, idx) => {
      if (modulesCheck.indexOf(item) != idx) {
        return { isAlready: true, label: item };
      }
      // return {isAlready: false, label: item}
    });

    if (isAlready[0]) {
      setErrorMessage((isAlready[0] as string) + ' already exists!');
    }
    setModules(newModule);

    if (!value) {
      setErrorMessage("Module can't be blank!");
    }

    if (id) {
      setEditing(true);

      return;
    }
    setIsChanging(true);
  };

  const reorder = (
    list: Array<{ id: string; module: { label: string; value: string } | SingleValue<string> }>,
    startIndex: number,
    endIndex: number,
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId) {
        const newModules = reorder(modules, source?.index, destination?.index);
        setModules(newModules);
      }
      setIsDrag(false);
      setIsFieldChange(true);
    },
    [modules],
  );

  const handleCancelEdit = useCallback(() => {
    if (isFieldChange) {
      setIsOpenConfirmCancelEdit(true);
      return;
    }
    if (courseId && modules?.length > 0) {
      setIsEdit(false);
      setEditing(false);
      setErrorMessage('');
      getModules(Number(courseId));
      return;
    }
    form.resetFields();
  }, [courseId, isFieldChange, modules, id]);

  const handleConfirmCancelEdit = useCallback(() => {
    setIsFieldChange(false);
    setEditing(false);
    getModules(Number(courseId));
    if (!isUpdate && courseId) {
      setModules([{ id: generateId(), module: '' }]);
    }
    if (courseId && isUpdate) {
      setIsEdit(false);
      setErrorMessage('');
      return;
    }
  }, [courseId, isUpdate]);

  const handleOpenConfirm = useCallback(() => {
    if (!isUpdate) {
      if (modules.find((item) => !item.module)) {
        setErrorMessage("Module can't be blank!");
        return;
      }
      form.submit();
      return;
    }

    if (modules.find((item) => !item.module)) {
      setErrorMessage("Module can't be blank!");
      return;
    }

    if (!errorMessage) {
      setIsOpenModalConfirm(true);
      return;
    }
  }, [errorMessage, modules, isUpdate, courseId]);

  const handleBackToInformation = useCallback(() => {
    if (errorMessage) {
      setIsOpenConfirmBackTab(true);
      return;
    }
    onBackTab();
  }, [errorMessage]);

  const handleConfirmBackTab = useCallback(() => {
    onBackTab();
    setErrorMessage('');
  }, []);

  const renderContent = useCallback(() => {
    return (
      <div>
        <Form
          onFinish={handleSubmit}
          form={form}
          layout="vertical"
          className="flex gap-x-4 flex-wrap"
        >
          <DragDropContext
            onBeforeDragStart={() => {
              setIsDrag(true);
              setIsOpenConfirmLeave(true);
              if (id) {
                setEditing(true);

                return;
              }
              setIsChanging(true);
            }}
            onDragEnd={onDragEnd}
          >
            <div className="w-full">
              <Droppable isDropDisabled={!isEdit} droppableId="modules">
                {(dropProvided: DroppableProvided) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    // style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {modules?.map((module, index) => (
                      <CardModule
                        key={module?.id}
                        isEdit={isEdit}
                        index={index}
                        handleDeleteModule={handleDeleteModule}
                        module={module}
                        onChangeSelectModule={onChangeSelectModule}
                        courseName={courseName}
                        errorMessage={errorMessage}
                      />
                    ))}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
          <div className={`w-full flex gap-3 justify-end ${isDrag ? 'mt-24' : ''}`}>
            {isEdit ? (
              <>
                <ButtonCustom
                  onClick={handleAddModule}
                  color="outline"
                  className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                >
                  Add module
                </ButtonCustom>
                {isFieldChange || isUpdate ? (
                  <ButtonCustom
                    onClick={handleCancelEdit}
                    color="outline"
                    className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                  >
                    Cancel
                  </ButtonCustom>
                ) : (
                  <ButtonCustom
                    onClick={handleBackToInformation}
                    color="outline"
                    className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                  >
                    Back
                  </ButtonCustom>
                )}
                <ButtonCustom
                  onClick={handleOpenConfirm}
                  color="orange"
                  className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                >
                  {isUpdate ? 'Update' : 'Next'}
                </ButtonCustom>
              </>
            ) : (
              <>
                <ButtonCustom onClick={handleBackToInformation} color="outline">
                  Back
                </ButtonCustom>
                <ButtonCustom
                  onClick={() => {
                    setIsEdit(true);
                  }}
                  color="orange"
                >
                  Edit
                </ButtonCustom>
              </>
            )}
          </div>
          {isOpenConfirmCancelEdit && (
            <ModalCustom
              onSubmit={handleConfirmCancelEdit}
              visible={true}
              content="You have modified the Course Module. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving"
              title="Notice"
              okText="Confirm"
              onCancel={() => setIsOpenConfirmCancelEdit(false)}
              cancelText="Cancel"
              titleCenter
            />
          )}
          <ModalCustom
            visible={isOpenModalConfirm}
            onCancel={() => setIsOpenModalConfirm(false)}
            title={isUpdate ? 'Update Course' : 'Create Course'}
            okText="Confirm"
            onSubmit={form.submit}
            cancelText="Cancel"
            titleCenter
            content={`Are you sure you want to ${isUpdate ? 'update' : 'create'} this Course?`}
          />
          {isOpenConfirmBackTab && (
            <ModalCustom
              onSubmit={handleConfirmBackTab}
              visible={true}
              content="You have modified the Course Module. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving"
              title="Notice"
              okText="Confirm"
              onCancel={() => setIsOpenConfirmBackTab(false)}
              cancelText="Cancel"
              titleCenter
            />
          )}
        </Form>
        {renderModalWarning()}
      </div>
    );
  }, [
    modules,
    isUpdate,
    isEdit,
    onDragEnd,
    isDrag,
    errorMessage,
    courseId,
    isOpenModalConfirm,
    isOpenConfirmCancelEdit,
    isFieldChange,
    isOpenConfirmBackTab,
    messageWarning,
  ]);
  return <>{renderContent()}</>;
};

export default ModuleTab;
