"use server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
export default async function syncUser() {
  const user = await currentUser();
  const { userId } = await auth();
  try {
    if (!user || !userId) return;
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },include:{
       _count:{
        select:{
          followers:true,
          following:true,
          posts:true,
        } 
       } 
      }
    });
    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        image: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return dbUser;
  } catch (error) {}
}

export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null
  const user = await getUserByClerkId(clerkId);
  if (!user) return new Error("User not found");
  return user.id;
}

export async function getRandomUsersBy() {
  try {
    const userId = await getUserId();
    if (userId instanceof Error ) {
      throw userId; // Re-throw the error if getUserId failed
    }
    if (!userId) {
      return []; // Return an empty array if userId is null
    }
   
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: userId,
            },
          },
          {
            NOT: {
              followers: {
                some: {
                  followerID: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers; // Ensure function returns data
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Re-throw for better handling in caller function
  }
}

export const toggleFollow = async (userTargetId: string) => {
  try {
    const userId = await getUserId();
    if (userId instanceof Error || !userId) {
      throw userId;
    }

    if (userId === userTargetId) {
      throw new Error("You can't follow yourself");
    }
    const exitsFollow = await prisma.follower.findUnique({
      where: {
        followerID_followingID: {
          followerID: userId,
          followingID: userTargetId,
        },
      },
    });

    if (exitsFollow) {
      await prisma.follower.delete({
        where: {
          followerID_followingID: {
            followerID: userId,
            followingID: userTargetId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.follower.create({
          data: {
            followerID: userId,
            followingID: userTargetId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userID: userTargetId,
            creatorID: userId,
          },
        }),
      ]);
    }
    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.log("Error following user:", error);
    return {
      success: false,
      error: error,
    };
  }
};
