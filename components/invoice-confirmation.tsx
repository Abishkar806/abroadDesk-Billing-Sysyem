"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InvoiceConfirmationProps {
  name: string
  date: string
  onUpdate: (data: { confirmationName: string; confirmationDate: string }) => void
}

export function InvoiceConfirmation({ name, date, onUpdate }: InvoiceConfirmationProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      confirmationName: e.target.value,
      confirmationDate: date,
    })
  }

  return (
    <div className="mt-16 pt-8 border-t">
      <h2 className="font-semibold text-lg mb-4">Confirmation</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="confirmationName">Confirmed by:</Label>
          <Input id="confirmationName" value={name} onChange={handleNameChange} placeholder="Full Name" />
        </div>

        <div className="space-y-2">
          <Label>Date:</Label>
          <p>{new Date(date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-8">
        <Label>Signature:</Label>
        <div className="h-16 border-b border-dashed mt-8"></div>
      </div>
    </div>
  )
}
