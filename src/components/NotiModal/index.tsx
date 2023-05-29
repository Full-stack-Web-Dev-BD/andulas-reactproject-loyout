import React from 'react';
import EmailSentSVG from 'assets/images/emailsent.svg';
interface INotiModal {
  text?: string;
  title?: string;
  image?: boolean;
}
const NotiModal = (props: INotiModal) => {
  const { text, title, image } = props;
  return (
    <>
      {image && <img src={EmailSentSVG} alt="email sent" />}

      <span className="font-fontFamily text-main-font-color text-center font-bold text-[28px] tracking-tight my-6">
        {title}
      </span>
      <span className="font-fontFamily font-normal text-center text-sm mb-2 text-main-font-color">
        {text}
      </span>
    </>
  );
};

export default NotiModal;
