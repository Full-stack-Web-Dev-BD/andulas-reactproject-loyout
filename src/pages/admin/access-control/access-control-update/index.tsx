import { Breadcrumb, Layout, notification } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import {
  getAccessControls,
  getAccessMenus,
  updateAccessControls,
  updateMenuSideBar,
} from 'api/access_control';
import { getProfileMe, IUser } from 'api/user';
import ButtonCustom from 'components/Button';
import Loading from 'components/Loading';
import ModalCustom from 'components/Modal';
import { IAccessControl, IAccessControlItem, IMenuAccess, ROUTES } from 'constants/index';
import { AppContext } from 'context';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CardItemRoleUpdate from '../component/CardItemRoleUpdate';
import CardItemUpdateAccessMenu from '../component/CardItemUpdateAccessMenu';
import CollapseParentItem from '../component/CollapseParentItem';

interface IState {
  roleName: string;
}

const AccessControlUpdate = () => {
  const location = useLocation();
  const history = useNavigate();
  const { id } = useParams();
  const state = location.state as IState;
  const [sidebarMenus, setSidebarMenus] = useState<IMenuAccess[]>([]);
  const [accessControls, setAccessControls] = useState<IAccessControl[]>([]);
  const [stateContext, setStateContext]: any = useContext(AppContext);
  const [roleName, setRoleName] = useState('');
  const [isOpenConfirmLeavePage, setIsOpenConfirmLeavePage] = useState<string>('');
  const [sideBarData, setSidebarData] = useState<Array<IMenuAccess>>([]);
  const [sideBarDataCurrent, setSidebarDataCurrent] = useState<Array<IMenuAccess>>([]);
  const [accessControlData, setAccessControlData] = useState<Array<IAccessControlItem>>([]);
  const [accessControlDataCurrent, setAccessControlDataCurrent] = useState<
    Array<IAccessControlItem>
  >([]);

  const wrapperData = useCallback((data: Array<IMenuAccess>) => {
    const wrapData: Array<IMenuAccess> = [];
    data.map((item: IMenuAccess) => {
      wrapData.push(item);
      if (item?.menuChildren?.length > 0) {
        item?.menuChildren?.map((els: IMenuAccess) => {
          wrapData.push(els);
          if (els?.menuChildren?.length > 0) {
            els.menuChildren.map((el: IMenuAccess) => {
              wrapData.push(el);
            });
          }
        });
      }
      setSidebarData(wrapData);
      setSidebarDataCurrent(wrapData.filter((x) => x.selected));
    });
  }, []);

  const onCancelAccessMenu = () => {
    const dataSelected = sideBarData.filter((x) => x.selected);
    const oldData = JSON.stringify(sideBarDataCurrent);
    const newData = JSON.stringify(dataSelected);
    if (oldData === newData) {
      history(ROUTES.access_control);
    } else {
      setIsOpenConfirmLeavePage('Access Menu');
    }
  };

  const wrapperAccessControl = useCallback(
    (data: Array<IAccessControl>, dataSelected: Array<IAccessControl>) => {
      const wrapData: Array<IAccessControlItem> = [];
      data.map((item: IAccessControl) => {
        if (item?.accessControls?.length > 0) {
          item?.accessControls?.map((els: IAccessControlItem) => {
            wrapData.push(els);
          });
        }
      });
      const result = wrapData.map((item) => {
        const isSelect = dataSelected.some((i) => i.id == item.id);
        return {
          ...item,
          selected: isSelect,
        };
      });
      setAccessControlData(result);
      setAccessControlDataCurrent(result.filter((x) => x.selected));
    },
    [],
  );

  const onCancelAccessControl = () => {
    const dataSelected = accessControlData.filter((x) => x.selected);
    const oldData = JSON.stringify(accessControlDataCurrent);
    const newData = JSON.stringify(dataSelected);
    if (oldData === newData) {
      history(ROUTES.access_control);
    } else {
      setIsOpenConfirmLeavePage('Access Control');
    }
  };

  const { mutate: getAccessMenuSideBar } = useMutation('getAccessMenus', getAccessMenus, {
    onSuccess: ({ data }) => {
      if (data?.sidebarMenus?.length > 0) {
        setSidebarMenus(data?.sidebarMenus);
        wrapperData(data?.sidebarMenus);
        setRoleName(data?.roleName);
      }
    },
  });

  const { mutate: getAccessControlSideBar } = useMutation('getAccessControls', getAccessControls, {
    onSuccess: ({ data }) => {
      wrapperAccessControl(data[0]?.accessControlGroups, data[1]);
      setAccessControls(data[0]?.accessControlGroups);
    },
  });

  const { mutate: getInfoCurrentUser, isLoading } = useMutation(
    'getInfoCurrentUser',
    getProfileMe,
    {
      onSuccess: ({ data }: { data: IUser }) => {
        setStateContext({
          ...stateContext,
          themeMain: data.theme,
          commonTemplate: data?.commonTemplate?.templateSetups,
          sidebarMenus: data?.userRole?.sidebarMenus,
        });
      },
    },
  );

  const { mutate: updateAccessMenuSideBar } = useMutation('updateMenuSideBar', updateMenuSideBar, {
    onSuccess: () => {
      getInfoCurrentUser();
      getAccessMenuSideBar(Number(id));
      notification.success({ message: 'Access Menu has been updated' });
    },
    onError: () => {
      notification.error({ message: 'Update Access Menu Failed' });
    },
  });

  const { mutate: updateAccessControl } = useMutation('updateAccessControl', updateAccessControls, {
    onSuccess: () => {
      getAccessControlSideBar(Number(id));
      notification.success({ message: 'Access Control has been updated' });
    },
    onError: () => {
      notification.error({ message: 'Update Access Control Failed' });
    },
  });

  const onChangeSelectedMenu = useCallback(
    (item: IMenuAccess, value: CheckboxChangeEvent) => {
      value.stopPropagation();
      const selected = value.target.checked;
      const newDataSelected = sideBarData.map((el) => {
        if (
          el.resourcePath.includes(item.resourcePath) &&
          (el.resourcePath.includes(item.resourcePath + '/') ||
            !el.resourcePath.replace(item.resourcePath, ''))
        ) {
          return { ...el, selected: selected };
        }
        return el;
      });
      setSidebarData(newDataSelected);
    },
    [sideBarData],
  );

  const onChangeSelectedControl = useCallback(
    (item: IAccessControlItem, value: CheckboxChangeEvent) => {
      value.stopPropagation();
      const selected = value.target.checked;
      const newDataSelected = accessControlData.map((el) => {
        if (el.id == item.id) {
          return { ...el, selected: selected };
        }
        return el;
      });
      setAccessControlData(newDataSelected);
    },
    [accessControlData],
  );

  const onChangeSelectedGroupControl = useCallback(
    (item: IAccessControl, value: CheckboxChangeEvent) => {
      value.stopPropagation();
      const selected = value.target.checked;
      const newDataSelected = accessControlData.map((el) => {
        if (item.accessControls.some((x) => x.id == el.id)) {
          return { ...el, selected: selected };
        }
        return el;
      });
      setAccessControlData(newDataSelected);
    },
    [accessControlData],
  );

  useEffect(() => {
    getAccessMenuSideBar(Number(id));
    getAccessControlSideBar(Number(id));
  }, [id]);

  const handleUpdateAccessMenuSideBar = useCallback(() => {
    const sidebarMenuIds = sideBarData.filter((item) => item.selected === true).map((el) => el.id);
    updateAccessMenuSideBar({ sidebarMenuIds, roleId: Number(id) });
  }, [sideBarData, id]);

  const handleUpdateAccessControl = useCallback(() => {
    const accessControlIds = accessControlData
      .filter((item) => item.selected === true)
      .map((el) => el.id);
    updateAccessControl({ accessControlIds, roleId: Number(id) });
  }, [accessControlData, id]);

  const handleCancelUpdate = useCallback(() => {
    history(ROUTES.access_control);
  }, []);

  return (
    <Layout className="p-0 sm:p-0 md:p-0 lg:p-0 xl:p-16 2xl:p-16 bg-transparent">
      <Breadcrumb
        style={{
          color: '#AEA8A5',
          fontWeight: '700',
          lineHeight: '36px',
          fontSize: '28px',
        }}
        className="font-fontFamily text-main-font-color"
      >
        <Breadcrumb.Item className="opacity-50 cursor-pointer" href="/access-control">
          Access Control
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color">
          {roleName}
        </Breadcrumb.Item>
      </Breadcrumb>
      <CollapseParentItem title="Access Menu">
        <>
          <div className="flex gap-4 flex-wrap mt-6  ">
            {sidebarMenus.map((item, index) => (
              <CardItemUpdateAccessMenu
                onChangeSelectedMenu={onChangeSelectedMenu}
                dataSelected={sideBarData}
                data={item}
                key={index}
              />
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <ButtonCustom
              className="lg:w-[calc(50%_-_0.375rem)]"
              onClick={onCancelAccessMenu}
              color="outline"
            >
              Cancel
            </ButtonCustom>
            <div className="lg:w-[calc(50%_-_0.375rem)]">
              <ModalCustom
                className="custom-width"
                cancelText="Cancel"
                viewComponent={<ButtonCustom color="orange">Update</ButtonCustom>}
                titleCenter
                okText="Confirm"
                content={`Are you sure want to update the access menu for ${roleName}?`}
                title="Confirmation"
                onSubmit={handleUpdateAccessMenuSideBar}
              />
            </div>
          </div>
        </>
      </CollapseParentItem>

      <CollapseParentItem title="Access Control">
        <>
          <div className="flex gap-4 flex-wrap mt-6  ">
            {accessControls.map((item, index) => (
              <CardItemRoleUpdate
                data={item}
                key={index}
                onChangeSelectedControl={onChangeSelectedControl}
                onChangeSelectedGroupControl={onChangeSelectedGroupControl}
                dataSelected={accessControlData}
              />
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <ButtonCustom
              className="lg:w-[calc(50%_-_0.375rem)]"
              onClick={onCancelAccessControl}
              color="outline"
            >
              Cancel
            </ButtonCustom>
            <div className="lg:w-[calc(50%_-_0.375rem)]">
              <ModalCustom
                cancelText="Cancel"
                viewComponent={<ButtonCustom color="orange">Update</ButtonCustom>}
                titleCenter
                okText="Confirm"
                content={`Are you sure want to update the access control for ${roleName}?`}
                title="Confirmation"
                onSubmit={handleUpdateAccessControl}
              />
            </div>
          </div>
        </>
      </CollapseParentItem>
      <ModalCustom
        cancelText="Cancel"
        titleCenter
        visible={isOpenConfirmLeavePage !== '' ? true : false}
        okText="Confirm"
        content={`You have modified the ${
          isOpenConfirmLeavePage || ''
        }. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.`}
        title="Notice"
        onCancel={() => setIsOpenConfirmLeavePage('')}
        onSubmit={handleCancelUpdate}
      />
      <Loading isDisplayOverlay isLoading={isLoading} />
    </Layout>
  );
};

export default AccessControlUpdate;
