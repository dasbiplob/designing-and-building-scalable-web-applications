# Performance test results

Brief description of the used server (choose one): HTTP/1.1 / HTTP/2

Brief description of your computer: TODO

## No database

### Retrieving todos

http_reqs: 128814
http_req_duration - median: avg=756.97µs
http_req_duration - 99th percentile: 1.22ms


### Posting todos

http_reqs: 123306
http_req_duration - median: 788.29µs
http_req_duration - 99th percentile: =1.47ms


## With database

### Retrieving todos

http_reqs: 70
http_req_duration - median: avg=1.55s
http_req_duration - 99th percentile: 2.86s 


### Posting todos

http_reqs: 70694  7068.674754/s
http_req_duration - median: avg=1.39ms
http_req_duration - 99th percentile: 3.03ms


## Reflection

Brief reflection on the results of the tests -- why do you think you saw the results you saw: TODO
