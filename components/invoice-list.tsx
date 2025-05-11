"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "@/lib/types"
import { Edit, Trash2, Search, FileText, Printer } from "lucide-react"

interface InvoiceListProps {
  invoices: Invoice[]
  onEdit: (invoice: Invoice) => void
  onDelete: (id: string) => void
}

export function InvoiceList({ invoices, onEdit, onDelete }: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateTotal = (invoice: Invoice) => {
    const total = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    let discountAmount = 0

    if (invoice.discountType === "percentage") {
      discountAmount = total * (invoice.discount / 100)
    } else {
      discountAmount = invoice.discount
    }

    return total - discountAmount
  }

  const getPaymentStatus = (invoice: Invoice): "paid" | "partial" | "unpaid" => {
    const total = calculateTotal(invoice)

    if (invoice.paidAmount >= total) return "paid"
    if (invoice.paidAmount > 0) return "partial"
    return "unpaid"
  }

  const handleEdit = (invoice: Invoice) => {
    onEdit(invoice)
    toast({
      title: "Edit Invoice",
      description: `Editing invoice #${invoice.invoiceNumber}`,
    })
  }

  const handleDelete = (id: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to delete invoice #${invoiceNumber}?`)) {
      onDelete(id)
      toast({
        title: "Invoice Deleted",
        description: `Invoice #${invoiceNumber} has been deleted`,
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Invoice History</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No invoices found</p>
            {searchTerm && <p className="text-sm">Try a different search term</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const total = calculateTotal(invoice)
                  const due = total - invoice.paidAmount
                  const status = getPaymentStatus(invoice)

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>{invoice.client.address}</TableCell>
                      <TableCell className="text-right">Rs. {total.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">Rs. {invoice.paidAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">Rs. {due.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status === "paid"
                              ? "bg-green-100 text-green-800"
                              : status === "partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status === "paid" ? "Paid" : status === "partial" ? "Partially Paid" : "Unpaid"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(invoice.id || "", invoice.invoiceNumber)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              handleEdit(invoice)
                              setTimeout(() => {
                                window.print()
                              }, 500)
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
