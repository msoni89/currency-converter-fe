import * as React from 'react';
// tslint:disable-next-line:no-duplicate-imports
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Chart from 'react-apexcharts'
import { Alert, Button, Form, Nav } from 'react-bootstrap';
import { Formik } from 'formik';
import { getCurrency, getDashboardData, getRealTimeCurrencyRate, triggerEvent } from './requests/CurrencyRequest';
import { Frequency, ICurrencyDto, ICurrencyRealtimeExRate } from './type';

export const Main = () => {

    const [isLoading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [selectToCurrency, setSelectedToCurrency] = useState<ICurrencyDto>();
    const [selectFromCurrency, setSelectedFromCurrency] = useState<ICurrencyDto>();
    const [selectFromAmount, setSelectedFromAmount] = useState<number>(0.0);
    const [selectToAmount, setSelectedToAmount] = useState<number>(0.0);
    const [currencies, setCurrencies] = useState<ICurrencyDto[]>([]);
    const [realTimeCurrencyExRate, setRealTimeCurrencyExRate] = useState<ICurrencyRealtimeExRate>();
    const [dataResponse, setDataResponse] = useState({
        series: [{
            data:undefined
        }],
        options: {

            chart: {
                toolbar: {
                    show: false
                },
                type: 'candlestick'
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    useEffect(() => {
        setLoading(true)
        getCurrency()
            .then((currencies) => {
                setCurrencies(currencies);
                setSelectedFromCurrency(currencies && currencies[0] && currencies[0]);
                setSelectedToCurrency(currencies && currencies[currencies.length - 1] && currencies[currencies.length - 1]);
                setLoading(false)
            }).catch(console.error);
    }, [])

    useEffect(() => {
        if (selectFromCurrency && selectToCurrency) {
            getRealTimeCurrencyRate(selectFromCurrency.currencyCode, selectToCurrency.currencyCode)
                .then(exRate => {
                    setRealTimeCurrencyExRate(exRate)
                    exRate &&  exRate.exchangeRate ?
                        setSelectedToAmount(selectFromAmount *  exRate.exchangeRate) :
                        setSelectedToAmount(0.0)
                })
                .catch(console.error);
        }
    }, [selectFromCurrency, selectToCurrency]);

    const updateDashboard = (frequency: string) => {
        getDashboardData(frequency, selectFromCurrency.currencyCode, selectToCurrency.currencyCode)
            // tslint:disable-next-line:block-spacing
            .then((response) => {
                setDataResponse({
                    series: [{
                        data: response
                    }],
                    options: {

                        chart: {
                            toolbar: {
                                show: false
                            },
                            type: 'candlestick'
                        },
                        xaxis: {
                            type: 'datetime'
                        },
                        yaxis: {
                            tooltip: {
                                enabled: true
                            }
                        }
                    }
                });

            })
            .catch(console.log);
    }

    useEffect(() => {
        if (realTimeCurrencyExRate) {
           getDashboardData(Frequency.DAILY.toString(), selectFromCurrency.currencyCode, selectToCurrency.currencyCode)
                // tslint:disable-next-line:block-spacing
                .then((response) => {
                    setDataResponse({
                        series: [{
                            data: response
                        }],
                        options: {

                            chart: {
                                toolbar: {
                                    show: false
                                },
                                type: 'candlestick'
                            },
                            xaxis: {
                                type: 'datetime'
                            },
                            yaxis: {
                                tooltip: {
                                    enabled: true
                                }
                            }
                        }
                    });

                })
                .catch(console.log)
        }
    }, [realTimeCurrencyExRate]);

    useEffect(() => {
        if (realTimeCurrencyExRate) {
            setSelectedToAmount(selectFromAmount *  realTimeCurrencyExRate.exchangeRate)
        }
    }, [selectFromAmount]);

    return (isLoading ? <div>Loading...</div> : <div>
            <Header>
                <H5>Currency Converter</H5>
                <SuccessMessage>
                    <Alert show={show} variant="success">
                        <Alert.Heading>Success</Alert.Heading>
                        <p>
                            Event successfully published
                        </p>
                        <hr />
                        <Button onClick={() => setShow(false)} variant="outline-success">
                            Close me, please!
                        </Button>
                    </Alert>
                </SuccessMessage>
            </Header>
            <Body>
                <CurrencyRate>
                    {realTimeCurrencyExRate && realTimeCurrencyExRate.fromCurrencyName ? <div> <From_Currency><span>1 {' '} </span>
                            <Currency_Code>{realTimeCurrencyExRate.fromCurrencyName}</Currency_Code> equals</From_Currency>
                        <To_Currency><span>{realTimeCurrencyExRate.exchangeRate}</span>
                            <Currency_Code>{realTimeCurrencyExRate.toCurrencyName}</Currency_Code></To_Currency>
                        <FetchedTime><span>{realTimeCurrencyExRate.lastRefreshed} {realTimeCurrencyExRate.timeZone}</span></FetchedTime>
                    </div> : <div/>}
                    <Formik
                        validate={(values) => {
                            currencies && setSelectedFromCurrency(currencies.find(value => value.currencyName === values.from_currency_name))
                            currencies && setSelectedToCurrency(currencies.find(value => value.currencyName === values.to_currency_name))
                            setSelectedFromAmount(values.from_currency_value)
                        }}
                        initialValues={{
                            from_currency_name: selectFromCurrency && selectFromCurrency.currencyName,
                            to_currency_name: selectToCurrency && selectToCurrency.currencyName,
                            from_currency_value: selectFromAmount
                        }}

                        onSubmit={(values, actions) => {
                            console.debug(values)
                            actions.setSubmitting(false);
                        }}
                    >
                        {props => (
                            <form><Table>
                                <tr>
                                    <td>
                                        <Form.Control onChange={props.handleChange}
                                                      onBlur={props.handleBlur}
                                                      value={props.values.from_currency_value
                                                      }
                                                      name="from_currency_value" min="1.0" step="0.01" type="number">
                                        </Form.Control>
                                    </td>
                                    <td style={{ width: '8px' }}/>
                                    <td>
                                        <Form.Control onChange={props.handleChange}
                                                      value={props.values.from_currency_name}
                                                      name="from_currency_name" as="select">
                                            {currencies && currencies
                                                .filter(value => value.currencyName !== props.values.to_currency_name)
                                                .map((item, key) =>
                                                    <Currency_code_Option
                                                        key={key}>{item.currencyName}</Currency_code_Option>
                                                )}
                                        </Form.Control>
                                    </td>

                                </tr>
                                <tr style={{ height: '8px' }}/>
                                <tr>
                                    <td>
                                        <Form.Control disabled={true
                                        } onChange={props.handleChange}
                                                      value={selectToAmount}
                                                      name="to_currency_value" min="0" type="number">
                                        </Form.Control>
                                    </td>
                                    <td style={{ width: '8px' }}/>
                                    <td>
                                        <Form.Control onChange={props.handleChange}
                                                      value={props.values.to_currency_name}
                                                      name="to_currency_name" as="select">
                                            {currencies && currencies.reverse()
                                                .filter(value => value.currencyName !== props.values.from_currency_name)
                                                .map((item, key) =>
                                                    <Currency_code_Option
                                                        key={key}>{item.currencyName}</Currency_code_Option>
                                                )}
                                        </Form.Control>
                                    </td>
                                </tr>
                            </Table>
                            </form>)}
                    </Formik>
                    <RefLink href="https://www.alphavantage.co/documentation/"
                             className="__web-inspector-hide-shortcut__"><span>Data provided by Alpha Vantage</span></RefLink>
                </CurrencyRate>
                {dataResponse ? <Dashboard>
                    <Nav
                        defaultActiveKey={Frequency.DAILY}  onSelect={(selectedKey: string) => updateDashboard(selectedKey)}
                            >
                            <Nav.Item>
                            <Nav.Link eventKey={Frequency.DAILY}>Daily</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey={Frequency.WEEKLY}>Weekly</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey={Frequency.MONTHLY}>Monthly</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Chart options={dataResponse.options} series={dataResponse.series} type="candlestick" width={450} height={200}/>
                </Dashboard> : <div/>}
            </Body>
            <div>
                <Formik
                    initialValues={{
                        from_currency_code: currencies && currencies[0] && currencies[0].currencyCode,
                        to_currency_code: currencies && currencies[currencies.length - 1] && currencies[currencies.length - 1].currencyCode,
                    }}

                    onSubmit={(values, actions) => {
                        triggerEvent(values.from_currency_code, values.to_currency_code)
                            .then(() => {
                                setShow(true);
                            })
                            .catch(console.error)
                        actions.setSubmitting(false);
                    }}
                >
                    {props => (
                        <form onSubmit={props.handleSubmit}><Table>
                            <thead><h4>Trigger Event</h4></thead>
                            <tr>
                                <td>
                                    <Form.Control onChange={props.handleChange}
                                                  value={props.values.from_currency_code}
                                                  name="from_currency_code" as="select">
                                        {currencies && currencies
                                            .filter(value => value.currencyCode !== props.values.to_currency_code)
                                            .map((item, key) =>
                                                <Currency_code_Option
                                                    key={key}>{item.currencyCode}</Currency_code_Option>
                                            )}
                                    </Form.Control>
                                </td>
                            </tr>
                            <tr style={{ height: '8px' }}/>
                            <tr>
                                <td>
                                    <Form.Control onChange={props.handleChange}
                                                  value={props.values.to_currency_code}
                                                  name="to_currency_code" as="select">
                                        {currencies && currencies.reverse()
                                            .filter(value => value.currencyCode !== props.values.from_currency_code)
                                            .map((item, key) =>
                                                <Currency_code_Option
                                                    key={key}>{item.currencyCode}</Currency_code_Option>
                                            )}
                                    </Form.Control>
                                </td>
                            </tr>
                            <tr style={{ height: '8px' }}/>
                            <tr>
                                <td>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </td>
                            </tr>
                        </Table>
                        </form>)}
                </Formik>
            </div>
        </div>
    );
}

const Currency_code_Option = styled.option
    `
    font-weight: normal;
    display: block;
    white-space: pre;
    min-height: 1.2em;
    padding: 0px 2px 1px;
`

const Table = styled.table
    `
border-spacing: 0;
    table-layout: fixed;
`
const Header = styled.div`
margin: 0 1em;
padding: 1em 1em;
`
const FetchedTime = styled.div`
    color: #70757A;
    margin-top: 8px;
    margin-bottom: 16px;
    font-size: 12px;
    font-family: Roboto,HelveticaNeue,Arial,sans-serif;

`
const To_Currency = styled.div`
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 24px;
    font-weight: normal;
`

const Currency_Code = styled.span`
margin: 0.25em;
`
const From_Currency = styled.div`
color: #70757A;
font-family: Roboto,HelveticaNeue,Arial,sans-serif;
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 20px ;
    font-weight: normal;
`
const RefLink = styled.a`
color: #70757A;
text-decoration: none;
display: block;
    font-size: 12px;
    margin-top: 15px;
`
const CurrencyRate = styled.div`
float:left;
`
const Dashboard = styled.div`
float:left;
    padding-left: 16px;
    width:50%;
`

const Body = styled.div`
margin: 0em 4em;
padding: 1em 1em;
float:left;
background-color: #fff;
position: relative;
border-radius: 8px;
border: 1px solid #dfe1e5;
box-shadow: none;
font-size: 14px;
`

const H5 = styled.h5`
 margin: 0 1em;
  padding: 1em 1em;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.0975);
  width: 90%;
  display: flex;
  align-items: center;
`
const SuccessMessage = styled.div`
width:50%;
margin: 1em 1em;
`
