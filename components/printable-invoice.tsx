"use client"

import { useState, useEffect } from "react"
import type { Invoice } from "@/lib/types"

interface PrintableInvoiceProps {
  invoice: Invoice
}

export function PrintableInvoice({ invoice }: PrintableInvoiceProps) {
  const [totalAmount, setTotalAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(0)
  const [dueAmount, setDueAmount] = useState(0)

  // Calculate totals
  useEffect(() => {
    const total = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    setTotalAmount(total)

    // Always calculate as percentage
    const discountValue = total * (invoice.discount / 100)
    setDiscountAmount(discountValue)

    const final = total - discountValue
    setFinalAmount(final)

    const due = final - invoice.paidAmount
    setDueAmount(due)
  }, [invoice])

  // Format date to YYYY/MM/DD
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}/${month}/${day}`
    } catch (e) {
      return dateString
    }
  }

  // Render a single receipt
  const renderReceipt = () => (
    <div className="mb-2 pb-2" style={{ transformOrigin: "top left" }}>
      <div className="text-center mb-4">
        <h1 className="text-xl font-normal">abroadDesk Consultancy pvt ltd</h1>
        <p className="text-sm">Newroad, Pokhara</p>
      </div>

      <div className="flex justify-between text-sm mb-4">
        <div>
          <div>PAN NO.: {invoice.panNumber}</div>
          <div>NAME: {invoice.client.name}</div>
          <div>ADDRESS: {invoice.client.address}</div>
        </div>
        <div className="text-right">
          <div>INVOICE NO: {invoice.invoiceNumber}</div>
          <div>{formatDate(invoice.date)}</div>
        </div>
      </div>

      <div className="border-t border-b py-1 mb-2">
        <div className="grid grid-cols-2 font-semibold text-sm">
          <div>DESCRIPTION</div>
          <div className="text-right">TOTAL</div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {invoice.items.map((item, index) => (
          <div key={index} className="grid grid-cols-2 text-sm items-center">
            <div>{item.description}</div>
            <div className="text-right">Rs {item.amount}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-b py-1 mb-3">
        <div className="grid grid-cols-2 text-sm">
          <div className="font-semibold">TOTAL</div>
          <div className="text-right">Rs {totalAmount}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 items-center justify-items-end">
          <div></div>
          <div className="text-right">
            {invoice.discount > 0 && (
              <div className="flex justify-between w-48">
                <span className="font-medium">Discount ({invoice.discount}%)</span>
                <span>Rs {discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between w-48">
              <span className="font-medium">Total Paid Amount</span>
              <span>Rs {invoice.paidAmount}</span>
            </div>
            <div className="flex justify-between w-48 font-bold text-base">
              <span>Amount due</span>
              <span>Rs {dueAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {invoice.confirmationName && (
        <div className="mt-4 text-sm">
          <div>Confirmed by: {invoice.confirmationName}</div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="mb-auto">{renderReceipt()}</div>
      <div className="border-t border-dashed my-4"></div>
      <div>{renderReceipt()}</div>
    </div>
  )
}
