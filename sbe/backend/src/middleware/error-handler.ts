import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export const createApiError = (status: number, title: string, detail: string, type: string = "about:blank") => {
  return {
    statusCode: status,
    error: {
      type,
      title,
      status,
      detail,
      instance: "",
    },
  };
};

export async function globalErrorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  // Access fastify instance via request.server
  const fastify: FastifyInstance = request.server;

  // Handle JWT errors specifically
  if (error.code === 'FST_JWT_C_INVALID_TOKEN' || error.code === 'FST_JWT_C_TOKEN_EXPIRED') {
    return reply.status(401).send(createApiError(401, "Unauthorized", "Invalid or expired session token."));
  }

  // Handle Drizzle/Database errors
  if (error.code === '23505') { // Unique violation
    return reply.status(409).send(createApiError(409, "Conflict", "The resource already exists."));
  }

  // Generic internal error
  fastify.log.error(error);
  return reply.status(error.statusCode || 500).send(
    createApiError(
      error.statusCode || 500,
      error.name || "Internal Server Error",
      error.message || "An unexpected error occurred on the server."
    )
  );
}
