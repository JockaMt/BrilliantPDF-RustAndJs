import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const SectionList = ({name, onDelete}) => {

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

    const handleDelete = () => {
        onDelete(name);
    };

    return (
        <li className={`flex group relative transition-all ${clicked ? "scale-95" : ""} justify-center text-nowrap text-white hover:bg-default/60 bg-default rounded-md`}>
            <span onClick={() => {setClicked(!clicked)}} className={"flex justify-center w-full p-3"}>{name}</span>
            <button onClick={handleDelete} className={"absolute hidden group-hover:block font-medium right-0 top-0 p-3"}>Apagar</button>
        </li>
    )
}

export default SectionList;