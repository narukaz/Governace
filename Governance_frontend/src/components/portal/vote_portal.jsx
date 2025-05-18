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

function VotePortal() {
  const suiClient = useSuiClient();
  const user = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [open, setOpen] = useState(false);
  // const [party, setParty] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [sorted, setSorted] = useState([]);
  // const [selectedParty, setSelectedParty] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.party);
  const [index, setIndex] = useState(0);

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
  // const print_sorted = () => {
  //   console.log(sorted);
  // };
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

  // console.log(sorted);

  return (
    <>
      <Header />
      {/* pop over */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed left-0 top-0 bg-black bg-opacity-40 backdrop-blur-sm w-full h-full z-40"
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
              className="group absolute right-4 top-4 hover:shadow-md bg-red-500 text-white font-mono rounded-full p-2 transition-all"
            >
              close{" "}
              <X className="ml-1 group-hover:rotate-180 transition-transform" />
            </Button>

            {/* Input Field */}
            <input
              value={userQuery}
              onChange={(e) => handleInputChange(e)}
              type="text"
              placeholder="Search parties..."
              className="w-full max-w-xl px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400 text-gray-900 mb-6"
            />

            {/* Voting Cards Grid */}
            <div className="flex flex-wrap px-2 py-3 justify-start h-full overflow-y-auto gap-6 w-full font-mono">
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
                      className="w-full h-40 object-contain bg-gray-100 p-3 border-b"
                    />

                    {/* Party Info */}
                    <div className="p-4 flex flex-col gap-2">
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
                          className="hover:text-blue-500  cursor-pointer"
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
                        className="mt-3 w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
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
        <div className="w-full max-w-xl bg-white p-4 rounded-md shadow-md animate-pulse flex gap-4 items-start">
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
            <div className="w-24 h-6 bg-gray-300 rounded mt-2" />
          </div>
        </div>
      ) : (
        <Dashboard />
      )}
      {/* <VoterPieChart /> */}
    </>
  );
}

export default VotePortal;
