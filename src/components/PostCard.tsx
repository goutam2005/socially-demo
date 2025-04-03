"use client";
import {
  AddComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialoag";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function formatDistanceInWords(date: Date) {
  return formatDistanceToNow(date, { addSuffix: false });
}
export default function PostCard({
  post,
  UserId,
}: {
  post: Post;
  UserId: string | null;
}) {
  // console.log("post card" , post)

  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userID === UserId)
  );
  const [optimisticLikes, setoptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiked) return;
    try {
      setIsLiked(true);
      setHasLiked((prev) => !prev);
      setoptimisticLikes((prev) => prev + (hasLiked ? -1 : +1));
      await toggleLike(post.id);
    } catch (error) {
      setoptimisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userID === UserId));
    } finally {
      setIsLiked(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await AddComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment added successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Error commenting on post");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result?.success) {
        toast.success("Post deleted successfully");
      }
    } catch (error) {
      toast.error("Error deleting post");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`profile/${post.author.username}`}>
              <Avatar className="size-8 sm:h-10 sm:w-10">
                <AvatarImage
                  src={
                    post.author.image ||
                    " https://img.icons8.com/?size=100&id=ckaioC1qqwCu&format=png&color=000000"
                  }
                />
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`profile/${post.author.username}`}>
                      @{post.author.username}
                    </Link>
                    <span>·</span>
                    <span>
                      {formatDistanceInWords(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>
                {UserId === post.author.id && (
                  <DeleteAlertDialog
                    isDeleting={isDeleting}
                    handleDelete={handleDelete}
                  />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">
                {post.content}
              </p>
            </div>
          </div>
          {post.image && (
            <div className="mt-4 overflow-hidden rounded-lg">
              <img
                src={post.image}
                alt={post.content}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant={"ghost"}
                size={"sm"}
                className={`text-muted-foreground gap-2 ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="gap-2 text-muted-foreground"
                >
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}
            <Button
              variant={"ghost"}
              size={"sm"}
              className="gap-2 text-muted-foreground"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`} />
              <span>{post.comments.length}</span>
            </Button>
          </div>
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e : any) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
