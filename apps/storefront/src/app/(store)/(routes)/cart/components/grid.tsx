'use client'

import { Card, CardContent } from '@/components/ui/card'
import { isVariableValid } from '@/lib/utils'
import { useCartContext } from '@/state/Cart'

import { Item } from './item'
import { Receipt } from './receipt'
import { Skeleton } from './skeleton'
import { Separator } from '@/components/ui/separator'
import { CrossSellProducts } from '../../products/[productId]/components/cross_sell_product'

export const CartGrid = () => {
   const { loading, cart, refreshCart, dispatchCart } = useCartContext()

   if (isVariableValid(cart?.items) && cart?.items?.length === 0) {
      return (
         <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
            <div className="md:col-span-2">
               <Card>
                  <CardContent className="p-4">
                     <p>Your Cart is empty...</p>
                  </CardContent>
               </Card>
            </div>
            <Receipt />
         </div>
      )
   }

   const crossSellProducts = () => {
      if (!isVariableValid(cart?.items) || cart?.items?.length === 0) return []

      const cartProductIds = new Set(cart?.items.map(item => item.product.id))
      // Flatten all cross-sell products
      const allCrossSellProducts = cart?.items?.flatMap(item => item.product.crossSellProducts)
      // Deduplicate by ID and exclude ones already in cart
      const uniqueCrossSellsMap = new Map()

      for (const product of allCrossSellProducts) {
         if (!cartProductIds.has(product.id) && !uniqueCrossSellsMap.has(product.id)) {
           uniqueCrossSellsMap.set(product.id, product)
         }
      }

      return Array.from(uniqueCrossSellsMap.values())
   }

   return (
      <>
         <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
            <div className="md:col-span-2">
               {isVariableValid(cart?.items)
                  ? cart?.items?.map((cartItem, index) => (
                     <Item cartItem={cartItem} key={index} />
                  ))
                  : [...Array(5)].map((cartItem, index) => (
                     <Skeleton key={index} />
                  ))}
            </div>
            <Receipt />
         </div>
         <Separator />
         <div>
            <h2 className="mb-4 text-xl font-bold tracking-tight">You might also like</h2>
            <CrossSellProducts products={crossSellProducts()}/>
         </div>
      </>
   )
}
