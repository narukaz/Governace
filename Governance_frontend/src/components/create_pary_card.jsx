import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function CreatePartyCard({ onCreate }) {
  const [partyData, setPartyData] = useState(initialState);

  const handleChange = (e) => {
    setPartyData({ ...partyData, [e.target.name]: String(e.target.value) });
  };

  const handleSubmit = () => {
    const { party_name, since, state, party_icon } = partyData;
    if (!party_name || !since || !state || !party_icon) return;
    onCreate?.(partyData);
    setPartyData(initialState);
  };

  return (
    <div className="w-full  py-10 px-10 flex items-center justify-center gap-2 h-[500px] bg-blue-600">
      <div className="max-w-lg w-full h-[450px] bg-[#EBECF0] rounded-lg p-6 shadow-neu">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-700 mb-6">
          <Plus className="text-gray-700" /> Create New Party
        </h2>
        <form className="space-y-5">
          {[
            {
              id: "party_name",
              label: "Party Name",
              placeholder: "Enter party name",
            },
            { id: "since", label: "Since", placeholder: "Year founded" },
            {
              id: "party_icon",
              label: "Party Icon URL",
              placeholder: "https://your-icon-url.com/logo.png",
            },
          ].map(({ id, label, placeholder }) => (
            <div key={id} className="flex flex-col">
              <Label htmlFor={id} className="mb-1 text-sm text-gray-500">
                {label}
              </Label>
              <Input
                id={id}
                name={id}
                placeholder={placeholder}
                value={partyData[id]}
                onChange={handleChange}
                className="w-full bg-[#EBECF0] outline text-gray-700 rounded-full border-1 border-black shadow-inner h-12 px-4 placeholder-gray-500 transition-all duration-200 focus:shadow-none focus:outline-none"
              />
            </div>
          ))}
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full flex items-center border-1 justify-center gap-2 bg-[#EBECF0] text-gray-700 rounded-full shadow-neu-btn py-3 hover:shadow-inner transition-shadow duration-200 hover:text-white cursor-pointer"
          >
            <Plus /> Create Party
          </Button>
        </form>
      </div>
    </div>
  );
}

// Tailwind CSS extensions (add to your global CSS):
// .shadow-neu { box-shadow: 5px 5px 10px #BABECC, -5px -5px 10px #FFF; }
// .shadow-neu-btn { box-shadow: inset 2px 2px 5px #BABECC, inset -5px -5px 10px #FFF; }
