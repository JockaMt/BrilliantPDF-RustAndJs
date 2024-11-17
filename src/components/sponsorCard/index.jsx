import {RiArrowUpSLine, RiInstagramFill, RiWhatsappFill} from "react-icons/ri";
import {useState} from "react";

const SponsorCard = ({sponsor}) => {

    const [open, setOpen] = useState(false)

    return (
        <div>
            <div className={"flex flex-col transform duration-500 transition-all p-2 min-w-50  hover:bg-default/20 hover:cursor-pointer rounded-md"}>
                <div onClick={() => setOpen(!open)} className={"flex items-center gap-3"}>
                    <img className={"w-12 h-12 object-cover rounded-full"} src={sponsor.image} alt={"profile"}/>
                    <p className={"font-medium flex flex-1"}>
                    {sponsor.name}
                    </p>
                    <RiArrowUpSLine className={`transition-transform duration-400 ${open ? "scale-100" : "scale-[-1]"}`}/>
                </div>
                <div className={`transition-all duration-400 ${open ? "h-16 pt-3" : "h-0 overflow-hidden"}`}>
                    <a className={`flex items-center gap-1 transition-all duration-400 text-gray-700 hover:text-default font-medium
                        ${open ? "opacity-100" : "opacity-0"}`} target={"_blank"}
                       href={`https://www.instagram.com/${sponsor.instagram}`}><RiInstagramFill
                        size={20}/>@{sponsor.instagram}</a>
                    <a className={`flex items-center gap-1 transition-all duration-400 text-gray-700 hover:text-default font-medium
                        ${open ? "opacity-100" : "opacity-0"}`} target={"_blank"}
                       href={`https://wa.me/${sponsor.number}`}><RiWhatsappFill
                        size={20}/>{sponsor.number}</a>
                </div>
            </div>
        </div>
    )
}

export default SponsorCard;