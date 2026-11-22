"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Ellipsis,
  Download,
  Search,
  Mail,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Send,
} from "lucide-react"
import { cn } from "cn"

export interface TableColumn<T> {
  id: string
  header: string
  sortable?: boolean
  className?: string
  cell: (item: T) => React.ReactNode
}

export interface DataTable2Props<T> {
  data: T[]
  columns: TableColumn<T>[]
  getId: (item: T) => string | number
  searchPlaceholder?: string
  searchKey?: (item: T) => string
  pageSize?: number
  showCheckbox?: boolean
  showSNo?: boolean
  bulkActions?: {
    onDownload?: (selectedItems: T[]) => void
    onSendReminder?: (selectedItems: T[]) => void
    onMarkPaid?: (selectedItems: T[]) => void
    onDelete?: (selectedItems: T[]) => void
  }
  filterSlot?: React.ReactNode
  emptyMessage?: string
  className?: string
}

export function DataTable2<T>({
  data,
  columns,
  getId,
  searchPlaceholder = "Search records...",
  searchKey,
  pageSize = 7,
  showCheckbox = true,
  showSNo = true,
  bulkActions,
  filterSlot,
  emptyMessage = "No records found.",
  className,
}: DataTable2Props<T>) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [selectedIds, setSelectedIds] = React.useState<Record<string, boolean>>({})
  const [currentPage, setCurrentPage] = React.useState(0)

  // Filter
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data
    const lower = searchTerm.toLowerCase()
    return data.filter((item) => {
      if (searchKey) {
        return searchKey(item).toLowerCase().includes(lower)
      }
      return Object.values(item as any).some((val) =>
        String(val ?? "").toLowerCase().includes(lower)
      )
    })
  }, [data, searchTerm, searchKey])

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortColumn]
      const valB = b[sortColumn]
      if (valA === valB) return 0
      if (valA == null) return 1
      if (valB == null) return -1
      const res = valA > valB ? 1 : -1
      return sortDirection === "asc" ? res : -res
    })
  }, [filteredData, sortColumn, sortDirection])

  // Pagination
  const totalCount = sortedData.length
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const paginatedData = React.useMemo(() => {
    const start = currentPage * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  // Selection
  const allPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds[String(getId(item))])
  const somePageSelected =
    paginatedData.some((item) => selectedIds[String(getId(item))]) &&
    !allPageSelected
  const selectedCount = Object.values(selectedIds).filter(Boolean).length

  const handleToggleSelectAll = (checked: boolean) => {
    const newSelected = { ...selectedIds }
    paginatedData.forEach((item) => {
      newSelected[String(getId(item))] = checked
    })
    setSelectedIds(newSelected)
  }

  const handleToggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleClearSelection = () => {
    setSelectedIds({})
  }

  const getSelectedItems = () => {
    return data.filter((item) => selectedIds[String(getId(item))])
  }

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  return (
    <div className={cn("w-full flex-1 flex flex-col space-y-3.5", className)}>
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex flex-1 items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 text-xs h-9 bg-card"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {filterSlot}
          <p className="text-xs text-muted-foreground shrink-0 font-medium">
            <span className="font-semibold text-foreground">{totalCount}</span>{" "}
            {totalCount === 1 ? "Result" : "Results"}
          </p>
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5 animate-in fade-in duration-200 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {selectedCount} Selected
            </span>
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-foreground text-xs h-6 px-2"
              onClick={handleClearSelection}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions?.onDownload && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => bulkActions.onDownload?.(getSelectedItems())}
              >
                <Download className="size-3.5" aria-hidden="true" />
                <span>Export PDF</span>
              </Button>
            )}
            {bulkActions?.onSendReminder && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => bulkActions.onSendReminder?.(getSelectedItems())}
              >
                <Send className="size-3.5" aria-hidden="true" />
                <span>WhatsApp Notice</span>
              </Button>
            )}
            {bulkActions?.onMarkPaid && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => bulkActions.onMarkPaid?.(getSelectedItems())}
              >
                <Check className="size-3.5" aria-hidden="true" />
                <span>Mark Paid</span>
              </Button>
            )}
            {bulkActions?.onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 text-rose-600 hover:text-rose-700"
                onClick={() => bulkActions.onDelete?.(getSelectedItems())}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>Delete</span>
              </Button>
            )}
            {!bulkActions && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => {
                  const items = getSelectedItems()
                  navigator.clipboard.writeText(JSON.stringify(items, null, 2))
                  alert(`Copied ${items.length} records to clipboard!`)
                }}
              >
                <Download className="size-3.5" aria-hidden="true" />
                <span>Export Selected</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table Container in @7ovr/table-2 Card Style with Full Width & Height */}
      <div className="w-full flex-1 flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-xs min-h-[420px]">
        <div className="w-full flex-1 overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                {showCheckbox && (
                  <TableHead className="w-12 text-center pl-4 pr-2 h-10">
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      onCheckedChange={(checked) => handleToggleSelectAll(checked === true)}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                {showSNo && (
                  <TableHead className="w-16 text-center px-2 h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    S.No
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead key={col.id} className={cn("h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3", col.className)}>
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                      >
                        <span>{col.header}</span>
                        {sortColumn === col.id ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="size-3.5 text-foreground" />
                          ) : (
                            <ArrowDown className="size-3.5 text-foreground" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 text-muted-foreground/60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length + (showCheckbox ? 1 : 0) + (showSNo ? 1 : 0)}
                    className="h-36 text-center text-xs text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const id = String(getId(item))
                  const isSelected = !!selectedIds[id]
                  const serialNumber = currentPage * pageSize + index + 1
                  return (
                    <TableRow
                      key={id}
                      data-state={isSelected ? "selected" : undefined}
                      className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/30 data-[state=selected]:bg-muted/50 text-xs"
                    >
                      {showCheckbox && (
                        <TableCell className="w-12 text-center pl-4 pr-2 py-3.5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleToggleSelectOne(id, checked === true)
                            }
                            aria-label={`Select row ${id}`}
                          />
                        </TableCell>
                      )}
                      {showSNo && (
                        <TableCell className="w-16 text-center px-2 py-3.5 font-mono text-xs font-semibold text-muted-foreground/90 tabular-nums">
                          {serialNumber}
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell key={col.id} className={cn("py-3.5 px-3", col.className)}>
                          {col.cell(item)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with Pagination */}
        <div className="w-full flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-3 mt-auto">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {totalCount} {totalCount === 1 ? "record" : "records"}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
            </Button>
            <span className="px-1.5 text-xs text-muted-foreground tabular-nums">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
