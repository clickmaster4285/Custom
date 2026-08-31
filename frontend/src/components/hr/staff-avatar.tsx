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

/** Hover/focus action to promote an existing photo to the circular profile image. */
export function SetAsProfileImageButton({
  disabled,
  onClick,
}: {
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="absolute inset-x-1.5 bottom-1.5 z-10 rounded-md bg-black/75 px-2 py-1.5 text-[11px] font-medium leading-tight text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 disabled:opacity-50 max-md:opacity-100"
    >
      Set as profile image
    </button>
  )
}
