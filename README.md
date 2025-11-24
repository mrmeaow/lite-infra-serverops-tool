# LiteInfra CLI

Get starting with a VPS or Local development/testing environment manager for managing 7 (for now) infrastructure services.

## Quick Start

```bash
pnpm lite
```

## Services

- **Portainer** - Docker UI (ports: 9100, 9443) - _default_ and an agent runs on port 9101
- **PostgreSQL** - Database (port: 5432)
- **MongoDB** - NoSQL with ReplicaSet (ports: 27017-27019)
- **Redis** - Cache (port: 6379) - _default_
- **SigNoz** - APM - Observability (port: 3080) and OTEL ports (gRPC: 4317, HTTP 4318)
- **MinIO** - S3 Storage (ports: 9010, 9011)
- **Mailpit** - Email Testing (ports: 8025, 8080)

## Features

- Start/stop/restart services
- View service status
- Interactive menu with multiselect
- Docker integration

**This is made for local/testing environment to pilot-stage VPS cloud serverops**

Made with :heart: by [@mrmeaow](https://github.com/mrmeaow)
