const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");
const bodyDataHas = require("../services/bodyDataHas");

function read(req, res) {

}

function update(req, res, next) {

}

function destroy(req, res) {

}

module.exports = {
  read,
  update,
  delete: [destroy]
}