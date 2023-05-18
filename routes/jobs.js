"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureUserIsAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * Job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: isAdmin
 */
router.post(
  "/",
  ensureUserIsAdmin,
  async function (req, res, next) {
    const validator = jsonschema.validate(req.body, jobNewSchema, {
      required: true,
    });
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  });

/** GET /  =>
 *   { job: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const jobs = await Job.findAll();

  return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * Fields can be: { title, salary, equity, company }
 *
 * Returns { id, title, salary, equity, company }
 *
 * Authorization required: isAdmin
 */
router.patch(
  "/:id",
  ensureUserIsAdmin,
  async function (req, res, next) {
    const validator = jsonschema.validate(req.body, jobUpdateSchema, {
      required: true,
    });

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  });

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: isAdmin
 */
router.delete(
  "/:id",
  ensureUserIsAdmin,
  async function (req, res, next) {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  });

module.exports = router;
