import { z } from 'zod';
import type { JsonObject, JsonValue } from './types.js';

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number(),
    z.string(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ])
);

export const jsonObjectSchema: z.ZodType<JsonObject> = z.record(jsonValueSchema);


