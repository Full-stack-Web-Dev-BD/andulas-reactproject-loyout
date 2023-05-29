import React from 'react';

interface ITemplate {
  templateName: string;
  id: number;
}

const TemplateLetter = ({
  templates,
  setTemplateId,
}: {
  templates: ITemplate[];
  setTemplateId: (value: number) => void;
}) => {
  return (
    <>
      <div className="font-fontFamily text-main-font-color text-2xl font-bold">Letter</div>
      <div className="font-fontFamily text-main-font-color my-4 text-sm ml-4">Template</div>

      {templates.map((temp) => {
        return (
          <div
            key={Number(temp.id)}
            className="w-full rounded-2xl bg-white my-4 py-4 px-6 font-fontFamily font-bold text-base cursor-pointer shadow-[0_8_32_rgba(0_0_0_0.04)]"
            onClick={() => {
              setTemplateId(Number(temp.id));
            }}
          >
            {temp.templateName}
          </div>
        );
      })}
    </>
  );
};

export default TemplateLetter;
