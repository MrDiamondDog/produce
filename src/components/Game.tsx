import { X } from "lucide-react";
import React from "react";
import Divider from "./Divider";

export type GameProps = {
    open: boolean;
    onClose: () => void;
}

export default function Game({ children, open, onClose }: GameProps & React.PropsWithChildren) {
    return (open && <div className="absolute-center text-center">
        <X className="ml-auto cursor-pointer text-gray-500" onClick={onClose} size={32} />
        <Divider />
        {children}
    </div>);
}
