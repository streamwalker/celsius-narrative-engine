import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { extractJson } from "./index.ts";

Deno.test("extractJson parses clean JSON object", () => {
  const out = extractJson('{"pages":[{"number":1}]}') as any;
  assertEquals(out.pages[0].number, 1);
});

Deno.test("extractJson strips ```json fences", () => {
  const out = extractJson('```json\n{"a":1}\n```') as any;
  assertEquals(out.a, 1);
});

Deno.test("extractJson strips bare ``` fences", () => {
  const out = extractJson('```\n{"a":2}\n```') as any;
  assertEquals(out.a, 2);
});

Deno.test("extractJson trims preamble before first brace", () => {
  const out = extractJson('Sure! Here is your JSON:\n{"a":3}') as any;
  assertEquals(out.a, 3);
});

Deno.test("extractJson trims trailing commentary after last brace", () => {
  const out = extractJson('{"a":4}\n\nLet me know if you need changes.') as any;
  assertEquals(out.a, 4);
});

Deno.test("extractJson repairs trailing commas in objects", () => {
  const out = extractJson('{"a":1,"b":2,}') as any;
  assertEquals(out.b, 2);
});

Deno.test("extractJson repairs trailing commas in arrays", () => {
  const out = extractJson('{"xs":[1,2,3,]}') as any;
  assertEquals(out.xs, [1, 2, 3]);
});

Deno.test("extractJson strips control characters", () => {
  const out = extractJson('{"a":"hello\x00\x01world"}') as any;
  assertEquals(out.a, "helloworld");
});

Deno.test("extractJson parses top-level arrays", () => {
  const out = extractJson("[1,2,3]") as any;
  assertEquals(out, [1, 2, 3]);
});

Deno.test("extractJson throws clear error on empty string", () => {
  assertThrows(
    () => extractJson(""),
    Error,
    "empty response",
  );
});

Deno.test("extractJson throws clear error on whitespace only", () => {
  assertThrows(
    () => extractJson("   \n\t  "),
    Error,
    "empty response",
  );
});

Deno.test("extractJson throws clear error when no JSON delimiters present", () => {
  assertThrows(
    () => extractJson("Sorry, I cannot help with that."),
    Error,
    "empty response",
  );
});

Deno.test("extractJson throws incomplete error when closer missing", () => {
  assertThrows(
    () => extractJson('{"a": 1'),
    Error,
    "incomplete",
  );
});
