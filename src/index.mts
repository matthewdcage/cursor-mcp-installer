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

// Add startup logs for debugging
console.log("Starting cursor-mcp-installer-free MCP server...");

const server = new Server(
  {
    name: "cursor-mcp-installer-free",
    version: "0.1.1",
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
  
  // In Smithery environment, we may not have direct file system access
  // Instead, return the config that would be written
  const isInContainer = process.env.SMITHERY_CONTAINER === 'true';
  
  let config: any;
  try {
    if (!isInContainer && fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } else {
      config = { mcpServers: {} };
    }
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
  
  if (!isInContainer && fs.existsSync(path.dirname(configPath))) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (e) {
      console.error("Failed to write config file:", e);
      // Continue to return the config even if we can't write it
    }
  }
  
  // Return the configuration that would be written
  return config;
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

  // Check if we're using a package that requires special handling
  if (name === 'mcp-openapi-schema' || name.includes('openapi-schema')) {
    // For OpenAPI schema servers, we need to pass the schema file as an argument to index.mjs
    const hasSchemaFile = args && args.length > 0 && 
      (args[0].endsWith('.yaml') || args[0].endsWith('.json') || args[0].endsWith('.yml'));
    
    if (hasSchemaFile) {
      // Special configuration for OpenAPI schema servers
      // First try to get the installed package path
      try {
        const packagePath = path.dirname(require.resolve(`${name}/package.json`));
        const indexPath = path.join(packagePath, 'index.mjs');
        
        if (fs.existsSync(indexPath)) {
          installToCursor(
            formattedName,
            'node',
            [indexPath, ...(args ?? [])],
            env
          );
          return;
        }
      } catch (error) {
        console.warn(`Couldn't resolve ${name} package path, falling back to npx`);
      }
    }
  }
  
  // Check if this is a Python package
  if (!npmIfTrueElseUvx || name.includes('x-mcp') || name.includes('python') || name.endsWith('.py')) {
    // For Python MCP servers, we should use python -m module_name pattern instead of uvx
    // This helps ensure proper module paths and environment
    
    const moduleName = name.replace(/-/g, '_').replace(/\.git$/, '');
    // Extract module name from common patterns like username/repo-name.git
    const cleanModuleName = moduleName.includes('/') ? 
      moduleName.split('/').pop()!.replace(/\.git$/, '') : 
      moduleName;
    
    // For X Twitter MCP specifically
    if (name.includes('x-mcp')) {
      installToCursor(
        'X Twitter Tools',
        'python3',
        ['-m', `${cleanModuleName.replace(/-/g, '_')}.server`],
        env
      );
      return;
    }
    
    // For other Python-based MCP servers
    installToCursor(
      formattedName,
      'python3',
      ['-m', cleanModuleName],
      env
    );
    return;
  }

  // Default case - use npx/uvx
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
  serverPath?: string,
  env?: string[]
) {
  const isInContainer = process.env.SMITHERY_CONTAINER === 'true';
  
  // Handle the case where the user provides either a command or a path
  if (!serverPath && !command) {
    return {
      content: [
        {
          type: "text",
          text: "Error: You must provide either a command or a path!",
        },
      ],
      isError: true,
    };
  }
  
  try {
    // If a server path is provided, use that instead of the command+args
    if (serverPath) {
      if (!isInContainer && !fs.existsSync(serverPath)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Path ${serverPath} does not exist!`,
            },
          ],
          isError: true,
        };
      }
      
      // Use node to run the server if it's a JavaScript file
      if (serverPath.endsWith('.js') || serverPath.endsWith('.mjs')) {
        command = 'node';
        args = [serverPath, ...(args || [])];
      } else if (serverPath.endsWith('.py')) {
        // Use python for Python files
        command = 'python3';
        args = [serverPath, ...(args || [])];
      } else {
        // Otherwise use the serverPath as the command
        command = serverPath;
        args = args || [];
      }
    }
    
    // Create server config
    const envObj = (env ?? []).reduce((acc: Record<string, string>, val) => {
      const [key, value] = val.split("=");
      if (key) acc[key] = value || "";
      return acc;
    }, {} as Record<string, string>);
    
    const serverConfig = {
      command: command!,  // We've verified either command or serverPath is provided
      type: "stdio",
      args: args || [],
      ...(env && env.length > 0 ? { env: envObj } : {})
    };
    
    if (isInContainer) {
      // In Smithery, just return the configuration
      const config: { mcpServers: Record<string, any> } = { mcpServers: {} };
      config.mcpServers[name] = serverConfig;
      
      return {
        content: [
          {
            type: "text",
            text: `Here's the configuration to add to your ~/.cursor/mcp.json file:\n\n` +
                  `\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\`\n\n` +
                  `After adding this configuration, restart Cursor to apply the changes.`
          },
        ],
      };
    } else {
      // In local environment, update the config file
      const configPath = path.join(os.homedir(), ".cursor", "mcp.json");
      
      let config: { mcpServers: Record<string, any> };
      try {
        config = fs.existsSync(configPath) 
          ? JSON.parse(fs.readFileSync(configPath, "utf8")) 
          : { mcpServers: {} };
      } catch (e) {
        config = { mcpServers: {} };
      }
      
      config.mcpServers = config.mcpServers || {};
      config.mcpServers[name] = serverConfig;
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully added ${name} to your Cursor configuration! Please restart Cursor to apply the changes.`,
          },
        ],
      };
    }
  } catch (e) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${e}`,
        },
      ],
      isError: true,
    };
  }
}

async function installLocalMcpServer(
  dirPath: string,
  args?: string[],
  env?: string[]
) {
  const isInContainer = process.env.SMITHERY_CONTAINER === 'true';
  
  if (isInContainer) {
    return {
      content: [
        {
          type: "text",
          text: "Local directory installation is not available in the Smithery environment. " +
                "Please use this tool locally with Cursor to install from local directories.",
        },
      ],
      isError: true,
    };
  }

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
          text: "Error: Node.js is not installed, please install it!",
        },
      ],
      isError: true,
    };
  }

  const isNpm = await isNpmPackage(name);
  const hasUv = await hasUvx();

  if (!isNpm && !hasUv) {
    return {
      content: [
        {
          type: "text",
          text: "Error: Package not found in npm registry and uvx is not installed!",
        },
      ],
      isError: true,
    };
  }

  const isInContainer = process.env.SMITHERY_CONTAINER === 'true';

  try {
    if (isInContainer) {
      // In Smithery, we can't directly install - provide instructions instead
      const packageManager = isNpm ? "npm" : "uvx";
      const configResult = installRepoWithArgsToCursor(name, isNpm, args, env);
      
      return {
        content: [
          {
            type: "text",
            text: `Instructions for installing ${name}:\n\n` +
                  `1. Install the package with: ${packageManager} install -g ${name}\n\n` +
                  `2. Add the following to your ~/.cursor/mcp.json file:\n\n` +
                  `\`\`\`json\n${JSON.stringify(configResult, null, 2)}\n\`\`\`\n\n` +
                  `3. Restart Cursor and the MCP server will be available`
          },
        ],
      };
    } else {
      // Normal direct installation
      installRepoWithArgsToCursor(name, isNpm, args, env);
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully installed the ${name} MCP server!`,
          },
        ],
      };
    }
  } catch (e) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${e}`,
        },
      ],
      isError: true,
    };
  }
}

// Add the server request handler for tool calls
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
      const { name, command, args, path: serverPath, env } = request.params.arguments as {
        name: string;
        command?: string;
        args?: string[];
        path?: string;
        env?: string[];
      };

      return await addToCursorConfig(name, command, args, serverPath, env);
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
  console.log("Initializing MCP server transport...");
  const transport = new StdioServerTransport();
  console.log("Connecting MCP server...");
  await server.connect(transport);
  console.log("MCP server connected and ready");
}

runServer().catch((error) => {
  console.error("Error starting MCP server:", error);
  process.exit(1);
});
