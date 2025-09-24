const core = require("@actions/core");
const axios = require("axios");

(async () => {
  try {
    await validateSubscription();

    const inputStr = core.getInput("string");
    console.log(`Manipulating string: ${inputStr}`);

    const lowercase = inputStr.toLowerCase();
    console.log(`lowercase: ${lowercase}`);
    core.setOutput("lowercase", lowercase);

    const uppercase = inputStr.toUpperCase();
    console.log(`uppercase: ${uppercase}`);
    core.setOutput("uppercase", uppercase);

    const capitalized =
      inputStr.charAt(0).toUpperCase() + inputStr.slice(1).toLowerCase();
    console.log(`capitalized: ${capitalized}`);
    core.setOutput("capitalized", capitalized);
  } catch (error) {
    core.setFailed(error.message);
  }
})();

async function validateSubscription() {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;

  try {
    await axios.get(API_URL, { timeout: 3000 });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error(
        "Subscription is not valid. Reach out to support@stepsecurity.io"
      );
      process.exit(1);
    } else {
      core.info("Timeout or API not reachable. Continuing to next step.");
    }
  }
}
