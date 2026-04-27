import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import { DiffView } from "@/components/chat/diffview";
import { DocumentSkeleton } from "@/components/chat/document-skeleton";
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
  PDFIcon,
} from "@/components/chat/icons";
import { exportToPDF } from "@/lib/pdf-utils";
import { Editor } from "@/components/chat/text-editor";
import type { Suggestion } from "@/lib/db/schema";
import { getSuggestions } from "../actions";

type TextArtifactMetadata = {
  suggestions: Suggestion[];
};

export const textArtifact = new Artifact<"text", TextArtifactMetadata>({
  kind: "text",
  description: "Useful for text content, like drafting essays and emails.",
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "data-suggestion") {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === "data-textDelta") {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + streamPart.data,
          isVisible:
            draftArtifact.status === "streaming" &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: "streaming",
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === "diff") {
      const selectedContent = getDocumentContentById(currentVersionIndex);
      const prevContent =
        currentVersionIndex > 0
          ? getDocumentContentById(currentVersionIndex - 1)
          : selectedContent;

      return (
        <div className="flex flex-row px-4 py-8 md:px-16 md:py-12 lg:px-20">
          <DiffView newContent={selectedContent} oldContent={prevContent} />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <div className="w-full max-w-3xl">
          <Editor
            content={content}
            currentVersionIndex={currentVersionIndex}
            isCurrentVersion={isCurrentVersion}
            onSaveContent={onSaveContent}
            status={status}
            suggestions={isCurrentVersion && metadata ? metadata.suggestions : []}
          />
        </div>

        {metadata?.suggestions && metadata.suggestions.length > 0 ? (
          <div className="h-dvh w-12 shrink-0 md:hidden" />
        ) : null}
      </div>
    );
  },
  actions: [
    {
      icon: <PDFIcon size={18} />,
      description: "Export as PDF",
      onClick: async ({ content, metadata, currentVersionIndex }) => {
        try {
          const title = (metadata as any)?.title || `Report_v${currentVersionIndex + 1}`;
          await exportToPDF(content, title);
          toast.success("PDF exported successfully!");
        } catch (error) {
          toast.error("Failed to export PDF");
        }
      },
    },
  ],
  toolbar: [],
});
