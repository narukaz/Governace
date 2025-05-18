import React, { useEffect, useState } from "react";
import vl from "../../assets/vl.svg";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { toast } from "sonner";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-gradient-to-b from-indigo-100 via-white to-blue-100 z-10 mx-auto   h-lvh flex flex-col items-center justify-center py-12 gap-6">
      <div className="px-4 ">
        <img src={vl} className="w-[200px] mx-auto " />
      </div>
      <div className="text-center h-20 font-mono  mb-9 space-y-3  ">
        <h1 className="font-thin text-2xl">
          Click. Cast. Counted. Your voice, your vote—digitally delivered!
        </h1>
        <p>
          this platform is wrapped by blockchain and is tottaly transparent{" "}
          <br /> anyone can check the status and confirmation of their casted
          vote either <br />
          on the chain or on the dashboard
        </p>
      </div>
      <div className="flex justify-center gap-1 hover:gap-10 hover:tracking-widest transition-all cursor-pointer  ">
        <Button
          className="bg-blue-600"
          onClick={() => {
            navigate("/vote");
            toast("Event has been created.");
          }}
        >
          Begin <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export default Home;
