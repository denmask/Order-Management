const { knex } = require("../database");

const getAll = () => knex("clienti").orderBy("cognome");
const getById = (id) => knex("clienti").where({ id }).first();
const create = (data) => knex("clienti").insert(data);
const update = (id, data) => knex("clienti").where({ id }).update(data);
const remove = (id) => knex("clienti").where({ id }).delete();

module.exports = { getAll, getById, create, update, remove };