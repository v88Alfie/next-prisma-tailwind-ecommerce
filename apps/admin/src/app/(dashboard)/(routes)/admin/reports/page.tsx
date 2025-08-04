import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { formatter } from '@/lib/utils'
import { ProductsTable } from './components/table'
import { ProductColumn } from './components/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderChart } from './components/chart'
import { format } from 'date-fns'
import { BrandCombobox, CategoriesCombobox, DateRangePicker } from './components/options'

export default async function ReportsPage({ searchParams}) {
   const brands = await prisma.brand.findMany()
   const categories = await prisma.category.findMany()

   const { startDate, endDate, brand, category } = searchParams ?? null

   const selectedCategories = category ? 
      category
         .split(',')
         .map((cat) => cat.trim())
         .filter(Boolean) 
      : 
      undefined

      const orders = await prisma.order.findMany({
         where: {
           createdAt: {
             gte: startDate,
             lte: endDate,
           },
           orderItems: {
               some: {
                  product: {
                  brand: {
                     title: {
                        contains: brand,
                        mode: 'insensitive',
                     },
                  },
                  categories: selectedCategories
                     ? {
                        some: {
                           title: {
                              in: selectedCategories,
                              mode: 'insensitive',
                           },
                        },
                        }
                     : undefined,
                  },
               },
           },
         },
         orderBy: {
           createdAt: 'asc',
         },
      })

   const summaryMap = new Map()

   orders.forEach(order => {
      const dateKey = format(order.createdAt, 'MMM d, yy')
      const count = summaryMap.get(dateKey) ?? 0
      summaryMap.set(dateKey, count + 1)
   })

   const summary = Array.from(summaryMap.entries()).map(([date, count]) => ({
      date,
      orderCount: count,
   }))

   /* Get all orderItems within the date range */
   const orderItemsInRange = await prisma.orderItem.findMany({
      where: {
        order: {
            createdAt: {
               gte: startDate,
               lte: endDate,
            },
        },
      },
      select: {
         productId: true,
      },
   });

   /* Count product */
   const productCountMap:Record<string, number> = orderItemsInRange.reduce((map, item) => {
      map[item.productId] = (map[item.productId] || 0) + 1;

      return map;
   }, {});

   /* Filter product IDs with Count */
   const productIds = Object.entries(productCountMap)
      .filter(([_, count]) => count > 0)
      .map(([productId]) => productId);

   const products = await prisma.product.findMany({
      where: {
         id: {
            in: productIds,
         },
         categories: selectedCategories
            ? {
               some: {
                  title: {
                     in: selectedCategories,
                     mode: 'insensitive',
                  },
               },
            }
            : undefined,
         brand: {
            title: {
               contains: brand,
               mode: 'insensitive',
            },
         },
         orders: {
            some: {}
         },
       },
      include: {
         _count: {
            select: { orders: true },
         },
         categories: true,
         brand: true,
      },
      orderBy: {
         orders: {
            _count: 'desc',
         },
      },
   })
    
   const formattedProducts: ProductColumn[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      price: formatter.format(product.price),
      category: product.categories[0]?.title ?? 'Uncategorized',
      sales: product._count.orders,
      brand: product.brand.title,
      isAvailable: product.isAvailable,
   }))

   return (
      <div className="block my-6 space-y-4">
         <Heading
            title={`Reports`}
            description="Manage orders for your store"
      />
         <Separator />
         <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-3 lg:grid-cols-4">
            <DateRangePicker initialStartDate={startDate} initialEndDate={endDate}/>
            <CategoriesCombobox
               initialCategory={category}
               categories={categories}
            />
            <BrandCombobox initialBrand={brand} brands={brands} />
         </div>
         <Separator />
         <Card className="p-2">
            <CardHeader>
               <CardTitle>ORDERS</CardTitle>
            </CardHeader>
            <CardContent>
               <OrderChart data={summary}/>
            </CardContent>
         </Card>
         <Card className="p-2">
            <CardHeader>
               <CardTitle>TOP SELLING PRODUCTS</CardTitle>
            </CardHeader>
            <CardContent>
               <ProductsTable data={formattedProducts} />
            </CardContent>
         </Card>
      </div>
   )
}
