import { ICurrencyDto, ICurrencyRealtimeExRate, IDashboardData, IEventResponse, ITimeSeries } from '../type';

const formatCurrency = (currency: ICurrencyDto): ICurrencyDto => {
    return {
        currencySymbol: currency.currencySymbol,
        currencyCode: currency.currencyCode,
        currencyName: currency.currencyName
    };
}

const formatEvent = (response: IEventResponse): IEventResponse => {
    return { message: response.message, statusCode: response.statusCode }
}

const formatRealTimeCurrency = (realTimeExRate: ICurrencyRealtimeExRate): ICurrencyRealtimeExRate => {
    return {
        askPrice: realTimeExRate.askPrice,
        bidPrice: realTimeExRate.bidPrice,
        exchangeRate: realTimeExRate.exchangeRate,
        fetchedTime: realTimeExRate.fetchedTime,
        fromCurrencyName: realTimeExRate.fromCurrencyName,
        lastRefreshed: realTimeExRate.lastRefreshed,
        timeZone: realTimeExRate.timeZone,
        toCurrencyCode: realTimeExRate.toCurrencyCode,
        toCurrencyName: realTimeExRate.toCurrencyName,
        fromCurrencyCode: realTimeExRate.fromCurrencyCode,
    };
}
const formatDashboardData = (timeSeries: ITimeSeries) => {
    // [[Timestamp], [O, H, L, C]]
    return {
        x: timeSeries.dateTime,
        y: [timeSeries.open, timeSeries.high, timeSeries.low, timeSeries.close]
    }
}

export const getRealTimeCurrencyRate = (fromCurrencyCode: string, toCurrencyCode: string): Promise<ICurrencyRealtimeExRate> => {
    return fetch(`/v1/cc/from/${fromCurrencyCode}/to/${toCurrencyCode}`)
        .then(res => res.json())
        .then(res => formatRealTimeCurrency(res));
};

export const getCurrency = (): Promise<ICurrencyDto[]> => {
    return fetch('/v1/cc/')
        .then(res => res.json())
        .then(res => res.map((currencyDto: ICurrencyDto) => formatCurrency(currencyDto)));
};

export const triggerEvent = (from: string, to: string): Promise<IEventResponse> => {
    return fetch(`/v1/trigger/from/${from}/to/${to}`)
        .then(res => res.json())
        .then(res => formatEvent(res));
};

export const getDashboardData = (frequency: string, from: string, to: string) => {
    return fetch(`/v1/cc/dashboard/from/${from}/to/${to}/frequency/${frequency}`)
        .then(res => res.json())
        .then(res => res as IDashboardData)
        .then(dashboardData => dashboardData.timeSeries)
        .then(timeSeries => timeSeries.map((data: ITimeSeries) => formatDashboardData(data)));
}
