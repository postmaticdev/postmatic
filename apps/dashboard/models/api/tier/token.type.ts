export interface AvailableTokenRes {
  availableToken: number
  totalValidToken: number
  totalUsedToken: number
  percentageUsage: number
}


export interface AnalyticTypeTokenRes {
  type: string
  result: TokenUsage
}

export interface TokenUsage {
  availableToken: number
  totalValidToken: number
  totalUsedToken: number
  percentageUsage: number
}


export interface AnalyticTokenUsageRes {
  date: string,
  Image: number,
  Video: number,
  LiveStream: number
}

