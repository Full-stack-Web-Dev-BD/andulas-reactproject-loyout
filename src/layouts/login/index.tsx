import React, { FC, ReactElement, useCallback, useContext, useEffect } from 'react';
import LoginSVG from 'assets/images/sidebarLoginImage.svg';
// import RegisterSVG from 'assets/images/sidebarRegisterImage.svg';

import { useLocation } from 'react-router-dom';
import { useMutation } from 'react-query';
import { getThemeDefault } from 'api/theme';
import { AppContext } from 'context';
interface Props {
  children?: ReactElement;
}
const DefaultLayoutLoginPage: FC<Props> = ({ children }) => {
  const location = useLocation();
  const [state]: any = useContext(AppContext);
  const sideImage = state?.themeLogin?.sideImageUrl;
  const checkColor = useCallback((color: string) => {
    if (CSS.supports('color', color)) {
      return true;
    }
    return;
  }, []);

  const [stateContext, setStateContext]: any = useContext(AppContext);
  const { mutate } = useMutation('themeDefault', getThemeDefault, {
    onSuccess: ({
      data,
    }: {
      data: {
        templateSetups: {
          fontColor: string;
          buttonColor: string;
          logoUrl: string;
          sideImageUrl: string;
          fontFamily: string;
        };
      };
    }) => {
      if (checkColor(data.templateSetups.fontColor)) {
        document.documentElement.style.setProperty(
          '--main-font-color',
          data.templateSetups.fontColor,
        );
      }
      if (checkColor(data.templateSetups.buttonColor)) {
        document.documentElement.style.setProperty(
          '--main-button-color',
          data.templateSetups.buttonColor,
        );
      }
      document.documentElement.style.setProperty(
        '--main-font-family',
        data.templateSetups.fontFamily + ',' + 'Arial, sans-serif',
      );

      setStateContext({ ...stateContext, themeLogin: data.templateSetups });
    },
  });
  useEffect(() => {
    document.title = 'Login';
    mutate();
  }, []);
  return (
    <div className="h-full p-4">
      <div
        className={`h-full bg-background-color rounded-3xl display-center !pl-0 2xl:pr-0 flex flex-row items-center ${
          location?.pathname === '/register' ? 'justify-center' : 'justify-between'
        } login overflow-hidden content-login`}
      >
        <div
          className={`isHide w-[100%] rounded-3xl  ${
            location?.pathname === '/register' ? 'hidden h-[1378px]' : 'h-[897px]'
          }`}
        >
          <img
            src={sideImage ? sideImage : LoginSVG}
            alt="image login"
            className={`w-full h-full object-cover rounded-3xl`}
          />
        </div>
        <div
          className={`${
            location?.pathname === '/register' ? 'w-2/3' : ''
          } flex flex-row h-full py-4 px-11 padding_login_detail custom-width`}
        >
          <div
            className={`cus_box_Shadow padding_login_detail custom-width bg-[#FFFFFF] rounded-3xl ${
              location?.pathname === '/register' ? 'w-full' : 'w-[512px]'
            } py-8 px-11 xl:py-10 xl:px-16 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center overflow-auto h-full !font-fontFamily !text-main-font-color`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayoutLoginPage;
