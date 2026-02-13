import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  const serverListEnv = process.env.SERVERLIST;
  
  if (!serverListEnv) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const servers = JSON.parse(serverListEnv);
    // Return only non-sensitive info. Using index as ID.
    const safeList = servers.map((server: any, index: number) => ({
      name: server.name || `Server ${index + 1}`,
      id: index
    }));
    return NextResponse.json(safeList);
  } catch (error) {
    console.error("Failed to parse SERVERLIST environment variable:", error);
    return NextResponse.json({ error: "Invalid server configuration" }, { status: 500 });
  }
}
