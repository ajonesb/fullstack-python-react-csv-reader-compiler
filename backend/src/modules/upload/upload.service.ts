import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Readable, Transform } from 'stream';
import csvParser from 'csv-parser';
import { Product } from '@/entities/product.entity';
import { ProductConversion } from '@/entities/product-conversion.entity';
import { ProductsService } from '@/modules/products/products.service';
import { CurrencyService, ExchangeRates } from '@/modules/currency/currency.service';
import { v4 as uuidv4 } from 'uuid';

interface CsvRow {
  [key: string]: string;
}

interface ColumnMapping {
  name: string;
  price: string;
  expirationDate: string;
}

export interface UploadResponse {
  message: string;
}

@Injectable()
export class UploadService {
  private readonly BATCH_SIZE = 1000;

  constructor(
    private readonly productsService: ProductsService,
    private readonly currencyService: CurrencyService,
  ) { }

  /**
   * Main orchestrator for processing CSV file uploads.
   *
   * Flow:
   * 1. Fetches current exchange rates
   * 2. Sets up in-memory batches for products and conversions
   * 3. Pipes file stream through delimiter detection → CSV parsing
   * 4. Processes each row and accumulates into batches
   * 5. Saves to database every 1000 rows (BATCH_SIZE)
   * 6. Flushes remaining data on EOF
   *
   * Returns a Promise wrapping event-driven CSV parsing for async/await compatibility.
   */
  async processUpload(fileStream: Readable): Promise<UploadResponse> {
    try {
      const exchangeRates = await this.currencyService.fetchExchangeRates();

      const productBatch: Partial<Product>[] = [];
      const conversionBatch: Partial<ProductConversion>[] = [];
      let columnMapping: ColumnMapping | null = null;

      return new Promise((resolve, reject) => {
        let headers: string[] = [];
        let firstLine = true;
        let delimiter = ',';
        let lineNumber = 0;

        /**
         * Transform stream that:
         * 1. Detects delimiter from header line (comma, semicolon, or tab)
         * 2. Converts detected delimiter to comma for csv-parser compatibility
         */
        const delimiterConversionStream = new Transform({
          transform: (chunk, encoding, callback) => {
            if (firstLine) {
              const text = chunk.toString('utf-8');
              const headerLine = text.split('\n')[0];
              delimiter = this.detectDelimiter(headerLine);
              firstLine = false;
            }

            if (delimiter !== ',') {
              const text = chunk.toString('utf-8');
              const converted = text.replace(
                new RegExp(delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                ','
              );
              callback(null, converted);
            } else {
              callback(null, chunk);
            }
          },
        });

        /**
         * Pipeline: fileStream → delimiterConversionStream → csvParser()
         *
         * Processes CSV in streaming fashion:
         * - fileStream: reads file chunks
         * - delimiterConversionStream: normalizes delimiter to comma
         * - csvParser(): parses CSV and emits headers + data events
         */
        fileStream
          .pipe(delimiterConversionStream)
          .pipe(csvParser())

          /**
           * 'headers' event: Fired once when CSV parser detects the header row.
           *
           * Actions:
           * - Stores header names
           * - Maps CSV columns to expected fields (name, price, expirationDate)
           * - Uses flexible matching (product/item for name, cost for price, etc.)
           */
          .on('headers', (parsedHeaders: string[]) => {
            headers = parsedHeaders;
            columnMapping = this.mapColumnNames(headers);
          })

          /**
           * 'data' event: Fired for each row (excluding header).
           *
           * Per-row processing:
           * 1. Parse and validate row data
           * 2. Generate UUID for product
           * 3. Create currency conversions for all exchange rates
           * 4. Accumulate into in-memory batches
           * 5. Save to database and clear batches when BATCH_SIZE reached
           *
           * Error handling: Logs line number and rejects the promise on error.
           */
          .on('data', (row: CsvRow) => {
            lineNumber++;
            try {
              if (!columnMapping) {
                return;
              }

              const product = this.parseAndValidateRow(row, columnMapping);
              if (product) {
                const productId = uuidv4();

                productBatch.push({
                  id: productId,
                  ...product,
                });

                const conversions = this.generateConversions(
                  productId,
                  product.price as number,
                  exchangeRates,
                );
                conversionBatch.push(...conversions);

                if (productBatch.length >= this.BATCH_SIZE) {
                  this.saveBatch(productBatch, conversionBatch).catch(reject);
                  productBatch.length = 0;
                  conversionBatch.length = 0;
                }
              }
            } catch (error) {
              console.error(`Error processing line ${lineNumber}:`, error);
              reject(error);
            }
          })

          /**
           * 'end' event: Fired when CSV parser reaches end-of-file.
           *
           * Final actions:
           * 1. Flushes any remaining partial batch to database
           * 2. Logs total lines processed
           * 3. Resolves promise with success message
           */
          .on('end', async () => {
            try {
              if (productBatch.length > 0 || conversionBatch.length > 0) {
                await this.saveBatch(productBatch, conversionBatch);
              }
              console.log(`CSV upload completed. Total lines processed: ${lineNumber}`);
              resolve({ message: 'Upload processed successfully' });
            } catch (error) {
              reject(error);
            }
          })

          /**
           * 'error' event: Fired on CSV parser errors or stream read failures.
           *
           * Rejects promise with formatted BadRequestException.
           */
          .on('error', (error) => {
            console.error('CSV parser error:', error);
            reject(
              new BadRequestException(
                `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              ),
            );
          });
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      throw new HttpException(
        `Upload processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Detects the delimiter used in the CSV header line.
   *
   * Algorithm:
   * 1. Counts occurrences of common delimiters: comma, semicolon, tab
   * 2. Returns the delimiter with the highest count
   * 3. Defaults to comma if counts are equal
   *
   * @param headerLine First line of CSV file
   * @returns Detected delimiter character
   */
  private detectDelimiter(headerLine: string): string {
    const commaCount = (headerLine.match(/,/g) || []).length;
    const semicolonCount = (headerLine.match(/;/g) || []).length;
    const tabCount = (headerLine.match(/\t/g) || []).length;

    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      return ';';
    }
    if (tabCount > commaCount && tabCount > semicolonCount) {
      return '\t';
    }
    return ',';
  }

  /**
   * Maps CSV column headers to expected product fields.
   *
   * Strategy: Flexible keyword matching (case-insensitive)
   * - name: matches "name", "product", "item"
   * - price: matches "price", "cost"
   * - expirationDate: matches "expiration", "expires", "expiry", "expire"
   *
   * Fallbacks to first column for name if no match found.
   *
   * @param headers CSV column names
   * @returns Mapping object with exact column names to use
   */
  private mapColumnNames(headers: string[]): ColumnMapping {
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

    let nameColumn = headers[0];
    for (const header of headers) {
      const lower = header.toLowerCase().trim();
      if (lower.includes('name') || lower.includes('product') || lower.includes('item')) {
        nameColumn = header;
        break;
      }
    }

    let priceColumn = 'price';
    for (const header of headers) {
      const lower = header.toLowerCase().trim();
      if (lower.includes('price') || lower.includes('cost')) {
        priceColumn = header;
        break;
      }
    }

    let expirationColumn = 'expirationDate';
    for (const header of headers) {
      const lower = header.toLowerCase().trim();
      if (
        lower.includes('expiration') ||
        lower.includes('expires') ||
        lower.includes('expiry') ||
        lower.includes('expire')
      ) {
        expirationColumn = header;
        break;
      }
    }

    return {
      name: nameColumn,
      price: priceColumn,
      expirationDate: expirationColumn,
    };
  }

  /**
   * Parses and validates a single CSV row.
   *
   * Validation steps:
   * 1. Extract name and price (required)
   * 2. Clean price: remove currency symbols ($, £, €, ¥, ₹)
   * 3. Parse price as float and validate (>= 0)
   * 4. Parse expiration date in flexible formats
   * 5. Round price to 2 decimal places
   *
   * @param row CSV row data
   * @param columnMapping Column header mapping
   * @returns Validated product partial object, or null if invalid
   */
  private parseAndValidateRow(
    row: CsvRow,
    columnMapping: ColumnMapping,
  ): Partial<Product> | null {
    const name = row[columnMapping.name]?.trim();
    let priceStr = row[columnMapping.price]?.trim() || '';
    const expirationDateStr = row[columnMapping.expirationDate]?.trim();

    if (!name || !priceStr) {
      return null;
    }

    priceStr = priceStr.replace(/[$£€¥₹]/g, '').trim();

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      return null;
    }

    let expirationDate: Date | null = null;
    if (expirationDateStr) {
      expirationDate = this.parseFlexibleDate(expirationDateStr);
    }

    return {
      name,
      price: Math.round(price * 100) / 100,
      expirationDate,
    };
  }

  /**
   * Parses date strings in multiple flexible formats.
   *
   * Supported formats:
   * - YYYY-MM-DD (ISO standard)
   * - MM/DD/YYYY (US format)
   * - DD-MM-YYYY (European format)
   * - YYYY/MM/DD
   *
   * Fallback: Attempts native JavaScript Date parsing if no regex match.
   *
   * Null handling: Returns null for empty strings, "null", or invalid dates.
   *
   * @param dateStr Date string to parse
   * @returns Parsed Date object, or null if invalid
   */
  private parseFlexibleDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.toLowerCase() === 'null' || dateStr === '') {
      return null;
    }

    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\d{4})\/(\d{2})\/(\d{2})$/,
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year: number, month: number, day: number;

        if (format.source.includes('YYYY.*DD')) {
          [, year, month, day] = match.map(Number);
        } else if (dateStr.includes('/')) {
          [, month, day, year] = match.map(Number);
        } else {
          [, day, month, year] = match.map(Number);
        }

        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  /**
   * Generates currency conversions for a product.
   *
   * Creates one ProductConversion entry per exchange rate:
   * - Rounds rate to 6 decimal places
   * - Calculates converted price with proper rounding
   *
   * @param productId Product ID to associate conversions with
   * @param price Base price in original currency
   * @param rates Exchange rates object (currency → rate mapping)
   * @returns Array of conversion records
   */
  private generateConversions(
    productId: string,
    price: number,
    rates: ExchangeRates,
  ): Partial<ProductConversion>[] {
    return Object.entries(rates).map(([currency, rate]) => ({
      id: uuidv4(),
      productId,
      currency,
      rate: Math.round(rate * 1000000) / 1000000,
      convertedPrice: Math.round(price * rate * 100) / 100,
    }));
  }

  /**
   * Persists batches of products and conversions to database.
   *
   * Conditional save logic:
   * - Only saves products if batch is non-empty
   * - Only saves conversions if batch is non-empty
   * - Called after every BATCH_SIZE rows or at EOF
   *
   * @param products Products to insert
   * @param conversions Currency conversions to insert
   */
  private async saveBatch(
    products: Partial<Product>[],
    conversions: Partial<ProductConversion>[],
  ): Promise<void> {
    if (products.length > 0) {
      await this.productsService.saveBatchProducts(products);
    }
    if (conversions.length > 0) {
      await this.productsService.saveBatchConversions(conversions);
    }
  }
}
