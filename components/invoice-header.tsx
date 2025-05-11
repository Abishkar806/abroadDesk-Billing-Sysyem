"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ClientInfo } from "@/lib/types"

interface InvoiceHeaderProps {
  invoiceNumber: string
  date: string
  client: ClientInfo
  onUpdate: (client: ClientInfo) => void
  errors?: Record<string, string>
}

export function InvoiceHeader({ invoiceNumber, date, client, onUpdate, errors = {} }: InvoiceHeaderProps) {
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onUpdate({
      ...client,
      [name]: value,
    })
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">AbroadDesk Consultancy Pvt. Ltd.</h1>
          <p className="text-gray-600">Newroad, Pokhara</p>
        </div>

        <div className="space-y-2 w-full md:w-auto md:text-right">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice No:</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              readOnly
              className={errors["invoiceNumber"] ? "border-red-500" : ""}
            />
            {errors["invoiceNumber"] && <p className="text-red-500 text-sm">{errors["invoiceNumber"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date:</Label>
            <Input id="date" type="date" value={date} readOnly />
          </div>
        </div>
      </div>

      <div className="border-t border-b py-4 space-y-4">
        <h2 className="font-semibold text-lg">Client Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              name="name"
              value={client.name}
              onChange={handleClientChange}
              placeholder="Client Name"
              className={errors["client.name"] ? "border-red-500" : ""}
            />
            {errors["client.name"] && <p className="text-red-500 text-sm">{errors["client.name"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              name="email"
              type="email"
              value={client.email}
              onChange={handleClientChange}
              placeholder="client@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress">Address</Label>
            <Input
              id="clientAddress"
              name="address"
              value={client.address}
              onChange={handleClientChange}
              placeholder="Client Address"
              className={errors["client.address"] ? "border-red-500" : ""}
            />
            {errors["client.address"] && <p className="text-red-500 text-sm">{errors["client.address"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone</Label>
            <Input
              id="clientPhone"
              name="phone"
              value={client.phone}
              onChange={handleClientChange}
              placeholder="Phone Number"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
