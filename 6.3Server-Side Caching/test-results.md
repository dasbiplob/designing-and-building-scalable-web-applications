# Performance test results

Brief description of the used server (choose one): HTTP/1.1 / HTTP/2

Brief description of your computer: TODO

## No Redis Cache

### Retrieving todos

http_reqs: 68809
http_req_duration - median: 1.43ms
http_req_duration - 99th percentile: 3.45ms

## Redis Cache

### Retrieving todos

http_reqs: 70157
http_req_duration - median: 1.4ms
http_req_duration - 99th percentile: =3.48ms

## Reflection

Brief reflection on the results of the tests -- why do you think you saw the results you saw: TODO
