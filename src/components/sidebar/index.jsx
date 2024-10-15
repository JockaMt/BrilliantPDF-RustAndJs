import logo from "../../assets/Logo1.png"
import { IoClose, IoMenu } from "react-icons/io5";
import { useState, createContext } from 'react';
import { RiAccountCircleLine } from "react-icons/ri";

export const SidebarContext = createContext()

const SideBar = ({children}) => {

    const [expanded, setExpanded] = useState(false)

    return (
        <aside className="fixed h-screen z-50">
            <div className={`h-full ${expanded ? "w-60" : "w-16"} transition-all bg-white flex flex-col border-r shadow-sm`}>
                <div className={`flex mx-3 h-20 pt-6 pb-6 "py-4" justify-between items-center`}>
                    <div className={`${expanded ? "flex" : "hidden"} gap-3`}><img src={logo} className="w-12 h-8"/><h1 className="flex text-nowrap flex-1 w-full font-bold text-default text-lg">Brilliant PDF</h1></div>
                    <button onClick={() => setExpanded((curr) => !curr)} className={`flex flex-1 px-1 w-6 h-full ${expanded ? "justify-end" : "justify-center"} items-center`}>
                        {expanded ? <IoClose size={16}/> : <IoMenu size={30}/>}
                    </button>
                </div>
                <SidebarContext.Provider value={{expanded}}>
                    <ul className={`flex-1 text-nowrap overflow-y-auto overflow-x-hidden border-y-2 ${expanded ? "mx-3" : "mx-0"}`}>
                        {children}
                    </ul>
                </SidebarContext.Provider>
                <div className={`flex ${expanded ? "mx-4 justify-start" : "justify-center"} items-center h-16`}>
                    <RiAccountCircleLine size={32}/>
                </div>
            </div>
        </aside>
    )
}

export default SideBar;