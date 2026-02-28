"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PrintQROnSaveProps {
  qrPayload: string
  visitorName: string
  visitorCNIC?: string
  validFrom: string
  validTo: string
  qrCodeId?: string
  onDone: () => void
}

export function PrintQROnSave({
  qrPayload,
  visitorName,
  visitorCNIC,
  validFrom,
  validTo,
  qrCodeId,
  onDone,
}: PrintQROnSaveProps) {
  const [dataUrl, setDataUrl] = useState<string>("")

  useEffect(() => {
    const payload = qrPayload && qrPayload !== "{}" ? qrPayload : JSON.stringify({
      name: visitorName,
      cnic: visitorCNIC,
      validFrom,
      validTo,
      qrCodeId,
    })
    QRCode.toDataURL(payload, { width: 200, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""))
  }, [qrPayload, visitorName, visitorCNIC, validFrom, validTo, qrCodeId])

  return (
    <Dialog open onOpenChange={(open) => !open && onDone()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Visitor QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code" className="rounded border border-border" />
          ) : (
            <div className="h-[200px] w-[200px] rounded border border-border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              Generating…
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{visitorName}</p>
            {visitorCNIC && <p>{visitorCNIC}</p>}
            <p>Valid: {validFrom} – {validTo}</p>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="w-full">
            Print
          </Button>
          <Button onClick={onDone} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
