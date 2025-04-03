"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

export default function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleOnClick = async () => {
    setIsLoading(true);
    try {
        await toggleFollow(userId);
        toast.success("User followed");
    } catch (error) {
        console.log("Follow", error)
        toast.error("Error following user");
    }finally{
      setIsLoading(false);
    }
  };
  return (
    <Button
      size="sm"
      variant={"secondary"}
      onClick={handleOnClick}
      className="w-20"
      disabled={isLoading}
    >
      {isLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Follow"}
    </Button>
  );
}
