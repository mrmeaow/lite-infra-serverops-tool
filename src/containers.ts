export const get_choice_list = <T extends Record<string, unknown>>(): T => ({
  portainer: {
      name: 'portainer',
      displayName: 'Portainer CE',
      type: 'standalone',
      ports: '9100, 9443',
      isDefault: true,
      description: 'Container Management UI',
    },
     portainer_agent: {
      name: 'portainer_agent',
      displayName: 'Portainer CE Agent',
      type: 'standalone',
      ports: '9101',
      isDefault: true,
      description: 'Container API Agent',
    },
    postgres: {
      name: 'postgres',
      displayName: 'PostgreSQL',
      type: 'standalone',
      ports: '5432',
      isDefault: false,
      description: 'Relational Database',
    },
    mongodb: {
      name: 'mongodb',
      displayName: 'MongoDB',
      type: 'compose',
      ports: '27017-27019',
      isDefault: false,
      description: 'Document Database with ReplicaSet',
    },
    redis: {
      name: 'redis',
      displayName: 'Redis',
      type: 'standalone',
      ports: '6379',
      isDefault: true,
      description: 'In-Memory Cache',
    },
    signoz: {
      name: 'signoz',
      displayName: 'SigNoz',
      type: 'compose',
      ports: '3080',
      isDefault: false,
      description: 'APM & Observability Platform',
    },
    minio: {
      name: 'minio',
      displayName: 'MinIO',
      type: 'standalone',
      ports: '9010, 9011',
      isDefault: false,
      description: 'S3-Compatible Storage',
    },
    mailpit: {
      name: 'mailpit',
      displayName: 'Mailpit',
      type: 'standalone',
      ports: '8025, 1025',
      isDefault: false,
      description: 'Email Testing Server',
    },
} as unknown as T);


export const get_configs = (vol_dir: string) => ({
    portainer: [
          'run', '-d',
          '--name', 'portainer',
          '--restart', 'unless-stopped',
          '--network', 'bridge',
          '-p', '9100:9000',
          '-p', '9443:9443',
          '-v', '/var/run/docker.sock:/var/run/docker.sock',
          '-v', `${vol_dir}/portainer/data:/data`,
          'portainer/portainer-ce:latest',
        ],
        portainer_agent: [
            'run', '-d',
          '--name', 'portainer_agent',
          '--restart', 'unless-stopped',
          '--network', 'bridge',
          '-p', '9101:9001',
          '-v', '/var/run/docker.sock:/var/run/docker.sock',
          '-v', '/var/lib/docker/volumes:/var/lib/docker/volumes',
          '-v', `${vol_dir}/portainer/agent/:/host`,
          'portainer/agent:latest',
        ],
        postgres: [
          'run', '-d',
          '--name', 'postgres',
          '--restart', 'unless-stopped',
          '--network', 'bridge',
          '-p', '5432:5432',
          '-e', 'POSTGRES_PASSWORD=postgres',
          '-e', 'POSTGRES_USER=postgres',
          '-e', 'POSTGRES_DB=postgres',
          '-v', `${vol_dir}/postgresql/data:/var/lib/postgresql/data`,
          'postgres:16',
          '-c', 'wal_level=logical',
        ],
        redis: [
          'run', '-d',
          '--name', 'redis',
          '--restart', 'unless-stopped',
          '--network', 'bridge',
          '-p', '6379:6379',
          '-v', `${vol_dir}/redis/data:/data`,
          'redis:7-alpine',
          'redis-server',
         //   '--appendonly', 'yes',
        ],
        minio: [
          'run', '-d',
          '--name', 'minio',
          '--restart', 'unless-stopped',
          '--network', 'bridge',
          '-p', '9010:9000',
          '-p', '9011:9001',
          '-e', 'MINIO_ROOT_USER=admin',
          '-e', 'MINIO_ROOT_PASSWORD=pa55w0rd',
          '-v', `${vol_dir}/minio/data:/data`,
          'minio/minio:latest',
          'server', '/data',
          '--console-address', ':9001',
        ],
        mailpit: [
          'run', '-d',
          '--name', 'mailpit',
          '--restart', 'unless-stopped',
          '--network', 'bridge',
          '-p', '1025:1025',
          '-p', '8025:8025',
          'axllent/mailpit:latest',
        ],
 })


interface COMPOSE_STACK_RECORD {
  stack_name: string
  ports: (string | number)[]
  majors: string[]
  compose_file: string
}

export const compose_stacks = <T extends Record<string, COMPOSE_STACK_RECORD>>(): T => ({
  mongodb: {
    stack_name: 'mongodb',
    ports: [27017,27018,27019], // external
    majors: ['mongodb_clstr', 'mongodb_clstr_r0', 'mongodb_clstr_r1'],
    compose_file: 'docker-compose.yml',
  },
  signoz: {
    stack_name: 'signoz',
    ports: [3080,4317,4318], // external
    majors: ['signoz', 'signoz-otel-collector'],
    compose_file: 'docker/docker-compose.yaml'
  }
 } as unknown as T)
