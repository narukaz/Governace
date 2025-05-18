import { ConnectButton } from "@mysten/dapp-kit";
import vl from "../../assets/vl.svg";

function Header() {
  return (
    <div className="w-full px-9 py-4 bg-gradient-to-r from-indigo-100 via-white to-blue-100 flex items-center justify-between sticky top-0 left-0 shadow-md z-20 backdrop-blur-md">
      <img src={vl} className="w-[70px] h-[70px] " alt="Logo" />
      <ConnectButton className="font-mono bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300 ease-in-out" />
    </div>
  );
}

export default Header;
