/**
 * Cloudflare Worker for Safe Trades API
 */

import { getStrategy } from '@rupiyakamao/core';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint
      if (path === '/api/health') {
        return Response.json({ status: 'ok' }, { headers: corsHeaders });
      }

      // Get trades endpoint
      if (path === '/api/trades' && request.method === 'GET') {
        const trades = await env.DB.prepare('SELECT * FROM trades ORDER BY created_at DESC LIMIT 100').all();
        return Response.json(trades.results, { headers: corsHeaders });
      }

      // Create trade endpoint
      if (path === '/api/trades' && request.method === 'POST') {
        const body = await request.json();
        const { symbol, entry_price, quantity, strategy } = body;

        const result = await env.DB.prepare(
          'INSERT INTO trades (symbol, entry_price, quantity, strategy, status) VALUES (?, ?, ?, ?, ?)'
        ).bind(symbol, entry_price, quantity, strategy, 'open').run();

        return Response.json({ id: result.meta.last_row_id }, { status: 201, headers: corsHeaders });
      }

      // AI Analysis endpoint (placeholder for OpenAI integration)
      if (path === '/api/analyze' && request.method === 'POST') {
        const body = await request.json();
        const { trade_id } = body;

        // Placeholder for OpenAI API call using env.OPENAI_API_KEY
        const analysis = {
          trade_id,
          analysis: 'AI analysis coming soon',
          confidence: 0.75,
        };

        return Response.json(analysis, { headers: corsHeaders });
      }

      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  },
};
