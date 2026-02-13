# Network Monitor Panel

A modern, real-time server monitoring dashboard built with Next.js. This panel allows you to visualize CPU and RAM usage across multiple servers in a centralized interface.

## Features

*   **Real-time Monitoring**: Updates server statistics every 2 seconds.
*   **CPU Usage**: Visualizes total CPU load and individual core usage.
*   **RAM Usage**: Displays used vs. total memory with visual progress bars.
*   **Multi-Server Support**: Monitor an unlimited number of servers from a single dashboard.
*   **Dark Mode UI**: Professional, eye-friendly interface for continuous monitoring.
*   **Secure**: Uses a server-side proxy to keep your authentication tokens safe.

## Prerequisites

To monitor a server, you must install the **Network Monitor Connector** on each target VPS/Node. This lightweight connector exposes the system metrics securely.

**Connector Repository & Installation Guide:**
👉 [https://github.com/RonaldZav/network-monitor-connector](https://github.com/RonaldZav/network-monitor-connector)

Please refer to the connector's documentation for installation and configuration instructions.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ronaldzav/network-monitor-panel.git
    cd network-monitor-panel
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Servers:**
    Create a `.env` file in the root directory and add your server list in JSON format.
    
    ```env
    SERVERLIST='[
      {
        "name": "Production Server",
        "url": "http://your-server-ip:2114",
        "token": "YOUR_SECRET_TOKEN"
      },
      {
        "name": "Database Node",
        "url": "http://another-ip:2114",
        "token": "ANOTHER_TOKEN"
      }
    ]'
    ```
    *   `name`: Display name for the server.
    *   `url`: The URL where the connector is running (usually port 2114).
    *   `token`: The authentication token configured in your connector.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Build for production:**
    ```bash
    npm run build
    npm run start
    ```

## Technologies

*   [Next.js](https://nextjs.org/) - React Framework
*   React - UI Library
*   TypeScript - Type Safety

## License

This project is open source and available under the [MIT License](LICENSE).

Developed by **RonaldZav**.
