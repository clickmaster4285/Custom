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
import { Clock, Pencil } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

export interface WalkInStep3VisitDetailsFormData {
  visitPurpose: string
  visitPurposeDescription: string
  department: string
  departmentForSlot: string
  hostFullName: string
  hostDesignation: string
  hostDepartment: string
  hostEmail: string
  hostContactNumber: string
  preferredDate: string
  preferredTimeSlot: string
  slotDuration: string
  priorityLevel: string
  securityLevel?: string
  allowedDepartments?: string
  entryGate?: string
  maxVisitDuration?: string
  allowedZones?: string
  timeValidityStart?: string
  timeValidityEnd?: string
  additionalRemarks?: string
  escortMandatory?: string
}

interface WalkInStep3VisitDetailsProps {
  formData: WalkInStep3VisitDetailsFormData
  updateFormData: (data: Partial<WalkInStep3VisitDetailsFormData>) => void
  onCancel?: () => void
  onReset?: () => void
  onPrevious?: () => void
  onSaveAndContinue?: () => void
}

const visitPurposeOptions = [
  { value: "hearing-and-adjudication", label: "Hearing and Adjudication" },
  { value: "license-renewal", label: "License Renewal" },
  { value: "auction-verification", label: "Auction verification" },
  { value: "vehicle-verification", label: "Vehicle Verification" },
]

const departmentOptions = [
  { value: "enforcement", label: "Enforcement" },
  { value: "hr", label: "Human Resource" },
  { value: "it", label: "IT Department" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
]

const securityLevelOptions = [
  { value: "standard", label: "Standard" },
  { value: "elevated", label: "Elevated" },
  { value: "high", label: "High" },
]

const entryGateOptions = [
  { value: "main", label: "Main Gate" },
  { value: "side", label: "Side Gate" },
  { value: "rear", label: "Rear Gate" },
]

export function WalkInStep3VisitDetails({
  formData,
  updateFormData,
  onCancel,
  onReset,
  onPrevious,
  onSaveAndContinue,
}: WalkInStep3VisitDetailsProps) {
  const formik = useFormik({
    initialValues: {
      visitPurpose: formData.visitPurpose || "",
      visitPurposeDescription: formData.visitPurposeDescription || "",
      department: formData.department || formData.departmentForSlot || "",
      hostFullName: formData.hostFullName || "",
      hostDesignation: formData.hostDesignation || "",
      hostDepartment: formData.hostDepartment || "",
      hostEmail: formData.hostEmail || "",
      hostContactNumber: formData.hostContactNumber || "",
      preferredDate: formData.preferredDate || "",
      preferredTimeSlot: formData.preferredTimeSlot || "",
      slotDuration: formData.slotDuration || "",
      priorityLevel: formData.priorityLevel || "normal",
      securityLevel: formData.securityLevel || "",
      allowedDepartments: formData.allowedDepartments || "",
      entryGate: formData.entryGate || "",
      maxVisitDuration: formData.maxVisitDuration || "",
      allowedZones: formData.allowedZones || "",
      timeValidityStart: formData.timeValidityStart || "",
      timeValidityEnd: formData.timeValidityEnd || "",
      additionalRemarks: formData.additionalRemarks || "",
      escortMandatory: formData.escortMandatory ?? "yes",
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      visitPurpose: Yup.string().trim().required("Visit purpose is required"),
      department: Yup.string().trim().required("Department to visit is required"),
    }),
    onSubmit: (values) => {
      // mirror field changes to parent state in case user never touched inputs directly
      updateFormData(values)
      if (onSaveAndContinue) {
        onSaveAndContinue()
      }
    },
  })

  return (
    <div className="space-y-8">
      <Label className="text-[22px] font-bold text-foreground">Visit Details</Label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Visit Purpose, Department to Visit */}
        <div className="space-y-2">
          <Label className="text-base text-foreground">Visit Purpose<span className="text-destructive -ml-px" aria-hidden="true">*</span></Label>
          <Select
            value={formik.values.visitPurpose || undefined}
            onValueChange={(v) => {
              formik.setFieldValue("visitPurpose", v)
              updateFormData({ visitPurpose: v })
            }}
          >
            <SelectTrigger className="w-full h-10 text-base bg-background border-border">
              <SelectValue placeholder="Select visit purpose" />
            </SelectTrigger>
            <SelectContent>
              {visitPurposeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.visitPurpose && formik.errors.visitPurpose && (
            <p className="text-sm text-destructive">{String(formik.errors.visitPurpose)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-base text-foreground">Visit Description</Label>
          <Input
            name="visitPurposeDescription"
            placeholder="To discuss some security matters."
            value={formik.values.visitPurposeDescription}
            onChange={(e) => {
              formik.handleChange(e)
              updateFormData({ visitPurposeDescription: e.target.value })
            }}
            className="h-10 text-base bg-background border-border"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base text-foreground">Department to Visit<span className="text-destructive -ml-px" aria-hidden="true">*</span></Label>
          <Select
            value={formik.values.department || undefined}
            onValueChange={(v) => {
              formik.setFieldValue("department", v)
              updateFormData({ department: v, departmentForSlot: v })
            }}
          >
            <SelectTrigger className="w-full h-10 text-base bg-background border-border">
              <SelectValue placeholder="Enforcement" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.department && formik.errors.department && (
            <p className="text-sm text-destructive">{String(formik.errors.department)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-base text-foreground">Host Officer Name</Label>
          <Select
            value={formik.values.hostFullName || undefined}
            onValueChange={(v) => {
              const host = v === "jahandad"
                ? { hostDesignation: "Manager HR", hostDepartment: "Human Resource", hostEmail: "jahandad123@email.com", hostContactNumber: "051-1234567" }
                : v === "ali"
                  ? { hostDesignation: "Officer", hostDepartment: "IT Department", hostEmail: "ali@email.com", hostContactNumber: "051-7654321" }
                  : v === "khan"
                    ? { hostDesignation: "Director", hostDepartment: "Operations", hostEmail: "khan@email.com", hostContactNumber: "051-1122334" }
                    : {}
              formik.setValues({ ...formik.values, hostFullName: v, ...host })
              updateFormData({ hostFullName: v, ...host })
            }}
          >
            <SelectTrigger className="w-full h-10 text-base bg-background border-border">
              <SelectValue placeholder="Mr. Jahandad Khan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jahandad">Mr. Jahandad Khan</SelectItem>
              <SelectItem value="ali">Mr. Ali Ahmed</SelectItem>
              <SelectItem value="khan">Mr. Hassan Khan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hosting Officer Details - light blue background */}
      <div className="rounded-lg border border-border bg-[#eff6ff] p-6 space-y-4">
        <Label className="text-[22px] font-bold text-foreground">Hosting Officer Details</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Hosting Officer Name</Label>
            <p className="text-base font-normal text-foreground">
              {formik.values.hostFullName === "jahandad"
                ? "Mr. Jahandad Khan"
                : formik.values.hostFullName === "ali"
                  ? "Mr. Ali Ahmed"
                  : formik.values.hostFullName === "khan"
                    ? "Mr. Hassan Khan"
                    : formik.values.hostFullName || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Hosting Officer Designation</Label>
            <p className="text-base font-normal text-foreground">
              {formik.values.hostDesignation || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Hosting Officer Department</Label>
            <p className="text-base font-normal text-foreground">
              {formik.values.hostDepartment || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Hosting Officer Email</Label>
            <p className="text-base font-normal text-foreground">
              {formik.values.hostEmail || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Hosting Officer Contact Number</Label>
            <div className="flex items-center gap-2">
              <p className="text-base font-normal text-foreground">
                {formik.values.hostContactNumber || "—"}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-base font-normal text-[#3366CC] hover:underline"
              >
                Edit <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Level */}
      <div className="space-y-3 border-t border-border pt-6">
        <Label className="text-[22px] font-bold text-foreground">Priority Level</Label>
        <RadioGroup
          value={formik.values.priorityLevel || "normal"}
          onValueChange={(v) => {
            formik.setFieldValue("priorityLevel", v)
            updateFormData({ priorityLevel: v })
          }}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="normal" id="priority-normal" />
            <Label htmlFor="priority-normal" className="text-base font-normal cursor-pointer">
              Normal
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="urgent" id="priority-urgent" />
            <Label htmlFor="priority-urgent" className="text-base font-normal cursor-pointer">
              Urgent
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="high-security" id="priority-high" />
            <Label htmlFor="priority-high" className="text-base font-normal cursor-pointer">
              High Security
            </Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-muted-foreground">(Priority level for the visit)</p>
      </div>

      {/* Security Clearance */}
      <div className="space-y-4 border-t border-border pt-6">
        <Label className="text-[22px] font-bold text-foreground">Security Clearance</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base text-foreground">Security Level</Label>
            <Select
              value={formik.values.securityLevel || undefined}
              onValueChange={(v) => {
                formik.setFieldValue("securityLevel", v)
                updateFormData({ securityLevel: v })
              }}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {securityLevelOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Maximum Visit Duration</Label>
            <Input
              placeholder="Set limit"
              value={formik.values.maxVisitDuration}
              onChange={(e) => {
                formik.setFieldValue("maxVisitDuration", e.target.value)
                updateFormData({ maxVisitDuration: e.target.value })
              }}
              className="h-10 text-base bg-background border-border"
            />
            <p className="text-sm text-muted-foreground">(Capacity Control)</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Allowed Departments</Label>
            <Select
              value={formik.values.allowedDepartments || undefined}
              onValueChange={(v) => {
                formik.setFieldValue("allowedDepartments", v)
                updateFormData({ allowedDepartments: v })
              }}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select department(s)" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Allowed Zones</Label>
            <Select
              value={formik.values.allowedZones || undefined}
              onValueChange={(v) => {
                formik.setFieldValue("allowedZones", v)
                updateFormData({ allowedZones: v })
              }}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select department(s)" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Entry Gate</Label>
            <Select
              value={formik.values.entryGate || undefined}
              onValueChange={(v) => {
                formik.setFieldValue("entryGate", v)
                updateFormData({ entryGate: v })
              }}
            >
              <SelectTrigger className="w-full h-10 text-base bg-background border-border">
                <SelectValue placeholder="Select department(s)" />
              </SelectTrigger>
              <SelectContent>
                {entryGateOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-foreground">Time Validity<span className="text-destructive -ml-px" aria-hidden="true">*</span></Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="time"
                  placeholder="---"
                  value={formik.values.timeValidityStart}
                  onChange={(e) => {
                    formik.setFieldValue("timeValidityStart", e.target.value)
                    updateFormData({ timeValidityStart: e.target.value })
                  }}
                  className="h-10 text-base bg-background border-border pr-9"
                />
                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <Input
                  type="time"
                  placeholder="---"
                  value={formik.values.timeValidityEnd}
                  onChange={(e) => {
                    formik.setFieldValue("timeValidityEnd", e.target.value)
                    updateFormData({ timeValidityEnd: e.target.value })
                  }}
                  className="h-10 text-base bg-background border-border pr-9"
                />
                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Remarks */}
      <div className="space-y-2 border-t border-border pt-6">
        <Label className="text-base text-foreground">Additional Remarks</Label>
        <Textarea
          placeholder="Add remarks"
          value={formik.values.additionalRemarks}
          onChange={(e) => {
            formik.setFieldValue("additionalRemarks", e.target.value)
            updateFormData({ additionalRemarks: e.target.value })
          }}
          className="min-h-20 text-base bg-background border-border resize-none"
        />
      </div>

      {/* Escort Mandatory */}
      <div className="space-y-3 border-t border-border pt-6">
        <Label className="text-[22px] font-bold text-foreground">Escort Mandatory</Label>
        <RadioGroup
          value={formik.values.escortMandatory || "yes"}
          onValueChange={(v) => {
            formik.setFieldValue("escortMandatory", v)
            updateFormData({ escortMandatory: v })
          }}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id="escort-yes" />
            <Label htmlFor="escort-yes" className="text-base font-normal cursor-pointer">
              Yes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id="escort-no" />
            <Label htmlFor="escort-no" className="text-base font-normal cursor-pointer">
              No
            </Label>
          </div>
        </RadioGroup>
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
              onClick={() => formik.submitForm()}
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
