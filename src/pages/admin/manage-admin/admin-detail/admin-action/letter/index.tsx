import React, { useState } from 'react';
import EditTemplate from './editTemplate';
import TemplateLetter from './templates';

const templates = [
  { templateName: 'Template A', id: 1 },
  { templateName: 'Template B', id: 2 },
  { templateName: 'Template C', id: 3 },
  { templateName: 'Template D', id: 4 },
  { templateName: 'Template E', id: 5 },
];

const LetterTab = () => {
  const [templateId, setTemplateId] = useState<number | undefined>(undefined);

  return (
    <>
      {templateId ? (
        <EditTemplate templateId={templateId} setTemplateId={setTemplateId} />
      ) : (
        <TemplateLetter templates={templates} setTemplateId={setTemplateId} />
      )}
    </>
  );
};

export default LetterTab;
