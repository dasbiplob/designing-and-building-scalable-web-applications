import { createClient } from "npm:redis@4.6.4";

const client = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000,
});

await client.connect();
await client.subscribe(
  "secret-channel",
  (message, channel) => console.log(message, channel),
);
