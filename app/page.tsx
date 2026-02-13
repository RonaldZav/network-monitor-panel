'use client';

import { useEffect, useState } from 'react';

interface ServerInfo {
  name: string;
  id: number;
}

interface ServerData {
  cpu: {
    cpu: number;
    cores: { [key: string]: number };
  };
  ram: {
    used_ram: number;
    total_ram: number;
  };
}

interface ServerStatus {
  info: ServerInfo;
  data: ServerData | null;
  error: string | null;
}

export default function Home() {
  const [servers, setServers] = useState<ServerStatus[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('/api/servers');
        if (!response.ok) throw new Error('Failed to fetch server list');
        const serverInfos: ServerInfo[] = await response.json();
        
        const initialStatus = serverInfos.map(info => ({
          info,
          data: null,
          error: null
        }));
        setServers(initialStatus);
      } catch (error) {
        console.error('Error fetching server list:', error);
      }
    };

    fetchServers();
  }, []);

  useEffect(() => {
    if (servers.length === 0) return;

    const updateServerData = async () => {
      const updatedDataPromises = servers.map(async (server) => {
        try {
          const response = await fetch(`/api/monitor?id=${server.info.id}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data: ServerData = await response.json();
          return { ...server, data, error: null };
        } catch (error) {
          return { ...server, error: (error as Error).message };
        }
      });

      const updatedServers = await Promise.all(updatedDataPromises);
      setServers(updatedServers);
    };

    updateServerData();
    const interval = setInterval(updateServerData, 2000); 

    return () => clearInterval(interval);
  }, [servers.length]); 

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return '#10B981'; // Green
    if (percentage < 80) return '#F59E0B'; // Yellow/Orange
    return '#EF4444'; // Red
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#111827', 
      color: '#F3F4F6', 
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ flex: 1, padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ marginBottom: '40px', borderBottom: '1px solid #374151', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0, background: 'linear-gradient(to right, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Network Monitor
            </h1>
            <p style={{ color: '#9CA3AF', marginTop: '10px' }}>Real-time server resource monitoring</p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
            {servers.map((server) => (
              <div key={server.info.id} style={{ 
                backgroundColor: '#1F2937', 
                borderRadius: '16px', 
                padding: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #374151',
                transition: 'transform 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#E5E7EB' }}>{server.info.name}</h2>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: server.error ? '#EF4444' : server.data ? '#10B981' : '#6B7280',
                    boxShadow: server.data && !server.error ? '0 0 8px #10B981' : 'none'
                  }}></div>
                </div>

                {server.error ? (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px dashed rgba(239, 68, 68, 0.3)', 
                    color: '#FCA5A5', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#EF4444' }}>Server is offline</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{server.error}</p>
                  </div>
                ) : server.data ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'space-between' }}>
                    {/* CPU Section */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', margin: 0 }}>CPU Load</h3>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: getStatusColor(server.data.cpu.cpu) }}>
                          {server.data.cpu.cpu.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* CPU Cores Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                        gap: '8px' 
                      }}>
                        {Object.entries(server.data.cpu.cores)
                          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                          .map(([core, usage]) => (
                          <div key={core} style={{ 
                            backgroundColor: '#111827', 
                            padding: '8px', 
                            borderRadius: '6px', 
                            textAlign: 'center',
                            border: '1px solid #374151'
                          }}>
                            <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '4px' }}>C{core}</div>
                            <div style={{ 
                              fontSize: '0.85rem', 
                              fontWeight: '600',
                              color: getStatusColor(usage)
                            }}>{usage.toFixed(0)}%</div>
                            <div style={{ 
                              height: '3px', 
                              width: '100%', 
                              backgroundColor: '#374151', 
                              marginTop: '6px', 
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                height: '100%', 
                                width: `${usage}%`, 
                                backgroundColor: getStatusColor(usage) 
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* RAM Section */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', margin: 0 }}>Memory</h3>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#E5E7EB' }}>{formatBytes(server.data.ram.used_ram)}</span>
                          <span style={{ color: '#6B7280', fontSize: '0.9rem', marginLeft: '6px' }}>/ {formatBytes(server.data.ram.total_ram)}</span>
                        </div>
                      </div>
                      
                      <div style={{ 
                        backgroundColor: '#374151', 
                        borderRadius: '999px', 
                        height: '16px', 
                        width: '100%', 
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          width: `${(server.data.ram.used_ram / server.data.ram.total_ram) * 100}%`, 
                          backgroundColor: getStatusColor((server.data.ram.used_ram / server.data.ram.total_ram) * 100), 
                          height: '100%', 
                          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: '999px'
                        }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                          {((server.data.ram.used_ram / server.data.ram.total_ram) * 100).toFixed(1)}% Used
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px', 
                    color: '#6B7280',
                    flexDirection: 'column',
                    gap: '12px',
                    flex: 1
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid #374151',
                      borderTopColor: '#60A5FA',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Connecting...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ 
        borderTop: '1px solid #374151', 
        padding: '20px', 
        textAlign: 'center', 
        color: '#6B7280',
        fontSize: '0.9rem',
        marginTop: 'auto'
      }}>
        <p style={{ margin: 0 }}>
          Developed by <span style={{ color: '#E5E7EB', fontWeight: '600' }}>RonaldZav</span> • Open Source
        </p>
        <a 
          href="https://github.com/ronaldzav/network-monitor" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#60A5FA', 
            textDecoration: 'none', 
            marginTop: '8px', 
            display: 'inline-block',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#93C5FD'}
          onMouseOut={(e) => e.currentTarget.style.color = '#60A5FA'}
        >
          github.com/ronaldzav/network-monitor
        </a>
      </footer>
    </div>
  );
}
