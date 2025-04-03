import { UploadDropzone } from "@/lib/uploadthing";
import React from "react";
import { Button } from "./ui/button";
import { XIcon } from "lucide-react";

interface IUploadImage {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}
export default function uploadImage({
  onChange,
  value,
  endpoint,
}: IUploadImage) {
  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover"
        />
        <Button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 h-8 w-8 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </Button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0]?.url);
      }}
      onUploadError={(err) => {
        console.log(err);
      }}
    />
  );
}
