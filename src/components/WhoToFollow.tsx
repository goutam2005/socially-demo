import { getRandomUsersBy } from "@/actions/user.action";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import FollowButton from "./FollowButton";

export default async function WhoToFollow() {
  const users = await getRandomUsersBy();
  if (users.length === 0) return null;

  return (
    <Card>
      <CardHeader>Who to follow</CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 justify-between"
            >
              {" "}
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.username}`}>
                  <Avatar>
                    <AvatarImage src={user.image ??  " https://img.icons8.com/?size=100&id=ckaioC1qqwCu&format=png&color=000000"}  />
                  </Avatar>
                </Link>
                <div className="text-xs">
                <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                  {user.name}
                </Link>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-muted-foreground">{user._count.followers} followers</p>
                </div>
              </div>
              <FollowButton userId = {user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
