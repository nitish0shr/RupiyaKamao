// Cloudflare Worker Backend API for RupiyaKamao

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
}

// Helper function to hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Helper function to verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Helper function to generate JWT token
async function generateToken(userId: number, email: string, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureB64 = btoa(String.fromCharCode(...signatureArray));
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    try {
      // Route: /api/auth/register
      if (path === '/api/auth/register' && method === 'POST') {
        const body = await request.json() as { email: string; password: string; username: string };
        
        // Validate input
        if (!body.email || !body.password || !body.username) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Email, username, and password are required',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Validate email format
        if (!isValidEmail(body.email)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Invalid email format',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Validate password length
        if (body.password.length < 6) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Password must be at least 6 characters long',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Check if user already exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ? OR username = ?'
        )
          .bind(body.email, body.username)
          .first();

        if (existingUser) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'User with this email or username already exists',
            }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Hash password
        const passwordHash = await hashPassword(body.password);

        // Insert user into database
        const result = await env.DB.prepare(
          'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)'
        )
          .bind(body.email, body.username, passwordHash)
          .run();

        if (!result.success) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Failed to create user',
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Get the created user
        const newUser = await env.DB.prepare(
          'SELECT id, email, username, created_at FROM users WHERE email = ?'
        )
          .bind(body.email)
          .first() as User | null;

        if (!newUser) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'User created but failed to retrieve',
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Generate JWT token
        const jwtSecret = env.JWT_SECRET || 'default-secret-key-change-in-production';
        const token = await generateToken(newUser.id, newUser.email, jwtSecret);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'User registered successfully',
            data: {
              user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                created_at: newUser.created_at,
              },
              token,
            },
          }),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Route: /api/auth/login
      if (path === '/api/auth/login' && method === 'POST') {
        const body = await request.json() as { email: string; password: string };
        
        // Validate input
        if (!body.email || !body.password) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Email and password are required',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Find user by email
        const user = await env.DB.prepare(
          'SELECT id, email, username, password_hash, created_at FROM users WHERE email = ?'
        )
          .bind(body.email)
          .first() as User | null;

        if (!user) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Invalid email or password',
            }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Verify password
        const isPasswordValid = await verifyPassword(body.password, user.password_hash);
        
        if (!isPasswordValid) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Invalid email or password',
            }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Generate JWT token
        const jwtSecret = env.JWT_SECRET || 'default-secret-key-change-in-production';
        const token = await generateToken(user.id, user.email, jwtSecret);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Login successful',
            data: {
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                created_at: user.created_at,
              },
              token,
            },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Route: /api/user/profile (GET - protected route)
      if (path === '/api/user/profile' && method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Unauthorized - No token provided',
            }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // For now, return a simple response
        // In production, you should verify the JWT token
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
              message: 'Profile endpoint - token verification to be implemented',
            },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Health check endpoint
      if (path === '/api/health' && method === 'GET') {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // 404 - Route not found
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Route not found',
          error: `${method} ${path} is not a valid endpoint`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      // Error handling
      console.error('Error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
