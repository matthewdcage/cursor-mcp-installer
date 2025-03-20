#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { spawnPromise } from "spawn-rx";

const server = new Server(
  {
    name: "cursor-mcp-installer",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "install_repo_mcp_server",
        description: "Install an MCP server via npx or uvx",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The package name of the MCP server",
            },
            args: {
              type: "array",
              items: { type: "string" },
              description: "The arguments to pass along",
            },
            env: {
              type: "array",
              items: { type: "string" },
              description: "The environment variables to set, delimited by =",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "install_local_mcp_server",
        description:
          "Install an MCP server whose code is cloned locally on your computer",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "The path to the MCP server code cloned on your computer",
            },
            args: {
              type: "array",
              items: { type: "string" },
              description: "The arguments to pass along",
            },
            env: {
              type: "array",
              items: { type: "string" },
              description: "The environment variables to set, delimited by =",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "add_to_cursor_config",
        description:
          "Add any MCP server to Cursor's configuration",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Display name for the MCP server in Cursor",
            },
            command: {
              type: "string",
              description: "Command to execute (e.g., node, npx, python)",
            },
            args: {
              type: "array",
              items: { type: "string" },
              description: "Arguments to pass to the command",
            },
            path: {
              type: "string",
              description: "Path to the MCP server on disk (optional, used instead of command+args)",
            },
            env: {
              type: "array",
              items: { type: "string" },
              description: "Environment variables to set, delimited by =",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

async function hasNodeJs() {
  try {
    await spawnPromise("node", ["--version"]);
    return true;
  } catch (e) {
    return false;
  }
}

async function hasUvx() {
  try {
    await spawnPromise("uvx", ["--version"]);
    return true;
  } catch (e) {
    return false;
  }
}

async function isNpmPackage(name: string) {
  try {
    await spawnPromise("npm", ["view", name, "version"]);
    return true;
  } catch (e) {
    return false;
  }
}

function installToCursor(
  name: string,
  cmd: string,
  args: string[],
  env?: string[]
) {
  const configPath = path.join(os.homedir(), ".cursor", "mcp.json");

  let config: any;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (e) {
    config = { mcpServers: {} };
  }

  const envObj = (env ?? []).reduce((acc, val) => {
    const [key, value] = val.split("=");
    acc[key] = value;

    return acc;
  }, {} as Record<string, string>);

  const newServer = {
    command: cmd,
    type: "stdio",
    args: args,
    ...(env ? { env: envObj } : {}),
  };

  config.mcpServers = config.mcpServers || {};
  config.mcpServers[name] = newServer;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function installRepoWithArgsToCursor(
  name: string,
  npmIfTrueElseUvx: boolean,
  args?: string[],
  env?: string[]
) {
  // If the name is in a scoped package, we need to remove the scope
  const serverName = /^@.*\//i.test(name) ? name.split("/")[1] : name;
  
  // For Cursor, create a friendly display name
  const formattedName = serverName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  installToCursor(
    formattedName,
    npmIfTrueElseUvx ? "npx" : "uvx",
    ["-y", name, ...(args ?? [])],
    env
  );
}

async function attemptNodeInstall(
  directory: string
): Promise<Record<string, string>> {
  await spawnPromise("npm", ["install"], { cwd: directory });

  // Run down package.json looking for bins
  const pkg = JSON.parse(
    fs.readFileSync(path.join(directory, "package.json"), "utf-8")
  );

  if (pkg.bin) {
    return Object.keys(pkg.bin).reduce((acc, key) => {
      acc[key] = path.resolve(directory, pkg.bin[key]);
      return acc;
    }, {} as Record<string, string>);
  }

  if (pkg.main) {
    return { [pkg.name]: path.resolve(directory, pkg.main) };
  }

  return {};
}

async function addToCursorConfig(
  name: string,
  command?: string,
  args?: string[],
  path?: string,
  env?: string[]
) {
  // Determine if we're using command+args or a direct path
  let cmd = command || "node";
  let cmdArgs = args || [];
  
  // If path is provided, use it directly
  if (path) {
    if (path.endsWith(".js") || path.endsWith(".mjs")) {
      cmd = "node";
      cmdArgs = [path];
    } else if (path.endsWith(".py")) {
      cmd = "python";
      cmdArgs = [path];
    } else {
      // Assume it's an executable
      cmd = path;
      cmdArgs = [];
    }
  }
  
  // Format the name nicely for display
  const formattedName = name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
    
  // Install to Cursor config
  installToCursor(formattedName, cmd, cmdArgs, env);
  
  return {
    content: [
      {
        type: "text",
        text: `Added ${formattedName} to Cursor's MCP configuration. Please restart Cursor to apply the changes.`,
      },
    ],
  };
}

async function installLocalMcpServer(
  dirPath: string,
  args?: string[],
  env?: string[]
) {
  if (!fs.existsSync(dirPath)) {
    return {
      content: [
        {
          type: "text",
          text: `Path ${dirPath} does not exist locally!`,
        },
      ],
      isError: true,
    };
  }

  if (fs.existsSync(path.join(dirPath, "package.json"))) {
    const servers = await attemptNodeInstall(dirPath);

    Object.keys(servers).forEach((name) => {
      // Install to Cursor
      const formattedName = name
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
        
      installToCursor(
        formattedName,
        "node",
        [servers[name], ...(args ?? [])],
        env
      );
    });

    return {
      content: [
        {
          type: "text",
          text: `Installed the following servers to Cursor: ${Object.keys(
            servers
          ).join(", ")}. Please restart Cursor to apply the changes.`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Can't figure out how to install ${dirPath}`,
      },
    ],
    isError: true,
  };
}

async function installRepoMcpServer(
  name: string,
  args?: string[],
  env?: string[]
) {
  if (!(await hasNodeJs())) {
    return {
      content: [
        {
          type: "text",
          text: `Node.js is not installed, please install it!`,
        },
      ],
      isError: true,
    };
  }

  if (await isNpmPackage(name)) {
    // Install to Cursor
    installRepoWithArgsToCursor(name, true, args, env);

    return {
      content: [
        {
          type: "text",
          text: "Installed MCP server via npx to Cursor successfully! Please restart Cursor to apply the changes.",
        },
      ],
    };
  }

  if (!(await hasUvx())) {
    return {
      content: [
        {
          type: "text",
          text: `Python uv is not installed, please install it! Go to https://docs.astral.sh/uv for installation instructions.`,
        },
      ],
      isError: true,
    };
  }

  // Install to Cursor
  installRepoWithArgsToCursor(name, false, args, env);

  return {
    content: [
      {
        type: "text",
        text: "Installed MCP server via uvx to Cursor successfully! Please restart Cursor to apply the changes.",
      },
    ],
  };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "install_repo_mcp_server") {
      const { name, args, env } = request.params.arguments as {
        name: string;
        args?: string[];
        env?: string[];
      };

      return await installRepoMcpServer(name, args, env);
    }

    if (request.params.name === "install_local_mcp_server") {
      const dirPath = request.params.arguments!.path as string;
      const { args, env } = request.params.arguments as {
        args?: string[];
        env?: string[];
      };

      return await installLocalMcpServer(dirPath, args, env);
    }
    
    if (request.params.name === "add_to_cursor_config") {
      const { name, command, args, path, env } = request.params.arguments as {
        name: string;
        command?: string;
        args?: string[];
        path?: string;
        env?: string[];
      };

      return await addToCursorConfig(name, command, args, path, env);
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error setting up package: ${err}`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error); 