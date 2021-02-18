const { metacall_load_from_memory, metacall } = require('metacall');

metacall_load_from_memory('rpc', 'http://localhost:3051');

console.log(metacall('sum', 3, 4)); // 7

console.log(metacall('mult', 3, 4)); // 12
