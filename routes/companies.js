"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companyFilterSchema = require("../schemas/companyFilter.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */
router.post("/", ensureLoggedIn, async function (req, res, next) {
  //TODO: admin only
  const validator = jsonschema.validate(req.body, companyNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.create(req.body);
  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters in the query string:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 * *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const queryObject = {};

  // to figure out whether to move something into a helper file, ask:
    // will you be using this function in multiple places?

  // turns query string into object, uses JSONSchema to validate
  if (Object.keys(req.query).length !== 0) {

    // another option instead of creating a new object on line 52
      // assign req.query to a variable
      // check for each criteria, if exists, cast that into desired type and mutate variable
    for (const key in req.query) {
      queryObject[key] = Number(req.query[key]) || req.query[key];
    }

    //TODO: move into models
    if (queryObject.minEmployees > queryObject.maxEmployees) {
      throw new BadRequestError("minEmployees needs to be less than or equal to maxEmployees.");
    }

    const validator = jsonschema.validate(queryObject, companyFilterSchema, {
      required: true,
    });

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  }

  // queryObject is an {} with keys that were found in query string
  const companies = await Company.findAll(queryObject);

  return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */
router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  //TODO: admin only
  const validator = jsonschema.validate(req.body, companyUpdateSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */
router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  //TODO:admin only
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});

module.exports = router;
