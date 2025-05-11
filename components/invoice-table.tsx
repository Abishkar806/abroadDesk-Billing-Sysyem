"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InvoiceItem } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

interface InvoiceTableProps {
  items: InvoiceItem[]
  onUpdate: (items: InvoiceItem[]) => void
  errors?: Record<string, string>
}

export function InvoiceTable({ items, onUpdate, errors = {} }: InvoiceTableProps) {
  // Item presets
  const itemPresets = [
    { label: "Custom", value: "custom", amount: 0 },
    { label: "IELTS Class", value: "ielts", amount: 6000 },
    { label: "PTE Class", value: "pte", amount: 6000 },
    { label: "TOEFL Class", value: "toefl", amount: 5000 },
    { label: "Consultation", value: "consultation", amount: 1000 },
    { label: "Document Processing", value: "document", amount: 3000 },
  ]

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
      preset: "custom",
    }
    onUpdate([...items, newItem])
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    onUpdate(updatedItems)
  }

  const handleItemPresetChange = (id: string, presetValue: string) => {
    const preset = itemPresets.find((p) => p.value === presetValue)

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        if (preset && presetValue !== "custom") {
          return {
            ...item,
            preset: presetValue,
            description: preset.label,
            amount: preset.amount,
          }
        } else {
          return {
            ...item,
            preset: presetValue,
          }
        }
      }
      return item
    })

    onUpdate(updatedItems)
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const updatedItems = items.filter((item) => item.id !== id)
      onUpdate(updatedItems)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="font-semibold text-lg mb-4">Invoice Items</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Type</TableHead>
            <TableHead className="w-[45%]">Description</TableHead>
            <TableHead className="text-right">Amount (Rs)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>
                <Select
                  value={item.preset || "custom"}
                  onValueChange={(value) => handleItemPresetChange(item.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Item description"
                  className={errors[`items[${index}].description`] ? "border-red-500" : ""}
                />
                {errors[`items[${index}].description`] && (
                  <p className="text-red-500 text-sm">{errors[`items[${index}].description`]}</p>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={item.amount || ""}
                  onChange={(e) => updateItem(item.id, "amount", Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="text-right"
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} disabled={items.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button variant="outline" size="sm" onClick={addItem} className="mt-4 flex items-center gap-1">
        <Plus className="h-4 w-4" /> Add Item
      </Button>
    </div>
  )
}
