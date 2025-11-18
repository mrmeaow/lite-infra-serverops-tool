import chalk from 'chalk';
import enquirer from 'enquirer';
import { SERVICES } from '../core.js';

const prompt = enquirer.prompt;

export async function backupServices(): Promise<void> {
  const backupServiceList = Object.values(SERVICES).filter(
    (s) => s.name === 'postgres' || s.name === 'mongodb' || s.name === 'redis'
  );

  if (backupServiceList.length === 0) {
    console.log(chalk.yellow('\n⚠ No backupable services\n'));
    return;
  }

  const answer = await prompt<{ services: string[] }>({
    type: 'multiselect',
    name: 'services',
    message: 'Select services to backup:',
    choices: backupServiceList.map((s) => ({
      name: s.displayName,
      value: s.name,
    })),
  });

  if (answer.services.length === 0) {
    console.log(chalk.yellow('\n⚠ No services selected\n'));
    return;
  }

  console.log('\n✓ (Not Implemented yet.) Backups created\n');
}
