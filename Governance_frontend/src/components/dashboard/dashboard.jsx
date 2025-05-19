import React, { useEffect, useState } from "react";
import PartyCard from "../party_card";
import { useSelector } from "react-redux";
import { CircleGauge } from "lucide-react";
import { useSuiClient } from "@mysten/dapp-kit";
import { Button } from "../ui/button";

function Dashboard({ setWinnerDetails, setShowWinner }) {
  const { data, loading, error } = useSelector((state) => state.party);
  const suiClient = useSuiClient();

  const [votesMap, setVotesMap] = useState({}); // store votes here

  useEffect(() => {
    if (!data || data.length === 0) return;

    const fetchVotes = async () => {
      const results = await Promise.all(
        data.map(async (party) => {
          try {
            const resp = await suiClient.getObject({
              id: party.party_obj,
              options: { showContent: true },
            });
            const vote = resp?.data?.content?.fields?.vote || 0;
            return { id: party.party_obj, vote };
          } catch (e) {
            console.error(`Error fetching vote for ${party.party_obj}`, e);
            return { id: party.party_obj, vote: 0 };
          }
        })
      );

      const voteMap = {};
      results.forEach(({ id, vote }) => {
        voteMap[id] = vote;
      });

      setVotesMap(voteMap);
    };

    fetchVotes();
  }, [data, suiClient]);

  useEffect(() => {
    if (data.length === 0 || Object.keys(votesMap).length === 0) return;

    let maxVotes = -Infinity;
    let best = null;

    for (const party of data) {
      const v = votesMap[party.party_obj] ?? 0;
      if (v > maxVotes) {
        maxVotes = v;
        best = { ...party, votes: v };
      }
    }

    if (best) {
      setWinnerDetails(best);
    }
  }, [data, votesMap, setWinnerDetails]);

  return (
    <div className="flex flex-col gap-5 bg-gray-200 py-6 px-5">
      <div className="flex gap-5">
        {" "}
        <h1 className="text-2xl flex gap-4 items-center font-mono select-none">
          Dashboard <CircleGauge />
        </h1>
        <Button
          onClick={() => {
            setShowWinner(true);
          }}
        >
          show winner
        </Button>
      </div>

      <div className="w-full px-6 grid grid-cols-3 gap-5 py-5">
        {data?.map((party) => {
          const vote = votesMap[party.party_obj] || 0;
          // if (vote > highestVote) {
          //   highestVote = vote;
          //   // setWinnerDetails({ ...party, votes: vote });
          // }
          return (
            <PartyCard
              key={party._id}
              partyName={party?.party_name}
              avatarUrl={party?.party_icon}
              since={party?.since}
              state={party?.state}
              blockchainAddress={party?.party_obj}
              votes={vote}
            />
          );
        })}

        {loading ? <p>Loading...</p> : null}
        {error ? <p cals>Error loading parties!</p> : null}
      </div>
    </div>
  );
}

export default Dashboard;
