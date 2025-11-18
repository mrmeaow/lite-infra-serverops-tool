import chalk from 'chalk';
import enquirer from 'enquirer';
import { SERVICES, startService } from '../core.js';

const prompt = enquirer.prompt;

export async function startServices(): Promise<void> {
  const serviceList = Object.values(SERVICES);
  const defaults = serviceList
    .filter((s) => s.isDefault)
    .map((s) => s.name);

  const answer = await prompt<{ services: string[] }>({
    type: 'multiselect',
    name: 'services',
    message: 'Select services to start:',
    choices: serviceList.map((s) => ({
      name: s.name,
      message: `${s.displayName} (${s.type})`,
      selected: defaults.includes(s.name),
    })),
  });

//   console.log(JSON.stringify(answer, null, 2))

  if (answer.services.length === 0) {
    console.log(chalk.yellow('\n⚠ No services selected\n'));
    return;
  }

  console.log(''); 
  for (const service of answer.services) {
    let result = await startService(service); 
    let icon = result.success ? chalk.green('✓') : chalk.red('✗'); 
    console.log(`${icon} ${service.padEnd(12)} ${result.message}`);
  } 
  console.log(''); 
}
