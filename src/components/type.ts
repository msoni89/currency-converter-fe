export type ICurrencyDto = {
    currencyCode: string
    currencyName: string
    currencySymbol: string
}

export type ITimeSeries = {
    open: number,
    high: number,
    low: number,
    close: number,
    dateTime: Date
}

export type IDashboardFormattedData = {
    x: Date,
    y: number[]
}

export enum Frequency {
    DAILY= 'DAILY', WEEKLY= 'WEEKLY', MONTHLY= 'MONTHLY'
}
export type IDashboardData = {
    timeSeries: ITimeSeries[]
}

export type ICurrencyRealtimeExRate = {
    fromCurrencyCode: string
    fromCurrencyName: string
    toCurrencyCode: string
    toCurrencyName: string
    exchangeRate: number
    lastRefreshed: Date
    fetchedTime: Date
    timeZone: string
    bidPrice: number
    askPrice: number
}

export type IEventResponse = {
    message: string
    statusCode: string
}
