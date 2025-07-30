"use client";

import { Check, EllipsisVertical, Pencil, Trash2, X } from "lucide-react";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "./Dropdown";
import { useState } from "react";
import Input from "./Input";

export default function TodoItem({ checked, onChange, label, disabled, onEdit, onDelete }:
    { checked?: boolean, onChange?: (checked: boolean) => void,
        label?: string, disabled?: boolean, onEdit?: (name: string) => void, onDelete?: () => void }) {
    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(label);

    function edit() {
        if (!editText)
            return;

        onEdit?.(editText);
        setEditMode(false);
    }

    return (
        <div className="flex gap-1 items-center justify-between">
            <div className="flex gap-1 items-center select-none" onClick={() => (!disabled && !editMode) && onChange?.(!checked)}>
                <div
                    className={`min-w-5 min-h-5 rounded-sm border-2 border-bg-lighter 
                transition-all relative ${checked && "bg-primary"} ${!disabled && "cursor-pointer"}`}
                >
                    {checked && <Check size={16} strokeWidth={5} className="absolute-center mt-[1px]" />}
                </div>
                {!editMode && <p className="text-wrap">{label}</p>}
                {editMode && <Input
                    placeholder="Label"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="my-1"
                />}
            </div>
            {!editMode && <Dropdown>
                <DropdownTrigger asChild>
                    <EllipsisVertical className="text-gray-500 cursor-pointer" />
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownItem className="flex items-center gap-1" onClick={() => setEditMode(true)}><Pencil /> Edit</DropdownItem>
                    <DropdownItem className="flex items-center gap-1" danger onClick={onDelete}><Trash2 /> Delete</DropdownItem>
                </DropdownContent>
            </Dropdown>}
            {editMode && <div className="flex gap-1 items-center *:cursor-pointer">
                <Check onClick={edit} />
                <X onClick={() => {
                    setEditMode(false);
                    setEditText(label);
                }} />
            </div>}
        </div>
    );
}
