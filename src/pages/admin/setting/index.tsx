import { getAllTemplate } from 'api/theme';
import Loading from 'components/Loading';
import CardTheme from 'pages/admin/setting/component/CardTheme';
import React, { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
  const history = useNavigate();
  const { data, mutate, isLoading } = useMutation('getAllTemplate', getAllTemplate);
  useEffect(() => {
    mutate();
  }, []);
  return (
    <Loading isLoading={isLoading}>
      <div className="content-title">Themes</div>
      <div className="flex gap-6 justify-start flex-wrap f-justify-center">
        {data?.data.templates.map((theme: { id: number; templateName: string }) => {
          return (
            <>
              <CardTheme
                onClick={() => {
                  history(`/settings/templates/${theme.id}/themes`);
                }}
              >
                {theme.templateName}
              </CardTheme>
            </>
          );
        })}
      </div>
    </Loading>
  );
};

export default Setting;
