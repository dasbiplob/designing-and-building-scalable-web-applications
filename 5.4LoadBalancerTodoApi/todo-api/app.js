import postgres from "https://deno.land/x/postgresjs@v3.4.2/mod.js";
const sql = postgres({});

const handleGetItem = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const items = await sql`SELECT * FROM todos WHERE id = ${id}`;

  if (items.length === 0) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  return Response.json(items[0]);
};

const handleDeleteItem = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const items = await sql`DELETE FROM todos WHERE id = ${id} RETURNING *`;
  if (result.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  // assuming that there's always an item that matches the id
  return Response.json(items[0]);
};

const handleGetItems = async (request) => {
  const items = await sql`SELECT * FROM todos`;
  return Response.json(items);
};

const handlePostItems = async (request) => {
  try {
    // assuming that the request has a json object and that
    // the json object has a property named 'item'
    const item = await request.json();

    // Check if 'item' property exists and is not empty
    if (!item || typeof item.item !== "string" || item.item.trim() === "") {
      return new Response("Invalid data. 'item' property is required and must be a non-empty string", { status: 400 });
    }

    await sql`INSERT INTO todos (item) VALUES (${item.item})`;
    return new Response("OK", { status: 200 });
  } catch (e) {
    //console.error(e);
    return new Response("Invalid data", { status: 400 });
  }
};


const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleGetItem,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handleGetItems,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostItems,
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleDeleteItem,
  }
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  try {
    return await mapping.fn(request, mappingResult);
  } catch (e) {
    console.log(e);
    return new Response(e.stack, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
};


//const portConfig = { port: 7777,  };
Deno.serve({ port: 7777}, handleRequest);
