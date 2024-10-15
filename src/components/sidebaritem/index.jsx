import { useContext } from 'react';
import {SidebarContext} from "../sidebar";

const SidebarItem = ({icon, text, active, alert, onClick}) => {
    const { expanded } = useContext(SidebarContext)
    return (
        <li onClick={onClick} className={`flex transition-all active:bg-default/50 ${expanded ? "justify-start" : "justify-center"} h-14 items-center gap-3 ${expanded ? "p-4" : "p-1 py-4"} hover:bg-default/20 rounded-md hover:cursor-default`}>
            {icon}
            <span className={`${expanded ? "flex" : "hidden"}`}>{text}</span>
        </li>
    )
}

export default SidebarItem;