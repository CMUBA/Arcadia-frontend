import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800">
      <div className="flex gap-4">
        <Link 
          to="/home" 
          className="text-white hover:text-gray-300"
        >
          Home
        </Link>
        <Link 
          to="/" 
          className="text-white hover:text-gray-300"
        >
          Market
        </Link>
      </div>
      <WalletSelector />
    </nav>
  );
} 