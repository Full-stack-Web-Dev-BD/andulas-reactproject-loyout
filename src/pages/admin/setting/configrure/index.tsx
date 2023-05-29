import { Checkbox, Layout, Radio, Space } from 'antd';
import ModalCustom from 'components/Modal';
import React, { useState } from 'react';
import './index.css';
import './custom-configrure.css';

export default function Configure() {
  const optionsHeader = [
    { label: 'Announcement', value: 'announcement' },
    { label: 'Notification', value: 'notification' },
    { label: 'Report', value: 'report' },
    { label: 'XXX', value: 'XXX' },
  ];

  const optionsDashboard = [
    { label: 'Calendar', value: 'calendar' },
    { label: 'Notification', value: 'notification' },
    { label: 'Report', value: 'report' },
    { label: 'XXX', value: 'XXX' },
  ];

  const [visibleHeader, setVisibleHeader] = useState(false);
  const [visibleDashboard, setVisibleDashboard] = useState(false);
  const [titleDashbord, setTitleDashboard] = useState<string>('');
  const [isSelected, setIsSelected] = useState(undefined);
  const handleHeader = () => {
    setVisibleHeader(true);
  };

  const onChangeHeader = (e: any) => {
    if (e.target.checked) {
      setIsSelected(e.target.name);
    } else {
      setIsSelected(undefined);
    }
  };

  const ModalHeader = () => {
    return (
      <ModalCustom
        visible={visibleHeader}
        cancelText="Cancel"
        onCancel={() => {
          setVisibleHeader(false);
        }}
        okText="Update"
        onSubmit={() => {}}
        title="Header Dashboard"
        titleCenter
        contentLeft
        content={
          <Radio.Group>
            <Space direction="vertical">
              {optionsHeader.length > 0 ? (
                optionsHeader.map((item, key) => {
                  return (
                    <Radio
                      className="custom-radio py-[8px]"
                      key={key}
                      onChange={onChangeHeader}
                      value={item.value}
                    >
                      {item.label}
                    </Radio>
                  );
                })
              ) : (
                <></>
              )}
            </Space>
          </Radio.Group>
        }
      />
    );
  };

  const ModalDashboard = (props: any) => {
    const { title } = props;
    return (
      <ModalCustom
        visible={visibleDashboard}
        cancelText="Cancel"
        onCancel={() => {
          setVisibleDashboard(false);
        }}
        okText="Update"
        onSubmit={() => {}}
        title={title}
        titleCenter
        contentLeft
        // styleCancel={"text-black"}
        content={
          <Radio.Group>
            <Space direction="vertical">
              {optionsDashboard.length > 0 ? (
                optionsDashboard.map((item, key) => {
                  return (
                    <Radio
                      className="custom-radio py-[8x]"
                      key={key}
                      onChange={onChangeHeader}
                      value={item.value}
                    >
                      {item.label}
                    </Radio>
                  );
                })
              ) : (
                <></>
              )}
            </Space>
          </Radio.Group>
        }
      />
    );
  };
  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div>
        <ModalHeader />
        <ModalDashboard title={titleDashbord} />
        <div className="font-meriweather font-bold text-3xl w-full h-[36px] m-[5px]">
          Configure Dashboard
        </div>
        <div className="flex flex-col gap-3">
          <div
            className="w-full h-[320px] px-[72px] py-[64px] bg-[#FCECD9] rounded-3xl mt-8"
            onClick={handleHeader}
          >
            <p className="font-meriweather font-bold text-2xl leading-8">
              Press to select the dashboard you prefer
            </p>
            <p className="font-meriweather font-normal text-lg leading-7">
              Maybe default as Announcement for this
            </p>
          </div>
          <div className="flex gap-3 min-h-[240px] pb-[30px] font-meriweather custom-configrure">
            <div
              className="basis-1/3 rounded-3xl h-full bg-[#FBE4D7] px-[72px] py-[64px] font-bold text-2xl leading-8"
              onClick={() => {
                setVisibleDashboard(true);
                setTitleDashboard('Body 1 Dashboard');
              }}
            >
              Press to select the dashboard you prefer
            </div>
            <div
              className="basis-1/3 rounded-3xl h-full bg-[#E6F2F2] px-[72px] py-[64px] font-bold text-2xl leading-8"
              onClick={() => {
                setVisibleDashboard(true);
                setTitleDashboard('Body 2 Dashboard');
              }}
            >
              Press to select the dashboard you prefer
            </div>
            <div
              className="basis-1/3 rounded-3xl h-full bg-[#FCECD9] px-[72px] py-[64px] font-bold text-2xl leading-8"
              onClick={() => {
                setVisibleDashboard(true);
                setTitleDashboard('Body 3 Dashboard');
              }}
            >
              Press to select the dashboard you prefer
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
