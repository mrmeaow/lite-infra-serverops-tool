import { spawn } from 'child_process';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { compose_stacks, get_choice_list, get_configs } from './containers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

config({ path: path.join(PROJECT_ROOT, '.env') });

export const VOL_DIR = process.env.VOL_DIR

if (!VOL_DIR || VOL_DIR.length < 0 || VOL_DIR.trim() === '') throw new Error('Invalid or missing VOL_DIR value')


export interface Service {
  name: string;
  displayName: string;
  type: 'standalone' | 'compose';
  ports: string;
  isDefault: boolean;
  description: string;
}

export const SERVICES = get_choice_list<Record<string, Service>>()

interface ExecResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

export async function execCommand(
  command: string,
  args: string[] = [],
  options: { cwd?: string; stdio?: any } = {},
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      shell: true,
      cwd: options.cwd || PROJECT_ROOT,
      stdio: options.stdio || 'pipe',
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });

    proc.on('error', (err) => {
      resolve({ stdout, stderr: err.message, code: 1 });
    });
  });
}

export async function isDockerAvailable(): Promise<boolean> {
  try {
    const { code } = await execCommand('docker', ['--version']);
    return code === 0;
  } catch {
    return false;
  }
}

export async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const { stdout, code } = await execCommand('docker', [
      'ps',
      '--filter',
      `name=^${containerName}`,
      '--format',
      '{{.Names}}',
    ]);
    // console.log(JSON.stringify({ stdout, code }, null ,2))
    return code === 0 && (stdout.trim() === containerName || 
stdout.trim().split('/')[0].includes(containerName));
  } catch {
    return false;
  }
}

export async function getRunningServices(): Promise<string[]> {
  const running: string[] = [];
  
  for (const [key, service] of Object.entries(SERVICES)) {
    if (service.type === 'standalone') {
      if (await isContainerRunning(service.name)) {
        running.push(key);
      }
    } else {
      // For compose services, check the main container
    //   const mainContainer = `${service.name}-1`;
      const { stdout } = await execCommand('docker', [
        'ps',
        '--filter',
        `name=${service.name}`,
        '--format',
        '{{.Names}}',
      ]);
      if (stdout.includes(service.name)) {
        running.push(key);
      }
    }
  }
  
//   console.log(JSON.stringify(running, null, 2))
  return running;
}

export async function ensureDataDir(serviceName: string): Promise<void> {
  const dataDir = path.join(`${VOL_DIR}/${serviceName}`);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    // Directory already exists or permission error
  }
}

export async function startService(serviceName: string): Promise<{ success: boolean; message: string }> {
  const service = SERVICES[serviceName];
  if (!service) {
    return { success: false, message: `Unknown service: ${serviceName}` };
  }

  try {
    const isRunning = await isContainerRunning(serviceName);
    if (isRunning) return { success: true, message: 'Already running' };

    if (service.type === 'standalone') {
      await ensureDataDir(serviceName);
      
      const configs: Record<string, string[]> = get_configs(VOL_DIR)

      const args = configs[serviceName];
      if (!args) {
        return { success: false, message: 'Configuration not found' };
      }

      const result = await execCommand('docker', args, { stdio: 'inherit' });
      
      if (result.code === 0) {
        return { success: true, message: `Started on ports: ${service.ports}` };
      }
      
      const errorMsg = result.stderr || result.stdout;
      return { 
        success: false, 
        message: errorMsg.split('\n')[0].substring(0, 100) 
      };
    } else {
      // Compose services
      const file_path = compose_stacks()[serviceName]
      const composeFile = path.join(PROJECT_ROOT, 'config', serviceName, file_path.compose_file) ;
    //   console.log(composeFile, typeof composeFile)
      
      try {
        await fs.access(composeFile);
      } catch {
        return { 
          success: false, 
          message: `Config file not found: config/${serviceName}/docker-compose.yml` 
        };
      } 

      const result = await execCommand('docker compose', [
        '-f', composeFile,
        'up', '-d',
      ], {
        stdio: 'inherit'
      });

      if (result.code === 0) {
        return { success: true, message: `Started on ports: ${service.ports}` };
      }
      
      const errorMsg = result.stderr || result.stdout;
      return { 
        success: false, 
        message: errorMsg.split('\n')[0].substring(0, 100) 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

export async function stopService(serviceName: string): Promise<{ success: boolean; message: string }> {
  const service = SERVICES[serviceName];
  if (!service) {
    return { success: false, message: `Unknown service: ${serviceName}` };
  }

  try {
    if (service.type === 'standalone') {
      const isRunning = await isContainerRunning(serviceName);
      if (!isRunning) {
        return { success: true, message: 'Already stopped' };
      }

      await execCommand('docker', ['stop', serviceName]);
      await execCommand('docker', ['rm', serviceName]);
      
      return { success: true, message: 'Stopped successfully' };
    } else {
        const file_path = compose_stacks()[serviceName]
      const composeFile = path.join(PROJECT_ROOT, 'config', serviceName, file_path.compose_file);
      
        // console.log(JSON.stringify({
        //     composeFile, record: file_path
        // }, null , 2))

      const result = await execCommand('docker compose', [
        '-f', composeFile,
        'down',
      ], {
        stdio: 'inherit'
      });

      if (result.code === 0) {
        return { success: true, message: 'Stopped successfully' };
      }
      
      return { success: false, message: 'Failed to stop' };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

export async function restartService(serviceName: string): Promise<{ success: boolean; message: string }> {
  const stopResult = await stopService(serviceName);
  if (!stopResult.success && stopResult.message !== 'Already stopped') {
    return stopResult;
  }
  
  // Small delay to ensure clean restart
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return startService(serviceName);
}

export async function getServiceLogs(
  serviceName: string, 
  lines: number = 50
): Promise<string> {
  const service = SERVICES[serviceName];
  if (!service) {
    return `Unknown service: ${serviceName}`;
  }

  if (service.type === 'standalone') {
    const { stdout, stderr } = await execCommand('docker', [
      'logs',
      '--tail', lines.toString(),
      serviceName,
    ]);
    return stdout || stderr || 'No logs available';
  } else {
    const composeFile = path.join(PROJECT_ROOT, 'config', serviceName, 'docker-compose.yml');
    const { stdout, stderr } = await execCommand('docker-compose', [
      '-f', composeFile,
      'logs',
      '--tail', lines.toString(),
    ]);
    return stdout || stderr || 'No logs available';
  }
}

export async function getServiceStats(serviceName: string): Promise<{
  cpu: string;
  memory: string;
  network: string;
} | null> {
  try {
    const { stdout, code } = await execCommand('docker', [
      'stats',
      '--no-stream',
      '--format',
      '{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}',
      serviceName,
    ]);

    if (code !== 0) return null;

    const [cpu, memory, network] = stdout.trim().split('\t');
    return { cpu, memory, network };
  } catch {
    return null;
  }
}

export { PROJECT_ROOT };