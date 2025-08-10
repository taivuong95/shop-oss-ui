import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const AUTH_API_BASE_URL = process.env.AUTH_API_BASE_URL || 'http://localhost:8000';
const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH || '/api/auth/login';

function extractToken(data: any): string | undefined {
  const candidates = [
    data?.token,
    data?.access_token,
    data?.accessToken,
    data?.jwt,
    data?.data?.token,
    data?.data?.access_token,
  ];
  return candidates.find((t) => typeof t === 'string' && t.length > 0);
}

function extractUser(data: any): any | undefined {
  const candidates = [
    data?.user,
    data?.data?.user,
    data?.profile,
    data?.account,
    data?.data,
  ];
  return candidates.find((u) => !!u && typeof u === 'object');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const upstreamRes = await fetch(`${AUTH_API_BASE_URL}${AUTH_LOGIN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok) {
      const message = (data && (data.message || data.error)) || 'Login failed';
      return NextResponse.json({ message }, { status: upstreamRes.status });
    }

    let token = extractToken(data);
    let user = extractUser(data);

    if (!token) {
      return NextResponse.json(
        { message: 'Malformed auth response: missing token' },
        { status: 502 }
      );
    }

    if (!user) {
      // best-effort minimal user object
      user = { id: 'unknown', email, name: email.split('@')[0], role: 'user' };
    }

    return NextResponse.json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 