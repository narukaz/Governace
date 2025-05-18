import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function PartyCard({
  partyName,
  avatarUrl,
  since,
  blockchainAddress,
  votes,
  state,
}) {
  async function handle_copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error(err);
      console.error("Failed to copy: ", err);
    }
  }
  return (
    <Card className="w-auto max-w-xl p-4 font-mono  transition-all">
      <CardContent className="flex flex-col gap-4">
        {/* Top - Big Vote Count */}
        <div className="text-3xl font-bold text-green-600 text-center">
          {votes} Votes
        </div>

        {/* Main Row - Avatar + Details */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} alt={partyName} />
            <AvatarFallback>{partyName?.[0]}</AvatarFallback>
          </Avatar>

          {/* Party Info */}
          <div className="flex flex-col justify-between">
            {/* Name + Since */}

            <div className="mb-1">
              <h3 className="text-lg font-semibold">{partyName}</h3>
              <p className="text-sm text-muted-foreground">Since: {since}</p>
            </div>

            <div className="mb-1">
              {/* <h3 className="text-lg font-semibold">{state}</h3> */}
              <p className="text-sm text-muted-foreground ">state: {state}</p>
            </div>

            {/* Blockchain Address */}
            <div className="flex gap-3">
              {" "}
              <p className="text-sm text-gray-700 break-words">
                Address:{" "}
                {blockchainAddress.slice(0, 3) +
                  "..." +
                  blockchainAddress.slice(-5)}
              </p>
              <Copy
                className="hover:text-blue-500  cursor-pointer"
                onClick={() => {
                  handle_copy(blockchainAddress);
                }}
                size={20}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
