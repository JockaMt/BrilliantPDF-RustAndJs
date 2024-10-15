import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const ItemList = ({name, quant, id}) => {

    const [clicked, setClicked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (clicked){
            setTimeout(() => {
                setClicked(!clicked);
                setTimeout(()=>{
                    console.log(id);
                    navigate(`/addItem/${id}`)
                }, 100);
            }, 100);
            
        }
    }, [clicked])
    

    return (
        <li onClick={() => {setClicked(!clicked)}} className={`flex transition-all ${clicked ? "scale-95" : ""} justify-between text-nowrap text-white p-3 hover:bg-default/60 bg-default rounded-md`}>
            <span className="w-16">{id}</span>
            <span>{name}</span>
            <span className="w-16 text-right">{quant}</span>
        </li>
    )
}

export default ItemList;