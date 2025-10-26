-- Cloudflare D1 Database Schema for Safe Trades

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL,
  quantity INTEGER NOT NULL,
  strategy TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parameters TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Analysis table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_id INTEGER NOT NULL,
  analysis TEXT NOT NULL,
  confidence REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_id) REFERENCES trades(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_trade_id ON ai_analysis(trade_id);
