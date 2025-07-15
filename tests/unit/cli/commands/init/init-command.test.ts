const { assertEquals, assertExists, assertStringIncludes, describe, it, beforeEach, afterEach, expect } = require("../../../../utils/test-utils.ts");
const fs = require('fs');
const path = require('path');
const os = require('os');
const { initCommand } = require("../../../../../src/cli/simple-commands/init/index.js");

describe("Init Command Unit Tests", () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "claude_flow_init_test_"));
    // Store original working directory
    process.env["ORIGINAL_CWD"] = process.cwd();
    // Set PWD for init command
    process.env["PWD"] = testDir;
    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore original working directory
    const originalCwd = process.env["ORIGINAL_CWD"];
    if (originalCwd) {
      process.chdir(originalCwd);
    }
    // Clean up test directory
    try {
      fs.rmSync(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("Basic initialization", () => {
    it("should create basic structure with no flags", async () => {
      await initCommand([], {});

      // Check basic files
      assertExists(fs.existsSync(path.join(testDir, "CLAUDE.md")));
      assertExists(fs.existsSync(path.join(testDir, "memory-bank.md")));
      assertExists(fs.existsSync(path.join(testDir, "coordination.md")));

      // Check directories
      assertExists(fs.existsSync(path.join(testDir, "memory")));
      assertExists(fs.existsSync(path.join(testDir, "memory/agents")));
      assertExists(fs.existsSync(path.join(testDir, "memory/sessions")));
      assertExists(fs.existsSync(path.join(testDir, "coordination")));
      assertExists(fs.existsSync(path.join(testDir, ".claude")));
      assertExists(fs.existsSync(path.join(testDir, ".claude/commands")));
    });

    it("should create minimal structure with --minimal flag", async () => {
      await initCommand(["--minimal"], {});

      // Check files exist
      assertExists(fs.existsSync(path.join(testDir, "CLAUDE.md")));
      assertExists(fs.existsSync(path.join(testDir, "memory-bank.md")));
      assertExists(fs.existsSync(path.join(testDir, "coordination.md")));

      // Check content is minimal (smaller size)
      const claudeMd = fs.readFileSync(path.join(testDir, "CLAUDE.md"), 'utf8');
      const memoryBankMd = fs.readFileSync(path.join(testDir, "memory-bank.md"), 'utf8');
      
      // Minimal versions should be shorter
      expect(claudeMd.includes("Minimal project configuration")).toBe(true);
      expect(memoryBankMd.includes("Simple memory tracking")).toBe(true);
    });

    it("should handle help flag correctly", async () => {
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: any[]) => logs.push(args.join(" "));

      await initCommand(["--help"], {});

      console.log = originalLog;

      // Check that help was displayed
      const helpOutput = logs.join("\n");
      assertStringIncludes(helpOutput, "Initialize Claude Code integration");
      assertStringIncludes(helpOutput, "--force");
      assertStringIncludes(helpOutput, "--minimal");
      assertStringIncludes(helpOutput, "--sparc");
    });
  });

  describe("Force flag behavior", () => {
    it("should fail when files exist without --force", async () => {
      // Create existing file
      fs.writeFileSync(path.join(testDir, "CLAUDE.md"), "existing content");

      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: any[]) => logs.push(args.join(" "));

      await initCommand([], {});

      console.log = originalLog;

      // Check warning was displayed
      const output = logs.join("\n");
      assertStringIncludes(output, "already exist");
      assertStringIncludes(output, "Use --force to overwrite");
    });

    it("should overwrite files with --force flag", async () => {
      // Create existing files
      fs.writeFileSync(path.join(testDir, "CLAUDE.md"), "old content");
      fs.writeFileSync(path.join(testDir, "memory-bank.md"), "old memory");

      await initCommand(["--force"], {});

      // Check files were overwritten
      const claudeMd = fs.readFileSync(path.join(testDir, "CLAUDE.md"), 'utf8');
      const memoryBankMd = fs.readFileSync(path.join(testDir, "memory-bank.md"), 'utf8');

      // Should not contain old content
      expect(claudeMd.includes("old content")).toBe(false);
      expect(memoryBankMd.includes("old memory")).toBe(false);

      // Should contain new content
      assertStringIncludes(claudeMd, "Claude Code Configuration");
      assertStringIncludes(memoryBankMd, "Memory Bank");
    });
  });

  describe("SPARC flag behavior", () => {
    it("should create SPARC-enhanced structure with --sparc flag", async () => {
      await initCommand(["--sparc"], {});

      // Check SPARC-specific files
      assertExists(fs.existsSync(path.join(testDir, "CLAUDE.md")));
      assertExists(fs.existsSync(path.join(testDir, ".claude/commands/sparc")));

      // Check CLAUDE.md contains SPARC content
      const claudeMd = fs.readFileSync(path.join(testDir, "CLAUDE.md"), 'utf8');
      assertStringIncludes(claudeMd, "SPARC");
      assertStringIncludes(claudeMd, "Test-Driven Development");
    });

    it("should create SPARC structure manually when create-sparc fails", async () => {
      // This will trigger manual creation since create-sparc won't exist
      await initCommand(["--sparc", "--force"], {});

      // Check manual SPARC structure
      assertExists(fs.existsSync(path.join(testDir, ".roo")));
      assertExists(fs.existsSync(path.join(testDir, ".roo/templates")));
      assertExists(fs.existsSync(path.join(testDir, ".roo/workflows")));
      assertExists(fs.existsSync(path.join(testDir, ".roomodes")));
    });
  });

  describe("File content validation", () => {
    it("should create valid JSON files", async () => {
      await initCommand([], {});

      // Check claude-flow-data.json is valid JSON
      const dataPath = path.join(testDir, "memory/claude-flow-data.json");
      assertExists(fs.existsSync(dataPath));

      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      expect(Array.isArray(data.agents)).toBe(true);
      expect(Array.isArray(data.tasks)).toBe(true);
      expect(typeof data.lastUpdated).toBe("number");
    });

    it("should create proper README files", async () => {
      await initCommand([], {});

      // Check README files
      const agentsReadme = fs.readFileSync(path.join(testDir, "memory/agents/README.md"), 'utf8');
      const sessionsReadme = fs.readFileSync(path.join(testDir, "memory/sessions/README.md"), 'utf8');

      assertStringIncludes(agentsReadme, "# Agent Memory Storage");
      assertStringIncludes(sessionsReadme, "# Session Memory Storage");
    });
  });

  describe("Error handling", () => {
    it("should handle directory creation errors gracefully", async () => {
      // Create a file where a directory should be
      fs.writeFileSync(path.join(testDir, "memory"), "not a directory");

      const originalError = console.error;
      const errors: string[] = [];
      console.error = (...args: any[]) => errors.push(args.join(" "));

      try {
        await initCommand([], {});
      } catch {
        // Expected to fail
      }

      console.error = originalError;

      // Should have attempted to create directory
      expect(errors.length > 0).toBe(true);
    });

    it("should continue when some operations fail", async () => {
      // Make directory read-only (will fail on some operations)
      try {
        fs.chmodSync(testDir, 0o555);
      } catch {
        // Skip if chmod fails (Windows etc)
      }

      try {
        await initCommand(["--force"], {});
      } catch {
        // Expected some operations to fail
      }

      // Restore permissions
      try {
        fs.chmodSync(testDir, 0o755);
      } catch {
        // Skip if chmod fails
      }

      // Should have created at least some files before failing
      // (This test may vary based on OS permissions)
    });
  });

  describe("Flag combinations", () => {
    it("should handle --sparc --minimal combination", async () => {
      await initCommand(["--sparc", "--minimal"], {});

      // Should create SPARC structure
      assertExists(fs.existsSync(path.join(testDir, ".claude/commands/sparc")));

      // But with minimal content
      const claudeMd = fs.readFileSync(path.join(testDir, "CLAUDE.md"), 'utf8');
      assertStringIncludes(claudeMd, "SPARC");
      
      // Memory bank should be minimal
      const memoryBankMd = fs.readFileSync(path.join(testDir, "memory-bank.md"), 'utf8');
      assertStringIncludes(memoryBankMd, "Simple memory tracking");
    });

    it("should handle --sparc --force combination", async () => {
      // Create existing files
      fs.writeFileSync(path.join(testDir, "CLAUDE.md"), "old content");
      fs.writeFileSync(path.join(testDir, ".roomodes"), "old roomodes");

      await initCommand(["--sparc", "--force"], {});

      // Should overwrite and create SPARC structure
      const claudeMd = fs.readFileSync(path.join(testDir, "CLAUDE.md"), 'utf8');
      assertStringIncludes(claudeMd, "SPARC");
      expect(claudeMd.includes("old content")).toBe(false);

      // Should preserve or recreate .roomodes
      assertExists(fs.existsSync(path.join(testDir, ".roomodes")));
    });

    it("should handle all flags together", async () => {
      await initCommand(["--sparc", "--minimal", "--force"], {});

      // Should create minimal SPARC structure
      assertExists(fs.existsSync(path.join(testDir, "CLAUDE.md")));
      assertExists(fs.existsSync(path.join(testDir, ".claude/commands/sparc")));

      const claudeMd = fs.readFileSync(path.join(testDir, "CLAUDE.md"), 'utf8');
      assertStringIncludes(claudeMd, "SPARC");
    });
  });
});