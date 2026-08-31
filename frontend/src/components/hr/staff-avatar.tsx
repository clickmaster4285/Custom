import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { resolveStaffProfileImageUrl, staffInitials } from "@/lib/staff-api"

type StaffAvatarProps = {
  profileImage?: string | null
  fullName?: string | null
  className?: string
  fallbackClassName?: string
}

export function StaffAvatar({
  profileImage,
  fullName,
  className,
  fallbackClassName,
}: StaffAvatarProps) {
  const src = resolveStaffProfileImageUrl(profileImage)
  const initials = staffInitials(fullName)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <Avatar key={src ?? "none"} className={cn(className)}>
      {src && !failed ? (
        <AvatarImage
          src={src}
          alt=""
          className="object-cover"
          onLoadingStatusChange={(status) => {
            if (status === "error") setFailed(true)
          }}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  )
}
