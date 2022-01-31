const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const bodyDataHas = require("../services/bodyDataHas");

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
  if (foundDish) {
    res.locals.foundDish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`
  })
}

function priceGreaterThanZero(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || typeof(price) != 'number') {
    return next({
      status: 400, message: `The price must be a number and greater than zero.`
    });
  }
  return next();
}

function list(req, res) {
  res.status(200).json({ data: dishes });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  }
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.status(200).json({ data: res.locals.foundDish });
}

function update(req, res, next) {
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (id) {
    if (id != dishId) {
      return next({
        status: 400,
        message: `Dish id in url (${dishId} does not match id in request body (${id})`
      });
    }
  }
  const index = dishes.findIndex(dish => dish.id === dishId);
  dishes[index] = {
    id: dishId,
    name,
    description,
    price,
    image_url
  }
  res.status(200).json({ data: dishes[index] });
}

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceGreaterThanZero,
    create
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    priceGreaterThanZero,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    update
  ]
}