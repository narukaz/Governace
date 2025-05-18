import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/header/header";
import Home from "./components/home/home";
import VotePortal from "./components/portal/vote_portal";
import { Toaster } from "@/components/ui/sonner";
import Admin_portal from "./components/Admin_portal";

function App() {
  return (
    <>
      <div className="bg-gray-500 w-full h-lvh flex flex-col justify-start">
        {/* <h1 className="text-5xl">I am working </h1> */}
        {/* <Header /> */}
        <div className=" bg-white">
          <Routes>
            <Route path="/" index element={<Home />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/vote" element={<VotePortal />}></Route>
            <Route path="/admin" element={<Admin_portal />}></Route>
          </Routes>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;
