import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface ExchangeRates {
  [currency: string]: number;
}

@Injectable()
export class CurrencyService {
  private readonly EXCHANGE_API_URL =
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

  private readonly SUPPORTED_CURRENCIES = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  async fetchExchangeRates(): Promise<ExchangeRates> {
    try {
      const response = await axios.get(this.EXCHANGE_API_URL, {
        timeout: 10000,
      });

      const rates: ExchangeRates = {};
      const usdRates = response.data.usd;

      for (const currency of this.SUPPORTED_CURRENCIES) {
        const key = currency.toLowerCase();
        if (usdRates[key]) {
          rates[currency] = usdRates[key];
        }
      }

      if (Object.keys(rates).length === 0) {
        throw new Error('No exchange rates found in API response');
      }

      return rates;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getSupportedCurrencies(): string[] {
    return this.SUPPORTED_CURRENCIES;
  }

  convertPrice(price: number, rate: number): number {
    return Math.round(price * rate * 100) / 100;
  }
}
