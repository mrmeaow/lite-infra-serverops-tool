import chalk from 'chalk';
import { SERVICES, isContainerRunning } from '../core.js';

export async function statusServices(): Promise<void> {
  console.log('');

  const serviceList = Object.values(SERVICES);

  for (const service of serviceList) {
    // console.log(`SERVICE NAME: {${service.type}} [${service.displayName}] ${service.name}`)
    const isRunning = await isContainerRunning(service.name);
    const status = isRunning ? chalk.green('●') : chalk.gray('○');
    const ports = Array.isArray(service.ports) ? service.ports.join(', ') : service.ports;

    console.log(`${status} ${service.displayName.padEnd(30)} ${ports.padEnd(20)} ${isRunning ? chalk.green('running') : 'stopped'}`);
  }

  return;
}
