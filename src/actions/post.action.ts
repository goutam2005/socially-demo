"use server";
import prisma from "@/lib/prisma";
import { getUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const CreatePostbc = async (content: string, image: string) => {
  const userId = await getUserId();
  try {
    // Check if userId is an Error object
    if (userId instanceof Error) {
      throw userId; // Re-throw the error if getUserId failed
    }

    if (!userId) return null;

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorID: userId,
      },
    });
    if (!post) return null;
    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.log("Error on creating a post ", error);
    return { success: false }; // Re-throw the error for proper error handling
  }
};

export const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id : true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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
    });
    return posts;
  } catch (error) {
    console.log("Error on getting posts", error);
    throw new Error("Error on getting posts");
  }
};

export const toggleLike = async (postId: string) => {
  try {
    const currentUserID = await getUserId();
    if (!currentUserID) return null;
    if (currentUserID instanceof Error) {
      throw currentUserID; // Re-throw the error if getUserId failed
    }
    const exitsLike = await prisma.like.findUnique({
      where: {
        userID_postID: {
          postID: postId,
          userID: currentUserID,
        },
      },
    });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorID: true },
    });
    if (!post) throw new Error("Post not found");
    if (exitsLike) {
      await prisma.like.delete({
        where: {
          userID_postID: {
            userID: currentUserID,
            postID: postId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userID: currentUserID,
            postID: postId,
          },
        }),
        ...(post.authorID !== currentUserID
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  postID: postId,
                  userID: post.authorID,
                  creatorID: currentUserID,
                },
              }),
            ]
          : []),
      ]);
    }
  } catch (error) {}
};

export const AddComment = async (postId: string, content: string) => {
  try {
    const userId = await getUserId();
    if (!userId) return null;
    if (userId instanceof Error) {
      throw userId; // Re-throw the error if getUserId failed
    }
    if (!content) throw new Error("Content is required");
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorID: true },
    });
    if (!post) throw new Error("Post not found");
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorID: userId,
          postID: postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorID !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userID: post.authorID,
            creatorID: userId,
            postID: postId,
            commentID: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.log("Error on adding comment", error);
    return { success: false, error: "Error on adding comment" };
  }
};

export const deletePost = async (postId: string) => {
  try {
    const userId = await getUserId();
    if (!userId) return null;
    if (userId instanceof Error) {
      throw userId; // Re-throw the error if getUserId failed
    }
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorID: true },
    });
    if (!post) throw new Error("Post not found");
    if (post.authorID !== userId)
      throw new Error("You are not authorized to delete this post");
    await prisma.post.delete({
      where: { id: postId },
    });
    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.log("Error on deleting post", error);
    return { success: false, error: "Error on deleting post" };
  }
};
