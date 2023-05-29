import React, { useCallback, useState } from 'react';
import { ReactComponent as IconDashOutLine } from 'assets/icons/dash_out_lined.svg';
import { Dropdown, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import ModalConfirmDeleteTheme from '../ModalConfirmDeleteTheme';
export interface InfiniteData<TData> {
  pages: TData[];
  pageParams: unknown[];
}
interface IThemes {
  children: string;
  icon?: boolean;
  onClick?: () => void;
  themeId?: number;
  deleteTheme?: () => void;
  templateID?: number;
  themeName?: string;
  templateName?: string;
}

const THEME_DEFAULT = 'Default Theme';

const CardTheme = (props: IThemes) => {
  const { children, icon, onClick, themeId, deleteTheme, templateID, themeName, templateName } =
    props;
  const history = useNavigate();
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);

  const handleConfirmDelete = useCallback(() => {
    setIsOpenConfirm(!isOpenConfirm);
  }, [isOpenConfirm]);

  const menu = (
    <Menu
      items={[
        {
          label: 'Edit',
          key: '1',
          onClick: () => {
            history(`/settings/templates/theme/${themeId}`, {
              state: { templateID, templateName },
            });
          },
        },
        {
          label: 'Delete',
          key: '2',
          onClick: handleConfirmDelete,
        },
      ]}
    />
  );
  const background = [
    'bg-[#FFFFFF]',
    'bg-[#E6F2F2]',
    'bg-[#FCECD9]',
    'bg-[#FAF9F9]',
    'bg-[#FBE4D7]',
  ];
  return (
    <div
      onClick={onClick}
      className={`font-fontFamily text-main-font-color ${
        !icon && 'cursor-pointer'
      } tracking-tighter text-2xl font-bold xl-min:w-[calc(33.33%_-_1rem)] xl:w-[calc(50%_-_0.75rem)] sm:w-full h-[272px] relative rounded-3xl flex justify-center items-center shadow-[0px_8px_32px_rgba(0,0,0,0.04)] ${
        background[Math.floor(Math.random() * background.length)]
      }`}
    >
      {icon && themeName !== THEME_DEFAULT.toString() && (
        <div className="absolute w-12 h-12 rounded-2xl hover:bg-main-button-color top-3 right-2 dash-theme flex items-center cursor-pointer">
          <Dropdown
            trigger={['click']}
            overlay={menu}
            placement="bottomRight"
            className="w-full h-full"
          >
            <div className="w-full h-full flex justify-center items-center">
              <IconDashOutLine />
            </div>
          </Dropdown>
          <ModalConfirmDeleteTheme
            visible={isOpenConfirm}
            onClose={() => setIsOpenConfirm(false)}
            onSubmit={() => {
              if (deleteTheme instanceof Function) {
                deleteTheme();
              }
              setIsOpenConfirm(false);
            }}
            content={`Are you sure you want to delete ${themeName}? This action cannot be undone.`}
            title="Delete"
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default CardTheme;
