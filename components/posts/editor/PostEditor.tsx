"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/UserAvatar";
import { useRef, useState } from "react";
import { useSubmitPostMutations } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import usePostMediaUpload, { Attachment } from "./usePostMediaUpload";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";

export default function PostEditor() {
  const { user } = useSession();
  const [input, setInput] = useState("");

  const mutation = useSubmitPostMutations();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads
  } = usePostMediaUpload();

  const {
    getRootProps,
    getInputProps, 
    isDragActive } = useDropzone({
    onDrop: startUpload
  });
  const {onClick, ...rootProps} = getRootProps();

  const onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setInput(e.currentTarget.value);
  }

  const onSubmit = () => {
    console.log(input)
    mutation.mutate(
    {
      content: input, 
      mediaIds: attachments.map(a => a.mediaId).filter(Boolean) as string[]
    }, 
    { 
      onSuccess: () => {
        setInput("");
        resetMediaUploads();
      }
    }
  )};

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div className="w-full" {...rootProps}>
          <Textarea placeholder="What's on your mind?"
            className={cn("w-full max-h-[20rem] bg-background rounded-2xl px-5 py-3 text-lg",
            isDragActive && "outline-dashed")}
            onChange={onChange}
            value={input}/>
            <input {...getInputProps()}/>
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews 
        attachments={attachments}
        removeAttachment={removeAttachment}/>
      )}
      <div className="flex items-center justify-end gap-3">
          { isUploading && (
            <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary"/>
            </>
          )}
          <AddAttachmentsButton 
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length > 5}
          />
          <LoadingButton 
            onClick={onSubmit} 
            loading={mutation.isPending}
            disabled={!input.trim() || isUploading} 
            className="min-w-20">
              Post
          </LoadingButton>
      </div>
  
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void,
  disabled: Boolean
} 

function AddAttachmentsButton (
  { onFilesSelected, disabled }: AddAttachmentsButtonProps) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    return ( 
    <>
      <Button variant={"ghost"} size={"icon"} disabled={disabled as boolean}
      className="text-primary hover:text-primary" 
      onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20}/>
      </Button>
      <input type="file" 
        accept="image/*, video/*" 
        multiple ref={fileInputRef}
        className="hidden sr-only"
        onChange={ (e)=>{
          const files = Array.from(e.target.files || []);
          if(files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
        />
    </>
  )
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}
function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={async() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment,
  onRemoveClick: () => {}
}
function AttachmentPreview(
  {attachment: {file, mediaId, isUploading},
   onRemoveClick} : AttachmentPreviewProps
) {
    const src = URL.createObjectURL(file);
    return (
      <div className={
          cn("relative mx-auto size-fit", 
          isUploading && "opacity-50")
        }
      >
        { file.type.startsWith("image") ? 
          (<Image src={src} alt="Attachment preview"
            width={500} height={500}
            className="size-fit max-h-[30rem] rounded-2xl"
          />) 
          : 
          ( 
            <video controls
            className="size-fit max-h-[30rem] rounded-2xl">
              <source src={src} type={file.type}></source>
            </video>
          )
        }

        {!isUploading && (
           <button onClick={onRemoveClick} 
           className="absolute right-3 top-3 rounded-full 
           bg-foreground p-1.5 text-background transition-colors
           hover:bg-foreground/60">
              <X size={20}/>
           </button>
        )}
      </div>
    )
}