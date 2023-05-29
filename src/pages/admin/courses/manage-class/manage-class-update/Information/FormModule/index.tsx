import ButtonCustom from 'components/Button';
import CollapseModule, { ISessionsModule } from 'pages/admin/courses/component/CollapseModule';
import { useCallback, useEffect, useState } from 'react';
import { IForm } from '..';
import { ReactComponent as ShowIcon } from 'assets/icons/show_less.svg';

interface IProps {
  forms: IForm;
  id?: string | number;
  returnSessionsModule: (module: ISessionsModule[], index: number) => void;
  onChangeModule: (index: number[], key: string | boolean[]) => (value: { label: string; value: string }) => void;
  validationSessionModule: (index: number[], key: string | boolean[]) => void;
  item: IForm;
  indexClass: number;
  isShowLessButton: boolean;
  total: number;
  isEdit: boolean;
  isShowError: boolean;
  setIsChangeField: (val: boolean) => void;
  returnCentre: (data: { label: string; value: string }, index: number) => void;
  classesList: IForm[];
}

const FormModule = (props: IProps) => {
  const {
    forms,
    onChangeModule,
    returnSessionsModule,
    id,
    item,
    indexClass,
    isShowLessButton,
    total,
    isEdit,
    isShowError,
    setIsChangeField,
    returnCentre,
    validationSessionModule,
    classesList
  } = props;
  const [isShowLess, setIsShowLess] = useState<boolean>(true);

  const renderModules = useCallback(
    (x: IForm, index: number) => {
      const newModule = x?.modules?.length > 0 ? x?.modules : [forms];
      return (
        Array.isArray(newModule) &&
        newModule.map((module, indexModule) => (
          <CollapseModule
            disable={isEdit}
            returnCentre={returnCentre}
            indexClass={index}
            indexModule={indexModule}
            returnSessionsModule={returnSessionsModule}
            courseName={x?.formValue?.courseName?.value}
            centre={x?.formValue?.centre}
            onChangeModule={onChangeModule}
            key={indexModule}
            validationSessionModule={validationSessionModule}
            data={module as { sessions: [] }}
            startDate={x.formValue.startDate}
            endDate={x.formValue.endDate}
            idClass={Number(id)}
            isShowError={isShowError}
            setIsChangeField={setIsChangeField}
            isShowLess={isShowLess && total - 1 !== index && newModule?.length > 1}
            classesList={classesList}
          />
        ))
      );
    },
    [classesList,isShowLess, onChangeModule, returnSessionsModule, total, isShowError, isEdit, id, item, forms],
  );

  const toggleModule = useCallback(() => {
    setIsShowLess(!isShowLess);
  }, [isShowLess]);

  useEffect(() => {
    if(total === 1) {
      setIsShowLess(false);
      return;
    }
    if(total > 1) {
      setIsShowLess(true);
    }
  },[total])

  return (
    <div className='responsive__form-module'>
      {renderModules(item, indexClass)}
      {item?.modules?.length > 1 && isShowLessButton && total - 1 !== indexClass && (
        <div className="text-right">
          <ButtonCustom
            color="outline"
            onClick={toggleModule}
            icon={<ShowIcon className="icon-button mr-1" />}
            className="mt-4"
            isWidthFitContent
          >
            {isShowLess ? 'Show more' : 'Show less'}
          </ButtonCustom>
        </div>
      )}
    </div>
  );
};

export default FormModule;
