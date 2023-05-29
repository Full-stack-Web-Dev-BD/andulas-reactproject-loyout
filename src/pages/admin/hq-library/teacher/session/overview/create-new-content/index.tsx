import { Button, Layout } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import PreviewContentCreationComponent from './PreviewContentCreation';

const HQLibraryContentCreationTeacher = () => {
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
            // history(
            //   ROUTES.hq_library +
            //     `/topic/${topicId}/module/${moduleId}/session/${sessionId}/overview/teacher`,
            // );
            handleExit();
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

export default HQLibraryContentCreationTeacher;
