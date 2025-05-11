"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceEditor } from "@/components/invoice-editor"
import { InvoiceList } from "@/components/invoice-list"
import { ClearDueAmount } from "@/components/clear-due-amount"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "@/lib/types"
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InvoiceSystem() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [isExporting, setIsExporting] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1ufyHCyQZLh2TB3zGnVCjW_s2ZSoSRVpmbqPq3Kh3t1Y/edit?gid=0#gid=0"

  // Use the new Apps Script URL that's working without authorization errors
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwJTHC-Q707UZKJhGEPOpoSsLzD_3dLIuGgqAMhce41Kx2fbL0V4TUTlsfLe4cviRu_ng/exec"

  // Load invoices from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices")
    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices))
      } catch (e) {
        console.error("Error parsing saved invoices:", e)
      }
    }

    const lastSync = localStorage.getItem("lastSyncTime")
    if (lastSync) {
      setLastSyncTime(lastSync)
    }
  }, [])

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(invoices))
  }, [invoices])

  const editInvoice = (invoice: Invoice) => {
    setActiveInvoice(invoice)
    setActiveTab("editor")
  }

  // Function to get payment status
  const getPaymentStatus = (invoice: Invoice): string => {
    const totalAmount = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discountAmount = totalAmount * (invoice.discount / 100)
    const finalAmount = totalAmount - discountAmount

    if (invoice.paidAmount >= finalAmount) return "Paid"
    if (invoice.paidAmount > 0) return "Partially Paid"
    return "Unpaid"
  }

  // Update the sendToGoogleSheets function to use fetch instead of form submission
  // This will prevent redirection to a new page
  const sendToGoogleSheets = async (invoicesToSave: Invoice[]) => {
    if (!APPS_SCRIPT_URL) {
      throw new Error("Google Apps Script URL is not configured")
    }

    // Prepare the data for Google Sheets
    const data = invoicesToSave.map((inv) => {
      const totalAmount = inv.items.reduce((sum, item) => sum + (item.amount || 0), 0)
      const discountAmount = totalAmount * (inv.discount / 100)
      const finalAmount = totalAmount - discountAmount
      const dueAmount = finalAmount - inv.paidAmount
      const paymentStatus = getPaymentStatus(inv)

      return {
        "Invoice No": inv.invoiceNumber,
        Date: new Date(inv.date).toLocaleDateString(),
        "Client Name": inv.client.name,
        "Client Address": inv.client.address,
        "Client Phone": inv.client.phone || "",
        Items: inv.items.map((item) => `${item.description}: Rs ${item.amount}`).join("; "),
        "Total Amount": totalAmount,
        "Discount (%)": inv.discount,
        "Final Amount": finalAmount,
        "Paid Amount": inv.paidAmount,
        "Due Amount": dueAmount,
        "Payment Status": paymentStatus,
        "Confirmed By": inv.confirmationName || "",
      }
    })

    // Use fetch API instead of form submission
    const formData = new FormData()
    formData.append("data", JSON.stringify(data))

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors", // This prevents CORS issues but means we can't read the response
    })

    // Update last sync time
    const now = new Date().toLocaleString()
    setLastSyncTime(now)
    localStorage.setItem("lastSyncTime", now)
  }

  // Save invoice function
  const saveInvoice = async (invoice: Invoice) => {
    let newInvoice = { ...invoice }
    let updatedInvoices = [...invoices]

    // Always set discount type to percentage
    newInvoice.discountType = "percentage"

    if (!invoice.id) {
      // Create new invoice with unique ID and auto-incremented invoice number
      const lastInvoiceNumber =
        invoices.length > 0
          ? Math.max(
              ...invoices.map((inv) => {
                const numPart = Number.parseInt(inv.invoiceNumber.replace(/^0+/, "")) || 0
                return numPart
              }),
            )
          : 0

      const nextNumber = lastInvoiceNumber + 1
      const paddedNumber = String(nextNumber).padStart(5, "0")

      newInvoice = {
        ...newInvoice,
        id: Date.now().toString(),
        invoiceNumber: paddedNumber,
        createdAt: new Date().toISOString(),
      }

      updatedInvoices = [...invoices, newInvoice]
    } else {
      // Update existing invoice
      updatedInvoices = invoices.map((inv) => (inv.id === invoice.id ? newInvoice : inv))
    }

    // Save locally
    setInvoices(updatedInvoices)

    // Try to send to Google Sheets
    if (APPS_SCRIPT_URL) {
      setIsExporting(true)
      try {
        await sendToGoogleSheets(updatedInvoices)

        // Show success message as a popup
        toast({
          title: "Success",
          description: "Data has been saved to database",
        })
      } catch (error) {
        console.error("Error sending to Google Sheets:", error)
        toast({
          title: "Google Sheets Update Failed",
          description: "Could not update Google Sheets. Your data is still saved locally.",
          variant: "destructive",
        })
      } finally {
        setIsExporting(false)
      }
    } else {
      // Show success message for local save only
      toast({
        title: "Invoice Saved Locally",
        description: "Invoice has been saved to your browser's storage",
      })
    }

    // Keep the user on the form page (don't redirect)
    // Reset the form for a new invoice if this was a new invoice
    if (!invoice.id) {
      setActiveInvoice(null)
    }
  }

  // Delete invoice function
  const deleteInvoice = async (id: string) => {
    const updatedInvoices = invoices.filter((invoice) => invoice.id !== id)

    // Save locally
    setInvoices(updatedInvoices)

    // Show success message for local delete
    toast({
      title: "Invoice Deleted Locally",
      description: "Invoice has been removed from your browser's storage",
    })

    // Try to send updated list to Google Sheets
    if (APPS_SCRIPT_URL) {
      setIsExporting(true)
      try {
        await sendToGoogleSheets(updatedInvoices)
        toast({
          title: "Google Sheets Updated",
          description: "Invoice data has been updated in Google Sheets",
        })
      } catch (error) {
        console.error("Error updating Google Sheets:", error)
        toast({
          title: "Google Sheets Update Failed",
          description: "Could not update Google Sheets. Your data is still saved locally.",
          variant: "destructive",
        })
      } finally {
        setIsExporting(false)
      }
    }
  }

  // Update invoice function (for clearing due amounts)
  const updateInvoice = async (updatedInvoice: Invoice) => {
    // Update the invoice in the local state
    const updatedInvoices = invoices.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))

    // Save locally
    setInvoices(updatedInvoices)

    // Try to send to Google Sheets
    if (APPS_SCRIPT_URL) {
      setIsExporting(true)
      try {
        await sendToGoogleSheets(updatedInvoices)
        toast({
          title: "Google Sheets Updated",
          description: "Invoice payment data has been updated in Google Sheets",
        })
      } catch (error) {
        console.error("Error updating Google Sheets:", error)
        toast({
          title: "Google Sheets Update Failed",
          description: "Could not update Google Sheets. Your data is still saved locally.",
          variant: "destructive",
        })
      } finally {
        setIsExporting(false)
      }
    }
  }

  // Manual sync function
  const manualSync = async () => {
    if (!APPS_SCRIPT_URL) {
      toast({
        title: "Sync Failed",
        description: "Google Apps Script URL is not configured",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      await sendToGoogleSheets(invoices)
      toast({
        title: "Google Sheets Updated",
        description: "All invoice data has been sent to Google Sheets",
      })
    } catch (error) {
      console.error("Error sending to Google Sheets:", error)
      toast({
        title: "Google Sheets Update Failed",
        description: "Could not update Google Sheets. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Export to CSV function
  const exportToCSV = () => {
    setIsExporting(true)

    try {
      // Prepare CSV data
      const headers = [
        "Invoice No",
        "Date",
        "Client Name",
        "Client Address",
        "Client Phone",
        "Items",
        "Total Amount",
        "Discount (%)",
        "Final Amount",
        "Paid Amount",
        "Due Amount",
        "Payment Status",
        "Confirmed By",
      ]

      const rows = invoices.map((inv) => {
        const totalAmount = inv.items.reduce((sum, item) => sum + (item.amount || 0), 0)
        const discountAmount = totalAmount * (inv.discount / 100)
        const finalAmount = totalAmount - discountAmount
        const dueAmount = finalAmount - inv.paidAmount
        const paymentStatus = getPaymentStatus(inv)

        return [
          inv.invoiceNumber,
          new Date(inv.date).toLocaleDateString(),
          inv.client.name,
          inv.client.address,
          inv.client.phone || "",
          inv.items.map((item) => `${item.description}: Rs ${item.amount}`).join("; "),
          totalAmount.toString(),
          inv.discount.toString(),
          finalAmount.toString(),
          inv.paidAmount.toString(),
          dueAmount.toString(),
          paymentStatus,
          inv.confirmationName || "",
        ]
      })

      // Convert to CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map(
              (cell) =>
                // Escape quotes and wrap in quotes
                `"${String(cell).replace(/"/g, '""')}"`,
            )
            .join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "invoice_data.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "CSV Exported",
        description: "Invoice data has been exported to CSV",
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export invoice data to CSV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AbroadDesk Invoice System</h1>

      {isExporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Updating Google Sheets...</p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Create Invoice</TabsTrigger>
          <TabsTrigger value="list">Invoice List</TabsTrigger>
          <TabsTrigger value="payment">Clear Due Amount</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <InvoiceEditor initialInvoice={activeInvoice} onSave={saveInvoice} invoices={invoices} />
        </TabsContent>

        <TabsContent value="list">
          <div className="mb-4 flex justify-between items-center">
            <div>
              {lastSyncTime && <p className="text-sm text-gray-500">Last synced with Google Sheets: {lastSyncTime}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
              <Button onClick={manualSync} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync to Google Sheets
              </Button>
              <Button
                onClick={() => window.open(GOOGLE_SHEET_URL, "_blank")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Open Google Sheet
              </Button>
            </div>
          </div>

          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <p className="font-semibold">✓ Google Sheets Integration Active</p>
            <p className="mt-1">
              All invoice data is automatically sent to Google Sheets when you save or delete an invoice. You can also
              manually sync by clicking the "Sync to Google Sheets" button.
            </p>
          </div>

          <InvoiceList invoices={invoices} onEdit={editInvoice} onDelete={deleteInvoice} />
        </TabsContent>

        <TabsContent value="payment">
          <ClearDueAmount invoices={invoices} onUpdateInvoice={updateInvoice} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
