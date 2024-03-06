import { postgres } from "./deps.js";

const sql = postgres({});

const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${ SERVER_ID }`);
};

const handleGetItem = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const items = await sql`SELECT * FROM items WHERE id = ${id}`;

  // assuming that there's always an item that matches the id
  return Response.json(items[0]);
};

const handleGetItems = async (request) => {
  const items = await sql`SELECT * FROM items`;
  return Response.json(items);
};

const handlePostItems = async (request) => {
  // assuming that the request has a json object and that
  // the json object has a property name
  const item = await request.json();

  await sql`INSERT INTO items (name) VALUES (${item.name})`;
  return new Response("OK", { status: 200 });
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/items/:id" }),
    fn: handleGetItem,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/items" }),
    fn: handleGetItems,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/items" }),
    fn: handlePostItems,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot,
  },
];

const handleRequest = async (request) => {
    const mapping = urlMapping.find(
      (um) => um.method === request.method && um.pattern.test(request.url)
    );
  
    if (!mapping) {
      return new Response("Not found", { status: 404 });
    }
  
    const mappingResult = mapping.pattern.exec(request.url);
    try {
      return await mapping.fn(request, mappingResult);
    } catch (e) {
      console.log(e);
      return new Response(e.stack, { status: 500 })
    }
  };

const portConfig = { port: 7777, hostname: '0.0.0.0' };
Deno.serve(portConfig, handleRequest);
