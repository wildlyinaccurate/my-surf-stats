import React from "react";
import style from "./icons.module.scss";

export type IconProps = {
    className: string;
    children: React.ReactNode;
};

export default function Icon({ className, children }: IconProps) {
    return <div className={`${style["icon"]} ${className}`}>{children}</div>;
}
