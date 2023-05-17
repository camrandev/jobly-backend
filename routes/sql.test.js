"use strict";

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

const DATA_TO_UPDATE = { firstName: "Aliya", age: 32 };
const JS_TO_SQL = {
  firstName: "first_name",
};

describe("sqlForPartialUpdate", function () {
  test("works: returns expected data", function () {
    const result = sqlForPartialUpdate(DATA_TO_UPDATE, JS_TO_SQL)
    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32],
    });
  });

  test("no JSON data: throws 400 BadRequestError", function () {
    expect(() => {
      sqlForPartialUpdate({}, JS_TO_SQL);
    }).toThrow(BadRequestError);
  });

  // test("works: default no admin", function () {
  //   // given the security risk if this didn't work, checking this specifically
  //   const token = createToken({ username: "test" });
  //   const payload = jwt.verify(token, SECRET_KEY);
  //   expect(payload).toEqual({
  //     iat: expect.any(Number),
  //     username: "test",
  //     isAdmin: false,
  //   });
  // });
});
