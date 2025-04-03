"use client";
import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { CreatePostbc } from "@/actions/post.action";
import toast from "react-hot-toast";
import UploadImage from "./uploadImage";

export default function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [isPosting, setisPosting] = useState(false);
  const [imageURL, setimageURL] = useState("");
  const [showImageUpload, setshowImageUpload] = useState(false);

  const handleOnSubmit = async () => {
    if (!content.trim() && !imageURL) return;
    setisPosting(true);
    try {
      const result = await CreatePostbc(content, imageURL);
      if (!result) return toast.error("Something went wrong");
      if (result.success) {
        setContent("");
        setimageURL("");
        setshowImageUpload(false);
        toast.success("Post created");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setisPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={
                  user?.imageUrl ||
                  " https://img.icons8.com/?size=100&id=ckaioC1qqwCu&format=png&color=000000"
                }
              />
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>
          {(showImageUpload || imageURL) && (
              <div className="border rounded-lg p-4">
                <UploadImage
                  endpoint="postImage"
                  value={imageURL}
                  onChange={(url) => {
                    setimageURL(url);
                    if (url) setshowImageUpload(false);
                  }}
                />
              </div>
            )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={"ghost"}
                size="sm"
                onClick={() => setshowImageUpload(!showImageUpload)}
                className="text-muted-foreground hover:text-primary"
                disabled={isPosting}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button
              className="flex items-center "
              onClick={handleOnSubmit}
              disabled={(!content.trim() && !imageURL) || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="mr-2 size-4" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
