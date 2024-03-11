import { createClient } from "npm:redis@4.6.4";
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";

const client = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000,
})

await client.connect();

const handleRequest = async (request) => {
  const url = new URL(request.url);
  if (url.pathname == "/publish") {
    client.publish("secret-channel", "hello!");
    return new Response("Data published!");
  }

  return new Response("Hello!");
};

serve(handleRequest, { port: 7777 });
