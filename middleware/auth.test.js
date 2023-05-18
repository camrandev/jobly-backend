"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError, BadRequestError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureUserIsAdmin,
  ensureAdminOrCurrent,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const adminJwt = jwt.sign({ username: "adminUser", isAdmin: true }, SECRET_KEY);
const nonAdminJwt = jwt.sign({ username: "notAdminUser", isAdmin: false }, SECRET_KEY);

function next(err) {
  if (err) throw new Error("Got error from middleware");
}


describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});


describe("ensureUserIsAdmin", function () {
  test("works if user is admin", function () {
    const req = { headers: { authorization: `Bearer ${adminJwt}` } };
    const res = { locals: { user: { username: "adminUser", isAdmin: true } } };
    ensureUserIsAdmin(req, res, next);
    expect(res.locals).toEqual({
      user: {
        username: "adminUser",
        isAdmin: true,
      },
    });
  });

  test("unauth if user is not admin", function () {
    const req = { headers: { authorization: `Bearer ${nonAdminJwt}` } };
    const res = { locals: { user: { username: "notAdminUser" } } };
    expect(() => ensureUserIsAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if isAdmin exists but is not true", function () {
    const req = { headers: { authorization: `Bearer ${adminJwt}` } };
    const res = { locals: { user: { username: "adminUser", isAdmin: "taco" } } };
    expect(() => ensureUserIsAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("badrequest if res.locals is empty object", function () {
    const req = { headers: { authorization: `Bearer ${adminJwt}` } };
    const res = { locals: { user: {} }};
    expect(() => ensureUserIsAdmin(req, res, next))
      .toThrow(BadRequestError);
  });
});


describe("ensureAdminOrCurrent", function () {
  test("works if user is admin but not current", function () {
    const req = {
      headers: { authorization: `Bearer ${adminJwt}` },
      params: { username: "test" },
    };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    ensureAdminOrCurrent(req, res, next);
    expect(res.locals).toEqual({
      user: {
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works if user is current but not admin", function () {
    const req = {
      headers: { authorization: `Bearer ${nonAdminJwt}` },
      params: { username: "notAdminUser" },
    };
    const res = { locals: { user: { username: "notAdminUser", isAdmin: false } } };
    ensureAdminOrCurrent(req, res, next);
    expect(res.locals).toEqual({
      user: {
        username: "notAdminUser",
        isAdmin: false,
      },
    });
  });

  test("unauth if user is not admin and not current", function () {
    const req = {
      headers: { authorization: `Bearer ${nonAdminJwt}` },
      params: { username: "notAdminUser" },
    };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    expect(() => ensureAdminOrCurrent(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if isAdmin exists but is not true", function () {
    const req = {
      headers: { authorization: `Bearer ${adminJwt}` },
      params: { username: "adminUser" },
    };
    const res = { locals: { user: { username: "test", isAdmin: "taco" } } };
    expect(() => ensureAdminOrCurrent(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("badrequest if res.locals is empty object", function () {
    const req = {
      headers: { authorization: `Bearer ${adminJwt}` },
      params: { username: "adminUser" },
    };
    const res = { locals: { user: {} }};
    expect(() => ensureAdminOrCurrent(req, res, next))
      .toThrow(BadRequestError);
  });
});