import { Breadcrumb, Form, Layout, Menu, notification, Tabs } from 'antd';
import { Content } from 'antd/lib/layout/layout';

import ButtonCustom from 'components/Button';
import { ROUTES } from 'constants/index';
import DropDownCustom from 'pages/admin/content-management/component/DropDown';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

import { ReactComponent as ContentSVG } from 'assets/icons/content_icon.svg';
import { ReactComponent as WebContentSVG } from 'assets/icons/web_content_icon.svg';
import { ReactComponent as CameraSVG } from 'assets/icons/camera_icon.svg';
import { ReactComponent as PlaySVG } from 'assets/icons/play_icon.svg';
import { ReactComponent as DocumentSVG } from 'assets/icons/document_icon.svg';
import { ReactComponent as TagSVG } from 'assets/icons/tag_icon.svg';
import { ReactComponent as FrameSVG } from 'assets/icons/frame_icon.svg';
import { ReactComponent as WarningSVG } from 'assets/icons/warning_icon.svg';
import { ReactComponent as ListSVG } from 'assets/icons/list_icon.svg';
import { ReactComponent as AssignmentSVG } from 'assets/icons/assignment_icon.svg';
import { ReactComponent as ComputerSVG } from 'assets/icons/computer_icon.svg';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as LinkSVG } from 'assets/icons/link.svg';

import UploadFileCustom from 'pages/admin/content-management/component/UploadFile';
import { getSessionById, updateSession } from 'api/session';
import Loading from 'components/Loading';
import RulesAndPath from './RulesAndPath';
import Reports from './Reports';
import { createNewUnit, deleteUnit, searchUnits, updateUnit } from 'api/content_management';
import ListUnits from './ListUnit';
import ModalCustom from 'components/Modal';
import CreateUnit from './CreateUnit/Content';
import Reorder from './Reorder';
import { ActiveTab } from '../create-new-session';
import CreateUnitWithWebContent from './CreateUnit/WebContent';
import CreateUnitWithAssignment from './CreateUnit/Assignment';
import CreateUnitWithVideo from './CreateUnit/Video';
import CreateUnitWithAudio from './CreateUnit/Audio';
import CreateUnitWithDocument from './CreateUnit/Document';
import CreateUnitWithTest from './CreateUnit/Test';
import ViewAsStudent from './ViewAsStudents/index';

export interface ISession {
  id: number;
  sessionName: string;
  sessionType: string;
  sessionDetails: string;
  status: string;
  programType: string;
  contentAttachedPath: string;
  authorization: string;
  category: {
    id: number;
    categoryName: string;
  };
  module: {
    id: number;
    moduleName: string;
    topic: {
      id: number;
      topicName: string;
    };
  };
  tag: {
    id: string;
    tagName: string;
  }[];
  categoryID: string;
  showUnits: string;
  calculateScoreByAverageOf: string;
  courseCompleteWhen: string;
  learningPath: string;
  sessionCode?: string;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Multiple Choice',
  FILL_THE_GAP = 'Fill the gap',
  ORDERING = 'Ordering',
  DRAG_DROP = 'Drag-and-drop',
  FREE_TEXT = 'Free text',
  RANDOMIZED = 'Randomized',
}

export const LIST_QUESTION_OPTIONS = [
  {
    label: QuestionType.MULTIPLE_CHOICE,
    value: QuestionType.MULTIPLE_CHOICE,
    isDisabled: false,
  },
  {
    label: QuestionType.FILL_THE_GAP,
    value: QuestionType.FILL_THE_GAP,
    isDisabled: false,
  },
  {
    label: QuestionType.ORDERING,
    value: QuestionType.ORDERING,
    isDisabled: false,
  },
  {
    label: QuestionType.DRAG_DROP,
    value: QuestionType.DRAG_DROP,
    isDisabled: false,
  },
  {
    label: QuestionType.FREE_TEXT,
    value: QuestionType.FREE_TEXT,
    isDisabled: false,
  },
  {
    label: QuestionType.RANDOMIZED,
    value: QuestionType.RANDOMIZED,
    isDisabled: false,
  },
];

export interface ITag {
  id: number;
  tagName: string;
}

export enum ContentType {
  CHECKBOX = 'Checkbox',
  QUESTION = 'Question',
  PERIOD = 'Period',
}

export enum AssignmentType {
  TEACHER_ACCEPTS_ANSWER = 'When teacher accepts the answer',
  UPLOADING_ANSWER = 'When uploading an answer',
}

export interface IUnit {
  id?: number;
  unitName: string;
  unitType: UnitType;
  sessionID?: number;
  isUploadedFile?: boolean;
  filePath?: string;
  isDisabled: boolean;
  content?: {
    id?: number;
    contentTitle?: string;
    contentType?: ContentType;
    questionType?: QuestionType;
    tags?: any[];
    tagIds?: any[];
    answers?: any[];
    unitID?: number;
    timeLimit?: number;
    assignmentType?: AssignmentType;
    isUploadedFile?: boolean;
    filePath?: string;
    url?: string;
  }[];
  session?: any;
  order?: number;
  contentId?: number[];
  url?: string;
  urlContent?: string;
  unitContents?: any[];
  unitOptions?: any[];
  userUnits?: any[];
}

export interface IContent {
  id?: number;
  contentTitle?: string;
  contentType?: ContentType;
  questionType?: QuestionType;
  tags?: any[];
  tagIds?: any[];
  answers?: any[];
  unitID?: number;
  timeLimit?: number;
  assignmentType?: AssignmentType;
  isUploadedFile?: boolean;
  filePath?: string;
  url?: string;
  freeTextPoint?: number;
  randomized?: any[];

  // some attribute of current student's userunit if have
  savedAnswers?: any;
  isCompleted?: boolean;
  isPassed?: boolean;
}

export interface ListUnit extends IUnit {
  isEditable: boolean;
}

export enum UnitType {
  CONTENT = 'Content',
  WEB_CONTENT = 'Web Content',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  DOCUMENT = 'Document',
  SCORM_XAPI_CMI5 = 'SCORM | xAPI | cmi5',
  FRAME = 'Frame',
  TEST = 'Test',
  SURVEY = 'Survey',
  ASSIGNMENT = 'Assignment',
  INSTRUCTOR_LED_TRAINING = 'Instructor-led training',
  SECTION = 'Section',
}

interface SelectedUnit extends IUnit {
  index: number;
}

interface IProps {
  sessionData: ISession;
  setSessionData: (values: any) => void;
  handleSubmitAddContentPage: () => void;
  listUnits: ListUnit[];
  setListUnits: (values: ListUnit[]) => void;
  activeTab: number;
  setActiveTab: (value: number) => void;
  setIsChanging: (value: boolean) => void;
  isOpenContentFirst?: boolean;
  isChanging?: boolean;
}

const AddContentSession = (props: IProps) => {
  const history = useNavigate();

  const {
    sessionData,
    setSessionData,
    handleSubmitAddContentPage,
    listUnits,
    setListUnits,
    activeTab,
    setActiveTab,
    setIsChanging,
    isOpenContentFirst,
    isChanging,
  } = props;

  const [messageWarning, setMessageWarning] = useState('');
  const [isModalDeleteUnit, setIsModalDeleteUnit] = useState<boolean>(false);
  const [unitIndexDeleting, setUnitIndexDeleting] = useState<number>(-1);

  const [isModalDuplicate, setIsModalDuplicate] = useState<boolean>(false);
  const [unitDuplicate, setUnitDuplicate] = useState<IUnit>();

  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit>();

  const handleDeleteUnit = useCallback(
    (index: number) => {
      const temp = [...listUnits];
      temp.splice(index, 1);
      setListUnits(temp);
      setIsChanging(true);
    },
    [listUnits],
  );

  const renderModalConfirmDelete = useCallback(() => {
    return (
      isModalDeleteUnit && (
        <ModalCustom
          visible={isModalDeleteUnit}
          onCancel={() => {
            setIsModalDeleteUnit(false);
            setUnitIndexDeleting(-1);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => handleDeleteUnit(unitIndexDeleting)}
          titleCenter
        >
          <div>Are you sure you want to delete this unit? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteUnit, unitIndexDeleting]);

  const handleOnClickDeleteUnit = (index: number, values: any) => {
    setUnitIndexDeleting(index);
    setIsModalDeleteUnit(true);
  };

  const onSubmitRulesAndPath = (values: {
    showUnits?: string;
    courseCompleteWhen?: string;
    calculateScoreByAverageOf?: string;
    learningPath?: string;
  }) => {
    const dataSubmit = {
      ...sessionData,
      ...values,
    };
    setSessionData(dataSubmit);
    setActiveTab(ActiveTab.Default);
    setIsChanging(true);
  };

  const handleSubmitEditUnit = (index: number, values: IUnit, editedName: string) => {
    if (values) {
      const temp = [...listUnits];
      temp[index].unitName = editedName;
      temp[index].isEditable = false;
      setListUnits(temp);
      setIsChanging(true);
    }
  };

  const handleUndoAndDisableUnit = (index: number, values: IUnit) => {
    if (values) {
      const temp = [...listUnits];
      temp[index].isDisabled = !temp[index].isDisabled;
      setListUnits(temp);
      setIsChanging(true);
    }
  };

  const onSubmitReports = () => {
    setActiveTab(ActiveTab.Default);
  };

  const handleOnClickEditUnit = (index: number, values: IUnit) => {
    // history(`${ROUTES.content_management_add_content}/${sessionData?.id}/edit-content/${values}`)
    setSelectedUnit({
      index: index,
      ...values,
    });
    if (values.unitType === UnitType.CONTENT) {
      setActiveTab(ActiveTab.AddContent);
    } else if (values.unitType === UnitType.WEB_CONTENT) {
      setActiveTab(ActiveTab.AddWebContent);
    } else if (values.unitType === UnitType.ASSIGNMENT) {
      setActiveTab(ActiveTab.AddAssignment);
    } else if (values.unitType === UnitType.VIDEO) {
      setActiveTab(ActiveTab.AddVideo);
    } else if (values.unitType === UnitType.AUDIO) {
      setActiveTab(ActiveTab.AddAudio);
    } else if (values.unitType === UnitType.DOCUMENT) {
      setActiveTab(ActiveTab.AddDocument);
    } else if (values.unitType === UnitType.TEST) {
      setActiveTab(ActiveTab.AddTest);
    }
  };

  const getFilePath = (value: any) => {
    if (value && value.filePath) {
      const filePath = value.filePath;
      const dataPush = {
        unitName: filePath.split('/')[1] || filePath,
        sessionID: Number(sessionData?.id),
        isUploadedFile: true,
        filePath: filePath,
        isDisabled: false,
        isEditable: false,
        unitType: UnitType.CONTENT,
        order: undefined,
      };
      // mutateCreateUnitByUpload(dataPush);
      const temp = [...listUnits];

      temp.push(dataPush);

      setListUnits(temp);

      setIsChanging(true);
    }
  };

  const handleSetEditableUnit = (index: number, values: IUnit, action: boolean) => {
    const temp = [...listUnits].map((x) => {
      return {
        ...x,
        isEditable: false,
      };
    });
    // const index = temp.findIndex((x) => x.id === values.id);
    temp[index].isEditable = action;
    setListUnits(temp);
  };

  const handleUnitDuplicate = (value: IUnit) => {
    const duplicatedUnit: any = { ...value };
    if (duplicatedUnit.id) {
      delete duplicatedUnit.id;
    }

    if (duplicatedUnit.content?.length > 0 && duplicatedUnit.content[0]?.unitID) {
      duplicatedUnit.content[0].unitID = null;

      if (
        duplicatedUnit.content[0].contentType !== ContentType.QUESTION &&
        duplicatedUnit.content[0].id
      ) {
        delete duplicatedUnit.content[0].id;
      }
    }

    duplicatedUnit.isEditable = false;

    const temp = [...listUnits];
    temp.push(duplicatedUnit);
    setListUnits(temp);
    setIsModalDuplicate(false);
    setUnitDuplicate(undefined);
    setIsChanging(true);
  };

  const renderModalWarning = useCallback(() => {
    return (
      messageWarning && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageWarning('');
          }}
          title="Warning"
          titleCenter
          content={messageWarning}
        />
      )
    );
  }, [messageWarning]);

  const renderModalDuplicate = useCallback(() => {
    return (
      isModalDuplicate && (
        <ModalCustom
          visible={isModalDuplicate}
          onCancel={() => {
            setIsModalDuplicate(false);
            setUnitDuplicate(undefined);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Duplicate"
          onSubmit={() => {
            if (unitDuplicate) {
              handleUnitDuplicate(unitDuplicate);
            }
          }}
          titleCenter
        >
          <div>Are you sure you want to duplicate this unit ?</div>
        </ModalCustom>
      )
    );
  }, [isModalDuplicate, unitDuplicate]);

  const handleDuplicateUnit = (index: number, values: IUnit) => {
    setUnitDuplicate(values);
    setIsModalDuplicate(true);
  };

  const handleCancelAddOrEditUnit = () => {
    setSelectedUnit(undefined);
    setActiveTab(ActiveTab.Default);
  };

  const handleAddOrEditUnit = useCallback(
    (values: any) => {
      if (selectedUnit) {
        const temp = [...listUnits];
        temp[selectedUnit.index] = values;
        setListUnits(temp);
        setSelectedUnit(undefined);
        setActiveTab(ActiveTab.Default);
        setIsChanging(true);
      } else {
        const temp = [...listUnits];
        temp.push(values);
        setListUnits(temp);
        setSelectedUnit(undefined);
        setActiveTab(ActiveTab.Default);
        setIsChanging(true);
      }
    },
    [selectedUnit, listUnits],
  );

  const handleResetEditableUnit = useCallback(() => {
    if (listUnits.length > 0) {
      const temp = [...listUnits];
      const findIsEditable = temp.findIndex((x) => x.isEditable);
      if (findIsEditable >= 0) {
        temp[findIsEditable].isEditable = false;
        setListUnits(temp);
      }
    }
  }, [listUnits]);

  const handleClickTab = (key: number) => {
    handleResetEditableUnit();
    setSelectedUnit(undefined);
    setActiveTab(key);
  };

  const LIST_ADD_ITEMS = (
    <Menu>
      <Menu.Item
        key="0"
        onClick={() => {
          handleClickTab(ActiveTab.AddContent);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <ContentSVG />
          Content
        </a>
      </Menu.Item>
      <Menu.Item
        key="1"
        onClick={() => {
          handleClickTab(ActiveTab.AddWebContent);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <WebContentSVG />
          Web Content
        </a>
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => {
          handleClickTab(ActiveTab.AddVideo);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <CameraSVG />
          Video
        </a>
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={() => {
          handleClickTab(ActiveTab.AddAudio);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <PlaySVG />
          Audio
        </a>
      </Menu.Item>
      <Menu.Item
        key="4"
        onClick={() => {
          handleClickTab(ActiveTab.AddDocument);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <DocumentSVG />
          Presentation|Document
        </a>
      </Menu.Item>
      {/* <Menu.Item key="5">
                <a className='ant-select-item ant-select-item-option'>
                    <TagSVG />
                    SCORM | xAPI | cmi5
                </a>
            </Menu.Item> */}
      {/* <Menu.Item key="6">
                <a className='ant-select-item ant-select-item-option'>
                    <FrameSVG />
                    Frame
                </a>
            </Menu.Item> */}
      <Menu.Item
        key="7"
        onClick={() => {
          handleClickTab(ActiveTab.AddTest);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <WarningSVG />
          Test
        </a>
      </Menu.Item>
      {/* <Menu.Item key="8">
                <a className='ant-select-item ant-select-item-option'>
                    <ListSVG />
                    Survey
                </a>
            </Menu.Item> */}
      <Menu.Item
        key="9"
        onClick={() => {
          handleClickTab(ActiveTab.AddAssignment);
        }}
      >
        <a className="ant-select-item ant-select-item-option">
          <AssignmentSVG />
          Assignment
        </a>
      </Menu.Item>
      {/* <Menu.Item key="10">
                <a className='ant-select-item ant-select-item-option'>
                    <WarningSVG />
                    Instructor-led training
                </a>
            </Menu.Item>
            <Menu.Item key="11">
                <a className='ant-select-item ant-select-item-option'>
                    <ComputerSVG />
                    Section
                </a>
            </Menu.Item>
            <Menu.Item key="12">
                <a className='ant-select-item ant-select-item-option'>
                    <DuplicateSVG />
                    Clone from another course
                </a>
            </Menu.Item>
            <Menu.Item key="13">
                <a className='ant-select-item ant-select-item-option'>
                    <LinkSVG />
                    Link from another course
                </a>
            </Menu.Item> */}
    </Menu>
  );

  const renderCurrentTab = useCallback(
    (values: ActiveTab) => {
      switch (values) {
        case ActiveTab.AddContent:
          return (
            <CreateUnit
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
              listUnits={listUnits}
              setListUnits={setListUnits}
            />
          );
        case ActiveTab.ReOrder:
          return (
            <Content className="rounded-3xl bg-white p-8" title="Add content">
              <Reorder
                listUnits={listUnits}
                setActiveTab={setActiveTab}
                setListUnits={setListUnits}
                setIsChanging={setIsChanging}
              />
            </Content>
          );
        case ActiveTab.RulesAndPath:
          return (
            <RulesAndPath
              setActiveTab={setActiveTab}
              onSubmitRulesAndPath={onSubmitRulesAndPath}
              sessionData={sessionData}
            />
          );
        case ActiveTab.ViewAsStudent:
          return (
            <ViewAsStudent
              setActiveTab={setActiveTab}
              units={listUnits}
            />
          );
        case ActiveTab.Reports:
          return <Reports setActiveTab={setActiveTab} onSubmitReports={onSubmitReports} />;
        case ActiveTab.AddWebContent:
          return (
            <CreateUnitWithWebContent
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
              listUnits={listUnits}
              setListUnits={setListUnits}
            />
          );
        case ActiveTab.AddAssignment:
          return (
            <CreateUnitWithAssignment
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
            />
          );
        case ActiveTab.AddVideo:
          return (
            <CreateUnitWithVideo
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
              listUnits={listUnits}
              setListUnits={setListUnits}
            />
          );
        case ActiveTab.AddAudio:
          return (
            <CreateUnitWithAudio
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
              listUnits={listUnits}
              setListUnits={setListUnits}
            />
          );
        case ActiveTab.AddDocument:
          return (
            <CreateUnitWithDocument
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
              listUnits={listUnits}
              setListUnits={setListUnits}
            />
          );
        case ActiveTab.AddTest:
          return (
            <CreateUnitWithTest
              sessionData={sessionData}
              selectedUnit={selectedUnit}
              handleAddOrEditUnit={handleAddOrEditUnit}
              handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
              listUnits={listUnits}
              setListUnits={setListUnits}
            />
          );
        case ActiveTab.Default:
          return (
            <Content className="rounded-3xl bg-white p-8" title="Add content">
              {listUnits && listUnits.length > 0 ? (
                <>
                  <ListUnits
                    setActiveTab={setActiveTab}
                    listUnits={listUnits}
                    handleSubmitEditUnit={handleSubmitEditUnit}
                    handleSetEditableUnit={handleSetEditableUnit}
                    handleOnClickDeleteUnit={handleOnClickDeleteUnit}
                    handleUndoAndDisableUnit={handleUndoAndDisableUnit}
                    handleOnClickEditUnit={handleOnClickEditUnit}
                    handleDuplicateUnit={handleDuplicateUnit}
                  />

                  {(!isOpenContentFirst || (isOpenContentFirst && isChanging)) && (
                    <div className="flex gap-x-3 justify-end">
                      <ButtonCustom
                        color="orange"
                        onClick={() => {
                          handleSubmitAddContentPage();
                        }}
                      >
                        Submit
                      </ButtonCustom>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-fontFamily font-bold mb-0 tracking-tight">
                    Add content to your session
                  </p>
                  <p className="text-base font-fontFamily font-normal mb-6 mt-2 text-[#AEA8A5]">
                    Drag-and-drop files here. Or click the Add button above to start building your
                    course.
                  </p>

                  <UploadFileCustom
                    buttonTitle="Find a “Upload Content” Image"
                    getFilePath={getFilePath}
                    maximumSize={1048576}
                    type="image"
                  />
                </>
              )}
            </Content>
          );
        default:
          return (
            <Content className="rounded-3xl bg-white p-8" title="Add content">
              {listUnits && listUnits.length > 0 ? (
                <>
                  <ListUnits
                    setActiveTab={setActiveTab}
                    listUnits={listUnits}
                    handleSubmitEditUnit={handleSubmitEditUnit}
                    handleSetEditableUnit={handleSetEditableUnit}
                    handleOnClickDeleteUnit={handleOnClickDeleteUnit}
                    handleUndoAndDisableUnit={handleUndoAndDisableUnit}
                    handleOnClickEditUnit={handleOnClickEditUnit}
                    handleDuplicateUnit={handleDuplicateUnit}
                  />

                  {(!isOpenContentFirst || (isOpenContentFirst && isChanging)) && (
                    <div className="flex gap-x-3 justify-end">
                      <ButtonCustom
                        color="orange"
                        onClick={() => {
                          handleSubmitAddContentPage();
                        }}
                      >
                        Submit
                      </ButtonCustom>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-fontFamily font-bold mb-0 tracking-tight">
                    Add content to your session
                  </p>
                  <p className="text-base font-fontFamily font-normal mb-6 mt-2 text-[#AEA8A5]">
                    Drag-and-drop files here. Or click the Add button above to start building your
                    course.
                  </p>
                  <UploadFileCustom
                    buttonTitle="Find a “Upload Content” Image"
                    getFilePath={getFilePath}
                    maximumSize={1048576}
                    type="image"
                  />
                </>
              )}
            </Content>
          );
      }
    },
    [
      activeTab,
      sessionData,
      selectedUnit,
      isOpenContentFirst,
      handleAddOrEditUnit,
      handleCancelAddOrEditUnit,
      setActiveTab,
      setListUnits,
      onSubmitRulesAndPath,
      onSubmitReports,
      handleSubmitEditUnit,
      handleSetEditableUnit,
      handleOnClickDeleteUnit,
      handleUndoAndDisableUnit,
      handleOnClickEditUnit,
      handleDuplicateUnit,
      handleSubmitAddContentPage,
    ],
  );

  return (
    <>
      <Layout className="bg-transparent gap-y-6">
        <div>
          <div className="flex items-center mb-6 gap-3 flex-wrap">
            <DropDownCustom
              items={LIST_ADD_ITEMS}
              title={'Add'}
              className={'bg-transparent xl:w-full'}
            />

            <ButtonCustom
              color="outline"
              className="bg-transparent custom-bg-transparent-btn   session-state"
              onClick={() => handleClickTab(ActiveTab.ReOrder)}
            >
              Reorder
            </ButtonCustom>

            <ButtonCustom
              color="outline"
              className="bg-transparent custom-bg-transparent-btn  session-state"
              onClick={() => handleClickTab(ActiveTab.ViewAsStudent)}
            >
              View as Student
            </ButtonCustom>

            <ButtonCustom
              color="outline"
              className="bg-transparent custom-bg-transparent-btn   session-state"
              onClick={() => handleClickTab(ActiveTab.RulesAndPath)}
            >
              Rules and path
            </ButtonCustom>

            <ButtonCustom
              color="outline"
              className="bg-transparent custom-bg-transparent-btn  session-state"
              onClick={() => handleClickTab(ActiveTab.Reports)}
            >
              Reports
            </ButtonCustom>
          </div>

          {renderCurrentTab(activeTab)}
          {/* {
                        // create unit - add content
                        activeTab === ActiveTab.AddContent ? (
                            <CreateUnit
                                sessionData={sessionData}
                                selectedUnit={selectedUnit}
                                handleAddOrEditUnit={handleAddOrEditUnit}
                                handleCancelAddOrEditUnit={handleCancelAddOrEditUnit}
                            />
                        ) :
                            (activeTab === ActiveTab.ReOrder ? (
                                <Content className="rounded-3xl bg-white p-8" title="Add content">
                                    <Reorder
                                        listUnits={listUnits}
                                        setActiveTab={setActiveTab}
                                        setListUnits={setListUnits}
                                    />
                                </Content>
                            ) : (
                                (
                                    // rules and path
                                    activeTab === ActiveTab.RulesAndPath ? (
                                        <RulesAndPath
                                            setActiveTab={setActiveTab}
                                            onSubmitRulesAndPath={onSubmitRulesAndPath}
                                            sessionData={sessionData}
                                        />
                                    ) : (
                                        // report
                                        activeTab === ActiveTab.Reports ? (
                                            <Reports
                                                setActiveTab={setActiveTab}
                                                onSubmitReports={onSubmitReports}
                                            />
                                        ) : (
                                            <Content className="rounded-3xl bg-white p-8" title="Add content">
                                                {
                                                    listUnits && listUnits.length > 0 ? (
                                                        <>
                                                            <ListUnits
                                                                setActiveTab={setActiveTab}
                                                                listUnits={listUnits}
                                                                handleSubmitEditUnit={handleSubmitEditUnit}
                                                                handleSetEditableUnit={handleSetEditableUnit}
                                                                handleOnClickDeleteUnit={handleOnClickDeleteUnit}
                                                                handleUndoAndDisableUnit={handleUndoAndDisableUnit}
                                                                handleOnClickEditUnit={handleOnClickEditUnit}
                                                                handleDuplicateUnit={handleDuplicateUnit}
                                                            />
                                                            <div className="flex gap-x-3 justify-end">

                                                                <ButtonCustom
                                                                    color="orange"
                                                                    onClick={() => {
                                                                        handleSubmitAddContentPage();
                                                                    }}
                                                                >
                                                                    Submit
                                                                </ButtonCustom>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-2xl font-fontFamily font-bold mb-0 tracking-tight">
                                                                Add content to your session
                                                            </p>
                                                            <p className="text-base font-fontFamily font-normal mb-6 mt-2 text-[#AEA8A5]">
                                                                Drag-and-drop files here. Or click the Add button above to start building your course.
                                                            </p>
                                                            <UploadFileCustom
                                                                buttonTitle='Find a “Upload Content” Image'
                                                                getFilePath={getFilePath}
                                                                maximumSize={1048576}
                                                                imageOnly
                                                            />
                                                        </>
                                                    )
                                                }
                                            </Content>
                                        )
                                    ))
                            ))
                    } */}
        </div>
      </Layout>
      {renderModalWarning()}
      {renderModalConfirmDelete()}
      {renderModalDuplicate()}
    </>
  );
};

export default AddContentSession;
