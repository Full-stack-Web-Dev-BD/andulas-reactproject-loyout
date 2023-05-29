import { reorderSession } from 'api/session';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import CheckboxCustom from 'components/Checkbox';
import Loading from 'components/Loading';
import SelectCustom from 'components/Select';
import CustomTooltip from 'components/Tooltip';
import { Status } from 'constants/constants';
import { ISessionInfo } from 'pages/admin/hq-library/session';
import React, { ReactElement, useContext } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useMutation } from 'react-query';
import './style.css';
import { AppContext } from 'context';
import { RoleName } from 'enum/role';

interface SelectCustomType {
  options?: Array<{ label?: string; value?: string }>;
  onChange?: (value: string) => void;
  value?: string | null;
  show?: boolean;
  onSelect?: (value: string) => void;
  minWidth?: string;
}

interface IProps {
  isLoading?: boolean;
  filters?: SelectCustomType;
  action?: SelectCustomType;
  searchNotFound?: ReactElement;
  isSearch?: boolean;
  isRowSelect?: boolean;
  sessions: ISessionInfo[];
  selection: React.Key[];
  onRow: (rowId: number, status: string) => void;
  onChangeSessionId: (id: number) => void;
  onChangeModalDeleteSession: (value: boolean) => void;
  onChangeModalDuplicateSession: (value: boolean) => void;
  onChangeSessionDuplicate: (session: ISessionInfo) => void;
  onChangeSelect?: (selectedRowKeys: React.Key[]) => void;
  onChangeListSession?: (sessions: ISessionInfo[]) => void;
  isFilter?: boolean;
}

const SESSION_HEADER = ['Session Name', 'Category', 'Topic', 'Module', 'Status', 'Action'];

const ReorderSession = (props: IProps) => {
  const {
    isLoading,
    filters,
    action,
    searchNotFound,
    isSearch,
    sessions,
    selection,
    onRow,
    onChangeSessionId,
    onChangeModalDeleteSession,
    onChangeModalDuplicateSession,
    onChangeSessionDuplicate,
    onChangeSelect,
    onChangeListSession,
    isFilter,
  } = props;

  const { mutate: reorderSessionMutate } = useMutation('reorderSession', reorderSession, {
    onSuccess: () => {},
  });

  const [state]: any = useContext(AppContext);
  console.log(state?.user?.userRole?.roleName);

  const handleReorderSession = (result: any) => {
    if (!onChangeListSession) return;
    const newSessions = Array.from(sessions);
    const [removed] = newSessions.splice(result.source.index, 1);
    newSessions.splice(result.destination.index, 0, removed);

    onChangeListSession(newSessions.map((session, index) => ({ ...session, order: index })) as ISessionInfo[]);
    reorderSessionMutate(newSessions.map((session, index) => ({ id: Number(session.id), order: index })));
  };

  return (
    <div>
      <div className='flex items-center mb-3 justify-end sm:justify-start'>
        {isSearch ? <p className='text-2xl font-fontFamily leading-9 font-bold mb-0'>Search Results</p> : null}
        <div className='flex gap-4 items-center flex-wrap'>
          {action?.show && (
            <div className='flex gap-4 items-center'>
              <p className='font-fontFamily font-bold mb-0'>Action</p>
              <SelectCustom
                placeholder='Select'
                color='transparent'
                className='min-w-[167px]'
                options={action?.options || []}
                onSelect={action?.onSelect}
                value={action.value || ''}
                allowClear
              />
            </div>
          )}
          {filters?.show && (
            <div className='flex gap-4 items-center'>
              <p className='font-fontFamily font-bold mb-0'>Filter</p>
              <SelectCustom
                placeholder='All'
                color='transparent'
                className={`${filters?.minWidth ? filters?.minWidth : 'min-w-[120px]'}`}
                options={filters?.options || []}
                onChange={filters?.onChange}
                value={filters?.value || ''}
              />
            </div>
          )}
        </div>
      </div>
      <Loading isLoading={isLoading}>
        {searchNotFound || (
          <div className='cus-overflow-tb'>
            <div className='flex items-center pt-4'>
              <div className='session'>
                <CheckboxCustom
                  checked={
                    sessions.filter((session: any) => session.authorID === state?.user?.id).length === 0
                      ? false
                      : selection.length ===
                        sessions.filter((session: any) => session.authorID === state?.user?.id).length
                  }
                  onChange={() => {
                    if (!onChangeSelect) return;

                    if (
                      selection.length ===
                      sessions.filter((session: any) => session.authorID === state?.user?.id).length
                    ) {
                      onChangeSelect([]);
                    } else {
                      onChangeSelect(
                        sessions
                          .filter((session) => session.authorID === state?.user?.id)
                          .map((session) => session.id) as React.Key[]
                      );
                    }
                  }}
                />
              </div>
              {SESSION_HEADER.map((title) => (
                <div className='cursor-pointer text-left fontFamily session' key={title}>
                  {title}
                </div>
              ))}
            </div>
            <DragDropContext onDragEnd={handleReorderSession}>
              <Droppable droppableId='sessionDroppable' isDropDisabled={isFilter}>
                {(providedDrop) => (
                  <div {...providedDrop.droppableProps} ref={providedDrop.innerRef} className='session-body-p-30'>
                    {sessions.map((session, index) => (
                      <Draggable
                        key={session.id}
                        draggableId={session.id?.toString() || ''}
                        index={index}
                        isDragDisabled={isFilter}
                      >
                        {(providedDrag) => (
                          <div
                            className='flex items-center mb-4 session-body-container w-fit'
                            key={session.id}
                            ref={providedDrag.innerRef}
                            {...providedDrag.draggableProps}
                            {...providedDrag.dragHandleProps}
                            onClick={() => onRow(Number(session?.id), session?.status as string)}
                          >
                            <div className='session' onClick={(e) => e.stopPropagation()}>
                              <CheckboxCustom
                                checked={selection.some((item) => +item === Number(session.id))}
                                disabled={state?.user?.id !== session.authorID}
                                onChange={() => {
                                  if (!onChangeSelect) return;

                                  const sessionId = Number(session.id);
                                  const selectionClone = [...selection];

                                  if (selectionClone.some((item) => +item === sessionId)) {
                                    onChangeSelect(selectionClone.filter((item) => +item !== sessionId) as React.Key[]);
                                  } else {
                                    selectionClone.push(sessionId);
                                    onChangeSelect(selectionClone as React.Key[]);
                                  }
                                }}
                              />
                            </div>
                            <CustomTooltip title={session.sessionName}>
                              <div className='font-bold custom-text-ellipsis session'>{session.sessionName}</div>
                            </CustomTooltip>
                            <CustomTooltip title={session.categoryName}>
                              <div className='font-bold custom-text-ellipsis session'>{session.categoryName}</div>
                            </CustomTooltip>
                            <CustomTooltip title={session.topicName}>
                              <div className='font-bold custom-text-ellipsis session'>{session.topicName}</div>
                            </CustomTooltip>
                            <CustomTooltip title={session.moduleName}>
                              <div className='font-bold custom-text-ellipsis session'>{session.moduleName}</div>
                            </CustomTooltip>
                            <div className='session'>
                              <div
                                className={`${
                                  session.status === Status.COMPLETED ||
                                  session.status === Status.COMPLETED.toLowerCase()
                                    ? 'bg-[#E6F2F2] text-[#006262]'
                                    : 'bg-[#FCECD9] text-[#BE5E2A]'
                                } px-[5px] py-[4px] rounded-2xl text-xs uppercase text-center font-bold`}
                              >
                                {session?.status?.toLocaleUpperCase()}
                              </div>
                            </div>
                            <div className='flex session session-body-action'>
                              {state?.user?.userRole?.roleName === RoleName.TEACHER ? (
                                session.authorID === state?.user?.id ? (
                                  <>
                                    <div
                                      className='cursor-pointer'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRow(Number(session?.id), session?.status as string);
                                      }}
                                    >
                                      <CustomTooltip title='Edit'>
                                        <EditSVG className='icon-hover' />
                                      </CustomTooltip>
                                    </div>{' '}
                                    <div
                                      className='cursor-pointer ml-5'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeSessionId(Number(session.id));
                                        onChangeModalDeleteSession(true);
                                      }}
                                    >
                                      <CustomTooltip title='Delete'>
                                        <TrashSVG className='icon-hover' />
                                      </CustomTooltip>
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )
                              ) : (
                                <>
                                  <div
                                    className='cursor-pointer'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRow(Number(session?.id), session?.status as string);
                                    }}
                                  >
                                    <CustomTooltip title='Edit'>
                                      <EditSVG className='icon-hover' />
                                    </CustomTooltip>
                                  </div>{' '}
                                  <div
                                    className='cursor-pointer ml-5'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onChangeSessionId(Number(session.id));
                                      onChangeModalDeleteSession(true);
                                    }}
                                  >
                                    <CustomTooltip title='Delete'>
                                      <TrashSVG className='icon-hover' />
                                    </CustomTooltip>
                                  </div>
                                </>
                              )}

                              <div
                                className='cursor-pointer ml-5'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChangeModalDuplicateSession(true);
                                  onChangeSessionId(Number(session.id));
                                  onChangeSessionDuplicate(session);
                                }}
                              >
                                <CustomTooltip title='Duplicate'>
                                  <DuplicateSVG className='icon-hover' />
                                </CustomTooltip>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </Loading>
    </div>
  );
};

export default ReorderSession;
