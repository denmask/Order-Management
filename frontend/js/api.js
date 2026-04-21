const API = "http://localhost:3000/api";

const apiGet    = (path)       => fetch(API + path).then(r => r.json());
const apiPost   = (path, data) => fetch(API + path, { method:"POST",   headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json());
const apiPut    = (path, data) => fetch(API + path, { method:"PUT",    headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json());
const apiDelete = (path)       => fetch(API + path, { method:"DELETE" }).then(r => r.json());