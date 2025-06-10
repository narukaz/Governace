import { useEffect, useState } from "react";
import Dashboard from "../dashboard/dashboard";
import Header from "../header/header";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Vote } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetch_party } from "@/store/fetch_party_slice";
import {
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  PACKAGE_ID,
  CITIZEN_OBJ_ID,
  PARTY_REGISTERY,
} from "@/config/config.js";
import axios from "axios";
import { Copy } from "lucide-react";
import PartyCard from "../party_card";
import wt from "../../assets/wt.svg";

function VotePortal() {
  const suiClient = useSuiClient();
  const user = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [open, setOpen] = useState(false);
  const [winnerDetails, setWinnerDetails] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [sorted, setSorted] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const dispatch = useDispatch();
  const [showWinner, setShowWinner] = useState(false);
  const { data, loading, error } = useSelector((state) => state.party);

  //handle input function
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserQuery(value);
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetch_req_party(value);
    }, 600);

    setTypingTimeout(timeout);
  };
  const fetch_req_party = async (value) => {
    try {
      let { data } = await axios.post(
        "https://governace.onrender.com/fetch_sorted_party",
        {
          query: value,
        }
      );
      // console.log("data.data", data.data);
      if (data?.data) {
        // console.log("query data", data.data);
        setSorted(data?.data);
      }
      // console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  const on_cast_vote = async (id) => {
    if (!user?.address) {
      toast.error("User address not found.");
      return;
    }

    try {
      let tx = new Transaction();
      console.log(id);

      tx.moveCall({
        package: PACKAGE_ID,
        module: "votes",
        function: "cast_your_vote",
        arguments: [tx.object(CITIZEN_OBJ_ID), tx.object(id)],
      });

      tx.setSender(user.address);

      const { bytes, signature } = await signTransaction({
        transaction: tx,
        chain: "sui:testnet",
      });

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
      });
      if (result?.digest) {
        setOpen(false);
        toast.success("your vote is casted");
        dispatch(fetch_party());
      }
    } catch (error) {
      console.log(error);
    }
  };
  async function handle_copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error(err);
      console.error("Failed to copy: ", err);
    }
  }
  useEffect(() => {
    dispatch(fetch_party());
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      fetch_req_party(userQuery);
    }
  }, [open]);
  console.log(winnerDetails);
  return (
    <>
      <Header />
      {/* pop-up for winner */}
      {showWinner && (
        <>
          <div className="bg-black w-full h-[100%] fixed left-0 top-0 z-40 opacity-60"></div>
          <img
            src={wt}
            className="fixed z-50 left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] opacity-30 "
          />
          <div className="fixed flex w-auto h-auto px-5 py-3 -translate-x-1/2 -translate-y-1/2 z-60 left-1/2 top-1/2">
            <PartyCard
              key={winnerDetails._id}
              partyName={winnerDetails?.party_name}
              avatarUrl={winnerDetails?.party_icon}
              since={winnerDetails?.since}
              state={winnerDetails?.state}
              blockchainAddress={winnerDetails?.party_obj}
              votes={Number(winnerDetails?.votes)}
            />
            <X
              onClick={() => setShowWinner(false)}
              className="absolute cursor-pointer right-8 top-5"
            />
          </div>
        </>
      )}
      {/* pop over */}

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed top-0 left-0 z-40 w-full h-full bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => {
              setOpen(false);
            }}
          ></div>

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1200px] h-[90%] max-h-[800px] bg-white z-50 rounded-3xl shadow-2xl flex flex-col py-6 px-6 items-center overflow-hidden">
            {/* Close Button */}
            <Button
              onClick={() => {
                setSorted([]);
                setUserQuery("");
                setOpen(false);
              }}
              variant="outline"
              className="absolute p-2 font-mono text-white transition-all bg-red-500 rounded-full group right-4 top-4 hover:shadow-md"
            >
              close{" "}
              <X className="ml-1 transition-transform group-hover:rotate-180" />
            </Button>

            {/* Input Field */}
            <input
              value={userQuery}
              onChange={(e) => handleInputChange(e)}
              type="text"
              placeholder="Search parties..."
              className="w-full max-w-xl px-4 py-2 mb-6 text-gray-900 placeholder-gray-400 transition bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Voting Cards Grid */}
            <div className="flex flex-wrap justify-start w-full h-full gap-6 px-2 py-3 overflow-y-auto font-mono">
              {sorted.length > 0 &&
                sorted.map((party) => (
                  <div
                    key={party.party_obj}
                    className="w-[320px] bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden hover:scale-[1.02]"
                  >
                    {/* Party Icon */}
                    <img
                      src={party.party_icon}
                      alt={`${party.party_name} icon`}
                      className="object-contain w-full h-40 p-3 bg-gray-100 border-b"
                    />

                    {/* Party Info */}
                    <div className="flex flex-col gap-2 p-4">
                      <h2 className="text-lg font-bold text-blue-700">
                        {party.party_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Since: {party.since || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        State: {party.state || "N/A"}
                      </p>
                      <div className="flex gap-3">
                        {" "}
                        <p className="text-sm text-gray-700 break-words">
                          Address:{" "}
                          {party?.party_obj.slice(0, 3) +
                            "..." +
                            party?.party_obj.slice(-5)}
                        </p>
                        <Copy
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => {
                            handle_copy(party?.party_obj);
                          }}
                          size={20}
                        />
                      </div>

                      <button
                        onClick={() => {
                          on_cast_vote(party?.party_obj);
                        }}
                        className="w-full py-2 mt-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Vote
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
      <div className="w-full  py-10 px-10 flex items-center justify-center gap-2 h-[500px] bg-blue-600 ">
        <button
          onClick={() => {
            setOpen(true);
            fetch_party("");
          }}
          className="font-mono rounded-tl-2xl  text-white px-4 py-6 select-none  hover:bg-blue-500 cursor-pointer outline border hover:shadow-[4px_4px_0px_0px_#000] flex gap-5 text-2xl items-center"
        >
          Select your party and cast your vote! <Vote size={45} />
        </button>
      </div>
      {/* <CreatePartyCard onCreate={createparty} /> */}
      {loading ? (
        <div className="flex items-start w-full max-w-xl gap-4 p-4 bg-white rounded-md shadow-md animate-pulse">
          {/* Avatar Circle */}
          <div className="w-[80px] h-[80px] rounded-full bg-gray-300" />

          {/* Text Content Skeletons */}
          <div className="flex flex-col flex-grow gap-2">
            {/* Title/Name Line */}
            <div className="w-1/2 h-4 bg-gray-300 rounded" />

            {/* Subtext lines */}
            <div className="w-full h-3 bg-gray-200 rounded" />
            <div className="w-3/4 h-3 bg-gray-200 rounded" />

            {/* Maybe a button placeholder */}
            <div className="w-24 h-6 mt-2 bg-gray-300 rounded" />
          </div>
        </div>
      ) : (
        <Dashboard
          setWinnerDetails={setWinnerDetails}
          setShowWinner={setShowWinner}
        />
      )}
      {/* <VoterPieChart /> */}
    </>
  );
}

export default VotePortal;
