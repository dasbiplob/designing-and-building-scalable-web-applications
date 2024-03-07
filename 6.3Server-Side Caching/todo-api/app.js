import * as todoService from "./services/todoService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const cachedTodoService = cacheMethodCalls(todoService, ["addItem"]);

const handleGetItem = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  return Response.json(await cachedTodoService.getItem(id));
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
  return Response.json(await cachedTodoService.getItems());
};

const handlePostItems = async (request) => {
  try {
     // assuming that the request has a json object and that
  // the json object has a property name
  const item = await request.json();
  await cachedTodoService.addItem(item.item);
  return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(e);
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
