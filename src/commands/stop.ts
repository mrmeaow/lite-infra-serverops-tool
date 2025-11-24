import chalk from "chalk";
import enquirer from "enquirer";
import { SERVICES, stopService } from "../core.js";

const prompt = enquirer.prompt;

export async function stopServices(): Promise<void> {
  const serviceList = Object.values(SERVICES);

  const answer = await prompt<{ services: string[] }>({
    type: "multiselect",
    name: "services",
    message: "Select services to stop:",
    choices: serviceList.map((s) => ({
      name: s.name,
      message: s.displayName,
    })),
  });

  if (answer.services.length === 0) {
    console.log(chalk.yellow("\n⚠ No services selected\n"));
    return;
  }

  console.log("");
  for (const service of answer.services) {
    const result = await stopService(service);
    const icon = result.success ? chalk.green("✓") : chalk.red("✗");
    console.log(`${icon} ${service.padEnd(12)} ${result.message}`);
  }
  console.log("");
}
