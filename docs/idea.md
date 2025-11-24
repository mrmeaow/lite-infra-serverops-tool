# Project Idea

## Infra. Servers

- Portainer (CE) with its += agent (standalone)
- PostgreSQL (standalone + WAL mode)
- MongoDB (replica-set is a must + compose-stack + auth)
- Redis (standalone)
- Signoz APM (compose-stack)
- MinIO (aka S3/R2 in local, standalone)
- Mailpit (aka local email testing SMTP, standalone)

> By default auto-selecteds are:
>
> - Portainer CE with its agent
> - Redis

## Ports reservation (external exposure)

- PostgreSQL `5432`
- MongoDB `27017 -> 27019`
- Redis `6379`
- Portainer `9100` and `9443`
- Signoz APM UI: `3080` and regular ports as it is.
- MinIO UI `9010` and console `9011`
- Mailpt UI `8025` and SMTP `1025`

> Note: ports like 3000,9000,8080, etc. are not available for external exposure allocation.

## Guidlines

- PostgreSQL => standalone container
- MongoDB => stack (docker compose, using common-env)
- Redis => standalone container
- Portainer => standalone containers
- Signoz APM => stack (docker compose) picked from its github repo
- MinIO => standalone container
- Mailpit => standalone container
