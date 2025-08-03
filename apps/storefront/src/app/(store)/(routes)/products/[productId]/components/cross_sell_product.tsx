import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
} from '@/components/ui/card'
import { Product } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

interface CrossSellProductsProps {
   products: Product[]
}

export function CrossSellProducts({ products }: CrossSellProductsProps) {
   function Price({ product }: { product: Product}) {
      if (product?.discount > 0) {
         const price = product?.price - product?.discount
         const percentage = (product?.discount / product?.price) * 100
         return (
            <div className="flex items-center gap-2">
               <Badge className="flex gap-4" variant="destructive">
                  <div className="line-through">${product?.price}</div>
                  <div>%{percentage.toFixed(2)}</div>
               </Badge>
               <h2 className="">${price.toFixed(2)}</h2>
            </div>
         )
      }

      return <h2>${product?.price}</h2>
   }

   return (
      <div className='flex gap-4'>
         {
            products.map((product) => (
               <Link key={product.id} className="" href={`/products/${product.id}`}>
                  <Card className="h-full rounded-lg">
                     <CardHeader className="p-0">
                        <div className="relative w-full h-60">
                        {
                           product?.images.length ? 
                              <Image
                                 className="rounded-t-lg"
                                 src={product?.images[0]}
                                 alt="product image"
                                 fill
                                 sizes="(min-width: 1000px) 30vw, 50vw"
                                 style={{ objectFit: 'cover' }}
                              /> :
                              <div className="flex items-center justify-center w-full h-full text-sm text-gray-400">
                                 No Image
                              </div>
                        }
                        </div>
                     </CardHeader>
                     <CardContent className="grid gap-1 p-4">
                        <h2 className="mt-2">{product.title}</h2>
                     </CardContent>
                     <CardFooter>
                        <Price product={product}/>
                     </CardFooter>
                  </Card>
               </Link>
            ))
         }
      </div>
   )
}