"use strict";

/** queryToWhereSQL takes a query object and returns data that can be used to
 * make a SQL WHERE query.
 *
 * It takes as input a query object that can have up to three keys: nameLike,
 * minEmployees, and maxEmployees
 *
 * It returns an object that looks like:
 * {
    whereSQL: string,
    whereValues: array,
   }
 */

function queryToWhereSQL(queryObject) {
  const keys = Object.keys(queryObject);
  let whereValues = [];

  const whereSql = keys.map((colName, idx) => {

    if (colName === "nameLike") {
      console.log("colName is running");
      whereValues.push(queryObject[colName]);
      return `name ILIKE '%' || $${idx + 1} || '%'`;
    } else if (colName === "minEmployees") {
      whereValues.push(queryObject[colName]);
      return `num_employees >= $${idx + 1}`;
    } else if (colName === "maxEmployees") {
      whereValues.push(queryObject[colName]);
      return `num_employees <= $${idx + 1}`;
    }
  });

  const whereQuery =
    Object.keys(queryObject).length === 0
      ? ""
      : `WHERE ${whereSql.filter(Boolean).join(" AND ")}`;

  return {
    whereSQL: whereQuery,
    whereValues: whereValues,
  };
}

module.exports = { queryToWhereSQL };
