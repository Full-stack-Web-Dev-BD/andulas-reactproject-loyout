/* Dependencies */
import React, { useCallback, useState } from 'react';

interface IProps {
  modalComponent?: any;
  viewComponent?: any;
}

interface IProp {
  open: boolean;
  toggleModal: () => void;
}

const WrapperModal = (props: IProps) => {
  const { modalComponent, viewComponent } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const renderViewComponent = useCallback((viewComponents: any, prop: IProp) => {
    if (typeof viewComponents === 'function') {
      return viewComponents(prop);
    }

    return <div onClick={toggle}>{viewComponents}</div>;
  }, []);

  const modalProps = {
    open: isOpen,
    toggleModal: toggle,
  };

  return (
    <React.Fragment>
      {renderViewComponent(viewComponent, modalProps)}
      {modalComponent(modalProps)}
    </React.Fragment>
  );
};

export default WrapperModal;
