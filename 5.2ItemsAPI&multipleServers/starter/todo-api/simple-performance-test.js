import http from "k6/http";

export const options = {
  duration: "5s",
  vus: 10,
  summaryTrendStats: ["avg", "p(99)"],
};

export default function () {
  http.get("http://localhost:7777");
  http.get("http://localhost:7777/items");
  http.post(
    "http://localhost:7777/items",
    JSON.stringify({ name: "hamburger" })
  );
}
