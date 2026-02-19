"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Camera, FileText, X } from "lucide-react"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export interface WalkInStep2DocumentsFormData {
  frontImage: string
  backImage: string
  applicationLetter: string
  additionalDocument: string
}

interface UploadedFile {
  id: string
  name: string
  size: string
  file?: File
}

interface WalkInStep2DocumentsUploadProps {
  formData: WalkInStep2DocumentsFormData
  updateFormData: (data: Partial<WalkInStep2DocumentsFormData>) => void
  onCancel?: () => void
  onReset?: () => void
  onPrevious?: () => void
  onSaveAndContinue?: () => void
}

const uploadBoxClass =
  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 py-8 px-6"

export function WalkInStep2DocumentsUpload({
  formData,
  updateFormData,
  onCancel,
  onReset,
  onPrevious,
  onSaveAndContinue,
}: WalkInStep2DocumentsUploadProps) {
  const [supportingFiles, setSupportingFiles] = useState<UploadedFile[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const idInputRef = useRef<HTMLInputElement>(null)
  const supportingInputRef = useRef<HTMLInputElement>(null)
  const authInputRef = useRef<HTMLInputElement>(null)
  const nocInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof WalkInStep2DocumentsFormData
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      updateFormData({ [field]: dataUrl })
    } catch {
      // ignore
    }
    e.target.value = ""
  }

  const handleSupportingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    Array.from(files).forEach((file) => {
      setSupportingFiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
          file,
        },
      ])
    })
    e.target.value = ""
  }

  const removeSupportingFile = (id: string) => {
    setSupportingFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-8">
      <Label className="text-[22px] font-bold text-foreground">Documents Upload</Label>

      {/* Photograph Upload */}
      <div className="space-y-3">
        <div className={uploadBoxClass}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeafe]">
            <Camera className="h-7 w-7 text-[#3366FF]" />
          </div>
          <p className="text-base font-normal text-foreground">Upload a Visitor Photograph</p>
          <p className="text-base text-muted-foreground">Image size: Max 2MB, Format JPG/PNG</p>
          <input
            ref={photoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleUpload(e, "frontImage")}
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Upload Photo
          </button>
        </div>
      </div>

      {/* ID Document Upload */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className={uploadBoxClass}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeafe]">
            <Camera className="h-7 w-7 text-[#3366FF]" />
          </div>
          <p className="text-base font-normal text-foreground">Upload a Proof of Identification</p>
          <p className="text-base text-muted-foreground">Image size: Max 5MB, Format PDF/JPG</p>
          <input
            ref={idInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => handleUpload(e, "backImage")}
          />
          <button
            type="button"
            onClick={() => idInputRef.current?.click()}
            className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Upload Document
          </button>
        </div>
      </div>

      {/* Supporting Documents */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className={uploadBoxClass}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeafe]">
            <Camera className="h-7 w-7 text-[#3366FF]" />
          </div>
          <p className="text-base font-normal text-foreground">Upload supporting document(s)</p>
          <p className="text-base text-muted-foreground">
            Total Image size: Max 10MB, Format PDF/JPG/PNG
          </p>
          <input
            ref={supportingInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={handleSupportingUpload}
          />
          <button
            type="button"
            onClick={() => supportingInputRef.current?.click()}
            className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Upload Document(s)
          </button>
        </div>
        {supportingFiles.length > 0 && (
          <div className="space-y-2">
            {supportingFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
              >
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base text-foreground">{f.name}</p>
                  <p className="text-base text-muted-foreground">File size: {f.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSupportingFile(f.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Authorization letter (if applicable) */}
      <div className="space-y-3 border-t border-border pt-6">
        <Label className="text-base font-medium text-foreground">
          Authorization letter (if applicable)
        </Label>
        <div className={uploadBoxClass}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeafe]">
            <Camera className="h-7 w-7 text-[#3366FF]" />
          </div>
          <p className="text-base font-normal text-foreground">Upload a Proof of Identification</p>
          <p className="text-base text-muted-foreground">Image size: Max 5MB, Format PDF/JPG</p>
          <input
            ref={authInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => handleUpload(e, "applicationLetter")}
          />
          <button
            type="button"
            onClick={() => authInputRef.current?.click()}
            className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Upload Document
          </button>
        </div>
      </div>

      {/* NOC from Relevant Authority (if required) */}
      <div className="space-y-3 border-t border-border pt-6">
        <Label className="text-base font-medium text-foreground">
          NOC from Relevant Authority (if required)
        </Label>
        <div className={uploadBoxClass}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeafe]">
            <Camera className="h-7 w-7 text-[#3366FF]" />
          </div>
          <p className="text-base font-normal text-foreground">Upload a Proof of Identification</p>
          <p className="text-base text-muted-foreground">Image size: Max 5MB, Format PDF/JPG</p>
          <input
            ref={nocInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => handleUpload(e, "additionalDocument")}
          />
          <button
            type="button"
            onClick={() => nocInputRef.current?.click()}
            className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
          >
            Upload Document
          </button>
        </div>
      </div>

      {/* Action buttons – same as first form */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-[#CCCCCC] bg-white px-4 py-2.5 text-base font-normal text-[#3366CC] transition-colors hover:bg-gray-50"
            >
              Reset Form
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-md bg-[#3366FF] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
            >
              Previous
            </button>
          )}
          {onSaveAndContinue && (
            <button
              type="button"
              onClick={onSaveAndContinue}
              className="shrink-0 rounded-md bg-[#3366FF] px-5 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#2952CC]"
            >
              Save & Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
