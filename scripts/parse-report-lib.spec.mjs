import { describe, it, expect } from 'vitest';
import {
  round,
  detectFormat,
  parseMetaTrader,
  parseBinance,
  aggregateTrades,
} from './parse-report-lib.mjs';

describe('round', () => {
  it('rounds to 2 decimal places', () => {
    expect(round(1.005)).toBe(1);
    expect(round(1.125)).toBe(1.13);
    expect(round(1.1)).toBe(1.1);
  });

  it('handles zero', () => {
    expect(round(0)).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(round(-1.456)).toBe(-1.46);
    expect(round(-0.001)).toBe(-0);
  });

  it('handles already-round numbers', () => {
    expect(round(5)).toBe(5);
    expect(round(3.14)).toBe(3.14);
  });

  it('handles large numbers', () => {
    expect(round(123456.789)).toBe(123456.79);
  });
});

describe('detectFormat', () => {
  it('detects binance format', () => {
    const rows = [[], [], ['Futures Position History']];
    expect(detectFormat(rows)).toBe('binance');
  });

  it('detects metatrader format', () => {
    const rows = [[], [], [], ['Positions']];
    expect(detectFormat(rows)).toBe('metatrader');
  });

  it('throws on unknown format', () => {
    const rows = [[], [], ['something else']];
    expect(() => detectFormat(rows)).toThrow('Unknown report format');
  });

  it('throws on empty rows', () => {
    expect(() => detectFormat([])).toThrow('Unknown report format');
  });
});

describe('parseMetaTrader', () => {
  function makeRows({
    name = 'John',
    accountRaw = '12345 (USD, ...)',
    company = 'Broker Inc',
    trades = [],
  } = {}) {
    // rows[1][3] = name, rows[2][3] = accountRaw, rows[3][3] = company
    const rows = [
      [], // row 0
      [null, null, null, name], // row 1
      [null, null, null, accountRaw], // row 2
      [null, null, null, company], // row 3
    ];

    // Positions header row
    rows.push(['Positions']);
    // Column header row (skipped)
    rows.push([
      'Ticket',
      'Open Time',
      'Symbol',
      'Type',
      'Volume',
      null,
      null,
      null,
      'Close Time',
      null,
      'Commission',
      'Swap',
      'Profit',
    ]);

    // Trade data rows
    for (const t of trades) {
      const row = [];
      row[0] = t.ticket ?? '123';
      row[2] = t.symbol ?? 'EURUSD';
      row[3] = t.type ?? 'buy';
      row[4] = t.volume ?? 0.1;
      row[8] = t.closeTime ?? '2025.01.15 12:00:00';
      row[10] = t.commission ?? -2.5;
      row[11] = t.swap ?? -0.5;
      row[12] = t.profit ?? 50;
      rows.push(row);
    }

    // Orders section
    rows.push(['Orders']);
    return rows;
  }

  it('parses account info', () => {
    const rows = makeRows({
      name: 'Alice',
      accountRaw: '99999 (EUR, Hedge)',
      company: 'IC Markets',
    });
    const { account } = parseMetaTrader(rows);
    expect(account).toEqual({
      name: 'Alice',
      number: '99999',
      currency: 'EUR',
      company: 'IC Markets',
    });
  });

  it('parses a single trade', () => {
    const rows = makeRows({
      trades: [
        {
          symbol: 'GBPUSD',
          type: 'sell',
          volume: 0.5,
          closeTime: '2025.03.10 14:30:00',
          commission: -3,
          swap: -1,
          profit: 100,
        },
      ],
    });
    const { trades } = parseMetaTrader(rows);
    expect(trades).toHaveLength(1);
    expect(trades[0]).toEqual({
      date: '2025-03-10',
      symbol: 'GBPUSD',
      type: 'sell',
      volume: 0.5,
      commission: -3,
      swap: -1,
      profit: 100,
    });
  });

  it('parses multiple trades', () => {
    const rows = makeRows({
      trades: [
        { symbol: 'EURUSD', closeTime: '2025.01.01 10:00:00', profit: 10 },
        { symbol: 'USDJPY', closeTime: '2025.01.02 11:00:00', profit: 20 },
      ],
    });
    const { trades } = parseMetaTrader(rows);
    expect(trades).toHaveLength(2);
  });

  it('skips empty rows', () => {
    const rows = makeRows({
      trades: [{ symbol: 'EURUSD', closeTime: '2025.01.01 10:00:00', profit: 10 }],
    });
    // Insert an empty row before Orders
    const ordersIdx = rows.findIndex((r) => r[0] === 'Orders');
    rows.splice(ordersIdx, 0, []);
    const { trades } = parseMetaTrader(rows);
    expect(trades).toHaveLength(1);
  });

  it('throws when Positions section is missing', () => {
    const rows = [[], [], [], [], ['Orders']];
    expect(() => parseMetaTrader(rows)).toThrow('Could not find Positions or Orders section');
  });

  it('throws when Orders section is missing', () => {
    const rows = [[], [], [], [], ['Positions'], []];
    expect(() => parseMetaTrader(rows)).toThrow('Could not find Positions or Orders section');
  });
});

describe('parseBinance', () => {
  function makeRows({ name = 'Bob', uid = '123456', trades = [] } = {}) {
    const rows = [
      [], // 0
      [], // 1
      ['Futures Position History'], // 2
      [], // 3
      [null, name], // 4 - name
      [null, uid], // 5 - uid
      [], // 6
      [], // 7
      [], // 8
      [], // 9 - column headers
    ];

    for (const t of trades) {
      const row = [];
      row[0] = t.symbol ?? 'BTCUSDT';
      row[2] = t.direction ?? 'Long';
      row[8] = t.volume ?? 0.01;
      row[9] = t.profit ?? 50;
      row[12] = t.closedTime ?? '25-01-15 12:00:00';
      row[14] = t.status ?? 'Closed';
      rows.push(row);
    }

    return rows;
  }

  it('parses account info', () => {
    const rows = makeRows({ name: 'Alice', uid: '789' });
    const { account } = parseBinance(rows);
    expect(account).toEqual({
      name: 'Alice',
      number: '789',
      currency: '$',
      company: 'Binance',
    });
  });

  it('maps short to sell and long to buy', () => {
    const rows = makeRows({
      trades: [
        { symbol: 'BTCUSDT', direction: 'Short', profit: 10, closedTime: '25-01-15 12:00:00' },
        { symbol: 'ETHUSDT', direction: 'Long', profit: 20, closedTime: '25-01-16 12:00:00' },
      ],
    });
    const { trades } = parseBinance(rows);
    expect(trades[0].type).toBe('sell');
    expect(trades[1].type).toBe('buy');
  });

  it('skips Partially Closed rows', () => {
    const rows = makeRows({
      trades: [
        {
          symbol: 'BTCUSDT',
          profit: 10,
          status: 'Partially Closed',
          closedTime: '25-01-15 12:00:00',
        },
        { symbol: 'ETHUSDT', profit: 20, status: 'Closed', closedTime: '25-01-16 12:00:00' },
      ],
    });
    const { trades } = parseBinance(rows);
    expect(trades).toHaveLength(1);
    expect(trades[0].symbol).toBe('ETHUSDT');
  });

  it('skips zero-profit rows', () => {
    const rows = makeRows({
      trades: [
        { symbol: 'BTCUSDT', profit: 0, closedTime: '25-01-15 12:00:00' },
        { symbol: 'ETHUSDT', profit: 30, closedTime: '25-01-16 12:00:00' },
      ],
    });
    const { trades } = parseBinance(rows);
    expect(trades).toHaveLength(1);
    expect(trades[0].symbol).toBe('ETHUSDT');
  });

  it('prefixes date with 20', () => {
    const rows = makeRows({
      trades: [{ closedTime: '25-03-10 14:30:00', profit: 5 }],
    });
    const { trades } = parseBinance(rows);
    expect(trades[0].date).toBe('2025-03-10');
  });

  it('sets commission and swap to 0', () => {
    const rows = makeRows({
      trades: [{ profit: 10, closedTime: '25-01-15 12:00:00' }],
    });
    const { trades } = parseBinance(rows);
    expect(trades[0].commission).toBe(0);
    expect(trades[0].swap).toBe(0);
  });
});

describe('aggregateTrades', () => {
  it('groups trades by date', () => {
    const trades = [
      {
        date: '2025-01-15',
        symbol: 'EURUSD',
        type: 'buy',
        volume: 0.1,
        commission: 0,
        swap: 0,
        profit: 10,
      },
      {
        date: '2025-01-15',
        symbol: 'GBPUSD',
        type: 'sell',
        volume: 0.2,
        commission: 0,
        swap: 0,
        profit: 20,
      },
      {
        date: '2025-01-16',
        symbol: 'USDJPY',
        type: 'buy',
        volume: 0.1,
        commission: 0,
        swap: 0,
        profit: -5,
      },
    ];
    const { dailySummaries } = aggregateTrades(trades);
    expect(Object.keys(dailySummaries)).toHaveLength(2);
    expect(dailySummaries['2025-01-15'].tradeCount).toBe(2);
    expect(dailySummaries['2025-01-16'].tradeCount).toBe(1);
  });

  it('accumulates netPL per day', () => {
    const trades = [
      {
        date: '2025-01-15',
        symbol: 'A',
        type: 'buy',
        volume: 1,
        commission: -2,
        swap: -1,
        profit: 50,
      },
      {
        date: '2025-01-15',
        symbol: 'B',
        type: 'sell',
        volume: 1,
        commission: -3,
        swap: 0,
        profit: 30,
      },
    ];
    const { dailySummaries } = aggregateTrades(trades);
    // netPL for trade A: -2 + -1 + 50 = 47
    // netPL for trade B: -3 + 0 + 30 = 27
    // total: 74
    expect(dailySummaries['2025-01-15'].netPL).toBe(74);
  });

  it('computes monthly totals', () => {
    const trades = [
      {
        date: '2025-01-10',
        symbol: 'A',
        type: 'buy',
        volume: 1,
        commission: 0,
        swap: 0,
        profit: 100,
      },
      {
        date: '2025-01-20',
        symbol: 'B',
        type: 'buy',
        volume: 1,
        commission: 0,
        swap: 0,
        profit: 50,
      },
      {
        date: '2025-02-05',
        symbol: 'C',
        type: 'buy',
        volume: 1,
        commission: 0,
        swap: 0,
        profit: 30,
      },
    ];
    const { monthlyTotals } = aggregateTrades(trades);
    expect(monthlyTotals['2025-01']).toEqual({ netPL: 150, tradeCount: 2 });
    expect(monthlyTotals['2025-02']).toEqual({ netPL: 30, tradeCount: 1 });
  });

  it('handles empty input', () => {
    const { dailySummaries, monthlyTotals } = aggregateTrades([]);
    expect(dailySummaries).toEqual({});
    expect(monthlyTotals).toEqual({});
  });

  it('rounds netPL correctly', () => {
    const trades = [
      {
        date: '2025-01-01',
        symbol: 'A',
        type: 'buy',
        volume: 1,
        commission: -0.1,
        swap: -0.2,
        profit: 0.3,
      },
    ];
    const { dailySummaries } = aggregateTrades(trades);
    expect(dailySummaries['2025-01-01'].netPL).toBe(0);
    expect(dailySummaries['2025-01-01'].trades[0].netPL).toBe(-0);
  });
});
