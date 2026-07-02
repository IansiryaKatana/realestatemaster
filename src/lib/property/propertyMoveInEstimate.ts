import type { Product } from '@/data/static-cms'
import { isPropertyListing } from '@/lib/property/formatProperty'

export type PropertyMoveInLine = {
  label: string
  amount: number
  note?: string
}

export type PropertyMoveInEstimate = {
  listingType: 'rent' | 'sale'
  chequeCount: number | null
  installmentAmount: number | null
  securityDeposit: number
  bookingDeposit: number | null
  agencyCommission: number
  adminFee: number
  ejariFee: number
  otherCharges: number
  moveInTotal: number
  lines: PropertyMoveInLine[]
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function resolveCommission(product: Product) {
  if (product.agentCommissionType === 'percent' && product.agentCommissionValue != null) {
    return roundMoney((product.price * product.agentCommissionValue) / 100)
  }
  if (product.agentCommissionValue != null) {
    return product.agentCommissionValue
  }
  return 0
}

export function buildPropertyMoveInEstimate(
  product: Product,
  agencyServiceCharge = 500,
): PropertyMoveInEstimate | null {
  if (!isPropertyListing(product) || !product.listingType) return null

  const commission = resolveCommission(product)
  const otherCharges = product.otherCharges ?? 0

  if (product.listingType === 'rent') {
    const chequeCount = product.rentPaymentCheques ?? 12
    const installmentAmount = roundMoney(product.price / chequeCount)
    const securityDeposit = product.securityDeposit ?? installmentAmount
    const ejariFee = 220
    const adminFee = agencyServiceCharge
    const moveInTotal = roundMoney(
      installmentAmount + securityDeposit + commission + adminFee + ejariFee + otherCharges,
    )

    const chequeLabel =
      chequeCount === 1
        ? '1 cheque (annual)'
        : chequeCount === 12
          ? '12 cheques (monthly)'
          : `${chequeCount} cheques`

    const lines: PropertyMoveInLine[] = [
      { label: 'Annual rent', amount: product.price },
      { label: 'Payment plan', amount: chequeCount, note: chequeLabel },
      { label: 'Per cheque / installment', amount: installmentAmount },
      { label: 'Security deposit', amount: securityDeposit },
      { label: 'Agency commission', amount: commission },
      { label: 'Admin fee', amount: adminFee },
      { label: 'Ejari registration', amount: ejariFee },
    ]

    if (otherCharges > 0) {
      lines.push({ label: 'Other charges', amount: otherCharges })
    }

    lines.push({ label: 'Estimated move-in total', amount: moveInTotal, note: '1st cheque + deposit + fees' })

    return {
      listingType: 'rent',
      chequeCount,
      installmentAmount,
      securityDeposit,
      bookingDeposit: null,
      agencyCommission: commission,
      adminFee,
      ejariFee,
      otherCharges,
      moveInTotal,
      lines,
    }
  }

  const bookingDeposit = product.securityDeposit ?? roundMoney(product.price * 0.1)
  const moveInTotal = roundMoney(bookingDeposit + commission + otherCharges)

  const lines: PropertyMoveInLine[] = [
    { label: 'Sale price', amount: product.price },
    { label: 'Booking deposit', amount: bookingDeposit },
    { label: 'Agency commission', amount: commission },
  ]

  if (otherCharges > 0) {
    lines.push({ label: 'Other charges', amount: otherCharges })
  }

  lines.push({
    label: 'Estimated upfront total',
    amount: moveInTotal,
    note: 'Deposit + fees (balance on transfer)',
  })

  return {
    listingType: 'sale',
    chequeCount: null,
    installmentAmount: null,
    securityDeposit: bookingDeposit,
    bookingDeposit,
    agencyCommission: commission,
    adminFee: 0,
    ejariFee: 0,
    otherCharges,
    moveInTotal,
    lines,
  }
}
