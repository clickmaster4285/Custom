"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Briefcase, Wrench, Search, Calendar, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WalkInStep1VisitorDetailsFormData {
  visitorCategory: string
  visitorSearch: string
  visitorType: string
  fullName: string
  gender: string
  cnicNumber: string
  passportNumber: string
  nationality: string
  dateOfBirth: string
  mobileNumber: string
  emailAddress: string
  residentialAddress: string
  organizationName: string
  organizationType: string
  ntnRegistrationNo: string
  designation: string
  officeAddress: string
  vehicleType: string
  vehicleNumber: string
  vehicleRegistrationNo: string
  licenseNo: string
  licenseIssueDate: string
  licenseExpiryDate: string
}

interface WalkInStep1VisitorDetailsProps {
  formData: WalkInStep1VisitorDetailsFormData
  updateFormData: (data: Partial<WalkInStep1VisitorDetailsFormData>) => void
  onCancel?: () => void
  onReset?: () => void
  onSaveAndContinue?: () => void
}

const visitorTypes = [
  {
    value: "individual",
    label: "Individual",
    description: "Personal visit or guest",
    icon: User,
  },
  {
    value: "company-rep",
    label: "Company Rep.",
    description: "Business meeting or official",
    icon: Briefcase,
  },
  {
    value: "contractor",
    label: "Contractor",
    description: "Maintenance or service",
    icon: Wrench,
  },
] as const

export function WalkInStep1VisitorDetails({
  formData,
  updateFormData,
  onCancel,
  onReset,
  onSaveAndContinue,
}: WalkInStep1VisitorDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Visitor Category */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Visitor Category</Label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <RadioGroup
            value={formData.visitorCategory}
            onValueChange={(value) => updateFormData({ visitorCategory: value })}
            className="flex flex-row gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="new" id="cat-new" />
              <Label htmlFor="cat-new" className="text-base font-normal cursor-pointer">New Visitor</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="registered" id="cat-registered" />
              <Label htmlFor="cat-registered" className="text-base font-normal cursor-pointer">Registered Visitor</Label>
            </div>
          </RadioGroup>
          {formData.visitorCategory === "registered" && (
            <div className="relative flex-1 max-w-sm sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search visitors, pass IDs..."
                value={formData.visitorSearch}
                onChange={(e) => updateFormData({ visitorSearch: e.target.value })}
                className="pl-9 h-10 text-base bg-background border-border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Visitor Type */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Visitor Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {visitorTypes.map(({ value, label, description, icon: Icon }) => {
            const isSelected = formData.visitorType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateFormData({ visitorType: value })}
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-lg border text-left transition-colors",
                  isSelected
                    ? "border-2 border-[#3b82f6] bg-[#eff6ff]"
                    : "border border-border bg-card hover:border-muted-foreground/40"
                )}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#3b82f6]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                )}
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isSelected ? "bg-[#3b82f6] text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5 pr-6">
                  <span className="text-base font-semibold text-foreground">{label}</span>
                  <span className="text-base text-muted-foreground">{description}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Personal Details */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Personal Details</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base text-foreground">Full Name (as per CNIC/Passport)</Label>
            <Input
              placeholder="e.g. Mohammad Ali Hassan"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(as per CNIC/Passport)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Gender</Label>
            <Select
              value={formData.gender || undefined}
              onValueChange={(value) => updateFormData({ gender: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Male/Female/Other" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-foreground">CNIC Number</Label>
            <Input
              placeholder="00000-0000000-0"
              value={formData.cnicNumber}
              onChange={(e) => updateFormData({ cnicNumber: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(Mandatory for Pakistani Nationals)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Passport Number</Label>
            <Input
              placeholder="123456789"
              value={formData.passportNumber}
              onChange={(e) => updateFormData({ passportNumber: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(Mandatory for Foreign Nationals)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Nationality</Label>
            <Select
              value={formData.nationality || undefined}
              onValueChange={(value) => updateFormData({ nationality: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Pakistani" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pakistani">Pakistani</SelectItem>
                <SelectItem value="american">American</SelectItem>
                <SelectItem value="british">British</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="uae">UAE</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-base text-muted-foreground">(Country of Citizenship)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Date of Birth</Label>
            <div className="relative">
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                className="h-10 text-base bg-background border-border pr-9"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-base text-muted-foreground">(for identity verification)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Mobile Number</Label>
            <Input
              placeholder="0000-0000000"
              value={formData.mobileNumber}
              onChange={(e) => updateFormData({ mobileNumber: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(SMS Notification & OTP)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Email Address</Label>
            <Input
              type="email"
              placeholder="emailaddress@email.com"
              value={formData.emailAddress}
              onChange={(e) => updateFormData({ emailAddress: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(Confirmation and Status Updates)</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-base text-foreground">Residential Address</Label>
            <Textarea
              placeholder="e.g. House #, Street Name, City"
              value={formData.residentialAddress}
              onChange={(e) => updateFormData({ residentialAddress: e.target.value })}
              className="min-h-20 text-base bg-background border-border resize-none"
            />
            <p className="text-base text-muted-foreground">(Visitor Address)</p>
          </div>
        </div>
      </div>

      {/* Company/Organization Information */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Company/Organization Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base text-foreground">Organization Name</Label>
            <Input
              placeholder="Enter the organization name"
              value={formData.organizationName}
              onChange={(e) => updateFormData({ organizationName: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Organization Type</Label>
            <Select
              value={formData.organizationType || undefined}
              onValueChange={(value) => updateFormData({ organizationType: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Select the type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">NTN / Registration No.</Label>
            <Input
              placeholder="Enter the number"
              value={formData.ntnRegistrationNo}
              onChange={(e) => updateFormData({ ntnRegistrationNo: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(Business registration - optional)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Designation</Label>
            <Input
              placeholder="Enter your designation"
              value={formData.designation}
              onChange={(e) => updateFormData({ designation: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-base text-muted-foreground">(Mandatory for Pakistani Nationals)</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-base text-foreground">Office Address</Label>
            <Textarea
              placeholder="e.g. Office #, Building Name, Area, City"
              value={formData.officeAddress}
              onChange={(e) => updateFormData({ officeAddress: e.target.value })}
              className="min-h-20 text-base bg-background border-border resize-none"
            />
            <p className="text-base text-muted-foreground">(Organization Address)</p>
          </div>
        </div>
      </div>

      {/* Vehicle Information (optional) */}
      <div className="space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Vehicle Information (optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base text-foreground">Vehicle Type</Label>
            <Select
              value={formData.vehicleType || undefined}
              onValueChange={(value) => updateFormData({ vehicleType: value })}
            >
              <SelectTrigger className="w-full h-10 bg-background border-border">
                <SelectValue placeholder="Car" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Vehicle Number</Label>
            <Input
              placeholder="Enter vehicle number"
              value={formData.vehicleNumber}
              onChange={(e) => updateFormData({ vehicleNumber: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Vehicle Registration No.</Label>
            <Input
              placeholder="Enter the number"
              value={formData.vehicleRegistrationNo}
              onChange={(e) => updateFormData({ vehicleRegistrationNo: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">License No.</Label>
            <Input
              placeholder="Enter the number"
              value={formData.licenseNo}
              onChange={(e) => updateFormData({ licenseNo: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Issue Date</Label>
            <Input
              type="date"
              placeholder="DD/MM/YYYY"
              value={formData.licenseIssueDate}
              onChange={(e) => updateFormData({ licenseIssueDate: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Expiry Date</Label>
            <Input
              type="date"
              placeholder="DD/MM/YYYY"
              value={formData.licenseExpiryDate}
              onChange={(e) => updateFormData({ licenseExpiryDate: e.target.value })}
              className="h-10 text-base bg-background border-border"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
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
  )
}
