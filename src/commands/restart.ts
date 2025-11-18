import chalk from 'chalk';
import enquirer from 'enquirer';
import { SERVICES, restartService } from '../core.js';


const { prompt } = enquirer

export async function restartServices(): Promise<void> {
  const serviceList = Object.values(SERVICES);

  const answer = await prompt<{ services: string[] }>({
    type: 'multiselect',
    name: 'services',
    message: 'Select services to restart:',
    choices: serviceList.map((s) => ({
      name: s.name,
      message: s.displayName,
    })),
  });

  if (answer.services.length === 0) {
    console.log(chalk.yellow('\n⚠ No services selected\n'));
    return;
  }

  console.log('');
  for (const service of answer.services) {
    let result = await restartService(service); 
    let icon = result.success ? chalk.green('✓') : chalk.red('✗'); 
    console.log(`${icon} ${service.padEnd(12)} ${result.message}`);
    // if (result.success && service === 'portainer') {
    //     // spin up the agent as well...
    //     result = await restartService('portainer_agent')
    //     icon = result.success ? chalk.green('✓') : chalk.red('✗')
    //     console.log(`${icon} ${service.padEnd(12)} ${result.message}`);
    // }
  } 
  console.log('');
}
