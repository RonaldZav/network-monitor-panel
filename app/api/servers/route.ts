import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  let serverListEnv = process.env.SERVERLIST;
  
  if (!serverListEnv) {
    console.error("SERVERLIST environment variable is missing");
    return NextResponse.json([], { status: 200 });
  }

  try {
    // Attempt to clean up common copy-paste errors (surrounding quotes)
    serverListEnv = serverListEnv.trim();
    if (serverListEnv.startsWith("'") && serverListEnv.endsWith("'")) {
      serverListEnv = serverListEnv.slice(1, -1);
    } else if (serverListEnv.startsWith('"') && serverListEnv.endsWith('"')) {
      // Only remove double quotes if it doesn't look like a JSON string itself (which starts with [ or {)
      // But a JSON array stringified is "[...]" which is valid JSON string, but we want the array.
      // If the user pasted " [...] " including quotes into the field.
      if (serverListEnv.charAt(1) === '[') {
         serverListEnv = serverListEnv.slice(1, -1);
      }
    }

    const servers = JSON.parse(serverListEnv);
    
    if (!Array.isArray(servers)) {
        throw new Error("SERVERLIST is not an array");
    }

    // Return only non-sensitive info. Using index as ID.
    const safeList = servers.map((server: any, index: number) => ({
      name: server.name || `Server ${index + 1}`,
      id: index
    }));
    return NextResponse.json(safeList);
  } catch (error) {
    console.error("Failed to parse SERVERLIST environment variable:", error);
    console.error("Received value (first 20 chars):", serverListEnv?.substring(0, 20));
    return NextResponse.json({ error: "Invalid server configuration" }, { status: 500 });
  }
}
