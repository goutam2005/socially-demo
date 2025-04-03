
import {
  getPostsOfUser,
  getProfile,
  getUserLikedPosts,
  isFollowing,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import React from "react";
import ProfilePageClient from "@/components/ProfilePageClient";
import  { getUserByClerkId } from "@/actions/user.action";
import { auth } from "@clerk/nextjs/server";


export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  return {
    title: `${params.username} | Social`,
    description: `View ${params.username}'s profile on Social`,
  };
}
export default async function page({
  params,
}: {
  params: { username: string };
}) {
  const { userId } = await auth();
  const user = await getProfile(params.username);
  const currentUser = await getUserByClerkId(userId as string) 
  if (!user) {
    return notFound();
  }
  
  // Ensure user is not an Error object
  if (user instanceof Error) {
    console.error("Error fetching profile:", user);
    return notFound();
  }
  if (!currentUser) {
    return notFound();
  }
  if (currentUser instanceof Error) {
    return notFound();
  }
  const [Posts, LikedPosts, isisFollowing] = await Promise.all([
    getPostsOfUser(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);
  return <ProfilePageClient user = {user} posts={Posts} currentUser={currentUser } likedPosts = {LikedPosts} isFollowing = {isisFollowing}/>;
}
