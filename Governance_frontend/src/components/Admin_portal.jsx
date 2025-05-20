import React, { useEffect, useState } from "react";
import Header from "./header/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Delete } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
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
import { Loader } from "lucide-react";
import { RotateCcwIcon } from "lucide-react";

let initialState = {
  party_name: "",
  since: "",
  state: "",
  party_icon: "",
};

let initialData = {
  first_name: "",
  mid_name: "",
  last_name: "",
  wallet_address: "",
  state: "",
  aadhaar_id: "",
};

function Admin_portal() {
  const suiClient = useSuiClient();
  const user = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [resetParty, setResetParty] = useState("");
  const [createCitizenData, setCreateCitizenData] = useState(initialData);
  const [citizenToRemove, setCitizenToRemove] = useState("");
  const [partyToRemove, setPartyToRemove] = useState("");
  const [partyData, setPartyData] = useState(initialState);
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const createparty = async () => {
    console.log("hit");
    if (!user?.address) {
      toast.error("User address not found.");
      return;
    }

    try {
      let tx = new Transaction();
      console.log(CITIZEN_OBJ_ID, PARTY_REGISTERY);
      tx.moveCall({
        package: PACKAGE_ID,
        module: "votes",
        function: "create_party",
        arguments: [tx.object(PARTY_REGISTERY)],
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

      console.log(result);
      await sleep(1000);

      const txDetails = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showObjectChanges: true,
        },
      });

      console.log("txDetails", txDetails);

      const createdPartyObject = txDetails.objectChanges?.find(
        (change) =>
          change.type === "created" &&
          change.objectType.includes("votes::Party")
      );

      console.log("createdPartyObject", createdPartyObject);

      if (createdPartyObject) {
        let send = await axios.post(
          "https://governace.onrender.com/register_party",
          {
            party_name: partyData.party_name,
            party_obj: createdPartyObject.objectId,
            state: partyData.state,
            since: partyData.since,
            party_icon: partyData.party_icon,
          }
        );

        if (send.data.success) {
          setPartyData(initialState);
          console.log("New Party Object ID:", createdPartyObject.objectId);
          toast.success(
            `Party created with ID: ${createdPartyObject.objectId}`
          );
        }
      } else {
        console.warn("Party object not found in transaction result.");
        toast("Party created, but ID not found.");
      }
    } catch (error) {
      console.error("Party registration failed:", error);
      toast.error("Party registration failed.");
    }
  };
  const reset_votes = async () => {
    if (!user?.address) {
      toast.error("User address not found");
      return;
    }

    if (!resetParty) {
      toast.error("No party id is shared");
      return;
    }

    try {
      let tx = new Transaction();
      tx.moveCall({
        package: PACKAGE_ID,
        module: "votes",
        function: "reset_vote",
        arguments: [tx.object(resetParty), tx.object(CITIZEN_OBJ_ID)],
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
      if (result.digest) {
        setResetParty("");
        return toast.success("successfully vhanged");
      }
      console.log(result);
    } catch (error) {
      console.error("Party deletion failed:", error);
      toast.error("Failed to delete party.");
    }
  };
  const register_citizen = async () => {
    if (!user?.address) {
      toast.error("User address not found.");
      return;
    }

    try {
      let tx = new Transaction();

      tx.moveCall({
        package: PACKAGE_ID,
        module: "votes",
        function: "add_citizen",
        arguments: [
          tx.object(CITIZEN_OBJ_ID), // Mutable reference to the Citizen Registry
          tx.object(createCitizenData.wallet_address), // Address of the current user
        ],
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
      if (result.digest) {
        let { data } = await axios.post(
          "https://governace.onrender.com/add_citizen",
          {
            ...createCitizenData,
          }
        );
        if (data.success) {
          console.log("Citizen Registered:", result);
          toast.success("You are now registered as a citizen!");
          setCreateCitizenData(initialData);
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Citizen registration failed.");
    }
  };

  const remove_citizen = async () => {
    if (!user?.address) {
      toast.error("User address not found.");
      return;
    }

    try {
      let tx = new Transaction();

      tx.moveCall({
        package: PACKAGE_ID,
        module: "votes",
        function: "remove_citizen",
        arguments: [
          tx.object(CITIZEN_OBJ_ID), // Mutable reference to the Citizen Registry
          tx.object(citizenToRemove), // Address of the citizen to be removed
        ],
      });

      tx.setSender(user.address); // user.address must be the OWNER for this call to succeed

      const { bytes, signature } = await signTransaction({
        transaction: tx,
        chain: "sui:testnet",
      });

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
      });

      if (result?.digest) {
        let { data } = await axios.delete(
          `https://governace.onrender.com/remove_citizen/${citizenToRemove}`
        );
        if (data.success) {
          setCitizenToRemove("");
          console.log("Citizen Removed:", result);
          toast.success("Citizen has been removed successfully.");
        }
      }
    } catch (error) {
      console.error("Citizen removal failed:", error);
      toast.error("Failed to remove citizen.");
    }
  };

  const delete_party = async (partyId) => {
    if (!user?.address) {
      toast.error("User address not found.");
      return;
    }

    try {
      let tx = new Transaction();

      tx.moveCall({
        package: PACKAGE_ID,
        module: "votes", // change if your module name is different
        function: "delete_party",
        arguments: [
          tx.object(partyId), // Pass the owned Party object
        ],
      });

      tx.setSender(user.address); // Must match OWNER in Move module

      const { bytes, signature } = await signTransaction({
        transaction: tx,
        chain: "sui:testnet",
      });

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
      });

      if (result?.digest) {
        let { data } = await axios.delete(
          `https://governace.onrender.com/remove_party/${partyId}`
        );
        if (data.success) {
          toast.success("party remove successfully!");
          setPartyToRemove("");
          return;
        }
      }
    } catch (error) {
      console.error("Party deletion failed:", error);
      toast.error("Failed to delete party.");
    }
  };

  useEffect(() => {
    if (user?.address) {
      toast.success("Successfully login ");
    }
  }, [user?.address]);

  console.log(partyData);
  return (
    <div className="bg-gradient-to-b from-indigo-100 via-white to-blue-100 h-lvh">
      <Header />
      {/* admin feature logic */}
      <div className="flex justify-center mt-12 bg-transparent ">
        <Tabs defaultValue="add_citizen" className="w-[700px] ">
          <TabsList defaultValue="" className="grid w-full grid-cols-5 mb-12">
            <TabsTrigger className="font-mono" value="add_citizen">
              Add Citizen
            </TabsTrigger>
            <TabsTrigger className="font-mono" value="create_party">
              Create Party
            </TabsTrigger>
            <TabsTrigger className="font-mono" value="remove_citizen">
              Remove Citizen
            </TabsTrigger>
            <TabsTrigger className="font-mono" value="remove_party">
              Remove Party
            </TabsTrigger>
            <TabsTrigger className="font-mono" value="reset_votes">
              Reset Votes
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="reset_votes"
            className="flex flex-col items-center w-full h-auto gap-5 py-5 font-mono font-bold bg-white border-1 rounded-2xl"
          >
            <h1>Reset party Votes</h1>
            <Input
              className="font-light w-sm"
              placeholder="input party address"
              value={resetParty}
              onChange={(e) => {
                setResetParty(e.target.value);
              }}
            />

            <Button
              onClick={() => {
                setIsLoading(true);
                reset_votes();
                setIsLoading(false);
              }}
              className="cursor-pointer w-sm"
            >
              Reset party votes{" "}
              {!isLoading ? (
                <RotateCcwIcon />
              ) : (
                <Loader className="animate-spin" />
              )}
            </Button>
          </TabsContent>
          <TabsContent
            value="add_citizen"
            className="flex flex-col items-center w-full h-auto gap-4 py-5 font-mono font-bold bg-white border-1 rounded-2xl"
          >
            <h1>Add Citizen</h1>

            <Input
              className="font-light w-sm"
              placeholder="First Name"
              value={createCitizenData.first_name}
              onChange={(e) =>
                setCreateCitizenData({
                  ...createCitizenData,
                  first_name: e.target.value,
                })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="Middle Name"
              value={createCitizenData.mid_name}
              onChange={(e) =>
                setCreateCitizenData({
                  ...createCitizenData,
                  mid_name: e.target.value,
                })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="Last Name"
              value={createCitizenData.last_name}
              onChange={(e) =>
                setCreateCitizenData({
                  ...createCitizenData,
                  last_name: e.target.value,
                })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="Wallet Address"
              value={createCitizenData.wallet_address}
              onChange={(e) =>
                setCreateCitizenData({
                  ...createCitizenData,
                  wallet_address: e.target.value,
                })
              }
            />
            <Input
              className="font-light w-sm"
              placeholder="Aadhaar ID"
              value={createCitizenData.aadhaar_id}
              onChange={(e) =>
                setCreateCitizenData({
                  ...createCitizenData,
                  aadhaar_id: e.target.value,
                })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="State"
              value={createCitizenData.state}
              onChange={(e) =>
                setCreateCitizenData({
                  ...createCitizenData,
                  state: e.target.value,
                })
              }
            />

            <Button
              onClick={async () => {
                setIsLoading(true);
                await register_citizen(createCitizenData);
                setIsLoading(false);
              }}
              className="cursor-pointer w-sm"
            >
              Add {isLoading ? <Loader className="animate-spin" /> : <Plus />}
            </Button>
          </TabsContent>

          <TabsContent
            value="remove_citizen"
            className="flex flex-col items-center w-full h-auto gap-5 py-5 font-mono font-bold bg-white border-1 rounded-2xl"
          >
            <h1>Remove Citizen</h1>
            <Input
              className="font-light w-sm"
              placeholder="input user address"
              onChange={(e) => {
                setCitizenToRemove(e.target.value);
              }}
              value={citizenToRemove}
            />
            <Button
              onClick={() => {
                setIsLoading(true);
                remove_citizen();
                setIsLoading(false);
              }}
              className="cursor-pointer w-sm"
            >
              Remove citizen{" "}
              {!isLoading ? <Delete /> : <Loader className="animate-spin" />}
            </Button>
          </TabsContent>

          <TabsContent
            value="remove_party"
            className="flex flex-col items-center w-full h-auto gap-5 py-5 font-mono font-bold bg-white border-1 rounded-2xl"
          >
            <h1>Remove party</h1>
            <Input
              className="font-light w-sm"
              placeholder="input party address"
              value={partyToRemove}
              onChange={(e) => {
                setPartyToRemove(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                setIsLoading(true);
                delete_party(partyToRemove);
                setIsLoading(false);
              }}
              className="cursor-pointer w-sm"
            >
              Remove party <Delete />
            </Button>
          </TabsContent>

          <TabsContent
            value="create_party"
            className="flex flex-col items-center w-full h-auto gap-5 py-5 font-mono font-bold bg-white border-1 rounded-2xl"
          >
            <h1>Remove party</h1>
            <Input
              className="font-light w-sm"
              placeholder="input party name"
              value={partyData.party_name}
              onChange={(e) =>
                setPartyData({ ...partyData, party_name: e.target.value })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="input party state"
              value={partyData.state}
              onChange={(e) =>
                setPartyData({ ...partyData, state: e.target.value })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="input party icon-url"
              value={partyData.party_icon}
              onChange={(e) =>
                setPartyData({ ...partyData, party_icon: e.target.value })
              }
            />

            <Input
              className="font-light w-sm"
              placeholder="existing since"
              value={partyData.since}
              onChange={(e) =>
                setPartyData({ ...partyData, since: e.target.value })
              }
            />

            <Button
              onClick={() => {
                setIsLoading(true);
                createparty();
                setIsLoading(false);
              }}
              className="cursor-pointer w-sm"
            >
              create party{" "}
              {!isLoading ? <Plus /> : <Loader className="animate-spin" />}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Admin_portal;
