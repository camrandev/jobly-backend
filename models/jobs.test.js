"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "t4",
    salary: 20,
    equity: "0.8",
    companyHandle: "c1",
  };

  test("works", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 't4'`);
    expect(result.rows[0]).toEqual(
      {
        id: 4,
        title: "t4",
        salary: 20,
        equity: "0.8",
        company_handle: "c1",
      },
    );
  });

  test("bad request with duplicate job", async function () {
    console.log("job object", newJob);
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      console.log("err", err.status);
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: 1,
        title: "t1",
        salary: 5,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        id: 2,
        title: "t2",
        salary: 10,
        equity: "0.4",
        companyHandle: "c2"
      },
      {
        id: 3,
        title: "t3",
        salary: 15,
        equity: "0.6",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "t1",
      salary: 5,
      equity: "0.2",
      company: {
        description: "Desc1",
        handle: "c1",
        logoUrl: "http://c1.img",
        name: "C1",
        numEmployees: 1,
      },
    });
  });

  test("not found if no job with id", async function () {
    try {
      await Job.get(-1);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New Title",
    salary: 1111,
    equity: 0.99,
    companyHandle: "c2",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "New Title",
      salary: 1111,
      equity: "0.99",
      companyHandle: "c2",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New Title",
      salary: 1111,
      equity: "0.99",
      company_handle: "c2",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New Title",
      salary: null,
      equity: null,
      companyHandle: "c2",
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      title: "New Title",
      salary: null,
      equity: null,
      companyHandle: "c2",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New Title",
      salary: null,
      equity: null,
      company_handle: "c2",
    }]);
  });

  test("not found if no job with this id", async function () {
    try {
      await Job.update(-1, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no job with id", async function () {
    try {
      await Job.remove(-1);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
