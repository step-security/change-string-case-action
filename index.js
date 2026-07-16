const core = require('@actions/core');
const fs = require('fs');
const axios = require('axios');

async function validateSubscription() {
  let repoPrivate;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    repoPrivate = payload?.repository?.private;
  }

  const upstream = "ASzc/change-string-case-action";
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl =
    "https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions";

  core.info("");
  core.info("StepSecurity Maintained Action");
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false)
    core.info("✓ Free for public repositories");
  core.info(`Learn more: ${docsUrl}`);
  core.info("");

  if (repoPrivate === false) return;
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const body = { action: action || "" };
  if (serverUrl !== "https://github.com") body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body,
      { timeout: 3000 },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      core.error(
        "This action requires a StepSecurity subscription for private repositories.",
      );
      core.error(`Learn how to enable a subscription: ${docsUrl}`);
      process.exit(1);
    }
    core.info("Timeout or API not reachable. Continuing to next step.");
  }
}

async function run() {
  await validateSubscription();
  try {
    const inputStr = core.getInput('string');
    console.log(`Manipulating string: ${inputStr}`);

    const lowercase = inputStr.toLowerCase();
    console.log(`lowercase: ${lowercase}`);
    core.setOutput("lowercase", lowercase);

    const uppercase = inputStr.toUpperCase();
    console.log(`uppercase: ${uppercase}`);
    core.setOutput("uppercase", uppercase);

    const capitalized = inputStr.charAt(0).toUpperCase() + inputStr.slice(1).toLowerCase();
    console.log(`capitalized: ${capitalized}`);
    core.setOutput("capitalized", capitalized);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
