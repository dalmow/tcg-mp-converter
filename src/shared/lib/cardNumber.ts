export function isCardNumberInRange(cardNumber: number, total: number): boolean {
  return Number.isInteger(cardNumber) && cardNumber >= 1 && cardNumber <= total
}

export function cardNumberOutOfRangeReason(cardNumber: number, collection: string, total: number): string {
  return `Número ${cardNumber} fora do total da coleção ${collection} (${total})`
}
