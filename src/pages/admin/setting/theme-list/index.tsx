import { Breadcrumb, Form } from 'antd';
import { deleteTheme, getAllTemplateThemes, ITemplateTheme } from 'api/theme';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import Loading from 'components/Loading';
import ModalCustom from 'components/Modal';
import CardTheme from 'pages/admin/setting/component/CardTheme';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

const ThemeList = () => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const [templateTheme, setTemplateTheme] = useState<ITemplateTheme>({});
  const { mutate, isLoading } = useMutation('getAllTemplateThemes', getAllTemplateThemes, {
    onSuccess: ({ data }: { data: ITemplateTheme }) => {
      setTemplateTheme({ templateName: data.templateName, themes: data.themes });
    },
  });
  const { templateID } = useParams();

  const { mutate: mutateDeleteTheme } = useMutation('deleteTheme', deleteTheme, {
    onSuccess: ({ themeID }: { data: { themeID: number }; themeID: number }) => {
      const newThemes = templateTheme?.themes?.filter(
        (item) => Number(item.id) !== Number(themeID),
      );
      setTemplateTheme({
        ...templateTheme,
        themes: newThemes,
      });
    },
  });

  useEffect(() => {
    mutate({ templateID: Number(templateID) });
  }, []);

  const handleCreateNewTheme = useCallback(({ themeName }: { themeName: string }) => {
    history('/settings/templates/theme', { state: { themeName, templateID: templateID, templateName: templateTheme?.templateName } });
  }, [templateTheme]);

  return (
    <>
      <div className="flex justify-between gap-4">
        <Breadcrumb className="content-title text-preview-theme-font-color !font-previewFontFamily custom-font-header">
          <Breadcrumb.Item
            onClick={() => {
              history('/settings/themes');
            }}
            className="!opacity-50 font-fontFamily text-main-font-color cursor-pointer"
          >
            Themes
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            {templateTheme?.templateName}
          </Breadcrumb.Item>
        </Breadcrumb>
        <ModalCustom
          contentLeft
          title="Create new theme"
          titleCenter
          viewComponent={
            <ButtonCustom isWidthFitContent={true} color="orange">
              Create new theme
            </ButtonCustom>
          }
          okText="Confirm"
          cancelText="Cancel"
          onSubmit={form.submit}
        >
          <Form form={form} onFinish={handleCreateNewTheme} layout="vertical">
            <Form.Item
              colon
              rules={[
                { required: true, message: 'Theme Name is required!' },
                { min: 5, message: 'Theme Name should consist of at least 5 characters' },
              ]}
              className="mb-0"
              label="Theme Name"
              name="themeName"
            >
              <CustomInput />
            </Form.Item>
          </Form>
        </ModalCustom>
      </div>
      <Loading isLoading={isLoading}>
        <div className="flex gap-6 justify-start flex-wrap f-justify-center">
          {Array.isArray(templateTheme?.themes) &&
            templateTheme?.themes?.map((theme: { themeName: string ; id: number }) => {
              return (
                <>
                  <CardTheme
                    icon
                    templateID={Number(templateID)}
                    themeId={Number(theme.id)}
                    themeName={theme.themeName}
                    templateName={templateTheme.templateName}
                    deleteTheme={() => {
                      mutateDeleteTheme({ themeID: Number(theme.id) });
                    }}
                  >
                    {theme.themeName}
                  </CardTheme>
                </>
              );
            })}
        </div>
      </Loading>
    </>
  );
};

export default ThemeList;
