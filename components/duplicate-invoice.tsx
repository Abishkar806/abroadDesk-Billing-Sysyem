"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import type { Invoice, InvoiceItem } from "@/lib/types"

interface DuplicateInvoiceProps {
  invoice: Invoice
  onUpdate: (data: Partial<Invoice>) => void
}

export function DuplicateInvoice({ invoice, onUpdate }: DuplicateInvoiceProps) {
  const [totalAmount, setTotalAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(0)
  const [dueAmount, setDueAmount] = useState(0)

  // Calculate totals whenever items, discount, or paid amount changes
  useEffect(() => {
    const total = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    setTotalAmount(total)

    let discountValue = 0
    if (invoice.discountType === "percentage") {
      discountValue = total * (invoice.discount / 100)
    } else {
      discountValue = invoice.discount
    }
    setDiscountAmount(discountValue)

    const final = total - discountValue
    setFinalAmount(final)

    const due = final - invoice.paidAmount
    setDueAmount(due)
  }, [invoice.items, invoice.discount, invoice.discountType, invoice.paidAmount])

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onUpdate({
      client: {
        ...invoice.client,
        [name]: value,
      },
    })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ date: e.target.value })
  }

  const handleInvoiceNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ invoiceNumber: e.target.value })
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    onUpdate({ items: updatedItems })
  }

  const handlePaidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ paidAmount: Number.parseFloat(e.target.value) || 0 })
  }

  // Render a single receipt
  const renderReceipt = () => (
    <div className="mb-4 pb-2">
      <div className="text-center mb-4">
        <h1 className="text-xl font-normal">abroadDesk Consultancy pvt ltd</h1>
        <p className="text-sm">Newroad, Pokhara</p>
      </div>

      <div className="flex justify-between text-sm mb-4">
        <div>
          <div>PAN NO.: 51825823</div>
          <div className="flex gap-1">
            <span>NAME:</span>
            <Input
              value={invoice.client.name}
              onChange={handleClientChange}
              name="name"
              className="h-6 py-0 px-1 w-40 border-0 border-b border-dashed"
              placeholder="Client Name"
            />
          </div>
          <div className="flex gap-1">
            <span>ADDRESS:</span>
            <Input
              value={invoice.client.address}
              onChange={handleClientChange}
              name="address"
              className="h-6 py-0 px-1 w-40 border-0 border-b border-dashed"
              placeholder="Client Address"
            />
          </div>
        </div>
        <div className="text-right">
          <div className="flex gap-1 justify-end">
            <span>INVOICE NO:</span>
            <Input
              value={invoice.invoiceNumber}
              onChange={handleInvoiceNumberChange}
              className="h-6 py-0 px-1 w-16 text-right border-0 border-b border-dashed"
              placeholder="0001"
            />
          </div>
          <div className="flex gap-1 justify-end">
            <Input
              type="date"
              value={invoice.date}
              onChange={handleDateChange}
              className="h-6 py-0 px-1 w-28 text-right border-0"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-b py-2 mb-2">
        <div className="grid grid-cols-2 font-semibold text-sm">
          <div>DESCRIPTION</div>
          <div className="text-right">TOTAL</div>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {invoice.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-2 text-sm items-center">
            <div className="flex-1">
              <Input
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                className="h-7 py-0 px-1 border-0 border-b border-dashed"
                placeholder="Item description"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <span>Rs</span>
              <Input
                type="number"
                value={item.amount || ""}
                onChange={(e) => updateItem(item.id, "amount", Number.parseFloat(e.target.value) || 0)}
                className="h-7 py-0 px-1 w-20 text-right border-0 border-b border-dashed"
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-b py-2 mb-4">
        <div className="grid grid-cols-2 text-sm">
          <div className="font-semibold">TOTAL</div>
          <div className="text-right">Rs {totalAmount}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 items-center justify-items-end">
          <div></div>
          <div className="text-right">
            <div className="flex justify-between w-48">
              <span className="font-medium">Total Paid Amount</span>
              <div className="flex items-center gap-1">
                <span>Rs</span>
                <Input
                  type="number"
                  value={invoice.paidAmount || ""}
                  onChange={handlePaidAmountChange}
                  className="h-6 py-0 px-1 w-16 text-right border-0 border-b border-dashed"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-between w-48 font-bold text-base">
              <span>Amount due</span>
              <span>Rs {dueAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 print:space-y-16 flex flex-col justify-between h-full">
      <div className="mb-auto">{renderReceipt()}</div>
      <div className="border-t border-dashed pt-4"></div>
      <div>{renderReceipt()}</div>
    </div>
  )
}
