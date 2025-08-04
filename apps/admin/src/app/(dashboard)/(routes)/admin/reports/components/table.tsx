'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, EditIcon, LinkIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProductsTableProps {
   data: ProductColumn[]
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ data }) => {
   return <DataTable searchKey="title" columns={columns} data={data} />
}

export type ProductColumn = {
   id: string
   title: string
   price: string
   category: string
   brand: string
   sales: number
   isAvailable: boolean
}

export const columns: ColumnDef<ProductColumn>[] = [
   {
      accessorKey: 'title',
      header: 'Product',
   },
   {
      accessorKey: 'price',
      header: 'Price',
   },
   {
      accessorKey: 'category',
      header: 'Category',
   },
   {
      accessorKey: 'brand',
      header: 'Brand',
   },
   {
      accessorKey: 'sales',
      header: 'Total Sold',
   },
   {
     accessorKey: 'isAvailable',
     header: 'Availability',
     cell: (props) => (props.cell.getValue() ? <CheckIcon /> : <XIcon />),
   }
]