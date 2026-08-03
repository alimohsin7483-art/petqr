import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Server-only components import "server-only" which errors outside a
// server bundle context — stub it so unit tests can import service modules.
vi.mock("server-only", () => ({}));

// Provide deterministic env vars for tests that read from process.env.
process.env.NEXT_PUBLIC_APP_URL = "https://petlink.test";
