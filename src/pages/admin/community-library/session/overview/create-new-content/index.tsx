import { Layout } from 'antd';
import ButtonCustom from 'components/Button';
import { ROUTES } from 'constants/constants';
import PreviewContentCreationComponent from 'pages/admin/hq-library/teacher/session/overview/create-new-content/PreviewContentCreation';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CommunityLibraryContentCreation = () => {
  const history = useNavigate();
  const { topicId, sessionId, moduleId } = useParams();
  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Content Creation
        </p>

        {/* <ButtonCustom
          color="outline"
          onClick={() => {
            history(
              ROUTES.community_library +
                `/topic/${topicId}/module/${moduleId}/session/${sessionId}/overview`,
            );
          }}
        >
          Exit
        </ButtonCustom> */}
      </div>
      
      <PreviewContentCreationComponent 
        moduleId={moduleId}
        sessionId={sessionId}
        topicId={topicId}
      />
    </Layout>
  );
};

export default CommunityLibraryContentCreation;
