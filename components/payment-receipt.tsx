"use client"
import type { Invoice } from "@/lib/types"

interface PaymentReceiptProps {
  invoice: Invoice
  paymentAmount: number
  paymentDate: string
}

export function PaymentReceipt({ invoice, paymentAmount, paymentDate }: PaymentReceiptProps) {
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

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    const totalAmount = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discountAmount = totalAmount * (invoice.discount / 100)
    const finalAmount = totalAmount - discountAmount
    // We subtract the current payment to get the remaining balance after this payment
    const remainingBalance = finalAmount - invoice.paidAmount
    return remainingBalance
  }

  // Render the payment receipt
  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-normal">abroadDesk Consultancy pvt ltd</h1>
        <p className="text-sm">Newroad, Pokhara</p>
      </div>

      <div className="flex justify-between text-sm mb-6">
        <div>
          <div>PAN NO.: {invoice.panNumber}</div>
          <div>NAME: {invoice.client.name}</div>
          <div>ADDRESS: {invoice.client.address}</div>
        </div>
        <div className="text-right">
          <div>INVOICE NO: {invoice.invoiceNumber}</div>
          <div>{formatDate(paymentDate)}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 font-semibold text-sm border-b pb-2">
          <div>DESCRIPTION</div>
          <div className="text-right">TOTAL</div>
        </div>

        <div className="grid grid-cols-2 text-sm items-center py-2 border-b">
          <div>Payment for Invoice #{invoice.invoiceNumber}</div>
          <div className="text-right">Rs {paymentAmount}</div>
        </div>

        <div className="grid grid-cols-2 text-sm font-semibold py-2 border-b">
          <div>TOTAL</div>
          <div className="text-right">Rs {paymentAmount}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 text-sm mb-6">
        <div></div>
        <div className="text-right space-y-1">
          <div className="flex justify-between">
            <span>Previous Due:</span>
            <span>Rs {(calculateRemainingBalance() + paymentAmount).toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Amount:</span>
            <span>Rs {paymentAmount}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Amount due:</span>
            <span>Rs {calculateRemainingBalance().toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div>Confirmed by: ___________________</div>
      </div>
    </div>
  )
}
