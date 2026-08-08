import { describe, expect, test } from "bun:test";

function run(...args: string[]): string {
  const result = Bun.spawnSync({
    cmd: ["bun", "src/index.ts", ...args],
    cwd: import.meta.dir.replace(/\/tests$/, ""),
    stdout: "pipe",
    stderr: "pipe",
  });

  expect(result.exitCode).toBe(0);
  return result.stdout.toString();
}

describe("Cloudflare CLI command contracts", () => {
  test("reports the package release version", () => {
    expect(run("--version").trim()).toBe("1.1.0");
  });

  test("does not advertise in-place DNS type changes", () => {
    expect(run("dns", "update", "--help")).not.toContain("--type");
  });

  test("exposes the current DNS scan workflow", () => {
    const help = run("dns", "--help");
    expect(help).toContain("scan-results");
    expect(help).toContain("scan-review");

    const reviewHelp = run("dns", "scan-review", "--help");
    expect(reviewHelp).toContain("--accepts");
    expect(reviewHelp).toContain("--rejects");
  });

  test("uses the current R2 name filter", () => {
    const help = run("r2", "list", "--help");
    expect(help).toContain("--name-contains");
    expect(help).not.toContain("--name-prefix");
  });

  test("removes the retired Privacy Pass commands", () => {
    expect(run("security", "--help")).not.toContain("privacy-pass");
  });

  test("describes Rate Limits as Rulesets-based", () => {
    expect(run("rate-limits", "--help")).toContain("Rulesets API");
  });
});
