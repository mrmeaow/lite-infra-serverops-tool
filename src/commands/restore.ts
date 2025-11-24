import chalk from "chalk";
import enquirer from "enquirer";
import { SERVICES } from "../core.js";

const prompt = enquirer.prompt;

export async function restoreServices(): Promise<void> {
  const backupServiceList = Object.values(SERVICES).filter(
    (s) => s.name === "postgres" || s.name === "mongodb" || s.name === "redis",
  );

  if (backupServiceList.length === 0) {
    console.log(chalk.yellow("\n⚠ No restorable services\n"));
    return;
  }

  const serviceAnswer = await prompt<{ service: string }>({
    type: "select",
    name: "service",
    message: "Select service:",
    choices: backupServiceList.map((s) => ({
      name: s.displayName,
      value: s.name,
    })),
  });

  const backupAnswer = await prompt<{ backup: string }>({
    type: "select",
    name: "backup",
    message: "Select backup:",
    choices: [
      {
        name: "(demo) backup_2024-01-15_14-32-45",
        value: "backup_2024-01-15_14-32-45",
      },
      {
        name: "(demo) backup_2024-01-14_10-12-30",
        value: "backup_2024-01-14_10-12-30",
      },
    ],
  });

  const confirmAnswer = await prompt<{ confirm: boolean }>({
    type: "confirm",
    name: "confirm",
    message: "Overwrite data?",
  });

  if (!confirmAnswer.confirm) {
    console.log(chalk.yellow("\nCancelled\n"));
    return;
  }

  console.log(chalk.green("\n✓ [Not implemented yet.] Restore complete\n"));
}
