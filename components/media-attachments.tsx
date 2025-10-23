"use client";

import React, { useState } from "react";
import type { MediaAttachment } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import {
  Camera,
  FileText,
  Video,
  Download,
  Eye,
  X,
  Music,
  File,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaAttachmentsProps {
  attachments: MediaAttachment[];
  onViewMedia?: (url: string) => void;
}

const MediaAttachments: React.FC<MediaAttachmentsProps> = ({
  attachments,
  onViewMedia,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const isAudioFile = (filename: string) => {
    const audioExtensions = [
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".aac",
      ".flac",
      ".wma",
    ];
    return audioExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  const getMediaIcon = (type: MediaAttachment["type"], filename?: string) => {
    // Check if it's an audio file based on extension
    if (filename && isAudioFile(filename)) {
      return <Music className="h-4 w-4" />;
    }

    switch (type) {
      case "image":
        return <Camera className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "other":
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getMediaTypeColor = (
    type: MediaAttachment["type"],
    filename?: string
  ) => {
    // Check if it's an audio file based on extension
    if (filename && isAudioFile(filename)) {
      return "text-purple-600 dark:text-purple-400";
    }

    switch (type) {
      case "image":
        return "text-green-600 dark:text-green-400";
      case "video":
        return "text-blue-600 dark:text-blue-400";
      case "document":
        return "text-orange-600 dark:text-orange-400";
      case "other":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const isValidUrl = (url: any): url is string => {
    return (
      typeof url === "string" &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/")) &&
      url.length > 0
    );
  };

  const handleMediaClick = (attachment: MediaAttachment) => {
    // if (!isValidUrl(attachment.url)) return;
    // if (attachment.type === "image" || attachment.type === "video") {
    //   // Open preview modal for images and videos
    //   setSelectedMedia(attachment);
    //   setIsViewerOpen(true);
    // } else {
    //   // For documents and other types, directly download or open in new tab
    //   if (onViewMedia) {
    //     onViewMedia(attachment.url);
    //   } else {
    //     // Fallback: open in new tab for documents
    //     window.open(attachment.url, "_blank");
    //   }
    // }

    if (attachment.type === "image" || attachment.type === "video") {
      // Open preview modal for images and videos
      setSelectedMedia(attachment);
      setIsViewerOpen(true);
    } else {
      window.open(attachment.url, "_blank");
    }
  };

  const handleDownload = (attachment: MediaAttachment) => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Attachments (
            {
              attachments.filter((attachment) => isValidUrl(attachment.url))
                .length
            }
            )
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {attachments
            .filter((attachment) => isValidUrl(attachment.url))
            .map((attachment, index) => (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:ring-2 hover:ring-primary/20"
                onClick={() => handleMediaClick(attachment)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square relative rounded-md overflow-hidden bg-muted mb-2">
                    {attachment.type === "image" &&
                    isValidUrl(attachment.url) ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.filename}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    ) : attachment.type === "video" &&
                      isValidUrl(attachment.url) ? (
                      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                          <Video className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs text-muted-foreground">Video</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          {getMediaIcon(attachment.type, attachment.filename)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {isAudioFile(attachment.filename)
                              ? "Audio"
                              : attachment.type === "document"
                              ? "Document"
                              : attachment.type === "other"
                              ? "File"
                              : "Media"}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {getMediaIcon(attachment.type, attachment.filename)}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          getMediaTypeColor(
                            attachment.type,
                            attachment.filename
                          )
                        )}
                      >
                        {isAudioFile(attachment.filename)
                          ? "AUDIO"
                          : attachment.type.toUpperCase()}
                      </span>
                    </div>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      title={attachment.filename}
                    >
                      {attachment.filename}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        .{attachment.extension}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(attachment);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Media Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {selectedMedia?.filename}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsViewerOpen(false)}
              >
                <X className="h-8 w-8" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6 pt-0">
            {selectedMedia && isValidUrl(selectedMedia.url) && (
              <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-muted">
                {selectedMedia.type === "image" ? (
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.filename}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 80vw"
                  />
                ) : selectedMedia.type === "video" ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : isAudioFile(selectedMedia.filename) ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Music className="h-16 w-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-lg font-medium mb-2">
                        {selectedMedia.filename}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Audio File
                      </p>
                      <audio
                        src={selectedMedia.url}
                        controls
                        className="w-full max-w-md mb-4"
                        preload="metadata"
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <Button
                        onClick={() => handleDownload(selectedMedia)}
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      {getMediaIcon(selectedMedia.type, selectedMedia.filename)}
                      <p className="text-lg font-medium mt-2">
                        {selectedMedia.filename}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isAudioFile(selectedMedia.filename)
                          ? "Audio File"
                          : selectedMedia.type === "document"
                          ? "Document"
                          : selectedMedia.type === "other"
                          ? "File"
                          : "Media"}
                      </p>
                      <Button
                        onClick={() => handleDownload(selectedMedia)}
                        className="mt-4"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedMedia &&
                  getMediaIcon(selectedMedia.type, selectedMedia.filename)}
                <span className="text-sm text-muted-foreground">
                  {selectedMedia?.filename}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedMedia && handleDownload(selectedMedia)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaAttachments;
