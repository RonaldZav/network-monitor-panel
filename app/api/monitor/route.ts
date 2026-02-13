import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id === null) {
    return NextResponse.json({ error: "Missing server ID" }, { status: 400 });
  }

  const serverListEnv = process.env.SERVERLIST;
  if (!serverListEnv) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }

  try {
    const servers = JSON.parse(serverListEnv);
    const serverIndex = parseInt(id, 10);
    
    if (isNaN(serverIndex) || serverIndex < 0 || serverIndex >= servers.length) {
      return NextResponse.json({ error: "Invalid server ID" }, { status: 404 });
    }

    const server = servers[serverIndex];
    
    // Ensure the URL ends with /v1/monitor if it's just the base URL
    let targetUrl = server.url;
    if (!targetUrl.endsWith('/v1/monitor')) {
        // Remove trailing slash if present before appending
        targetUrl = targetUrl.replace(/\/$/, '') + '/v1/monitor';
    }

    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${server.token}`
      },
      // Prevent caching for real-time data
      cache: 'no-store'
    });

    if (!response.ok) {
        return NextResponse.json({ error: `Upstream error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
