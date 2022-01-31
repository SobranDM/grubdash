const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");
const bodyDataHas = require("../services/bodyDataHas");

const VALID_STATUSES = [ "pending", "preparing", "out-for-delivery", "delivered" ];

function dishesIsArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length < 1) {
    return next({ status: 400, message: `The dishes array cannot be empty.`})
  }
  if (!Array.isArray(dishes)) {
    return next({ status: 400, message: `The dishes key must be an array.`});
  }
  next();
}

function isPending(req, res, next) {
  if (res.locals.foundOrder.status === "pending") {
    next();
  }
  next({
    status: 400,
    message: `An order can only be deleted if the status is pending. Order status: ${res.locals.foundOrder.status}.`
  });
}

function statusValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (VALID_STATUSES.includes(status)) {
    next();
  }
  next({ status: 400, message: `The status is invalid. Must be one of: ${VALID_STATUSES.join(", ")}`});
}

function dishesHaveQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  for (let i = 0; i < dishes.length; i++) {
    if (!dishes[i].quantity || dishes[i].quantity <= 0 || typeof(dishes[i].quantity) != 'number') {
      return next({
        status: 400, message: `Each dish must have a quantity greater than 0. Dish ${i} does not.`
      });
    }
  }
  next();
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  if (foundOrder) {
    res.locals.foundOrder = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`
  });
}

function list(req, res) {
  res.status(200).json({ data: orders });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes
  }
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  res.status(200).json({ data: res.locals.foundOrder });
}

function idMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (id != orderId) {
      return next({
        status: 400,
        message: `Order id in url (${orderId}) does not match id in request body (${id})`
      });
    }
    next();
  }
  next();
}

function update(req, res, next) {
  const { orderId } = req.params;
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  const index = orders.findIndex(order => order.id === orderId);
  orders[index] = {
    id: orderId,
    deliverTo,
    mobileNumber,
    dishes,
    status
  }
  res.status(200).json({ data: orders[index] });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex(order => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesIsArray,
    dishesHaveQuantity,
    create
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    bodyDataHas("status"),
    idMatches,
    dishesIsArray,
    dishesHaveQuantity,
    statusValid,
    update
  ],
  delete: [orderExists, isPending, destroy]
}