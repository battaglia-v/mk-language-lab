import { NextRequest } from 'next/server';
import { handlers } from '@/lib/auth';

type NextAuthParams = { params: Promise<{ nextauth: string[] }> };

export const GET = (request: NextRequest, _context: NextAuthParams) => {
	void _context;
	return handlers.GET(request);
};

export const POST = (request: NextRequest, _context: NextAuthParams) => {
	void _context;
	return handlers.POST(request);
};
