export interface StatusSubscribtionRes {
  valid: boolean
  expiredAt: string|null
  subscription: Subscription|null
}

export interface Subscription {
  productName: string
  productType: string
  subscriptionValidFor: number
}
