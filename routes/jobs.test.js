"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  nonAdminToken,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
  const newJob = {
    title: "Cool job",
    salary: 999,
    equity: 0.5,
    companyHandle: "c1",
  };

  test("works for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    console.log('message from failing test', resp)

    expect(resp.statusCode).toEqual(201);

    console.log("resp body in test", resp.body);
    expect(resp.body.job).toEqual({
      id: expect.any(Number),
      title: "Cool job",
      salary: 999,
      equity: "0.5",
      companyHandle: "c1",
    });
  });

  test("unauthorized for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${nonAdminToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "Cool job",
        salary: 999,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: 100,
        salary: "tacos",
        equity: 0.5,
        companyHandle: "boyd-evans",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon user", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "t1",
          salary: 5,
          equity: "0.2",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "t2",
          salary: 10,
          equity: "0.4",
          companyHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "t3",
          salary: 15,
          equity: "0.6",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("ok for anon user with filtering", async function () {
    const resp = await request(app).get("/jobs?title=t&minSalary=12");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: 3,
            title: "t3",
            salary: 15,
            equity: "0.6",
            companyHandle: "c3",
          },
        ],
    });
  });

  test("throws BadRequestError if query string has invalid criteria", async function () {
    const resp = await request(app).get("/jobs?tacos=many&burritos=-1");
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual([
			"instance is not allowed to have the additional property \"tacos\"",
			"instance is not allowed to have the additional property \"burritos\""
		]);
  });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    console.log(resp.body);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "t1",
        salary: 5,
        equity: "0.2",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for invalid job id", async function () {
    const resp = await request(app).get(`/jobs/-1`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "t1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "t1-new",
        salary: 5,
        equity: "0.2",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized for non-admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "t1-new",
      })
      .set("authorization", `Bearer ${nonAdminToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for not logged in user", async function () {
    const resp = await request(app).patch(`/jobs/1`).send({
      title: "t1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for invalid job id", async function () {
    const resp = await request(app)
      .patch(`/jobs/-1`)
      .send({
        title: "t1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        salary: "taco",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for non admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${nonAdminToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/-1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
