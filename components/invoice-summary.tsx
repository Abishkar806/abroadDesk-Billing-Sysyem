"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { InvoiceItem } from "@/lib/types"

interface InvoiceSummaryProps {
  items: InvoiceItem[]
  discount: number
  discountType: "percentage" | "fixed"
  paidAmount: number
  onUpdate: (data: { discount: number; discountType: "percentage" | "fixed"; paidAmount: number }) => void
}

export function InvoiceSummary({ items, discount, discountType, paidAmount, onUpdate }: InvoiceSummaryProps) {
  const [totalAmount, setTotalAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(0)
  const [dueAmount, setDueAmount] = useState(0)

  // Calculate totals whenever items, discount, or paid amount changes
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    setTotalAmount(total)

    let discountValue = 0
    if (discountType === "percentage") {
      discountValue = total * (discount / 100)
    } else {
      discountValue = discount
    }
    setDiscountAmount(discountValue)

    const final = total - discountValue
    setFinalAmount(final)

    const due = final - paidAmount
    setDueAmount(due)
  }, [items, discount, discountType, paidAmount])

  const handleDiscountChange = (value: string) => {
    onUpdate({
      discount: Number.parseFloat(value) || 0,
      discountType,
      paidAmount,
    })
  }

  const handlePaidAmountChange = (value: string) => {
    onUpdate({
      discount,
      discountType,
      paidAmount: Number.parseFloat(value) || 0,
    })
  }

  return (
    <div className="mb-8 space-y-4">
      <h2 className="font-semibold text-lg">Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Discount (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={discount || ""}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="0"
                className="w-24 text-right"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Label>Paid Amount</Label>
            <Input
              type="number"
              value={paidAmount || ""}
              onChange={(e) => handlePaidAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-32 text-right"
            />
          </div>
        </div>

        <div className="space-y-4 border-l pl-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span>
              Rs. {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Discount:</span>
            <span>
              Rs. {discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Total Payable:</span>
            <span>
              Rs. {finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Paid Amount:</span>
            <span>
              Rs. {paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Amount Due:</span>
            <span>Rs. {dueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
