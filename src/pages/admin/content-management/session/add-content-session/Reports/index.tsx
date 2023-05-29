import { Form, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import React, { useEffect, useState } from 'react';

interface IProps {
    onSubmitReports: () => void;
    setActiveTab: (values: number) => void;
}

const Reports = (props: IProps) => {

    const { onSubmitReports, setActiveTab } = props;

    const handleBack = () => {
        setActiveTab(0);
    };

    return (
        <Content className="rounded-3xl bg-white p-8" title="Reports">
            <div className="flex gap-x-3">
                <div
                    className=""
                    style={{
                        minHeight: "650px"
                    }}
                >

                </div>
            </div>
            <div className="flex gap-x-3 justify-end">
                <ButtonCustom color="outline" onClick={handleBack}>
                    Cancel
                </ButtonCustom>

                <ButtonCustom
                    color="orange"
                    onClick={() => {
                        handleBack();
                    }}
                >
                    Continue
                </ButtonCustom>
            </div>
        </Content>
    );
}

export default Reports;