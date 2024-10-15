const Header = ({page}) => {
    return (
        <header className="flex bg-default h-20">
            <div className="flex w-28"></div>
            <div className="flex justify-center w-[100%] items-center text-2xl font-medium text-white"><span>{page}</span></div>
            <div className="flex w-28"></div>
        </header>
    )
}

export default Header;