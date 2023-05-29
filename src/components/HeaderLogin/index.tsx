import { AppContext } from 'context';
import React, { useContext, useEffect } from 'react';
import LogoLoginSVG from '../../assets/images/logo.svg';

interface IHeaderLogin {
  title?: string;
}
const HeaderLogin = (props: IHeaderLogin) => {
  const [state]: any = useContext(AppContext);
  const logoUrl = state?.themeLogin?.logoUrl;
  const logoHeight = state?.themeLogin?.logoHeight || '47px';
  const { title } = props;

  useEffect(() => {
    if (logoHeight) {
      const logoSize = document.getElementById('logo');
      if (logoSize) {
        logoSize.style.height = logoHeight;
      }
    }
  }, [logoHeight]);

  return (
    <>
      <img className='w-[138px] object-contain' id="logo" src={logoUrl ? logoUrl : LogoLoginSVG} alt="Logo" />
      {title && (
        <span className="text-center font-bold text-xl xl:text-2xl tracking-tight my-3 xl:my-6 text-main-font-color">
          {title}
        </span>
      )}
    </>
  );
};

export default HeaderLogin;
