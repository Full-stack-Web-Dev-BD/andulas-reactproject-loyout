import { Collapse } from 'antd';
import { getCourseSessionsByModule } from 'api/courses';
import { Moment } from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { IForm } from '../../manage-class/manage-class-update/Information';
import CardSessionModule from '../CardSessionModule';
import './style.css';

const Panel = Collapse.Panel;
export interface ISessionsModule {
  id: number;
  index: number;
  moduleName: string;
  sessions: Array<ISession>;
}

export interface ISession {
  id: number;
  sessionId: number;
  sessionName: string;
  time?: Array<Moment>;
  centre: { label: string; value: string } | any;
  classRoom: { label: string; value: string } | any;
  teachers: { label: string; value: string }[] | any;
  disabled?: boolean;
  error?: boolean;
}

interface IProps {
  data: {
    moduleName?: string;
    sessions: ISession[] | [];
  };
  expandIconPosition?: 'end' | 'start';
  onChangeModule: (
    index: number[],
    key: string | boolean[],
  ) => (value: { label: string; value: string }) => void;
  validationSessionModule: (index: number[], key: string | boolean[]) => void;
  courseName: string | { label: string; value: string };
  indexClass: number;
  indexModule: number;
  startDate: string;
  endDate: string;
  idClass: number;
  returnSessionsModule: (data: ISessionsModule[], index: number) => void;
  returnCentre: (data: { label: string; value: string }, index: number) => void;
  disable: boolean;
  centre: { label: string; value: string };
  isShowError: boolean;
  setIsChangeField: (val: boolean) => void;
  isShowLess: boolean;
  classesList: IForm[];
}

const CollapseModule = (props: IProps) => {
  const {
    data,
    expandIconPosition = 'end',
    courseName,
    indexClass,
    returnSessionsModule,
    returnCentre,
    onChangeModule,
    indexModule,
    endDate,
    startDate,
    idClass,
    disable,
    centre,
    isShowError,
    setIsChangeField,
    isShowLess,
    validationSessionModule,
    classesList
  } = props;
  const [isActive, setIsActive] = useState<string | string[]>('');

  const toggleCollapse = useCallback(
    (key: string | string[]) => {
      if (data?.sessions?.length > 0) {
        setIsActive(key);
      }
    },
    [data, disable],
  );

  const { mutate: getSessionsModule } = useMutation(
    'getCourseSessionsByModule',
    getCourseSessionsByModule,
    {
      onSuccess: (res: { data: ISessionsModule[] }) => {
        const modules = res.data.map((item) => {
          return {
            ...item,
            sessions: item.sessions.map((session) => {
              return {
                ...session,
                teachers: [],
                centre: centre ? centre : '',
                classRoom: '',
                time: undefined,
                disabled: idClass ? false : true,
              };
            }),
          };
        });
        if (!idClass) {
          returnSessionsModule(modules, indexClass);
        }
      },
    },
  );

  useEffect(() => {
    if (courseName) {
      getSessionsModule(Number(courseName));
    }
  }, [courseName]);

  useEffect(() => {
    if(!idClass) {
      returnCentre(centre, indexClass);
    }
  }, [centre, idClass]);

  return data?.moduleName && isShowLess && indexModule === 0 ? (
    <Collapse
      expandIconPosition={expandIconPosition}
      className="card-item-module"
      activeKey={isActive}
      onChange={toggleCollapse}
    >
      <Panel header={data?.moduleName} key="1">
        {data?.sessions?.map((item: ISession, index: number) => (
          <CardSessionModule
            onChangeModule={onChangeModule}
            indexClass={indexClass}
            indexModule={indexModule}
            key={`item-${index}`}
            startDate={startDate}
            endDate={endDate}
            indexSession={index}
            sessions={data?.sessions}
            item={item}
            disabled={disable}
            centre={centre}
            isShowError={isShowError}
            setIsChangeField={setIsChangeField}
            validationSessionModule={validationSessionModule}
            classesList={classesList}
          />
        ))}
      </Panel>
    </Collapse>
  ) : data?.moduleName && !isShowLess ? (
    <Collapse
      expandIconPosition={expandIconPosition}
      className="card-item-module"
      activeKey={isActive}
      onChange={toggleCollapse}
    >
      <Panel header={data?.moduleName} key="1">
        {data?.sessions?.map((item: ISession, index: number) => (
          <CardSessionModule
          disabled={disable}
            sessions={data?.sessions}
            indexSession={index}
            onChangeModule={onChangeModule}
            indexClass={indexClass}
            indexModule={indexModule}
            key={`item-${index}`}
            startDate={startDate}
            endDate={endDate}
            item={item}
            centre={centre}
            isShowError={isShowError}
            setIsChangeField={setIsChangeField}
            validationSessionModule={validationSessionModule}
            classesList={classesList}
          />
        ))}
      </Panel>
    </Collapse>
  ) : null;
};

export default CollapseModule;
