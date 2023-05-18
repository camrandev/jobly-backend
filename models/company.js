"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `
        SELECT handle
        FROM companies
        WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   *
   * Takes as input a queryObject, which is an object with up to three keys:
   * name, maxEmployees, and minEmployees
   * */

  static async findAll(queryObject) {
    // TODO: move the where builder into a helper function
    const keys = Object.keys(queryObject);
    let whereValues = Object.values(queryObject);

    // TODO: beware the sql injection! (return an array of wherequery and values)
    const whereSql = keys.map((colName, idx) => {
      // let whereClause;

      if (colName === "nameLike") {
        return `name ILIKE '%' || $1 || '%'`;
      } else if (colName === "minEmployees") {
        return `num_employees >= $${idx + 1}`;
      } else if (colName === "maxEmployees") {
        return `num_employees <= $${idx + 1}`;
      }
      // console.log('whereClauseInsideMap=', whereClause)

      // return whereClause;
    });

    // console.log("whereSql=", whereSql)

    // console.log("WhereValues=", whereValues);

    // let whereQuery = [];
    // for (let criteria in queryObject) {
    //   if (criteria === "nameLike") {
    //     whereQuery.push(`name ILIKE '%${queryObject[criteria]}%'`);
    //   }
    //   if (criteria === "minEmployees") {
    //     whereQuery.push(`num_employees >= ${queryObject[criteria]}`);
    //   }
    //   if (criteria === "maxEmployees") {
    //     whereQuery.push(`num_employees <= ${queryObject[criteria]}`);
    //   }
    // }

    const whereQuery =
      Object.keys(queryObject).length === 0
        ? ""
        : `WHERE ${whereSql.join(" AND ")}`;

    console.log("where query=", whereQuery)

    const companiesRes = await db.query(
      `
    SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ${whereQuery}
        ORDER BY name`,
      whereValues
    );

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `
        SELECT handle,
        name,
        description,
        num_employees AS "numEmployees",
        logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE companies
    SET ${setCols}
    WHERE handle = ${handleVarIdx}
    RETURNING
    handle,
    name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
