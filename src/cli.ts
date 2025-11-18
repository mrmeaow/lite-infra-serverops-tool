#!/usr/bin/env node
import chalk from 'chalk';
import enquirer from 'enquirer';
import { SERVICES, getRunningServices, isDockerAvailable } from './core.js';
import { startServices } from './commands/start.js';
import { stopServices } from './commands/stop.js';
import { restartServices } from './commands/restart.js';
import { statusServices } from './commands/status.js';
import { backupServices } from './commands/backup.js';
import { restoreServices } from './commands/restore.js';


const { prompt } = enquirer;


async function checkDockerInstallation(): Promise<void> {
  const available = await isDockerAvailable();
  if (!available) {
    console.log(chalk.red('\n✗ Docker is not available'));
    console.log(chalk.yellow('Please install Docker and try again'));
    console.log(chalk.blue('Visit: https://docs.docker.com/get-docker/\n'));
    process.exit(1);
  }
}

function showHeader(): void {
  console.log(chalk.cyan('\n╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.white('          🚀       Lite Infra. Manager         🚀         ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════════════════════╝\n'));
}

async function showStatus(): Promise<void> {
  const running = await getRunningServices();
  const total = Object.keys(SERVICES).length;
  
  console.log(chalk.gray('━'.repeat(60)));
  console.log(
    chalk.white('Status: ') +
    chalk.green(`${running.length} running`) +
    chalk.gray(' / ') +
    chalk.white(`${total} total`)
  );
  
  if (running.length > 0) {
    console.log(
      chalk.white('Active: ') + 
      chalk.green(running.map(s => SERVICES[s].displayName).join(', '))
    );
  }
  
  console.log(chalk.gray('━'.repeat(60)) + '\n');
}

async function mainMenu(): Promise<void> {
  console.clear();
  showHeader();
  await showStatus();

  const answer = await prompt<{menu: string}>({
    type: 'select',
    name: 'menu',
    message: 'What would you like to do?',
    choices: [
      { message: '📦 Create Services', name: 'start' },
      { message: '🛑 Stop Services', name: 'stop' },
      { message: '🔄 Start/Restart Services', name: 'restart' },
      { message: '📊 View Status', name: 'status' },
      { message: '💾 Backup Service', name: 'backup' },
      { message: '📥 Restore Service', name: 'restore' },
      { message: '❌ Exit', name: 'exit' },
    ],
  });

//   console.log('# DEBUG: ', answer)
//   setTimeout(() => {}, 1000 * 2)

  if (answer.menu.toLowerCase() === 'exit') {
    console.log(chalk.green('\n👋 Goodbye!\n'));
    process.exit(0);
  }

  console.log();

  try {
    switch (answer.menu.toLowerCase()) {
      case 'start':
        await startServices();
        break;
      case 'stop':
        await stopServices();
        break;
      case 'restart':
        await restartServices();
        break;
      case 'status':
        await statusServices();
        break;
      case 'backup':
        await backupServices();
        break;
      case 'restore':
        await restoreServices();
        break;
    }
  } catch (error) {
    console.log(chalk.red('\n✗ Command failed:'), (error as Error).message);
  }

  console.log('');
  const continueAnswer = await prompt<{ continue: boolean }>({
    type: 'confirm',
    name: 'continue',
    message: 'Return to main menu?',
    initial: true,
  });

  if (continueAnswer.continue) {
    await mainMenu();
  } else {
    console.log(chalk.green('\n👋 Goodbye!\n'));
    process.exit(0);
  }
}

async function main(): Promise<void> {
  await checkDockerInstallation();
  await mainMenu();
}

await main().catch((err) => {
  if (err.message === '') {
    console.log(chalk.yellow('\n\n⚠ Cancelled by user\n'));
    process.exit(0);
  }
  console.error(chalk.red('\n✗ Error:'), err.message);
  process.exit(1);
});