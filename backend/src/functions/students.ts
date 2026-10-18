
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext
} from "@azure/functions";

import { prisma } from "../lib/prisma";

interface StudentInput {
  name: string;
  className: string;
  email: string;
}

function isStudentInput(value: unknown): value is StudentInput {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  return (
    typeof data.name === "string" &&
    data.name.trim().length > 0 &&
    typeof data.className === "string" &&
    data.className.trim().length > 0 &&
    typeof data.email === "string" &&
    data.email.trim().length > 0
  );
}

// GET /api/students
async function getStudents(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" }
    });

    return { status: 200, jsonBody: students };
  } catch (error) {
    context.error("GET students failed", error);
    return { status: 500, jsonBody: { error: "Database error" } };
  }
}

// POST /api/students
async function createStudent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body: unknown = await request.json();

    if (!isStudentInput(body)) {
      return {
        status: 400,
        jsonBody: { error: "Invalid student details" }
      };
    }

    const student = await prisma.student.create({
      data: {
        name: body.name,
        className: body.className,
        email: body.email
      }
    });

    return { status: 201, jsonBody: student };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { status: 400, jsonBody: { error: "Invalid JSON" } };
    }
    context.error("POST student failed", error);
    return { status: 500, jsonBody: { error: "Database error" } };
  }
}

// PUT /api/students/{id}
async function updateStudent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const id = request.params.id!;
    const body: unknown = await request.json();

    if (!isStudentInput(body)) {
      return {
        status: 400,
        jsonBody: { error: "Invalid student details" }
      };
    }

    const result = await prisma.student.updateMany({
      where: { id },
      data: {
        name: body.name,
        className: body.className,
        email: body.email
      }
    });

    if (result.count === 0) {
      return { status: 404, jsonBody: { error: "Student not found" } };
    }

    const student = await prisma.student.findUnique({
      where: { id }
    });

    return { status: 200, jsonBody: student };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { status: 400, jsonBody: { error: "Invalid JSON" } };
    }
    context.error("PUT student failed", error);
    return { status: 500, jsonBody: { error: "Database error" } };
  }
}

// DELETE /api/students/{id}
async function deleteStudent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const result = await prisma.student.deleteMany({
      where: { id: request.params.id! }
    });

    if (result.count === 0) {
      return { status: 404, jsonBody: { error: "Student not found" } };
    }

    return { status: 204 };
  } catch (error) {
    context.error("DELETE student failed", error);
    return { status: 500, jsonBody: { error: "Database error" } };
  }
}

// Register HTTP endpoints
app.http("getStudents", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "students",
  handler: getStudents
});

app.http("createStudent", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "students",
  handler: createStudent
});

app.http("updateStudent", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "students/{id}",
  handler: updateStudent
});

app.http("deleteStudent", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "students/{id}",
  handler: deleteStudent
});
