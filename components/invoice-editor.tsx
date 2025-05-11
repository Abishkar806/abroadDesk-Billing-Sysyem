"use client"
import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "@/lib/types"
import type { InvoiceItem } from "@/lib/types"
import { Printer, Download, Save } from "lucide-react"
import { PrintableInvoice } from "@/components/printable-invoice"
import { InvoiceHeader } from "@/components/invoice-header"
import { InvoiceTable } from "@/components/invoice-table"
import { InvoiceSummary } from "@/components/invoice-summary"
import { InvoiceConfirmation } from "@/components/invoice-confirmation"

interface InvoiceEditorProps {
  initialInvoice: Invoice | null
  onSave: (invoice: Invoice) => void
  invoices: Invoice[]
}

export function InvoiceEditor({ initialInvoice, onSave, invoices }: InvoiceEditorProps) {
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice>({
    id: "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    panNumber: "51825823",
    client: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    items: [
      {
        id: "1",
        description: "",
        amount: 0,
        preset: "custom",
      },
    ],
    discount: 0,
    discountType: "percentage",
    paidAmount: 0,
    confirmationName: "",
    confirmationDate: new Date().toISOString().split("T")[0],
    createdAt: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize with provided invoice or create a new one
  useEffect(() => {
    if (initialInvoice) {
      // Always ensure discount type is percentage
      setInvoice({
        ...initialInvoice,
        discountType: "percentage",
      })
    } else {
      // Generate a new invoice number (e.g., 0001)
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")

      // Auto-increment invoice number
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

      setInvoice({
        id: "",
        invoiceNumber: paddedNumber,
        date: `${year}-${month}-${day}`,
        panNumber: "51825823",
        client: {
          name: "",
          address: "",
          email: "",
          phone: "",
        },
        items: [
          {
            id: "1",
            description: "",
            amount: 0,
            preset: "custom",
          },
        ],
        discount: 0,
        discountType: "percentage",
        paidAmount: 0,
        confirmationName: "",
        confirmationDate: today.toISOString().split("T")[0],
        createdAt: "",
      })
    }
  }, [initialInvoice, invoices])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!invoice.client.name) {
      newErrors["client.name"] = "Client name is required"
    }

    if (!invoice.client.address) {
      newErrors["client.address"] = "Client address is required"
    }

    // Check if any item has empty description
    invoice.items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`items[${index}].description`] = "Description is required"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Always ensure discount type is percentage before saving
    const updatedInvoice = {
      ...invoice,
      discountType: "percentage",
    }

    onSave(updatedInvoice)
    toast({
      title: "Success",
      description: "Invoice saved successfully",
    })
  }

  const generatePDF = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before downloading",
        variant: "destructive",
      })
      return
    }

    const invoiceElement = document.getElementById("invoice-container")
    if (!invoiceElement) {
      toast({
        title: "Error",
        description: "Could not find invoice element",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your PDF",
    })

    try {
      // Make sure the element is visible for html2canvas
      const originalDisplay = invoiceElement.style.display
      invoiceElement.style.display = "block"
      invoiceElement.style.visibility = "visible"
      invoiceElement.style.position = "fixed"
      invoiceElement.style.top = "-9999px"
      invoiceElement.style.left = "-9999px"
      invoiceElement.style.width = "210mm" // A4 width
      invoiceElement.style.height = "auto"

      // Wait a moment for the element to be fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500))

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("invoice-container")
          if (clonedElement) {
            clonedElement.style.display = "block"
            clonedElement.style.visibility = "visible"
            clonedElement.style.position = "relative"
            clonedElement.style.top = "0"
            clonedElement.style.left = "0"
          }
        },
      })

      // Restore original display
      invoiceElement.style.display = originalDisplay
      invoiceElement.style.visibility = ""
      invoiceElement.style.position = ""
      invoiceElement.style.top = ""
      invoiceElement.style.left = ""
      invoiceElement.style.width = ""
      invoiceElement.style.height = ""

      // Create PDF
      try {
        const imgData = canvas.toDataURL("image/jpeg", 0.95) // Use JPEG instead of PNG

        // A4 dimensions in mm: 210 x 297
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        const imgWidth = 210
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)
        pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`)

        toast({
          title: "PDF Generated",
          description: "Your PDF has been downloaded successfully",
        })
      } catch (pdfError) {
        console.error("Error creating PDF from canvas:", pdfError)

        // Fallback to window.print() if PDF generation fails
        toast({
          title: "PDF Generation Failed",
          description: "Falling back to browser print dialog",
        })

        setTimeout(() => {
          window.print()
        }, 500)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Falling back to browser print dialog.",
        variant: "destructive",
      })

      // Fallback to window.print()
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }

  const handlePrint = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before printing",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Printing",
      description: "Preparing invoice for printing",
    })

    // Make sure the print container is ready
    const invoiceElement = document.getElementById("invoice-container")
    if (invoiceElement) {
      // Ensure it's visible
      invoiceElement.style.display = "block"
    }

    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleClientUpdate = (client: any) => {
    setInvoice({
      ...invoice,
      client,
    })
  }

  const handleItemsUpdate = (items: InvoiceItem[]) => {
    setInvoice({
      ...invoice,
      items,
    })
  }

  const handleSummaryUpdate = (data: {
    discount: number
    discountType: "percentage" | "fixed"
    paidAmount: number
  }) => {
    setInvoice({
      ...invoice,
      discount: data.discount,
      discountType: "percentage", // Always use percentage
      paidAmount: data.paidAmount,
    })
  }

  const handleConfirmationUpdate = (data: { confirmationName: string; confirmationDate: string }) => {
    setInvoice({
      ...invoice,
      confirmationName: data.confirmationName,
      confirmationDate: data.confirmationDate,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Invoice Editor</h2>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button onClick={generatePDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-6">
          <InvoiceHeader
            invoiceNumber={invoice.invoiceNumber}
            date={invoice.date}
            client={invoice.client}
            onUpdate={handleClientUpdate}
            errors={errors}
          />

          <InvoiceTable items={invoice.items} onUpdate={handleItemsUpdate} errors={errors} />

          <InvoiceSummary
            items={invoice.items}
            discount={invoice.discount}
            discountType={invoice.discountType}
            paidAmount={invoice.paidAmount}
            onUpdate={handleSummaryUpdate}
          />

          <InvoiceConfirmation
            name={invoice.confirmationName}
            date={invoice.confirmationDate}
            onUpdate={handleConfirmationUpdate}
          />
        </CardContent>
      </Card>

      <div
        id="invoice-container"
        className="hidden print:block bg-white p-6 shadow-sm border rounded-lg w-full max-w-[210mm] mx-auto h-[297mm]"
      >
        <PrintableInvoice invoice={invoice} />
      </div>

      <style jsx global>{`
    @media print {
      body * {
        visibility: hidden;
      }
      #invoice-container,
      #invoice-container * {
        visibility: visible;
      }
      #invoice-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 10mm;
        box-shadow: none;
        border: none;
        background-color: white;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        page-break-after: avoid;
      }
      @page {
        size: A4;
        margin: 0;
      }
    }
  `}</style>
    </div>
  )
}
