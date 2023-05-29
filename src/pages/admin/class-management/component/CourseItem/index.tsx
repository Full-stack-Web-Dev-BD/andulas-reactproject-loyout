import { Collapse } from 'antd';
import { InfoType } from 'constants/types';
import { useState } from 'react';
import ClassItem from '../ClassItem';

interface IProps {
  expandIconPosition?: 'end' | 'start';
  courses: InfoType[];
}

const Panel = Collapse.Panel;

const CourseItem = (props: IProps) => {
  const { expandIconPosition = 'end', courses } = props;

  const [activeKey, setActiveKey] = useState<string | string[]>('');

  return (
    <>
      {courses &&
        courses.length > 0 &&
        courses.map((course) => (
          <Collapse
            expandIconPosition={expandIconPosition}
            className="card-item"
            activeKey={activeKey}
            onChange={(key: string | string[]) => setActiveKey(key)}
            key={course.id}
          >
            <Panel
              header={
                <span className="text-lg text-[#32302D] font-fontFamily">
                  {course?.courseName}
                </span>
              }
              key={course?.id?.toString() || ''}
            >
              <ClassItem classes={course.classes || []} category={course.courseCategory} />
            </Panel>
          </Collapse>
        ))}
    </>
  );
};

export default CourseItem;
