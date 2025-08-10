import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const AUTH_API_BASE_URL = process.env.AUTH_API_BASE_URL || 'http://localhost:8000';
const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH || '/api/auth/login';

// Upstream response shapes
interface RawUser {
  id?: string;
  _id?: string;
  uuid?: string;
  userId?: string;
  email?: string;
  username?: string;
  name?: string;
  fullName?: string;
  role?: string;
  type?: string;
}

interface UpstreamDataContainer {
  token?: string;
  access_token?: string;
  user?: RawUser;
}

interface UpstreamLoginResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  jwt?: string;
  data?: UpstreamDataContainer | RawUser;
  user?: RawUser;
  profile?: RawUser;
  account?: RawUser;
  message?: string;
  error?: string;
  email?: string;
  username?: string;
}

interface NormalizedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRawUser(value: unknown): value is RawUser {
  return isObject(value);
}

function isUpstreamDataContainer(value: unknown): value is UpstreamDataContainer {
  return isObject(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function extractToken(data: UpstreamLoginResponse): string | undefined {
  const candidates: Array<string | undefined> = [
    data.token,
    data.access_token,
    data.accessToken,
    data.jwt,
    isUpstreamDataContainer(data.data) ? data.data.token : undefined,
    isUpstreamDataContainer(data.data) ? data.data.access_token : undefined,
  ];
  return candidates.find(isString);
}

function extractUser(data: UpstreamLoginResponse): RawUser | undefined {
  const direct = data.user;
  const nested = isUpstreamDataContainer(data.data) ? data.data.user : undefined;
  const profile = data.profile;
  const account = data.account;
  const rawData = isRawUser(data.data) ? data.data : undefined;

  const candidates: Array<RawUser | undefined> = [
    direct,
    nested,
    profile,
    account,
    rawData,
    // Some APIs return root-level fields
    data.email || data.username ? { email: data.email, username: data.username } : undefined,
  ];
  return candidates.find((u): u is RawUser => isRawUser(u));
}

function normalizeUser(raw: RawUser | undefined, fallbackEmail: string): NormalizedUser {
  const id = raw?.id || raw?._id || raw?.uuid || raw?.userId || 'unknown';
  const email = raw?.email || fallbackEmail;
  const name = raw?.name || raw?.fullName || raw?.username || (email ? email.split('@')[0] : 'User');
  const role = raw?.role || raw?.type || 'user';
  return { id, email, name, role };
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

    let data: UpstreamLoginResponse = {};
    try {
      data = (await upstreamRes.json()) as UpstreamLoginResponse;
    } catch {
      data = {} as UpstreamLoginResponse;
    }

    if (!upstreamRes.ok) {
      const message = data.message || data.error || 'Login failed';
      return NextResponse.json({ message }, { status: upstreamRes.status });
    }

    const token = extractToken(data);
    const rawUser = extractUser(data);

    if (!isString(token)) {
      return NextResponse.json(
        { message: 'Malformed auth response: missing token' },
        { status: 502 }
      );
    }

    const user = normalizeUser(rawUser, email);

    return NextResponse.json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 