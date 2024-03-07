import { postgres } from "../deps.js";

const sql = postgres({});

const getItem = async (id) => {
  const items = await sql`SELECT * FROM todos WHERE id = ${id}`;
  return items[0];
};

const getItems = async () => {
  return await sql`SELECT * FROM todos`;
};

const addItem = async (item) => {
      await sql`INSERT INTO todos (item) VALUES (${item})`;
};

export { getItem, getItems, addItem };
