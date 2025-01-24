import {useEffect, useState} from "react";

const DropdownMenu = ({options, onSelect, initial}) => {

    const [selectedItem, setSelectedItem] = useState("")
    const [isOpenDropdown, setIsOpenDropdown] = useState(false)
    const button = document.getElementById("button")
    const toggleDropdown = () => {
        setIsOpenDropdown(!isOpenDropdown)
    }

    const select = (e) => {
        setSelectedItem(e)
        button.blur()
        onSelect(e)
    }

    useEffect(() => {
        setSelectedItem(initial)
    }, []);

    return (
        <div>
            <button id={"button"} onClick={((e) => {e.preventDefault(); toggleDropdown()})} onBlur={() => toggleDropdown(false)}
                className="flex w-full hover:bg-default/20 relative border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2">
                <span className="block">
                    {selectedItem ? selectedItem : "Selecione uma seção"}
                </span>
                {isOpenDropdown &&
                    <ul className={"flex flex-col overflow-hidden shadow-md rounded-md w-full absolute top-0 left-0"}>
                        {
                            options.map((item) => <li key={item.name}  onClick={() => select(item.name)} className={"transition-all flex items-center p-3 hover:bg-default h-12 w-full bg-gray-200 hover:text-white"}>{item.name}</li>)
                        }
                    </ul>
                }
            </button>
        </div>
    )
}

export default DropdownMenu;