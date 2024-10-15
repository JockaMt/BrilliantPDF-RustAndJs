import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const SectionList = ({name, quant}) => {

    const [clicked, setClicked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (clicked){
            setTimeout(() => {
                setClicked(!clicked);
                setTimeout(()=>{
                    navigate(`/editSection/${name}`)
                }, 100);
            }, 100);
            
        }
    }, [clicked])
    

    return (
        <li onClick={() => {setClicked(!clicked)}} className={`flex transition-all ${clicked ? "scale-95" : ""} justify-center text-nowrap text-white p-3 hover:bg-default/60 bg-default rounded-md`}>
            <spann>{name}</spann>
            <span>{quant}</span>
        </li>
    )
}

export default SectionList;