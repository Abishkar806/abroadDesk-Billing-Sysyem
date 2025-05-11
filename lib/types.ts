export interface ClientInfo {
  name: string
  address: string
  email?: string
  phone?: string
}

export interface InvoiceItem {
  id: string
  description: string
  amount: number
  preset?: string
  [key: string]: any
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  panNumber: string
  client: ClientInfo
  items: InvoiceItem[]
  discount: number
  discountType: "percentage" | "fixed"
  paidAmount: number
  confirmationName: string
  confirmationDate: string
  createdAt: string
  [key: string]: any
}
