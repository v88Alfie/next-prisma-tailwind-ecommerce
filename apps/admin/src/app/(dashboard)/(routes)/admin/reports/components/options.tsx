'use client'

import { Button } from '@/components/ui/button'
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command'
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover'
import { cn, isVariableValid } from '@/lib/utils'
import { slugify } from '@persepolis/slugify'
import { Check, ChevronsUpDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'

export function DateRangePicker({ initialStartDate, initialEndDate}) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [date, setDate] = useState<DateRange>({
      from: initialStartDate ? new Date(initialStartDate) : undefined,
      to: initialEndDate ? new Date(initialEndDate) : undefined,
    })

   useEffect(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
  
      if (date?.from) current.set('startDate', date.from.toISOString())
      else current.delete('startDate')
  
      if (date?.to) current.set('endDate', date.to.toISOString())
      else current.delete('endDate')
  
      const search = current.toString()
      const query = search ? `?${search}` : ''
  
      router.replace(`${pathname}${query}`, {
        scroll: false,
      })
    }, [date])
 
   return (
      <Popover>
         <PopoverTrigger asChild>
            <Button variant="outline">
               {date?.from ? (
                  date.to ? (
                     <>
                        {format(date?.from, "LLL dd, y")} - {format(date?.to, "LLL dd, y")}
                     </>
                  ) : (
                     format(date?.from, "LLL dd, y")
                  )
               ) : (
                  <span>Pick a date</span>
               )}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" align="start">
            <Calendar
               autoFocus
               mode="range"
               defaultMonth={date?.from}
               selected={date}
               onSelect={setDate}
               numberOfMonths={2}
            />
         </PopoverContent>
     </Popover>
   )
}

export function CategoriesCombobox({ categories, initialCategory }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [open, setOpen] = React.useState(false)
   const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

   function getSelectedCategoryTitle() {
      const selected = categories.filter((category) =>
         selectedCategories.includes(slugify(category.title))
      );
    
      const categoryTitles = selected.map((category) => category.title);
    
      if (categoryTitles.length > 2) {
         const [first, second, ...rest] = categoryTitles;

         return `${first}, ${second}, +${rest.length} other${rest.length > 1 ? 's' : ''}`;
      }
    
      return categoryTitles.join(', ');
   }

   useEffect(() => {
      if (!initialCategory) return
      const initial = initialCategory.split(',').map((slug) => slug.trim())

      setSelectedCategories(initial)
   }, [initialCategory])

   function toggleCategorySelection(slug: string) {
      let updatedSelections = [...selectedCategories]
      if (selectedCategories.includes(slug)) {
         updatedSelections = updatedSelections.filter((s) => s !== slug)
      } else {
         updatedSelections.push(slug)
      }

      setSelectedCategories(updatedSelections)

      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (updatedSelections.length === 0) {
         current.delete('category')
      } else {
         current.set('category', updatedSelections.join(','))
      }

      const search = current.toString()
      const query = search ? `?${search}` : ''
      router.replace(`${pathname}${query}`, { scroll: false })
   }

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="justify-between w-full"
            >
               {selectedCategories.length > 0
                  ? getSelectedCategoryTitle()
                  : 'Select categories...'}
               <ChevronsUpDown className="h-4 ml-2 opacity-50 shrink-0" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command>
               <CommandInput placeholder="Search categories..." />
               <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                     {categories.map((category) => {
                        const slug = slugify(category.title)
                        const isSelected = selectedCategories.includes(slug)

                        return (
                           <CommandItem
                              key={category.title}
                              onSelect={() => {
                                 toggleCategorySelection(slug)
                              }}
                           >
                              <Check
                                 className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                 )}
                              />
                              {category.title}
                           </CommandItem>
                        )
                     })}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   )
}

export function BrandCombobox({ brands, initialBrand }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const [open, setOpen] = React.useState(false)
   const [value, setValue] = React.useState('')

   function getBrandTitle() {
      for (const brand of brands) {
         if (slugify(brand.title) === slugify(value)) return brand.title
      }
   }

   useEffect(() => {
      setValue(initialBrand)
   }, [initialBrand])

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="justify-between w-full"
            >
               {value ? getBrandTitle() : 'Select brand...'}
               <ChevronsUpDown className="h-4 ml-2 opacity-50 shrink-0" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command>
               <CommandInput placeholder="Search brand..." />
               <CommandList>
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandGroup>
                     {brands.map((brand) => (
                        <CommandItem
                           key={brand.title}
                           onSelect={(currentValue) => {
                              const current = new URLSearchParams(
                                 Array.from(searchParams.entries())
                              )

                              if (currentValue === value) {
                                 current.delete('brand')
                                 setValue('')
                              } else {
                                 current.set('brand', currentValue)
                                 setValue(currentValue)
                              }

                              // cast to string
                              const search = current.toString()
                              // or const query = `${'?'.repeat(search.length && 1)}${search}`;
                              const query = search ? `?${search}` : ''

                              router.replace(`${pathname}${query}`, {
                                 scroll: false,
                              })

                              setOpen(false)
                           }}
                        >
                           <Check
                              className={cn(
                                 'mr-2 h-4',
                                 value === brand.title
                                    ? 'opacity-100'
                                    : 'opacity-0'
                              )}
                           />
                           {brand.title}
                        </CommandItem>
                     ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   )
}
