import { DragOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { searchModules } from 'api/courses';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import SelectSearch from 'components/SelectSearch';
import { PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH } from 'constants/constants';
import { useEffect, useRef, useState } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { useMutation } from 'react-query';
import { SingleValue } from 'react-select';

interface IProps {
  index: number;
  module: { module: { label: string; value: string } | any | SingleValue<string>; id: string };
  isEdit: boolean;
  onChangeSelectModule: any;
  handleDeleteModule: (id: string) => void;
  courseName: string;
  errorMessage: string;
}

const CardModule = (props: IProps) => {
  const {
    index,
    module,
    isEdit,
    onChangeSelectModule,
    handleDeleteModule,
    courseName,
    errorMessage,
  } = props;
  const [limit] = useState(10);
  const timeout: any = useRef(null);
  const [sort] = useState('updatedAt');
  const [order] = useState('DESC');
  const [page] = useState(1);
  const [error, setError] = useState('');
  const [isChangeModule, setIsChangeModule] = useState(false);
  const [optionsModule, setOptionsModule] = useState<Array<{ label: string; value: string }>>([]);
  const [searchValue, setSearchValue] = useState('');
  const { mutate: getModules } = useMutation('searchModules', searchModules, {
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
          ? data?.listModules
              ?.map((item) => {
                return {
                  label: `${item.topic.topicName} - ${item.moduleName} ${
                    item?.moduleCode && item?.moduleCode !== '' ? `(${item?.moduleCode})` : ''
                  }`,
                  value: item.id.toString(),
                  isDisabled: false,
                };
              })
              .concat([{ label: TEXT_SELECT_SEARCH.module, value: '', isDisabled: true }])
          : [];
      setOptionsModule(newOptions);
    },
  });

  useEffect(() => {
    // getModules({ page, limit: SELECT_SEARCH_CONFIG.limit, order, sort, search: searchValue });
    getModules({ ...PARAMS_SELECT_SEARCH.module, search: searchValue });
  }, [page, limit, order, sort, searchValue]);

  const handleSearchOptions = (value: string) => {
    clearTimeout(timeout.current);
    setTimeout(() => {
      setSearchValue(value);
    }, 500);
  };

  useEffect(() => {
    if (errorMessage?.replace(' already exists!', '') === module?.module?.label && isChangeModule) {
      setError(`${module?.module?.label} already exists!`);
      return;
    }

    if (!module?.module?.label && !module?.module?.value) {
      setError("Module can't be blank!");
      return;
    }

    setError('');
  }, [module?.id, module?.module, errorMessage, isChangeModule]);

  const handleChangeModule = (val: string) => {
    setIsChangeModule(true);
    onChangeSelectModule(module?.id, val);
  };

  return (
    <div>
      <Draggable isDragDisabled={!isEdit} draggableId={module.id.toString()} index={index}>
        {(provided: DraggableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="flex gap-3 w-100 flex-wrap"
          >
            <Form.Item
              className={'w-full'}
              label={
                // module?.module?.label
                //   ? module?.module?.label?.split('- ')[1]
                'Module ' + (index + 1)
              }
              name={`module_${index}`}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                className="flex justify-between gap-3 items-center"
              >
                <div className={`${isEdit ? 'w-[89.4%]' : 'w-[96.4%]'}`}>
                  <SelectSearch
                    handleSearchOptions={handleSearchOptions}
                    onChange={handleChangeModule}
                    value={module?.module as SingleValue<string>}
                    options={optionsModule}
                    disable={!isEdit}
                    placeholder="Please select / type"
                  />
                </div>

                {isEdit && (
                  <ModalCustom
                    onSubmit={() => handleDeleteModule(module.id)}
                    title="Delete"
                    content={`Are you sure you want to remove ${
                      module?.module?.label ? module?.module?.label : 'Module ' + (index + 1)
                    } 
                    from ${courseName}?`}
                    titleCenter
                    okText="Confirm"
                    cancelText="Cancel"
                    viewComponent={
                      <ButtonCustom
                        isRound
                        icon={<DeleteIcon className="icon-button " />}
                        color="outline"
                        className="lg:w-[3rem] lg:h-[3rem] min-w-fit"
                      />
                    }
                  />
                )}
                <div className="h-[20px]" {...provided.dragHandleProps}>
                  <DragOutlined className="text-xl text-main-button-color" />
                </div>
              </div>
              {error && (
                <div className="text-red-600 font-fontFamily mt-2 basis-[100%]">{error}</div>
              )}
            </Form.Item>
          </div>
        )}
      </Draggable>
    </div>
  );
};

export default CardModule;
