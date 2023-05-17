"use strict";

const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate prepares JSON data submitted by user to be used
 * in SQL queries to update a part of a record in the database.
 *
 * It takes as input some JSON, for example: {firstName: 'Aliya', age: 32}
 *
 * It returns an object with two properties. setCols is a string, and values
 * is an array. It looks like:
  * {
      setCols: '"first_name"=$1', '"age"=$2',
      values: ['Aliya', 32],
    }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
