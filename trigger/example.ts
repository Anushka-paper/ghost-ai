import { task } from "@trigger.dev/sdk";

export const exampleTask = task({
  id: "example-task",
  run: async (payload: { name: string }) => {
    console.log(`Trigger.dev example running for ${payload.name}`);
    return { message: `Processed ${payload.name}` };
  },
});
