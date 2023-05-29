import { Layout, Row, Col } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as ContentManagementSVG } from 'assets/images/contentManagement.svg';
import './style.css';

const { Header, Content } = Layout;

const Report = [
  { id: 1, text: 'Report 1' },
  { id: 2, text: 'Report 2' },
  { id: 3, text: 'Report 3' },
  { id: 4, text: 'Report 4' },
  { id: 5, text: 'Report 5' },
];

const Example = [
  { id: 1, text: 'User Reports' },
  { id: 2, text: 'Courses Reports' },
  { id: 3, text: 'Branch Reports' },
  { id: 4, text: 'Group Reports' },
  { id: 5, text: 'Scorm Reports' },
  { id: 6, text: 'Test Reports' },
  { id: 7, text: 'Survey Reports' },
  { id: 8, text: 'Assignment Reports' },
  { id: 9, text: 'ILT Reports' },
];

const ReportAdmin = () => {
  const history = useNavigate();
  const [dataList, setDataList] = useState<any>(Report);
  const [examleList, setExampleList] = useState<any>(Example);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Reports
        </p>
      </Header>
      <Content className="flex flex-col gap-y-6">
        <div className="grid grid-cols-3 gap-5">
          {dataList?.length > 0 &&
            dataList?.map((data: any) => (
              <div
                key={data?.id}
                className="basis-1/3 bg-[#FFFFFF] flex items-center gap-[24px] py-[16px] px-[24px] rounded-3xl h-[72px] shadow-[0px 8px 32px rgba(0, 0, 0, 0.04)] pr-5 custom_padding"
              >
                <ContentManagementSVG className="w-[26.67px] h-[33.33px] " />{' '}
                <div className="text-base font-bold ">{data?.text} 111</div>
              </div>
            ))}
        </div>
        <div className="bg-[#FFFFFF] shadow-[0px 8px 32px rgba(0, 0, 0, 0.04)] p-8 rounded-3xl mb-5 ">
          <p className="text-[24px] font-bold leading-8 text-[#32302D]">Example</p>
          <div className="grid grid-cols-3 gap-5">
            {examleList?.length > 0 &&
              examleList?.map((examle: any) => (
                <div
                  key={examle?.id}
                  className="basis-1/3 bg-[#FCECD9] flex items-center gap-[24px] py-[16px] px-[24px] rounded-3xl h-[72px] shadow-[0px 8px 32px rgba(0, 0, 0, 0.04)] pr-5 custom_padding"
                >
                  <div className="text-base text-[18px] custom_font">{examle?.text}</div>
                </div>
              ))}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ReportAdmin;
