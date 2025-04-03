"use server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUserId } from "./user.action";

export const getProfile = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        websites: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.log("Error getting profile");
    return new Error("Error getting profile");
  }
};

export const getPostsOfUser = async (userID: string) => {
  try {
    const post = prisma.post.findMany({
      where: {
        authorID: userID,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userID: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return post;
  } catch (error) {
    console.log("Error getting posts");
    return new Error("Error getting posts");
  }
};

export const getUserLikedPosts = async (userID: string) => {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userID,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userID: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return likedPosts;
  } catch (error) {
    console.log("Error getting liked posts");
    return new Error("Error getting liked posts");
  }
};

export const updateUserProfile = async (formData: FormData) => {
  try {
    
    const { userId } = await auth();
    if (!userId) return null;
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    // const image = formData.get("image") as string;
    const location = formData.get("location") as string;
    const websites = formData.get("website") as string;

    const user = await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        name,
        bio,
        location,
        websites,
      }
    });
    revalidatePath(`/profile/${user.username}`);
    return user;
  } catch (error) {}
};
export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follower.findUnique({
      where: {
        followerID_followingID: {
          followerID: currentUserId as string,
          followingID: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}