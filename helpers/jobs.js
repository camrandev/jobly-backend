"use strict";

/** queryToWhereSQL takes a query object and returns data that can be used to
 * make a SQL WHERE query (used in the findAll method in jobs.js models).
 *
 * It takes as input a query object that can have up to three keys: title,
 * minSalary, and hasEquity
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

    if (colName === "title") {
      whereValues.push(queryObject[colName]);
      return `title ILIKE '%' || $${idx + 1} || '%'`;
    } else if (colName === "minSalary") {
      whereValues.push(queryObject[colName]);
      return `salary >= $${idx + 1}`;
    } else if (colName === "hasEquity") {
      whereValues.push(queryObject[colName]);
      return `equity > $${idx + 1}`;
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
