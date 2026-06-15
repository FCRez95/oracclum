import Image from "next/image";
import SymbolOracclum from "@/assets/logos/symbolOracclum.svg";
import Link from "next/link";

const DemoButton = () => {
  return (
    <Link
      className="z-3 bg-[#5EC899] text-small absolute bottom-10 right-14 flex items-center rounded-[30px] py-[15px] px-[25px] cursor-pointer border-none"
      href="/login"
    >
      <Image
        className="w-4 h-4 bg-transparent mr-[5px]"
        src={SymbolOracclum}
        alt="Símbolo Oracclum"
      />
      <div>DEMO</div>
    </Link>
  );
};
export default DemoButton;
