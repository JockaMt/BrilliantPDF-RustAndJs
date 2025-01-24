import { useState, useEffect } from "react"
import {useNavigate} from "react-router-dom"
import {Checkbox} from "@mui/material";

const ItemList = ({name, setMarked, id, section, image}) => {

    const [clicked, setClicked] = useState(false);
    const navigate = useNavigate();
    const handleCheck = () => {
        setMarked(id)
    }

    useEffect(() => {
        if (clicked){
            setTimeout(() => {
                setClicked(!clicked);
                setTimeout(()=>{
                    navigate(`/addItem?id=${id}&section=${section}`);
                }, 100);
            }, 100);
            
        }
    }, [clicked])
    

    return (
        <li className={`flex min-h-12 overflow-hidden bg-default items-center rounded-md transition-all w-full ${clicked ? "scale-95" : ""}`}>
            <img style={{paddingLeft: '1rem', width: '3rem', height: '2.5rem', objectFit: 'cover'}} src={image} alt={"image"}/>
            <div onClick={() => {
                setClicked(!clicked)
            }} className={`flex flex-1 overflow-hidden w-auto justify-between text-nowrap text-white p-3 bg-default rounded-l-md`}>
                <span className="w-16">{id}</span>
                <span className={"flex w-full pr-16 justify-evenly overflow-hidden"}>{name}</span>
            </div>
            <Checkbox className={""} onChange={handleCheck} sx={{color: '#ffffff', "&.Mui-checked": {
                    color: "#ffffff",
                },}} type={"checkbox"}/>
            <span className={"peer-checked:bg-default"}></span>
        </li>
    )
}

export default ItemList;