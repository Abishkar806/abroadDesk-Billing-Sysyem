"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "@/lib/types"
import { Search, CreditCard, Printer } from "lucide-react"
import { PaymentReceipt } from "@/components/payment-receipt"

interface ClearDueAmountProps {
  invoices: Invoice[]
  onUpdateInvoice: (updatedInvoice: Invoice) => void
}

export function ClearDueAmount({ invoices, onUpdateInvoice }: ClearDueAmountProps) {
  const { toast } = useToast()
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [paymentAmount, setPaymentAmount] = useState<number | "">("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [dueAmount, setDueAmount] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastPayment, setLastPayment] = useState<{
    invoice: Invoice
    amount: number
    date: string
  } | null>(null)

  const handleSearch = () => {
    if (!invoiceNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number",
        variant: "destructive",
      })
      return
    }

    const invoice = invoices.find((inv) => inv.invoiceNumber === invoiceNumber.trim())
    if (!invoice) {
      toast({
        title: "Invoice Not Found",
        description: `No invoice found with number ${invoiceNumber}`,
        variant: "destructive",
      })
      setSelectedInvoice(null)
      return
    }

    // Calculate due amount
    const totalAmount = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discountAmount = totalAmount * (invoice.discount / 100)
    const finalAmount = totalAmount - discountAmount
    const due = finalAmount - invoice.paidAmount

    setSelectedInvoice(invoice)
    setDueAmount(due)
    setPaymentAmount("")
    setShowReceipt(false)

    toast({
      title: "Invoice Found",
      description: `Invoice #${invoiceNumber} for ${invoice.client.name}`,
    })
  }

  const handlePayment = () => {
    if (!selectedInvoice) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive",
      })
      return
    }

    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    if (paymentAmount > dueAmount) {
      toast({
        title: "Error",
        description: "Payment amount cannot exceed due amount",
        variant: "destructive",
      })
      return
    }

    // Update the invoice with the new payment
    const updatedInvoice = {
      ...selectedInvoice,
      paidAmount: selectedInvoice.paidAmount + Number(paymentAmount),
    }

    // Save the payment details for the receipt
    setLastPayment({
      invoice: updatedInvoice,
      amount: Number(paymentAmount),
      date: new Date().toISOString(),
    })

    onUpdateInvoice(updatedInvoice)
    setShowReceipt(true)

    toast({
      title: "Payment Successful",
      description: `Payment of Rs. ${paymentAmount} applied to invoice #${selectedInvoice.invoiceNumber}`,
    })
  }

  const handlePrintReceipt = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your popup blocker settings.",
        variant: "destructive",
      })
      return
    }

    // Format date
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
      if (!lastPayment || !lastPayment.invoice) return 0
      const totalAmount = lastPayment.invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
      const discountAmount = totalAmount * (lastPayment.invoice.discount / 100)
      const finalAmount = totalAmount - discountAmount
      const remainingBalance = finalAmount - lastPayment.invoice.paidAmount
      return remainingBalance
    }

    const previousDue = calculateRemainingBalance() + (lastPayment?.amount || 0)

    // Write the receipt HTML to the new window
    printWindow.document.write(`
<html>
  <head>
    <title>Payment Receipt</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 10px;
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.3;
        font-size: 12px;
      }
      .receipt-container {
        display: flex;
        flex-direction: column;
      }
      .receipt {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px dashed #ccc;
        page-break-inside: avoid;
      }
      .receipt:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: bold; }
      .text-xl { font-size: 16px; }
      .text-sm { font-size: 12px; }
      .mb-6 { margin-bottom: 15px; }
      .mb-4 { margin-bottom: 10px; }
      .mt-8 { margin-top: 20px; }
      .py-2 { padding-top: 5px; padding-bottom: 5px; }
      .pb-2 { padding-bottom: 5px; }
      .border-b { border-bottom: 1px solid #e2e8f0; }
      .grid { display: grid; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .space-y-1 > * + * { margin-top: 2px; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }
      th, td {
        padding: 5px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        font-weight: bold;
      }
      td.amount {
        text-align: right;
      }
      .summary {
        margin-top: 10px;
        text-align: right;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
      }
      .summary-row.total {
        font-weight: bold;
        border-top: 1px solid #ddd;
        padding-top: 3px;
      }
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
        body { 
          print-color-adjust: exact; 
          -webkit-print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        .receipt-container {
          height: auto;
        }
        .receipt { 
          page-break-inside: avoid;
          page-break-after: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt-container">
      <!-- First Receipt -->
      <div class="receipt">
        <div class="text-center mb-6">
          <h1 class="text-xl">abroadDesk Consultancy pvt ltd</h1>
          <p class="text-sm">Newroad, Pokhara</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <div>PAN NO.: ${lastPayment?.invoice.panNumber}</div>
            <div>NAME: ${lastPayment?.invoice.client.name}</div>
            <div>ADDRESS: ${lastPayment?.invoice.client.address}</div>
          </div>
          <div style="text-align: right;">
            <div>INVOICE NO: ${lastPayment?.invoice.invoiceNumber}</div>
            <div>${formatDate(lastPayment?.date || "")}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th style="text-align: right;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Payment for Invoice #${lastPayment?.invoice.invoiceNumber}</td>
              <td class="amount">Rs ${lastPayment?.amount}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>TOTAL</th>
              <th style="text-align: right;">Rs ${lastPayment?.amount}</th>
            </tr>
          </tfoot>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Previous Due:</span>
            <span>Rs ${previousDue.toFixed(0)}</span>
          </div>
          <div class="summary-row">
            <span>Payment Amount:</span>
            <span>Rs ${lastPayment?.amount}</span>
          </div>
          <div class="summary-row total">
            <span>Amount due:</span>
            <span>Rs ${calculateRemainingBalance().toFixed(0)}</span>
          </div>
        </div>

        <div class="mt-8">
          <div>Confirmed by: ___________________</div>
        </div>
      </div>

      <!-- Second Receipt (Duplicate) -->
      <div class="receipt">
        <div class="text-center mb-6">
          <h1 class="text-xl">abroadDesk Consultancy pvt ltd</h1>
          <p class="text-sm">Newroad, Pokhara</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <div>PAN NO.: ${lastPayment?.invoice.panNumber}</div>
            <div>NAME: ${lastPayment?.invoice.client.name}</div>
            <div>ADDRESS: ${lastPayment?.invoice.client.address}</div>
          </div>
          <div style="text-align: right;">
            <div>INVOICE NO: ${lastPayment?.invoice.invoiceNumber}</div>
            <div>${formatDate(lastPayment?.date || "")}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th style="text-align: right;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Payment for Invoice #${lastPayment?.invoice.invoiceNumber}</td>
              <td class="amount">Rs ${lastPayment?.amount}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>TOTAL</th>
              <th style="text-align: right;">Rs ${lastPayment?.amount}</th>
            </tr>
          </tfoot>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Previous Due:</span>
            <span>Rs ${previousDue.toFixed(0)}</span>
          </div>
          <div class="summary-row">
            <span>Payment Amount:</span>
            <span>Rs ${lastPayment?.amount}</span>
          </div>
          <div class="summary-row total">
            <span>Amount due:</span>
            <span>Rs ${calculateRemainingBalance().toFixed(0)}</span>
          </div>
        </div>

        <div class="mt-8">
          <div>Confirmed by: ___________________</div>
        </div>
      </div>
    </div>
  </body>
</html>
    `)

    // Trigger print and close the window after printing
    printWindow.document.close()
    printWindow.focus()

    // Use setTimeout to ensure the content is loaded before printing
    setTimeout(() => {
      printWindow.print()
      // Don't close the window automatically so user can see the print dialog
    }, 500)
  }

  const getPaymentStatus = (invoice: Invoice): "paid" | "partial" | "unpaid" => {
    const totalAmount = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discountAmount = totalAmount * (invoice.discount / 100)
    const finalAmount = totalAmount - discountAmount

    if (invoice.paidAmount >= finalAmount) return "paid"
    if (invoice.paidAmount > 0) return "partial"
    return "unpaid"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clear Due Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice number"
                />
                <Button onClick={handleSearch} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {selectedInvoice && !showReceipt && (
            <div className="border rounded-md p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{selectedInvoice.client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">
                    Rs.{" "}
                    {selectedInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Already Paid</p>
                  <p className="font-medium">Rs. {selectedInvoice.paidAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Amount</p>
                  <p className="font-medium text-red-600">Rs. {dueAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getPaymentStatus(selectedInvoice) === "paid"
                        ? "bg-green-100 text-green-800"
                        : getPaymentStatus(selectedInvoice) === "partial"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getPaymentStatus(selectedInvoice) === "paid"
                      ? "Paid"
                      : getPaymentStatus(selectedInvoice) === "partial"
                        ? "Partially Paid"
                        : "Unpaid"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="Enter payment amount"
                    max={dueAmount}
                  />
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full flex items-center justify-center gap-2"
                  disabled={!paymentAmount || paymentAmount <= 0 || paymentAmount > dueAmount}
                >
                  <CreditCard className="h-4 w-4" />
                  Process Payment
                </Button>
              </div>
            </div>
          )}

          {showReceipt && lastPayment && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Payment Receipt</h3>
                  <Button onClick={handlePrintReceipt} variant="outline" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>

                <div className="border p-4 rounded-md bg-gray-50">
                  <PaymentReceipt
                    invoice={lastPayment.invoice}
                    paymentAmount={lastPayment.amount}
                    paymentDate={lastPayment.date}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReceipt(false)
                      setSelectedInvoice(null)
                      setInvoiceNumber("")
                    }}
                  >
                    New Payment
                  </Button>
                  <Button onClick={handlePrintReceipt} className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
