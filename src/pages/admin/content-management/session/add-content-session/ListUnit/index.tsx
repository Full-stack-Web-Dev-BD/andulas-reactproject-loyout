import { Form, Input, Select } from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType } from 'antd/lib/select';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import CustomTooltip from 'components/Tooltip';
import React, { useCallback, useEffect, useState } from 'react';

import { ReactComponent as ContentSVG } from 'assets/icons/content_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as BlockSVG } from 'assets/icons/block_icon.svg';
import { ReactComponent as PenNoteSVG } from 'assets/icons/pen_note_icon.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as CheckedSVG } from 'assets/icons/checked_icon.svg';
import { ReactComponent as CloseSVG } from 'assets/icons/x-icon.svg';
import { ReactComponent as LinkSVG } from 'assets/icons/link.svg';
import { ReactComponent as OutlineCheckedSVG } from 'assets/icons/outline_checked_icon.svg';

import { IUnit, ListUnit, UnitType } from '..';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as WebContentSVG } from 'assets/icons/web_content_icon.svg';
import { ReactComponent as CameraSVG } from 'assets/icons/camera_icon.svg';
import { ReactComponent as PlaySVG } from 'assets/icons/play_icon.svg';
import { ReactComponent as DocumentSVG } from 'assets/icons/document_icon.svg';
import { ReactComponent as TagSVG } from 'assets/icons/tag_icon.svg';
import { ReactComponent as FrameSVG } from 'assets/icons/frame_icon.svg';
import { ReactComponent as WarningSVG } from 'assets/icons/warning_icon.svg';
import { ReactComponent as ListSVG } from 'assets/icons/list_icon.svg';
import { ReactComponent as AssignmentSVG } from 'assets/icons/assignment_icon.svg';
import { ReactComponent as ComputerSVG } from 'assets/icons/computer_icon.svg';

import "./style.css";
export const renderUnitIcon = (items: IUnit) => {
    switch (items.unitType) {
        case UnitType.CONTENT:
            if (items.isUploadedFile) {
                return (
                    <LinkSVG />
                )
            }
            else {
                return (
                    <ContentSVG />
                )
            }
        case UnitType.WEB_CONTENT:
            return (
                <WebContentSVG />
            )
        case UnitType.VIDEO:
            return (
                <CameraSVG />
            )
        case UnitType.AUDIO:
            return (
                <PlaySVG />
            )
        case UnitType.DOCUMENT:
            return (
                <DocumentSVG />
            )
        case UnitType.SCORM_XAPI_CMI5:
            return (
                <TagSVG />
            )
        case UnitType.FRAME:
            return (
                <FrameSVG />
            )
        case UnitType.TEST:
            return (
                <WarningSVG />
            )
        case UnitType.SURVEY:
            return (
                <ListSVG />
            )
        case UnitType.ASSIGNMENT:
            return (
                <AssignmentSVG />
            )
        case UnitType.INSTRUCTOR_LED_TRAINING:
            return (
                <WarningSVG />
            )
        case UnitType.SECTION:
            return (
                <ComputerSVG />
            )
        default:
            return (
                <ContentSVG />
            )
    }
}

interface IProps {
    setActiveTab: (values: number) => void;
    listUnits: ListUnit[]
    handleSubmitEditUnit: (index: number, values: IUnit, newName: string) => void;
    handleSetEditableUnit: (index: number, values: IUnit, action: boolean) => void;
    handleOnClickDeleteUnit: (index: number, values: IUnit) => void;
    handleUndoAndDisableUnit: (index: number, values: IUnit) => void;
    handleOnClickEditUnit: (index: number, values: IUnit) => void;
    handleDuplicateUnit: (index: number, values: IUnit) => void;
}

const ListUnits = (props: IProps) => {

    const {
        setActiveTab,
        listUnits,
        handleSubmitEditUnit,
        handleSetEditableUnit,
        handleOnClickDeleteUnit,
        handleUndoAndDisableUnit,
        handleOnClickEditUnit,
        handleDuplicateUnit,
    } = props;

    const [form] = Form.useForm();

    const history = useNavigate();

    const [editedName, setEditedName] = useState<string>('');

    const handleBack = () => {
        setActiveTab(1);
    };

    const setUnitEditable = (index: number, values: IUnit) => {
        setEditedName(values.unitName);
        handleSetEditableUnit(index, values, true);
    }

    const cancelEditable = useCallback((index: number, values: IUnit) => {
        setEditedName('');
        handleSetEditableUnit(index, values, false);
        for (let i = 0; i < listUnits.length; i++) {
            form.setFields([
                {
                    name: `input${index}`,
                    errors: undefined,
                },
            ]);
        }
    }, [listUnits])

    const handleOnChangeEditedName = (event: any) => {
        setEditedName(event.target.value);
    }



    const handleSaveNewName = useCallback((index: number, values: IUnit) => {
        if (!editedName || editedName.trim() === "") {
            form.setFields([
                {
                    name: `input${index}`,
                    errors: ['This field is required!'],
                },
            ]);
            return;
        }

        else {
            handleSubmitEditUnit(index, values, editedName.trim())
        }
    }, [editedName, form]);

    useEffect(() => {
        if (listUnits?.length > 0) {
            for (let i = 0; i < listUnits.length; i++) {
                form.setFieldValue(`input${i}`, listUnits[i].unitName);
            }
        }
    }, [listUnits])

    return (
        <div className="flex gap-x-3 flex-col cus-table__list-unit">

            <Form
                form={form}
            >
                {
                    listUnits?.map((unit, index) => {
                        return (
                            <div
                                className={`list-unit-item relative flex items-start justify-between mb-4 ${listUnits.some(x => x.isEditable) && !unit.isEditable ? "opacity-16" : ""}`}
                                key={unit.id || `new-unit-${index}`}>
                                <div
                                    className="ml-5 flex item-center justify-center absolute content-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <CustomTooltip title="Content">
                                        {
                                            renderUnitIcon(unit)
                                        }
                                    </CustomTooltip>
                                </div>
                                <Form.Item
                                    name={`input${index}`}
                                    rules={[{ required: true, message: 'This field is required!' }]}
                                >
                                    <Input
                                        className='cus-input-wsp'
                                        onChange={handleOnChangeEditedName}
                                        placeholder={'Unit Name'}
                                        value={unit.isEditable ? editedName : unit.unitName}
                                        disabled={!unit.isEditable}
                                    />
                                </Form.Item>

                                {
                                    !unit.isEditable ? (
                                        <>
                                            <div
                                                className="cursor-pointer ml-1 unit_action_icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUnitEditable(index, unit);
                                                }}
                                            >
                                                <CustomTooltip title="Rename">
                                                    <EditSVG className="icon-hover" />
                                                </CustomTooltip>
                                            </div>
                                            <div
                                                className={`cursor-pointer ml-1 unit_action_icon ${unit.unitType === UnitType.CONTENT && unit.isUploadedFile ? "disabled" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!(unit.unitType === UnitType.CONTENT && unit.isUploadedFile)) {
                                                        handleOnClickEditUnit(index, unit)
                                                    }
                                                }}
                                            >
                                                <CustomTooltip title="Edit">
                                                    <PenNoteSVG className="icon-hover" />
                                                </CustomTooltip>
                                            </div>
                                            <div
                                                className="cursor-pointer ml-1 unit_action_icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDuplicateUnit(index, unit);
                                                }}
                                            >
                                                <CustomTooltip title="Duplicate">
                                                    <DuplicateSVG className="icon-hover" />
                                                </CustomTooltip>
                                            </div>
                                            <div
                                                className="cursor-pointer ml-1 unit_action_icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUndoAndDisableUnit(index, unit);
                                                }}
                                            >
                                                <CustomTooltip title={unit.isDisabled ? "Unblock" : "Block"}>
                                                    {
                                                        unit.isDisabled ? (
                                                            <OutlineCheckedSVG className="icon-hover" />
                                                        ) : (
                                                            <BlockSVG className="icon-hover" />
                                                        )
                                                    }
                                                </CustomTooltip>
                                            </div>
                                            <div
                                                className="cursor-pointer ml-1 unit_action_icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOnClickDeleteUnit(index, unit)
                                                }}
                                            >
                                                <CustomTooltip title="Delete">
                                                    <TrashSVG className="icon-hover" />
                                                </CustomTooltip>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="cursor-pointer ml-1 unit_action_icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveNewName(index, unit)
                                                }}
                                            >
                                                <CustomTooltip title="Save">
                                                    <CheckedSVG className="icon-hover" />
                                                </CustomTooltip>
                                            </div>
                                            <div
                                                className="cursor-pointer ml-1 unit_action_icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    cancelEditable(index, unit);
                                                }}
                                            >
                                                <CustomTooltip title="Cancel">
                                                    <CloseSVG className="icon-hover" />
                                                </CustomTooltip>
                                            </div>
                                        </>
                                    )
                                }

                            </div>
                        );
                    })
                }
            </Form>

        </div>
    );
}

export default ListUnits;